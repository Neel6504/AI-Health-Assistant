const gu = {
  // Header
  appTitle: 'મેડિકલ AI સહાયક',
  disclaimer: 'ફક્ત માહિતી માટે. આ વ્યાવસાયિક તબીબી સલાહનો વિકલ્પ નથી.',
  historyBtn: 'ઇતિહાસ',
  hideBtn: 'છુપાવો',
  historyTitle: 'ચિકિત્સા ઇતિહાસ જુઓ',
  welcomeUser: 'સ્વાગત છે,',
  logout: 'લોગઆઉટ',
  login: 'લોગિન',
  signUp: 'સાઇન અપ',

  // Language select
  langSelectLabel: 'ભાષા',
  langEnglish: 'English',
  langHindi: 'हिंदी',
  langGujarati: 'ગુજરાતી',

  // Chat input
  inputPlaceholder: 'તમારા લક્ષણો વર્ણવો...',
  sendBtn: 'મોકલો',

  // Initial AI welcome message
  initialMessage: 'નમસ્તે! તમારા લક્ષણોના આધારે સંભવિત આરોગ્ય સ્થિતિઓ ઓળખવામાં હું મદદ કરીશ. તમારી પરિસ્થિતિ સમજવા માટે હું થોડા પ્રશ્નો પૂછીશ. ચાલો શરૂ કરીએ: **આજે તમારો મુખ્ય લક્ષણ કે ચિંતા શું છે?**',

  // Loading / typing
  loadingHistory: 'તમારો પરામર્શ ઇતિહાસ લોડ થઈ રહ્યો છે...',
  loadingConversation: 'વાતચીત લોડ થઈ રહી છે...',

  // Dashboard
  dashboardTitle: 'મેડિકલ ઇતિહાસ ડેશબોર્ડ',
  dashboardSubtitle: 'તમારા આરોગ્ય પરામર્શ અને માહિતીને ટ્રેક કરો',
  medicalSessions: 'મેડિકલ સત્રો',
  totalConsultations: 'કુલ પરામર્શ',
  messagesExchanged: 'સંદેશોની આપલે',
  aiInteractions: 'AI ઇન્ટરએકશન',
  emergencyCases: 'આપાતકાલીન કેસ',
  urgentDetection: 'તાત્કાલિક ઓળખ',
  allClear: 'બધું સારું',
  hospitalSearches: 'હોસ્પિટલ શોધ',
  locationQueries: 'સ્થાન શોધ',
  recentConsultations: '🔬 તાજેતરના મેડિકલ પરામર્શ',
  sessions: 'સત્રો',
  aiAssessment: 'AI મૂલ્યાંકન',
  messages: 'સંદેશો',
  hospitalSearched: 'હોસ્પિટલ શોધાયું',
  viewChat: 'ચેટ જુઓ →',
  migrated: '📱 સ્થળાંતરિત',
  latestBadge: 'નવીનતમ',
  migratedFromGuest: 'અતિથિ સત્રમાંથી સ્થળાંતરિત',

  // Empty states
  noConsultations: 'હજુ સુધી કોઈ મેડિકલ પરામર્શ નથી',
  noConsultationsDesc: 'તમારી આરોગ્ય યાત્રા શરૂ કરવા માટે નીચે પ્રથમ વાતચીત શરૂ કરો!',
  symptomAnalysis: 'લક્ષણ વિશ્લેષણ અને ટ્રેકિંગ',
  medicalHistoryDash: 'મેડિકલ ઇતિહાસ ડેશબોર્ડ',
  emergencyDetection: 'આપાતકાલીન ઓળખ અને હોસ્પિટલ ફાઇન્ડર',
  noMessages: 'આ સત્ર માટે કોઈ સંદેશા મળ્યા નથી.',
  medicalConsultation: 'મેડિકલ પરામર્શ',
  youLabel: '🧑 તમે',
  aiLabel: '🤖 AI સહાયક',
  assessmentInProgress: 'મૂલ્યાંકન ચાલુ છે',

  // Emergency
  findHospitalsNow: '🚑 નજીકની આપાતકાલીન હોસ્પિટલ હમણાં શોધો',
  call911: '📞 108 પર કોલ કરો',
  findNearbyHospitals: '🏥 નજીકની હોસ્પિટલ શોધો',

  // ---- Nearby Hospitals Page ----
  // Header
  nhBack: 'પાછા',
  nhTitle: '🏥 હોસ્પિટલો',
  nhTabNearby: '📍 નજીકની હોસ્પિટલો',
  nhTabAll: '🏥 બધી હોસ્પિટલો',
  nhGoogleMaps: 'Google Maps',
  nhFoundHospitals: (n) => `5 કિમીમાં ${n} હોસ્પિટલ મળી`,
  nhSearching: 'તમારી નજીકની હોસ્પિટલ શોધી રહ્યા છીએ',
  nhShowingAll: (n) => `અમારા ડેટાબેઝમાંથી ${n} હોસ્પિટલો બતાવી રહ્યા છીએ`,
  nhRegistered: '🏥 ડેટાબેઝમાં નોંધાયેલા 5 કિમી વિસ્તારમાંના હોસ્પિટલ બતાવવામાં આવે છે',

  // Auth banner
  nhSaveHistory: 'તમારો મેડિકલ શોધ ઇતિહાસ સાચવો',
  nhLoginPrompt: 'તમારી હોસ્પિટલ શોધ અને મેડિકલ પરામર્શ તમારા ડેશબોર્ડમાં સાચવવા માટે લોગિન/સાઇન અપ કરો',
  nhLogin: 'લોગિન',
  nhSignUp: 'સાઇન અપ',
  nhWelcomeBack: (name) => `ફરી સ્વાગત છે, ${name}!`,
  nhSearchesSaved: 'તમારી શોધો આપમેળે ડેશબોર્ડમાં સાચવાઈ રહી છે',
  nhDashboard: 'ડેશબોર્ડ',
  nhLogout: 'લોગઆઉટ',

  // Error / retry
  nhRetry: '📍 સ્થાન ફરી પ્રયાસ કરો',
  nhSearchMaps: '🗺️ Maps પર શોધો',
  nhNoHospitalsError: '5 કિમીમાં અમારાં ડેટાબેઝમાં કોઈ હોસ્પિટલ મળી નથી. બધી નોંધાયેલ હોસ્પિટલો જોવા "બધી હોસ્પિટલો" ટેબ જુઓ.',

  // Location debug
  nhYourLocation: '📍 તમારું સ્થાન:',

  // Stats
  nhHospitalsFound: 'હોસ્પિટલ મળી',
  nhTotalHospitals: 'કુલ હોસ્પિટલો',
  nhOpenNow: 'હમણાં ખુલ્લી',
  nhNearest: 'સૌથી નજીક',
  nhClosest: 'સૌથી નજીક',

  // Hospital card
  nhOpen: '🟢 ખુલ્લું',
  nhClosed: '🔴 બંધ',
  nhAway: 'દૂર',
  nhReviews: 'સમીક્ષાઓ',

  // Hospital details
  nhHospitalInfo: '🏥 હોસ્પિટલ માહિતી',
  nhType: 'પ્રકાર:',
  nhTotalBeds: 'કુલ બેડ:',
  nhSpecializations: 'સ્પેશિયાલાઇઝેશન:',
  nhEmergencyServices: '🚨 આપાતકાલીન સેવાઓ',
  nhEmergencyWard: 'આપાતકાલીન વોર્ડ:',
  nhAvailable: '✅ ઉપલબ્ધ',
  nhNotAvailable: '❌ ઉપલબ્ધ નથી',
  nhAmbulanceService: 'એમ્બ્યુલન્સ સેવા:',
  nhOpeningHours: '🕒 કાર્ય સમય',
  nhContactInfo: '📞 સંપર્ક માહિતી',
  nhPhone: 'ફોન:',
  nhEmail: 'ઇમેઇલ:',
  nhWebsite: 'વેબસાઇટ:',
  nhVisitWebsite: 'વેબસાઇટ જુઓ',
  nhFacilities: '🏥 સુવિધાઓ અને સેવાઓ',

  // Actions
  nhBookAppointment: 'એપોઇન્ટમેન્ટ બુક કરો',
  nhDirections: 'દિશા',
  nhCall: 'કોલ',
  nhHideDetails: 'વિગતો છુપાવો',
  nhViewDetails: 'વિગતો જુઓ',

  // No results
  nhNoHospitals: 'કોઈ હોસ્પિટલ મળી નથી',
  nhNoHospitalsDesc: 'Google Maps પર શોધો અથવા તમારું સ્થાન બદલો',
  nhSearchGoogleMaps: 'Google Maps પર શોધો',

  // Loader
  nhLoadingNearby: 'નજીકની હોસ્પિટલો શોધી રહ્યા છીએ',
  nhLoadingNearbySubtitle: 'તમારું સ્થાન મેળવીને 5 કિમીની અંદર હોસ્પિટલો શોધી રહ્યા છીએ...',
  nhLoadingAll: 'બધી હોસ્પિટલો લોડ થઈ રહી છે',
  nhLoadingAllSubtitle: 'અમારા ડેટાબેઝમાંથી હોસ્પિટલો લાવી રહ્યા છીએ...',

  // Appointment toast
  nhAppointmentBooked: 'એપોઇન્ટમેન્ટ બુક થઈ ગઈ!',

  // Errors
  errorGeneral: 'માફ કરશો, એક ભૂલ આવી છે. કૃપા કરીને ફરી પ્રયાસ કરો.',
  errorOverloaded: '⚠️ AI મોડેલ હાલમાં વ્યસ્ત છે. કૃપા કરીને થોડું રાહ જુઓ અને ફરી પ્રયાસ કરો.',
  errorRateLimit: '⚠️ વિનંતી મર્યાદા પહોંચી ગઈ છે. થોડા સમય પછી ફરી પ્રયાસ કરો.'
}

export default gu
