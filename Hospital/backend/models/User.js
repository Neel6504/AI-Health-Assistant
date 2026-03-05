import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    emergencyContacts: [{
      name: String,
      phone: String,
      relationship: String
    }],
    medicalInfo: {
      allergies: [String],
      medications: [String],
      conditions: [String],
      bloodType: String,
      emergencyNotes: String
    }
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Update login stats
userSchema.pre('save', function(next) {
  if (this.isModified('lastLogin')) {
    this.loginCount += 1;
  }
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Sign JWT token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// Get user profile (safe data only)
userSchema.methods.getProfile = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    role: this.role,
    isEmailVerified: this.isEmailVerified,
    preferences: this.preferences,
    lastLogin: this.lastLogin,
    loginCount: this.loginCount,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Update profile method
userSchema.methods.updateProfile = async function(updateData) {
  const allowedUpdates = ['name', 'avatar', 'preferences'];
  const updates = {};
  
  allowedUpdates.forEach(field => {
    if (updateData[field] !== undefined) {
      updates[field] = updateData[field];
    }
  });
  
  Object.assign(this, updates);
  return await this.save();
};

export default mongoose.model('User', userSchema);