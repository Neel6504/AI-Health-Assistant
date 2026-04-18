const en = {
  // Header
  appTitle: 'Medical AI Assistant',
  disclaimer: 'For informational purposes only. Not a substitute for professional medical advice.',
  historyBtn: 'History',
  hideBtn: 'Hide',
  historyTitle: 'View Medical History',
  welcomeUser: 'Welcome,',
  logout: 'Logout',
  login: 'Login',
  signUp: 'Sign Up',

  // Lang toggle
  langToggle: 'हिं',
  langSelectLabel: 'Language',
  langEnglish: 'English',
  langHindi: 'Hindi',
  langGujarati: 'Gujarati',

  // Chat input
  inputPlaceholder: 'Describe your symptoms...',
  sendBtn: 'Send',

  // Initial AI welcome message
  initialMessage: "Hello! I'm here to help identify possible health conditions based on your symptoms. I'll ask you a few questions to better understand what you're experiencing. Let's start: **What is your main symptom or concern today?**",

  // Loading / typing
  loadingHistory: 'Loading your consultation history...',
  loadingConversation: 'Loading conversation...',

  // Dashboard
  dashboardTitle: 'Medical History Dashboard',
  dashboardSubtitle: 'Track your health consultations and insights',
  medicalSessions: 'Medical Sessions',
  totalConsultations: 'Total consultations',
  messagesExchanged: 'Messages Exchanged',
  aiInteractions: 'AI interactions',
  emergencyCases: 'Emergency Cases',
  urgentDetection: 'Urgent detection',
  allClear: 'All clear',
  hospitalSearches: 'Hospital Searches',
  locationQueries: 'Location queries',
  recentConsultations: '🔬 Recent Medical Consultations',
  sessions: 'sessions',
  aiAssessment: 'AI Assessment',
  messages: 'messages',
  hospitalSearched: 'Hospital searched',
  viewChat: 'View Chat →',
  migrated: '📱 Migrated',
  latestBadge: 'Latest',
  migratedFromGuest: 'Migrated from guest session',

  // Empty states
  noConsultations: 'No medical consultations yet',
  noConsultationsDesc: 'Start your first conversation below to begin tracking your health journey!',
  symptomAnalysis: 'Symptom analysis & tracking',
  medicalHistoryDash: 'Medical history dashboard',
  emergencyDetection: 'Emergency detection & hospital finder',
  noMessages: 'No messages found for this session.',
  medicalConsultation: 'Medical Consultation',
  youLabel: '🧑 You',
  aiLabel: '🤖 AI Assistant',
  assessmentInProgress: 'Assessment in progress',

  // Emergency
  findHospitalsNow: '🚑 Find Nearest Emergency Hospital NOW',
  call911: '📞 Call 911',
  findNearbyHospitals: '🏥 Find Nearby Hospitals',

  // ---- Nearby Hospitals Page ----
  // Header
  nhBack: 'Back',
  nhTitle: '🏥 Hospitals',
  nhTabNearby: '📍 Nearby Hospitals',
  nhTabAll: '🏥 All Hospitals',
  nhGoogleMaps: 'Google Maps',
  nhFoundHospitals: (n) => `Found ${n} hospital${n !== 1 ? 's' : ''} within 5km`,
  nhSearching: 'Searching for hospitals near you',
  nhShowingAll: (n) => `Showing ${n} hospital${n !== 1 ? 's' : ''} from our database`,
  nhRegistered: '🏥 Showing registered hospitals from our database within 5km radius',

  // Auth banner
  nhSaveHistory: 'Save Your Medical Search History',
  nhLoginPrompt: 'Login or signup to automatically save your hospital searches and medical consultations to your personal dashboard',
  nhLogin: 'Login',
  nhSignUp: 'Sign Up',
  nhWelcomeBack: (name) => `Welcome back, ${name}!`,
  nhSearchesSaved: 'Your searches are being saved to your dashboard automatically',
  nhDashboard: 'Dashboard',
  nhLogout: 'Logout',

  // Error / retry
  nhRetry: '📍 Retry Location',
  nhSearchMaps: '🗺️ Search on Maps',
  nhNoHospitalsError: 'No hospitals found within 5km in our database. Try viewing "All Hospitals" tab to see all registered hospitals.',

  // Location debug
  nhYourLocation: '📍 Your Location:',

  // Stats
  nhHospitalsFound: 'Hospitals Found',
  nhTotalHospitals: 'Total Hospitals',
  nhOpenNow: 'Open Now',
  nhNearest: 'Nearest',
  nhClosest: 'Closest',

  // Hospital card
  nhOpen: '🟢 Open',
  nhClosed: '🔴 Closed',
  nhAway: 'away',
  nhReviews: 'reviews',

  // Hospital details
  nhHospitalInfo: '🏥 Hospital Information',
  nhType: 'Type:',
  nhTotalBeds: 'Total Beds:',
  nhSpecializations: 'Specializations:',
  nhEmergencyServices: '🚨 Emergency Services',
  nhEmergencyWard: 'Emergency Ward:',
  nhAvailable: '✅ Available',
  nhNotAvailable: '❌ Not Available',
  nhAmbulanceService: 'Ambulance Service:',
  nhOpeningHours: '🕒 Opening Hours',
  nhContactInfo: '📞 Contact Information',
  nhPhone: 'Phone:',
  nhEmail: 'Email:',
  nhWebsite: 'Website:',
  nhVisitWebsite: 'Visit Website',
  nhFacilities: '🏥 Facilities & Services',

  // Actions
  nhBookAppointment: 'Book Appointment',
  nhDirections: 'Directions',
  nhCall: 'Call',
  nhHideDetails: 'Hide Details',
  nhViewDetails: 'View Details',

  // No results
  nhNoHospitals: 'No Hospitals Found',
  nhNoHospitalsDesc: 'Try searching on Google Maps or adjust your location',
  nhSearchGoogleMaps: 'Search on Google Maps',

  // Loader
  nhLoadingNearby: 'Finding Nearby Hospitals',
  nhLoadingNearbySubtitle: 'Getting your location and searching for hospitals within 5km...',
  nhLoadingAll: 'Loading All Hospitals',
  nhLoadingAllSubtitle: 'Fetching hospitals from our database...',

  // Appointment toast
  nhAppointmentBooked: 'Appointment Booked!',

  // Errors
  errorGeneral: 'Sorry, I encountered an error. Please try again.',
  errorOverloaded: '⚠️ The AI model is currently overloaded. Please wait a minute and try again. (Free tier has limited requests per minute)',
  errorRateLimit: '⚠️ Rate limit reached. You can only make 5 requests per minute and 20 per day on the free tier. Please wait before trying again.',
}

export default en
