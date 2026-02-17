import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const hospitalSchema = new mongoose.Schema({
  // Hospital Basic Information
  hospitalName: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true,
    unique: true
  },
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true
  },
  establishedYear: {
    type: Number,
    required: [true, 'Established year is required'],
    min: 1800,
    max: new Date().getFullYear()
  },
  
  // Contact Information
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  
  // Address Information
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  state: {
    type: String,
    required: [true, 'State is required'],
    trim: true
  },
  pincode: {
    type: String,
    required: [true, 'Pincode is required'],
    trim: true,
    match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
  },
  
  // GPS Coordinates
  latitude: {
    type: Number,
    required: [true, 'Latitude is required for location services']
  },
  longitude: {
    type: Number,
    required: [true, 'Longitude is required for location services']
  },
  
  // Hospital Details
  hospitalType: {
    type: String,
    required: [true, 'Hospital type is required'],
    enum: ['Government', 'Private', 'Semi-Government', 'Trust'],
    trim: true
  },
  totalBeds: {
    type: Number,
    required: [true, 'Total beds is required'],
    min: 1
  },
  specializations: {
    type: String,
    required: [true, 'Specializations are required'],
    trim: true
  },
  emergencyAvailable: {
    type: Boolean,
    default: false
  },
  ambulanceAvailable: {
    type: Boolean,
    default: false
  },
  
  // Available Medical Services
  availableServices: {
    type: [String],
    default: [],
    validate: {
      validator: function(services) {
        // Optional: Add validation for valid service names
        return Array.isArray(services);
      },
      message: 'Available services must be an array'
    }
  },
  
  // Admin Information
  adminName: {
    type: String,
    required: [true, 'Admin name is required'],
    trim: true
  },
  adminPosition: {
    type: String,
    required: [true, 'Admin position is required'],
    trim: true
  },
  
  // Authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password before saving
hospitalSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
hospitalSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;
