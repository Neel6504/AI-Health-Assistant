import express from 'express';
import Appointment from '../models/Appointment.js';
import ChatHistory from '../models/ChatHistory.js';
import { protect } from './authRoutes.js';
import { protectHospital } from './hospitalRoutes.js';

const router = express.Router();

// ──────────────────────────────────────────────────────────────────
// HOSPITAL-FACING routes (must come BEFORE the user protect middleware)
// ──────────────────────────────────────────────────────────────────

// @desc    Get all appointments booked at this hospital (with patient info & chat)
// @route   GET /api/appointments/hospital
// @access  Private (Hospital)
router.get('/hospital', protectHospital, async (req, res) => {
  try {
    const hospitalId = req.hospital._id.toString();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const query = { hospitalId };
    if (req.query.status) query.status = req.query.status;

    const appointments = await Appointment.find(query)
      .populate('userId', 'name email')
      .sort({ appointmentDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      appointments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Hospital appointments fetch error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @desc    Update appointment status (hospital confirms / completes)
// @route   PATCH /api/appointments/hospital/:id/status
// @access  Private (Hospital)
router.patch('/hospital/:id/status', protectHospital, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'confirmed', 'completed'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const appointment = await Appointment.findOne({
      _id: req.params.id,
      hospitalId: req.hospital._id.toString()
    }).populate('userId', 'name email');

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json({ success: true, appointment, message: `Status updated to ${status}` });
  } catch (error) {
    console.error('Hospital status update error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// ──────────────────────────────────────────────────────────────────
// USER-FACING routes (protected by user JWT)
// ──────────────────────────────────────────────────────────────────

// Apply user protect middleware to all subsequent routes
router.use(protect);

// @desc    Book an appointment with a hospital
// @route   POST /api/appointments
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      hospitalId,
      hospitalName,
      hospitalAddress,
      hospitalPhone,
      hospitalEmail,
      appointmentDate,
      appointmentTime,
      reason,
      includeChatHistory // boolean – whether to attach recent chat messages
    } = req.body;

    if (!hospitalId || !hospitalName || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'hospitalId, hospitalName, appointmentDate and appointmentTime are required'
      });
    }

    // Optionally pull the user's most recent chat session messages
    let chatContext = [];
    if (includeChatHistory) {
      const latestSession = await ChatHistory.findOne({ userId: req.user._id })
        .sort({ updatedAt: -1 })
        .select('messages title');

      if (latestSession && latestSession.messages.length > 0) {
        // Sort by timestamp primary, then by _id (ObjectId encodes insertion order)
        // so equal-timestamp messages keep their original stored sequence
        chatContext = [...latestSession.messages]
          .sort((a, b) => {
            const tDiff = new Date(a.timestamp) - new Date(b.timestamp);
            if (tDiff !== 0) return tDiff;
            return a._id.toString() < b._id.toString() ? -1 : 1;
          })
          .slice(-20)
          .map((m) => ({
            sender: m.sender,
            content: m.content,
            timestamp: m.timestamp
          }));
      }
    }

    const appointment = await Appointment.create({
      userId: req.user._id,
      hospitalId,
      hospitalName,
      hospitalAddress: hospitalAddress || '',
      hospitalPhone: hospitalPhone || '',
      hospitalEmail: hospitalEmail || '',
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      reason: reason || '',
      chatContext,
      healthProfile: {
        hasDiabetes:   req.user.preferences?.medicalInfo?.conditions?.includes('Diabetes') ?? false,
        hasBloodSugar: req.user.preferences?.medicalInfo?.conditions?.includes('Blood Sugar') ?? false,
        bloodType:     req.user.preferences?.medicalInfo?.bloodType || '',
        allergies:     req.user.preferences?.medicalInfo?.allergies || [],
        medications:   req.user.preferences?.medicalInfo?.medications || [],
        conditions:    req.user.preferences?.medicalInfo?.conditions || []
      }
    });

    res.status(201).json({
      success: true,
      appointment,
      message: 'Appointment booked successfully'
    });

  } catch (error) {
    console.error('Appointment creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error booking appointment',
      error: error.message
    });
  }
});

// @desc    Get all appointments for logged-in user
// @route   GET /api/appointments
// @access  Private
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };

    if (req.query.status) {
      query.status = req.query.status;
    }

    const appointments = await Appointment.find(query)
      .sort({ appointmentDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-chatContext'); // exclude heavy chat context from list view

    const total = await Appointment.countDocuments(query);

    res.status(200).json({
      success: true,
      appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Appointments fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching appointments',
      error: error.message
    });
  }
});

// @desc    Get a single appointment with full chat context
// @route   GET /api/appointments/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.status(200).json({
      success: true,
      appointment
    });

  } catch (error) {
    console.error('Appointment fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching appointment',
      error: error.message
    });
  }
});

export default router;
