import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const appointmentSchema = new mongoose.Schema({
  appointmentId: {
    type: String,
    default: () => uuidv4(),
    unique: true
  },
  // User who booked
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Hospital details (snapshot at booking time)
  hospitalId: {
    type: String,
    required: true,
    index: true
  },
  hospitalName: {
    type: String,
    required: true
  },
  hospitalAddress: {
    type: String,
    default: ''
  },
  hospitalPhone: {
    type: String,
    default: ''
  },
  hospitalEmail: {
    type: String,
    default: ''
  },
  // Appointment date & time chosen by user
  appointmentDate: {
    type: Date,
    required: true
  },
  appointmentTime: {
    type: String, // e.g. "10:30 AM"
    required: true
  },
  // Reason / chief complaint
  reason: {
    type: String,
    default: ''
  },
  // Chat history messages copied at booking time (optional – user's chat context)
  chatContext: {
    type: [
      {
        sender: { type: String, enum: ['user', 'ai'] },
        content: { type: String },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    default: []
  },
  // Patient health profile snapshot (copied from user record at booking time)
  healthProfile: {
    hasDiabetes:   { type: Boolean, default: false },
    hasBloodSugar: { type: Boolean, default: false },
    bloodType:     { type: String, default: '' },
    allergies:     { type: [String], default: [] },
    medications:   { type: [String], default: [] },
    conditions:    { type: [String], default: [] }
  },
  // Status of the appointment
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed'],
    default: 'pending'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
