import express from 'express';
import mongoose from 'mongoose';
import Hospital from '../models/Hospital.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const WEEK_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const isValidTimeHHmm = (value) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
const timeToMinutes = (value) => {
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
};

// Quick check to avoid DB operations when disconnected (e.g., bad MONGODB_URI/DNS)
const isDbConnected = () => mongoose.connection.readyState === 1;

// Middleware to authenticate hospital requests
export const protectHospital = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hospital = await Hospital.findById(decoded.id).select('-password');
    if (!hospital) {
      return res.status(401).json({ success: false, message: 'Hospital not found' });
    }
    req.hospital = hospital;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized', error: error.message });
  }
};

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
      openDays,
      operatingHours,
      availableServices,
      adminName,
      adminPosition,
      password
    } = req.body;

    const safeOpenDays = Array.isArray(openDays) && openDays.length > 0 ? openDays : WEEK_DAYS;
    const safeOperatingHours = {
      openingTime: operatingHours?.openingTime || '09:00',
      closingTime: operatingHours?.closingTime || '18:00'
    };

    if (!safeOpenDays.every((day) => WEEK_DAYS.includes(day))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid openDays. Use day names like Monday, Tuesday, etc.'
      });
    }

    if (!isValidTimeHHmm(safeOperatingHours.openingTime) || !isValidTimeHHmm(safeOperatingHours.closingTime)) {
      return res.status(400).json({
        success: false,
        message: 'Operating hours must be in HH:mm format.'
      });
    }

    if (timeToMinutes(safeOperatingHours.openingTime) >= timeToMinutes(safeOperatingHours.closingTime)) {
      return res.status(400).json({
        success: false,
        message: 'Opening time must be earlier than closing time.'
      });
    }

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
      openDays: safeOpenDays,
      operatingHours: safeOperatingHours,
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
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Please configure MONGODB_URI and restart the server.'
      });
    }

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

    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: 'Database not connected. Please configure MONGODB_URI and restart the server.'
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
    const now = new Date();
    const todayName = WEEK_DAYS[now.getDay()];
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const hospitalsWithDistance = allHospitals
      .map(hospital => {
        const distance = calculateDistance(
          latitude,
          longitude,
          hospital.latitude,
          hospital.longitude
        );

        const hospitalOpenDays = Array.isArray(hospital.openDays) && hospital.openDays.length > 0
          ? hospital.openDays
          : WEEK_DAYS;
        const openingTime = hospital.operatingHours?.openingTime || '09:00';
        const closingTime = hospital.operatingHours?.closingTime || '18:00';
        const openingMinutes = isValidTimeHHmm(openingTime) ? timeToMinutes(openingTime) : 9 * 60;
        const closingMinutes = isValidTimeHHmm(closingTime) ? timeToMinutes(closingTime) : 18 * 60;
        const isOpenToday = hospitalOpenDays.includes(todayName);
        const isOpenNow = isOpenToday && nowMinutes >= openingMinutes && nowMinutes < closingMinutes;

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
          openDays: hospitalOpenDays,
          operatingHours: {
            openingTime,
            closingTime
          },
          availableServices: hospital.availableServices,
          latitude: hospital.latitude,
          longitude: hospital.longitude,
          distance: distance,
          isOpen: isOpenNow
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
