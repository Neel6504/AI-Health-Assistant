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
      establishedYear,
      hospitalType,
      totalBeds,
      specializations,
      emergencyAvailable,
      ambulanceAvailable,
      adminName,
      adminPosition,
      password
    } = req.body;

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
      establishedYear,
      hospitalType,
      totalBeds,
      specializations,
      emergencyAvailable,
      ambulanceAvailable,
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

export default router;
