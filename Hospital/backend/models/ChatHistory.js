import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const messageSchema = new mongoose.Schema({
  id: {
    type: String,
    default: () => uuidv4()
  },
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    wordCount: Number,
    hasEmergencyKeywords: Boolean,
    detectedSymptoms: [String],
    suggestedActions: [String]
  }
});

const chatHistorySchema = new mongoose.Schema({
  sessionId: {
    type: String,
    default: () => uuidv4(),
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'Medical Consultation'
  },
  messages: [messageSchema],
  
  // Session metadata
  sessionInfo: {
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: Date,
    duration: Number, // in minutes
    messageCount: {
      type: Number,
      default: 0
    },
    userMessageCount: {
      type: Number,
      default: 0
    },
    aiMessageCount: {
      type: Number,
      default: 0
    }
  },

  // Medical analysis
  medicalAnalysis: {
    hasEmergencySymptoms: {
      type: Boolean,
      default: false
    },
    reportedSymptoms: {
      type: [String],
      default: []
    },
    finalDiagnosis: {
      type: String,
      default: ''
    },
    aiConclusion: {
      type: String,
      default: ''
    },
    criticalSymptoms: [String],
    commonSymptoms: [String],
    detectedConditions: [String],
    emergencyLevel: {
      type: String,
      enum: ['none', 'low', 'medium', 'high', 'critical'],
      default: 'none'
    },
    recommendedActions: [String]
  },

  // Hospital interactions
  hospitalInteractions: {
    searchedHospitals: [{
      hospitalId: String,
      hospitalName: String,
      searchTime: {
        type: Date,
        default: Date.now
      },
      userLocation: {
        lat: Number,
        lng: Number,
        address: String
      },
      distance: Number
    }],
    viewedHospitalDetails: [String], // hospital IDs
    contactedHospitals: [String] // hospital IDs
  },

  // Session status
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  
  // Migration tracking
  migratedFromGuest: {
    type: Boolean,
    default: false
  },
  guestSessionId: {
    type: String,
    sparse: true
  },
  
  tags: [String],
  starred: {
    type: Boolean,
    default: false
  },
  
  // Location data
  userLocation: {
    lat: Number,
    lng: Number,
    address: String,
    city: String,
    state: String,
    country: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
chatHistorySchema.index({ userId: 1, createdAt: -1 });
chatHistorySchema.index({ 'medicalAnalysis.emergencyLevel': 1 });
chatHistorySchema.index({ status: 1 });

// Methods
chatHistorySchema.methods.addMessage = function(sender, content, metadata = {}) {
  const message = {
    sender,
    content,
    metadata
  };
  
  this.messages.push(message);
  this.sessionInfo.messageCount = this.messages.length;
  
  // Track if this is a migrated session
  if (metadata && (metadata.migratedFromGuest || metadata.migratedFromCurrentChat)) {
    this.migratedFromGuest = true;
  }
  
  if (sender === 'user') {
    this.sessionInfo.userMessageCount += 1;
    // Extract and store symptoms from user messages
    this.extractSymptomsFromMessage(content);
  } else if (sender === 'ai') {
    this.sessionInfo.aiMessageCount += 1;
    // Update final diagnosis with latest AI response
    this.updateFinalDiagnosis(content);
  }

  // Auto-generate title from first user message
  if (sender === 'user' && this.sessionInfo.userMessageCount === 1 && this.title === 'Medical Consultation') {
    this.title = this.generateTitle(content);
  }

  return this.save();
};

chatHistorySchema.methods.addCriticalSymptom = function(symptom, emergencyLevel = 'medium') {
  if (!this.medicalAnalysis.criticalSymptoms.includes(symptom)) {
    this.medicalAnalysis.criticalSymptoms.push(symptom);
    this.medicalAnalysis.hasEmergencySymptoms = true;
    
    // Also add to reported symptoms if not already there
    if (!this.medicalAnalysis.reportedSymptoms.includes(symptom)) {
      this.medicalAnalysis.reportedSymptoms.push(symptom);
    }
    
    // Update emergency level if higher
    const levels = ['none', 'low', 'medium', 'high', 'critical'];
    const currentIndex = levels.indexOf(this.medicalAnalysis.emergencyLevel);
    const newIndex = levels.indexOf(emergencyLevel);
    
    if (newIndex > currentIndex) {
      this.medicalAnalysis.emergencyLevel = emergencyLevel;
    }
  }
  
  return this.save();
};

// Extract symptoms from user message
chatHistorySchema.methods.extractSymptomsFromMessage = function(message) {
  const symptomKeywords = [
    'pain', 'ache', 'hurt', 'sore', 'tender', 'burning', 'sharp', 'dull', 'throbbing',
    'fever', 'temperature', 'hot', 'chills', 'cold', 'shivering',
    'headache', 'migraine', 'dizzy', 'lightheaded', 'nausea', 'vomit', 'sick',
    'cough', 'sneeze', 'congestion', 'runny nose', 'sore throat',
    'tired', 'fatigue', 'weak', 'exhausted', 'sleepy',
    'rash', 'itchy', 'red', 'swollen', 'bump', 'lump',
    'breathless', 'shortness of breath', 'breathing', 'chest pain',
    'stomach', 'belly', 'abdominal', 'cramps', 'bloated',
    'diarrhea', 'constipation', 'blood', 'bleeding',
    'swelling', 'inflammation', 'infection'
  ];
  
  const lowerMessage = message.toLowerCase();
  const foundSymptoms = [];
  
  symptomKeywords.forEach(keyword => {
    if (lowerMessage.includes(keyword)) {
      foundSymptoms.push(keyword);
    }
  });
  
  // Add newly found symptoms to reported symptoms
  foundSymptoms.forEach(symptom => {
    if (!this.medicalAnalysis.reportedSymptoms.includes(symptom)) {
      this.medicalAnalysis.reportedSymptoms.push(symptom);
    }
  });
};

// Update final diagnosis from AI message
chatHistorySchema.methods.updateFinalDiagnosis = function(aiMessage) {
  // Look for diagnostic keywords to identify final diagnosis
  const diagnosticKeywords = [
    'diagnosis', 'condition', 'likely', 'appears to be', 'seems to be',
    'may have', 'could have', 'possibly', 'probably', 'indicates',
    'suggests', 'recommend', 'should', 'need to', 'based on'
  ];
  
  const lowerMessage = aiMessage.toLowerCase();
  let isFinalDiagnosis = false;
  
  // Check if this message contains diagnostic language
  diagnosticKeywords.forEach(keyword => {
    if (lowerMessage.includes(keyword)) {
      isFinalDiagnosis = true;
    }
  });
  
  // If this looks like a diagnosis, store it
  if (isFinalDiagnosis || this.medicalAnalysis.finalDiagnosis === '') {
    // Clean up the message for display
    let cleanDiagnosis = aiMessage
      .replace(/\*\*/g, '') // Remove markdown bold
      .replace(/\*/g, '')   // Remove markdown italic
      .replace(/#+/g, '')   // Remove markdown headers
      .trim();
    
    // Limit length for display
    if (cleanDiagnosis.length > 200) {
      cleanDiagnosis = cleanDiagnosis.substring(0, 200) + '...';
    }
    
    this.medicalAnalysis.finalDiagnosis = cleanDiagnosis;
    this.medicalAnalysis.aiConclusion = cleanDiagnosis;
  }
};

chatHistorySchema.methods.addHospitalSearch = function(hospitals, userLocation) {
  const searches = hospitals.map(hospital => ({
    hospitalId: hospital._id || hospital.id,
    hospitalName: hospital.name,
    searchTime: new Date(),
    userLocation: userLocation,
    distance: hospital.distance
  }));
  
  this.hospitalInteractions.searchedHospitals.push(...searches);
  
  if (userLocation) {
    this.userLocation = userLocation;
  }
  
  return this.save();
};

chatHistorySchema.methods.endSession = function() {
  this.sessionInfo.endTime = new Date();
  this.sessionInfo.duration = Math.round(
    (this.sessionInfo.endTime - this.sessionInfo.startTime) / (1000 * 60)
  );
  this.status = 'completed';
  
  return this.save();
};

chatHistorySchema.methods.generateTitle = function(firstMessage) {
  const words = firstMessage.split(' ').slice(0, 6).join(' ');
  return words.length > 30 ? words.substring(0, 30) + '...' : words;
};

chatHistorySchema.methods.generateSummary = function(includeMessages = false) {
  const summary = {
    _id: this._id,
    sessionId: this.sessionId,
    title: this.title,
    messageCount: this.sessionInfo.messageCount,
    duration: this.sessionInfo.duration,
    emergencyLevel: this.medicalAnalysis.emergencyLevel,
    hasEmergencySymptoms: this.medicalAnalysis.hasEmergencySymptoms,
    criticalSymptoms: this.medicalAnalysis.criticalSymptoms,
    reportedSymptoms: this.medicalAnalysis.reportedSymptoms,
    finalDiagnosis: this.medicalAnalysis.finalDiagnosis,
    aiConclusion: this.medicalAnalysis.aiConclusion,
    hospitalSearched: this.hospitalInteractions.searchedHospitals.length > 0,
    hospitalSearchCount: this.hospitalInteractions.searchedHospitals.length,
    migratedFromGuest: this.migratedFromGuest,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
  
  if (includeMessages && this.messages) {
    // Include only the first few messages for preview
    summary.messages = this.messages.slice(0, 4).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content,
      timestamp: msg.timestamp
    }));
  }
  
  return summary;
};

// Static methods
chatHistorySchema.statics.getUserStats = async function(userId) {
  const sessions = await this.find({ userId });
  
  const stats = {
    totalSessions: sessions.length,
    totalMessages: sessions.reduce((sum, session) => sum + session.sessionInfo.messageCount, 0),
    emergencySessions: sessions.filter(s => s.medicalAnalysis.hasEmergencySymptoms).length,
    totalDuration: sessions.reduce((sum, session) => sum + (session.sessionInfo.duration || 0), 0),
    hospitalSearches: sessions.reduce((sum, session) => sum + session.hospitalInteractions.searchedHospitals.length, 0),
    lastSessionDate: sessions.length > 0 ? Math.max(...sessions.map(s => s.updatedAt)) : null,
    emergencyLevels: {
      critical: sessions.filter(s => s.medicalAnalysis.emergencyLevel === 'critical').length,
      high: sessions.filter(s => s.medicalAnalysis.emergencyLevel === 'high').length,  
      medium: sessions.filter(s => s.medicalAnalysis.emergencyLevel === 'medium').length,
      low: sessions.filter(s => s.medicalAnalysis.emergencyLevel === 'low').length
    }
  };
  
  return stats;
};

chatHistorySchema.statics.getRecentSessions = async function(userId, limit = 10, includeMessages = false) {
  const selectFields = 'sessionId title status migratedFromGuest medicalAnalysis.emergencyLevel sessionInfo.messageCount hospitalInteractions.searchedHospitals createdAt updatedAt';
  const query = this.find({ userId })
    .sort({ updatedAt: -1 })
    .limit(limit);
  
  if (includeMessages) {
    query.select(selectFields + ' messages');
  } else {
    query.select(selectFields);
  }
  
  return await query;
};

export default mongoose.model('ChatHistory', chatHistorySchema);