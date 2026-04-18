const hi = {
  // Header
  appTitle: 'मेडिकल AI सहायक',
  disclaimer: 'केवल जानकारी के उद्देश्य से। यह पेशेवर चिकित्सा सलाह का विकल्प नहीं है।',
  historyBtn: 'इतिहास',
  hideBtn: 'छुपाएं',
  historyTitle: 'चिकित्सा इतिहास देखें',
  welcomeUser: 'स्वागत है,',
  logout: 'लॉगआउट',
  login: 'लॉगिन',
  signUp: 'साइन अप',

  // Lang toggle
  langToggle: 'EN',
  langSelectLabel: 'भाषा',
  langEnglish: 'English',
  langHindi: 'हिंदी',
  langGujarati: 'ગુજરાતી',

  // Chat input
  inputPlaceholder: 'अपने लक्षण बताएं...',
  sendBtn: 'भेजें',

  // Initial AI welcome message
  initialMessage: 'नमस्ते! मैं आपके लक्षणों के आधार पर संभावित स्वास्थ्य स्थितियों की पहचान करने में मदद करने के लिए यहाँ हूँ। मैं आपकी स्थिति को बेहतर समझने के लिए कुछ प्रश्न पूछूंगा। शुरू करते हैं: **आज आपका मुख्य लक्षण या समस्या क्या है?**',

  // Loading / typing
  loadingHistory: 'आपका परामर्श इतिहास लोड हो रहा है...',
  loadingConversation: 'बातचीत लोड हो रही है...',

  // Dashboard
  dashboardTitle: 'चिकित्सा इतिहास डैशबोर्ड',
  dashboardSubtitle: 'अपने स्वास्थ्य परामर्श और जानकारी ट्रैक करें',
  medicalSessions: 'चिकित्सा सत्र',
  totalConsultations: 'कुल परामर्श',
  messagesExchanged: 'आदान-प्रदान किए गए संदेश',
  aiInteractions: 'AI इंटरेक्शन',
  emergencyCases: 'आपातकालीन मामले',
  urgentDetection: 'तत्काल पहचान',
  allClear: 'सब ठीक है',
  hospitalSearches: 'अस्पताल खोज',
  locationQueries: 'स्थान प्रश्न',
  recentConsultations: '🔬 हाल के चिकित्सा परामर्श',
  sessions: 'सत्र',
  aiAssessment: 'AI मूल्यांकन',
  messages: 'संदेश',
  hospitalSearched: 'अस्पताल खोजा गया',
  viewChat: 'चैट देखें →',
  migrated: '📱 स्थानांतरित',
  latestBadge: 'नवीनतम',
  migratedFromGuest: 'अतिथि सत्र से स्थानांतरित',

  // Empty states
  noConsultations: 'अभी तक कोई चिकित्सा परामर्श नहीं',
  noConsultationsDesc: 'अपनी स्वास्थ्य यात्रा शुरू करने के लिए नीचे पहली बातचीत शुरू करें!',
  symptomAnalysis: 'लक्षण विश्लेषण और ट्रैकिंग',
  medicalHistoryDash: 'चिकित्सा इतिहास डैशबोर्ड',
  emergencyDetection: 'आपातकालीन पहचान और अस्पताल खोज',
  noMessages: 'इस सत्र के लिए कोई संदेश नहीं मिला।',
  medicalConsultation: 'चिकित्सा परामर्श',
  youLabel: '🧑 आप',
  aiLabel: '🤖 AI सहायक',
  assessmentInProgress: 'मूल्यांकन जारी है',

  // Emergency
  findHospitalsNow: '🚑 अभी निकटतम आपातकालीन अस्पताल खोजें',
  call911: '📞 112 पर कॉल करें',
  findNearbyHospitals: '🏥 नजदीकी अस्पताल खोजें',

  // ---- Nearby Hospitals Page ----
  // Header
  nhBack: 'वापस',
  nhTitle: '🏥 अस्पताल',
  nhTabNearby: '📍 नजदीकी अस्पताल',
  nhTabAll: '🏥 सभी अस्पताल',
  nhGoogleMaps: 'Google Maps',
  nhFoundHospitals: (n) => `5km के अंदर ${n} अस्पताल मिले`,
  nhSearching: 'आपके नजदीकी अस्पताल खोजे जा रहे हैं',
  nhShowingAll: (n) => `हमारे डेटाबेस से ${n} अस्पताल दिखाए जा रहे हैं`,
  nhRegistered: '🏥 डेटाबेस में पंजीकृत अस्पताल 5km दायरे में दिखाए जा रहे हैं',

  // Auth banner
  nhSaveHistory: 'अपना चिकित्सा खोज इतिहास सहेजें',
  nhLoginPrompt: 'अपने अस्पताल की खोज और चिकित्सा परामर्श को स्वचालित रूप से सहेजने के लिए लॉगिन या साइन अप करें',
  nhLogin: 'लॉगिन',
  nhSignUp: 'साइन अप',
  nhWelcomeBack: (name) => `वापस स्वागत है, ${name}!`,
  nhSearchesSaved: 'आपकी खोजें स्वचालित रूप से डैशबोर्ड में सहेजी जा रही हैं',
  nhDashboard: 'डैशबोर्ड',
  nhLogout: 'लॉगआउट',

  // Error / retry
  nhRetry: '📍 स्थान पुनः प्रयास करें',
  nhSearchMaps: '🗺️ Maps पर खोजें',
  nhNoHospitalsError: '5km के अंदर हमारे डेटाबेस में कोई अस्पताल नहीं मिला। सभी अस्पताल देखने के लिए "सभी अस्पताल" टैब देखें।',

  // Location debug
  nhYourLocation: '📍 आपका स्थान:',

  // Stats
  nhHospitalsFound: 'अस्पताल मिले',
  nhTotalHospitals: 'कुल अस्पताल',
  nhOpenNow: 'अभी खुले हैं',
  nhNearest: 'सबसे नजदीक',
  nhClosest: 'सबसे नजदीक',

  // Hospital card
  nhOpen: '🟢 खुला',
  nhClosed: '🔴 बंद',
  nhAway: 'दूर',
  nhReviews: 'समीक्षाएं',

  // Hospital details
  nhHospitalInfo: '🏥 अस्पताल की जानकारी',
  nhType: 'प्रकार:',
  nhTotalBeds: 'कुल बिस्तर:',
  nhSpecializations: 'विशेषज्ञताएं:',
  nhEmergencyServices: '🚨 आपातकालीन सेवाएं',
  nhEmergencyWard: 'आपातकालीन वार्ड:',
  nhAvailable: '✅ उपलब्ध',
  nhNotAvailable: '❌ उपलब्ध नहीं',
  nhAmbulanceService: 'एम्बुलेंस सेवा:',
  nhOpeningHours: '🕒 खुलने का समय',
  nhContactInfo: '📞 संपर्क जानकारी',
  nhPhone: 'फोन:',
  nhEmail: 'ईमेल:',
  nhWebsite: 'वेबसाइट:',
  nhVisitWebsite: 'वेबसाइट देखें',
  nhFacilities: '🏥 सुविधाएं और सेवाएं',

  // Actions
  nhBookAppointment: 'अपॉइंटमेंट बुक करें',
  nhDirections: 'दिशा निर्देश',
  nhCall: 'कॉल करें',
  nhHideDetails: 'विवरण छुपाएं',
  nhViewDetails: 'विवरण देखें',

  // No results
  nhNoHospitals: 'कोई अस्पताल नहीं मिला',
  nhNoHospitalsDesc: 'Google Maps पर खोजें या अपना स्थान बदलें',
  nhSearchGoogleMaps: 'Google Maps पर खोजें',

  // Loader
  nhLoadingNearby: 'नजदीकी अस्पताल खोजे जा रहे हैं',
  nhLoadingNearbySubtitle: 'आपका स्थान प्राप्त किया जा रहा है और 5km के अंदर अस्पताल खोजे जा रहे हैं...',
  nhLoadingAll: 'सभी अस्पताल लोड हो रहे हैं',
  nhLoadingAllSubtitle: 'हमारे डेटाबेस से अस्पताल लाए जा रहे हैं...',

  // Appointment toast
  nhAppointmentBooked: 'अपॉइंटमेंट बुक हो गई!',

  // Errors
  errorGeneral: 'क्षमा करें, एक त्रुटि हुई। कृपया पुनः प्रयास करें।',
  errorOverloaded: '⚠️ AI मॉडल अभी व्यस्त है। कृपया एक मिनट प्रतीक्षा करें और पुनः प्रयास करें।',
  errorRateLimit: '⚠️ दर सीमा पहुँच गई। कृपया कुछ देर प्रतीक्षा करें और पुनः प्रयास करें।',
}

export default hi
