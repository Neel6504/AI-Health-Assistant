import express from 'express';
import Hospital from '../models/Hospital.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/hospitals/register
// @desc    Register a new hospital
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const {
      hospitalName,
      registrationNumber,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      establishedYear,
      hospitalType,
      totalBeds,
      specializations,
      emergencyAvailable,
      ambulanceAvailable,
      availableServices,
      adminName,
      adminPosition,
      password
    } = req.body;

    // Validate latitude and longitude
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Hospital location (latitude and longitude) is required. Please detect your location.'
      });
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates. Please detect your location again.'
      });
    }

    // Check if hospital already exists
    const hospitalExists = await Hospital.findOne({
      $or: [{ email }, { registrationNumber }, { hospitalName }]
    });

    if (hospitalExists) {
      let message = 'Hospital already registered';
      if (hospitalExists.email === email) message = 'Email already registered';
      if (hospitalExists.registrationNumber === registrationNumber) {
        message = 'Registration number already exists';
      }
      if (hospitalExists.hospitalName === hospitalName) {
        message = 'Hospital name already exists';
      }
      
      return res.status(400).json({
        success: false,
        message
      });
    }

    // Create new hospital
    const hospital = await Hospital.create({
      hospitalName,
      registrationNumber,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      latitude,
      longitude,
      establishedYear,
      hospitalType,
      totalBeds,
      specializations,
      emergencyAvailable,
      ambulanceAvailable,
      availableServices,
      adminName,
      adminPosition,
      password
    });

    if (hospital) {
      res.status(201).json({
        success: true,
        message: 'Hospital registered successfully',
        data: {
          _id: hospital._id,
          hospitalName: hospital.hospitalName,
          email: hospital.email,
          registrationNumber: hospital.registrationNumber,
          token: generateToken(hospital._id)
        }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: messages
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
});

// @route   POST /api/hospitals/login
// @desc    Login hospital
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find hospital by email and include password
    const hospital = await Hospital.findOne({ email }).select('+password');

    if (!hospital) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if password matches
    const isPasswordMatch = await hospital.matchPassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if hospital is active
    if (!hospital.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Hospital account is deactivated'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: hospital._id,
        hospitalName: hospital.hospitalName,
        email: hospital.email,
        token: generateToken(hospital._id)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
});

// @route   GET /api/hospitals
// @desc    Get all hospitals (for admin purposes)
// @access  Public (should be protected in production)
router.get('/', async (req, res) => {
  try {
    const hospitals = await Hospital.find({}).select('-password');
    
    res.json({
      success: true,
      count: hospitals.length,
      data: hospitals
    });
  } catch (error) {
    console.error('Get hospitals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching hospitals',
      error: error.message
    });
  }
});

// @route   GET /api/hospitals/:id
// @desc    Get single hospital by ID
// @access  Public (should be protected in production)
router.get('/:id', async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id).select('-password');
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    res.json({
      success: true,
      data: hospital
    });
  } catch (error) {
    console.error('Get hospital error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching hospital',
      error: error.message
    });
  }
});

// @route   POST /api/hospitals/nearby
// @desc    Find nearby hospitals based on user's location
// @access  Public
router.post('/nearby', async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.body; // radius in kilometers, default 5km

    // Validate coordinates
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates'
      });
    }

    // Get all hospitals from database
    const allHospitals = await Hospital.find({}).select('-password');

    // Calculate distance using Haversine formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      
      return parseFloat(distance.toFixed(2));
    };

    const toRad = (value) => {
      return (value * Math.PI) / 180;
    };

    // Calculate distances and filter by radius
    const hospitalsWithDistance = allHospitals
      .map(hospital => {
        const distance = calculateDistance(
          latitude,
          longitude,
          hospital.latitude,
          hospital.longitude
        );

        return {
          _id: hospital._id,
          hospitalName: hospital.hospitalName,
          address: hospital.address,
          city: hospital.city,
          state: hospital.state,
          pincode: hospital.pincode,
          phone: hospital.phone,
          email: hospital.email,
          hospitalType: hospital.hospitalType,
          totalBeds: hospital.totalBeds,
          specializations: hospital.specializations,
          emergencyAvailable: hospital.emergencyAvailable,
          ambulanceAvailable: hospital.ambulanceAvailable,
          availableServices: hospital.availableServices,
          latitude: hospital.latitude,
          longitude: hospital.longitude,
          distance: distance,
          isOpen: true // You can add business hours logic later
        };
      })
      .filter(hospital => hospital.distance <= radius)
      .sort((a, b) => a.distance - b.distance); // Sort by distance (nearest first)

    console.log(`Found ${hospitalsWithDistance.length} hospitals within ${radius}km`);

    res.json({
      success: true,
      count: hospitalsWithDistance.length,
      data: hospitalsWithDistance,
      userLocation: {
        latitude,
        longitude
      },
      radius
    });

  } catch (error) {
    console.error('Nearby hospitals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching for nearby hospitals',
      error: error.message
    });
  }
});

export default router;
