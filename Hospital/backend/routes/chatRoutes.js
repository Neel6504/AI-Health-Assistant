import express from 'express';
import ChatHistory from '../models/ChatHistory.js';
import { protect } from './authRoutes.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// @desc    Create new chat session
// @route   POST /api/chat/sessions
// @access  Private
router.post('/sessions', async (req, res) => {
  try {
    const { title, userLocation } = req.body;

    const session = await ChatHistory.create({
      userId: req.user._id,
      title: title || 'Medical Consultation',
      userLocation
    });

    res.status(201).json({
      success: true,
      session: session.generateSummary(),
      message: 'Chat session created successfully'
    });

  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating chat session',
      error: error.message
    });
  }
});

// @desc    Get all user sessions
// @route   GET /api/chat/sessions
// @access  Private
router.get('/sessions', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { status, emergencyLevel, search } = req.query;
    
    // Build query
    let query = { userId: req.user._id };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (emergencyLevel && emergencyLevel !== 'all') {
      query['medicalAnalysis.emergencyLevel'] = emergencyLevel;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'messages.content': { $regex: search, $options: 'i' } }
      ];
    }

    const sessions = await ChatHistory.find(query)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('sessionId title status medicalAnalysis sessionInfo createdAt updatedAt');

    const total = await ChatHistory.countDocuments(query);

    res.status(200).json({
      success: true,
      sessions: sessions.map(session => session.generateSummary()),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Sessions fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching sessions',
      error: error.message
    });
  }
});

// @desc    Get specific session with full details
// @route   GET /api/chat/sessions/:sessionId
// @access  Private
router.get('/sessions/:sessionId', async (req, res) => {
  try {
    const session = await ChatHistory.findOne({
      sessionId: req.params.sessionId,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.status(200).json({
      success: true,
      session
    });

  } catch (error) {
    console.error('Session fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching session',
      error: error.message
    });
  }
});

// @desc    Add message to session
// @route   POST /api/chat/sessions/:sessionId/messages
// @access  Private
router.post('/sessions/:sessionId/messages', async (req, res) => {
  try {
    const { sender, content, metadata } = req.body;

    if (!sender || !content) {
      return res.status(400).json({
        success: false,
        message: 'Sender and content are required'
      });
    }

    const session = await ChatHistory.findOne({
      sessionId: req.params.sessionId,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    await session.addMessage(sender, content, metadata);

    res.status(200).json({
      success: true,
      message: 'Message added successfully',
      messageCount: session.messages.length
    });

  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding message',
      error: error.message
    });
  }
});

// @desc    Update session title
// @route   PUT /api/chat/sessions/:sessionId/title
// @access  Private
router.put('/sessions/:sessionId/title', async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const session = await ChatHistory.findOneAndUpdate(
      { sessionId: req.params.sessionId, userId: req.user._id },
      { title },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.status(200).json({
      success: true,
      session: session.generateSummary(),
      message: 'Title updated successfully'
    });

  } catch (error) {
    console.error('Title update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating title',
      error: error.message
    });
  }
});

// @desc    Add critical symptom to session
// @route   POST /api/chat/sessions/:sessionId/symptoms
// @access  Private
router.post('/sessions/:sessionId/symptoms', async (req, res) => {
  try {
    const { symptom, emergencyLevel } = req.body;

    if (!symptom) {
      return res.status(400).json({
        success: false,
        message: 'Symptom is required'
      });
    }

    const session = await ChatHistory.findOne({
      sessionId: req.params.sessionId,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    await session.addCriticalSymptom(symptom, emergencyLevel);

    res.status(200).json({
      success: true,
      message: 'Critical symptom added',
      emergencyLevel: session.medicalAnalysis.emergencyLevel
    });

  } catch (error) {
    console.error('Add symptom error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding symptom',
      error: error.message
    });
  }
});

// @desc    Add hospital search to session
// @route   POST /api/chat/sessions/:sessionId/hospitals
// @access  Private
router.post('/sessions/:sessionId/hospitals', async (req, res) => {
  try {
    const { hospitals, userLocation } = req.body;

    const session = await ChatHistory.findOne({
      sessionId: req.params.sessionId,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    await session.addHospitalSearch(hospitals || [], userLocation);

    res.status(200).json({
      success: true,
      message: 'Hospital search recorded',
      hospitalSearchCount: session.hospitalInteractions.searchedHospitals.length
    });

  } catch (error) {
    console.error('Hospital search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error recording hospital search',
      error: error.message
    });
  }
});

// @desc    End chat session
// @route   PUT /api/chat/sessions/:sessionId/end
// @access  Private
router.put('/sessions/:sessionId/end', async (req, res) => {
  try {
    const session = await ChatHistory.findOne({
      sessionId: req.params.sessionId,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    await session.endSession();

    res.status(200).json({
      success: true,
      session: session.generateSummary(),
      message: 'Session ended successfully'
    });

  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error ending session',
      error: error.message
    });
  }
});

// @desc    Delete session
// @route   DELETE /api/chat/sessions/:sessionId
// @access  Private
router.delete('/sessions/:sessionId', async (req, res) => {
  try {
    const session = await ChatHistory.findOneAndDelete({
      sessionId: req.params.sessionId,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Session deleted successfully'
    });

  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting session',
      error: error.message
    });
  }
});

// @desc    Star/unstar session
// @route   PUT /api/chat/sessions/:sessionId/star
// @access  Private
router.put('/sessions/:sessionId/star', async (req, res) => {
  try {
    const { starred } = req.body;

    const session = await ChatHistory.findOneAndUpdate(
      { sessionId: req.params.sessionId, userId: req.user._id },
      { starred: starred !== undefined ? starred : true },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    res.status(200).json({
      success: true,
      message: session.starred ? 'Session starred' : 'Session unstarred',
      starred: session.starred
    });

  } catch (error) {
    console.error('Star session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating session',
      error: error.message
    });
  }
});

// @desc    Get user statistics
// @route   GET /api/chat/stats
// @access  Private
router.get('/stats', async (req, res) => {
  try {
    const stats = await ChatHistory.getUserStats(req.user._id);

    res.status(200).json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics',
      error: error.message
    });
  }
});

// @desc    Get recent sessions
// @route   GET /api/chat/recent
// @access  Private
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const includeMessages = req.query.includeMessages === 'true';
    
    const sessions = await ChatHistory.getRecentSessions(req.user._id, limit, includeMessages);

    res.status(200).json({
      success: true,
      sessions: sessions.map(session => session.generateSummary(includeMessages))
    });

  } catch (error) {
    console.error('Recent sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching recent sessions',
      error: error.message
    });
  }
});

// @desc    Export chat data
// @route   GET /api/chat/export
// @access  Private
router.get('/export', async (req, res) => {
  try {
    const { format = 'json', sessionId } = req.query;

    let query = { userId: req.user._id };
    if (sessionId) {
      query.sessionId = sessionId;
    }

    const sessions = await ChatHistory.find(query).sort({ createdAt: -1 });

    if (format === 'csv') {
      // Basic CSV export
      const csvData = sessions.map(session => ({
        sessionId: session.sessionId,
        title: session.title,
        messageCount: session.sessionInfo.messageCount,
        duration: session.sessionInfo.duration,
        emergencyLevel: session.medicalAnalysis.emergencyLevel,
        status: session.status,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }));

      res.status(200).json({
        success: true,
        data: csvData,
        format: 'csv'
      });
    } else {
      res.status(200).json({
        success: true,
        sessions,
        format: 'json'
      });
    }

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error exporting data',
      error: error.message
    });
  }
});

export default router;