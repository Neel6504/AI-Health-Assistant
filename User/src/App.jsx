import { useState, useRef, useEffect, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useLanguage } from './contexts/LanguageContext'
import Login from './components/Login'
import Signup from './components/Signup'
import Groq from 'groq-sdk'
import ReactMarkdown from 'react-markdown'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial, Stars, Float, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import './App.css'
import { CHAT_API } from './config/api'
import { detectCriticalSymptoms, isEmergency, isUrgent, getEmergencyAdvice } from './utils/criticalSymptomDetector'
import enT from './locales/en/translations'
import hiT from './locales/hi/translations'
import guT from './locales/gu/translations'

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
})

const SYSTEM_PROMPT = `You are a professional Medical AI Assistant designed to diagnose health conditions through a systematic question-based approach.

Your role is to:
- Ask ONE specific, relevant question at a time to gather information about the patient's symptoms.
- Build a complete picture through sequential questioning (location, duration, severity, associated symptoms, triggers, etc.).
- Analyze the collected information logically using medical knowledge and pattern recognition.
- **CRITICAL: Immediately recognize life-threatening symptoms and clearly state them in your response.**
- After gathering sufficient information through your questions, provide a list of possible conditions or diseases based on the symptoms.
- Maintain a calm, empathetic, and professional tone throughout the consultation.

Guidelines you must follow:
1. ALWAYS ask only ONE question per response until you have enough information.
2. Questions should be clear, specific, and directly relevant to narrowing down possible conditions.
3. **EMERGENCY DETECTION: If the patient describes symptoms of heart attack, stroke, severe chest pain, difficulty breathing, severe bleeding, loss of consciousness, or other life-threatening conditions, IMMEDIATELY mention these specific conditions in your response (use exact terms like "heart attack", "stroke", "severe bleeding", etc.).**
4. After 5-7 questions (or when you have sufficient information), provide your assessment.
5. In your final assessment, list possible conditions in order of likelihood.
6. Do NOT provide practical steps, precautions, or "when to consult a professional" sections.
7. Do NOT provide treatment advice, medication recommendations, or home remedies.
8. Focus only on identifying possible conditions based on the symptoms described.
9. Use simple, patient-friendly language without unnecessary medical jargon.
10. Be unbiased, ethical, and privacy-conscious at all times.
11. Always remind users in your final assessment that this is for informational purposes only and they should consult a healthcare professional for confirmation and treatment.

**CRITICAL SYMPTOMS TO WATCH FOR (mention these specifically if detected):**
- Heart attack symptoms: chest pain, pain radiating to arm/jaw, crushing sensation
- Stroke symptoms: facial drooping, arm weakness, speech difficulties, sudden confusion
- Severe respiratory: difficulty breathing, gasping, cannot breathe
- Internal bleeding: vomiting blood, blood in stool, severe abdominal pain
- Severe allergic reaction: throat swelling, anaphylaxis
- Loss of consciousness, seizures
- Severe trauma or injuries
- Cancer indicators (mention if symptoms strongly suggest)
- Pulmonary embolism symptoms
- Sepsis or severe infection signs

Question Strategy:
- Start with location and nature of the main symptom
- Ask about duration and progression
- Inquire about severity and pattern (use severity scales when appropriate)
- Check for associated symptoms
- Ask about triggers or relieving factors
- Inquire about medical history if relevant

Final Assessment Format:
After gathering information, provide:
- **Assessment Summary**: Brief overview of reported symptoms
- **Possible Conditions** (in order of likelihood):
  1. [Condition Name] - Brief explanation
  2. [Condition Name] - Brief explanation
  3. [Condition Name] - Brief explanation
- **Important**: Remind them to consult a healthcare professional for proper diagnosis and treatment.

Your goal is to conduct a thorough diagnostic interview and provide an informed assessment of possible conditions while ensuring critical symptoms are immediately identified.`

const SYSTEM_PROMPT_HI = `आप एक पेशेवर मेडिकल AI सहायक हैं जो एक व्यवस्थित प्रश्न-आधारित दृष्टिकोण के माध्यम से स्वास्थ्य स्थितियों का निदान करने के लिए डिज़ाइन किए गए हैं।

आपकी भूमिका है:
- रोगी के लक्षणों के बारे में जानकारी एकत्र करने के लिए एक बार में एक विशिष्ट, प्रासंगिक प्रश्न पूछना।
- अनुक्रमिक पूछताछ के माध्यम से पूरी तस्वीर बनाना (स्थान, अवधि, गंभीरता, संबंधित लक्षण, ट्रिगर आदि)।
- चिकित्सा ज्ञान और पैटर्न पहचान का उपयोग करके एकत्रित जानकारी का तार्किक विश्लेषण करना।
- **महत्वपूर्ण: जीवन के लिए खतरनाक लक्षणों को तुरंत पहचानें और अपने उत्तर में स्पष्ट रूप से बताएं।**
- पर्याप्त जानकारी एकत्र करने के बाद, लक्षणों के आधार पर संभावित स्थितियों या बीमारियों की सूची प्रदान करें।
- पूरे परामर्श में शांत, सहानुभूतिपूर्ण और पेशेवर स्वर बनाए रखें।

आपके लिए अनिवार्य दिशानिर्देश:
1. जब तक पर्याप्त जानकारी न हो, हमेशा एक उत्तर में केवल एक प्रश्न पूछें।
2. **आपातकालीन पहचान: यदि रोगी हृदयाघात, स्ट्रोक, गंभीर सीने में दर्द, सांस लेने में कठिनाई, गंभीर रक्तस्राव, चेतना खोने आदि के लक्षण बताए, तो तुरंत इन विशेष स्थितियों का उल्लेख करें।**
3. 5-7 प्रश्नों के बाद (या पर्याप्त जानकारी होने पर) अपना मूल्यांकन दें।
4. अपने अंतिम मूल्यांकन में संभावित स्थितियों को संभावना के क्रम में सूचीबद्ध करें।
5. व्यावहारिक कदम, सावधानियां या उपचार सलाह न दें।
6. सरल, रोगी-अनुकूल भाषा का उपयोग करें।
7. हमेशा याद दिलाएं कि यह केवल सूचनात्मक है और उचित निदान के लिए स्वास्थ्य पेशेवर से परामर्श करें।
8. **सभी उत्तर हिंदी में दें।**

अंतिम मूल्यांकन प्रारूप:
- **मूल्यांकन सारांश (Assessment Summary)**: रिपोर्ट किए गए लक्षणों का संक्षिप्त विवरण
- **संभावित स्थितियाँ (Possible Conditions)** (संभावना के क्रम में):
  1. [स्थिति का नाम] - संक्षिप्त व्याख्या
  2. [स्थिति का नाम] - संक्षिप्त व्याख्या
  3. [स्थिति का नाम] - संक्षिप्त व्याख्या
- **महत्वपूर्ण**: उचित निदान और उपचार के लिए स्वास्थ्य पेशेवर से परामर्श करने की याद दिलाएं।

आपका लक्ष्य एक संपूर्ण नैदानिक साक्षात्कार करना और संभावित स्थितियों का सूचित मूल्यांकन प्रदान करना है।`

const SYSTEM_PROMPT_GU = `${SYSTEM_PROMPT}\n\nIMPORTANT: Provide all responses in Gujarati language (ગુજરાતી).`

const TRANSLATIONS_BY_LANGUAGE = {
  en: enT,
  hi: hiT,
  gu: guT
}

const SYSTEM_PROMPT_BY_LANGUAGE = {
  en: SYSTEM_PROMPT,
  hi: SYSTEM_PROMPT_HI,
  gu: SYSTEM_PROMPT_GU
}

// 3D Background Components
function AnimatedSphere({ position, color, speed = 1 }) {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * speed * 0.2
      meshRef.current.rotation.y = state.clock.getElapsedTime() * speed * 0.3
      meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * speed) * 0.5
    }
  })
  
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere ref={meshRef} args={[1, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  )
}

function Particles() {
  const pointsRef = useRef()
  const particleCount = 2000
  
  const particles = new Float32Array(particleCount * 3)
  for (let i = 0; i < particleCount * 3; i++) {
    particles[i] = (Math.random() - 0.5) * 50
  }
  
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.02
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.03
    }
  })
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#8b5cf6"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}

function RotatingRing({ position, radius = 2 }) {
  const ringRef = useRef()
  
  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = state.clock.getElapsedTime() * 0.3
      ringRef.current.rotation.z = state.clock.getElapsedTime() * 0.2
    }
  })
  
  return (
    <mesh ref={ringRef} position={position}>
      <torusGeometry args={[radius, 0.1, 16, 100]} />
      <meshStandardMaterial
        color="#06b6d4"
        emissive="#06b6d4"
        emissiveIntensity={0.5}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  )
}

function DNAHelix({ position = [0, 0, 0], scale = 1 }) {
  const groupRef = useRef()
  const helixPoints = 20 // Reduced from 40 for better performance
  const radius = 1.2
  const height = 8
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.1 // Slower rotation
    }
  })
  
  const createStrandPoints = (offset) => {
    const points = []
    for (let i = 0; i < helixPoints; i++) {
      const t = (i / helixPoints) * height - height / 2
      const angle = (i / helixPoints) * Math.PI * 4 + offset
      points.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          t,
          Math.sin(angle) * radius
        )
      )
    }
    return points
  }
  
  const strand1Points = createStrandPoints(0)
  const strand2Points = createStrandPoints(Math.PI)
  
  return (
    <group ref={groupRef} position={position} scale={scale} rotation={[0.3, 0, 0.3]}>
      {/* First DNA Strand */}
      {strand1Points.map((point, i) => (
        <mesh key={`strand1-${i}`} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial
            color="#00d4ff"
            emissive="#00d4ff"
            emissiveIntensity={0.2}
            metalness={0.6}
            roughness={0.3}
            transparent={true}
            opacity={0.08}
          />
        </mesh>
      ))}
      
      {/* Second DNA Strand */}
      {strand2Points.map((point, i) => (
        <mesh key={`strand2-${i}`} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={0.2}
            metalness={0.6}
            roughness={0.3}
            transparent={true}
            opacity={0.08}
          />
        </mesh>
      ))}
      
      {/* Base Pairs - Connecting Lines */}
      {strand1Points.map((point1, i) => {
        if (i % 2 === 0) {
          const point2 = strand2Points[i]
          const midPoint = new THREE.Vector3(
            (point1.x + point2.x) / 2,
            (point1.y + point2.y) / 2,
            (point1.z + point2.z) / 2
          )
          const distance = point1.distanceTo(point2)
          const direction = new THREE.Vector3().subVectors(point2, point1).normalize()
          const quaternion = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction
          )
          
          return (
            <mesh
              key={`base-${i}`}
              position={[midPoint.x, midPoint.y, midPoint.z]}
              quaternion={quaternion}
            >
              <cylinderGeometry args={[0.08, 0.08, distance, 8]} />
              <meshStandardMaterial
                color="#8b5cf6"
                emissive="#8b5cf6"
                emissiveIntensity={0.3}
                metalness={0.7}
                roughness={0.3}
                transparent={true}
                opacity={0.1}
              />
            </mesh>
          )
        }
        return null
      })}
    </group>
  )
}

function Scene3D() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-10, -10, -10]} color="#8b5cf6" intensity={0.8} />
      
      <DNAHelix position={[0, 0, -3]} scale={1.8} />
      
      <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
    </>
  )
}

function App() {
  const navigate = useNavigate()
  const { user, token, logout } = useAuth()
  const { language, setLanguage } = useLanguage()
  const t = TRANSLATIONS_BY_LANGUAGE[language] || enT
  
  // Authentication states
  const [showAuth, setShowAuth] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: enT.initialMessage
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // When language changes, if only the initial welcome message exists, update it
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        const translations = TRANSLATIONS_BY_LANGUAGE[language] || enT
        return [{ role: 'assistant', content: translations.initialMessage }]
      }
      return prev
    })
  }, [language])
  
  // Dashboard integration states
  const [showDashboard, setShowDashboard] = useState(false)
  const [dashboardStats, setDashboardStats] = useState(null)
  const [recentSessions, setRecentSessions] = useState([])
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [selectedChatSession, setSelectedChatSession] = useState(null)
  const [chatSessionLoading, setChatSessionLoading] = useState(false)
  
  // Chat session management
  const [currentSession, setCurrentSession] = useState(null)
  const [sessionCreated, setSessionCreated] = useState(false)
  
  // Local storage key for guest sessions
  const GUEST_SESSION_KEY = 'ai_health_guest_session'
  
  // API Base URL
  const API_URL = CHAT_API

  // Enhanced save guest session with current conversation state
  const saveGuestSession = (messages, symptoms = []) => {
    try {
      const guestSession = {
        messages: messages.filter(msg => 
          !msg.content.includes('emergency-warning|||') && 
          msg.content !== 'hospital-finder-prompt'
        ),
        symptoms: symptoms,
        timestamp: new Date().toISOString(),
        completed: messages.some(msg => isDiagnosisComplete(msg.content)),
        sessionId: `guest_${Date.now()}`, // Add unique ID for tracking
        messageCount: messages.length
      }
      localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(guestSession))
      console.log('Guest session saved:', guestSession.messageCount, 'messages')
    } catch (error) {
      console.error('Error saving guest session:', error)
    }
  }

  const getGuestSession = () => {
    try {
      const stored = localStorage.getItem(GUEST_SESSION_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Error loading guest session:', error)
      return null
    }
  }

  const clearGuestSession = () => {
    try {
      localStorage.removeItem(GUEST_SESSION_KEY)
    } catch (error) {
      console.error('Error clearing guest session:', error)
    }
  }

  // Migrate guest session to authenticated session
  const migrateGuestSession = async () => {
    if (!user || !token) return
    
    // Check for both stored guest session and current messages
    const guestSession = getGuestSession()
    const hasCurrentConversation = messages.length > 1 // More than just initial message
    
    // If no stored session but has current conversation, create one from current state
    if (!guestSession && hasCurrentConversation) {
      console.log('Migrating current ongoing conversation to authenticated session')
      try {
        // Create new authenticated session for current conversation
        const session = await createChatSession()
        if (!session) return
        
        // Update current session state
        setCurrentSession(session)
        setSessionCreated(true)
        
        // Save all current messages (skip system messages)
        for (const message of messages) {
          if (message.role === 'user' || message.role === 'assistant') {
            await saveMessage(
              message.role === 'user' ? 'user' : 'ai',
              message.content,
              { migratedFromCurrentChat: true }
            )
          }
        }
        
        console.log('Current conversation migrated successfully')
        return
      } catch (error) {
        console.error('Error migrating current conversation:', error)
        return
      }
    }
    
    // Handle stored guest session migration
    if (guestSession && guestSession.messages.length > 1) {
      console.log('Migrating stored guest session to authenticated session')
      try {
        // Create new authenticated session
        const session = await createChatSession()
        if (!session) return

        // Update current session state for ongoing conversations
        setCurrentSession(session)
        setSessionCreated(true)

        // Save all messages from stored guest session
        for (const message of guestSession.messages) {
          if (message.role === 'user' || message.role === 'assistant') {
            await saveMessage(
              message.role === 'user' ? 'user' : 'ai', 
              message.content,
              { migratedFromGuest: true }
            )
          }
        }

        // Save any critical symptoms detected during guest session
        for (const symptom of guestSession.symptoms || []) {
          await saveCriticalSymptom(symptom.symptom, symptom.emergencyLevel)
        }

        // Clear guest session after successful migration
        clearGuestSession()
        
        console.log('Stored guest session migrated successfully')
      } catch (error) {
        console.error('Error migrating stored guest session:', error)
      }
    }
  }

  // Fetch dashboard data when toggling dashboard view
  const fetchDashboardData = async () => {
    if (!user || !token) return
    
    try {
      setDashboardLoading(true)
      
      const [statsRes, sessionsRes] = await Promise.all([
        fetch(`${API_URL}/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_URL}/recent?limit=5&includeMessages=true`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      const statsData = await statsRes.json()
      const sessionsData = await sessionsRes.json()

      if (statsData.success) {
        setDashboardStats(statsData.stats)
      }

      if (sessionsData.success) {
        setRecentSessions(sessionsData.sessions)
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error)
    } finally {
      setDashboardLoading(false)
    }
  }

  // Handle authentication changes and migrate sessions
  useEffect(() => {
    if (user && token) {
      // User just logged in — migrate current in-memory conversation to DB
      const performMigration = async () => {
        await migrateGuestSession()
        clearGuestSession() // Always wipe local data after login
        setTimeout(() => refreshDashboard(), 1000)
      }
      performMigration()
    }
  }, [user, token])

  // On mount: if not logged in, wipe any stored guest data (guest data does not persist across refreshes)
  useEffect(() => {
    if (!user && !token) {
      clearGuestSession()
    }
  }, [])

  // Refresh dashboard when user returns to this tab (e.g. from nearby hospitals page)
  useEffect(() => {
    const onVisible = () => {
      if (!document.hidden && showDashboard && user && token) {
        fetchDashboardData()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [showDashboard, user, token])

  // Toggle dashboard visibility and refresh data
  const toggleDashboard = async () => {
    const newShowDashboard = !showDashboard
    setShowDashboard(newShowDashboard)
    
    if (newShowDashboard && user && token) {
      await fetchDashboardData()
    }
  }
  
  // Force refresh dashboard data (used after session migration)
  const refreshDashboard = async () => {
    if (user && token) {
      await fetchDashboardData()
    }
  }

  // Open a past session's full chat
  const openChatSession = async (sessionId) => {
    setChatSessionLoading(true)
    setSelectedChatSession({ sessionId, messages: [], loading: true })
    try {
      const res = await fetch(`${API_URL}/sessions/${sessionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setSelectedChatSession(data.session)
      }
    } catch (err) {
      console.error('Error fetching session:', err)
    } finally {
      setChatSessionLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
    // Auto-focus input when new message arrives with debounce
    const timeoutId = setTimeout(() => {
      if (inputRef.current && !isLoading) {
        inputRef.current.focus()
      }
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [messages, isLoading])

  // Cleanup effect - end session when component unmounts or diagnosis complete
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentSession) {
        endChatSession()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      // End session if component unmounts
      if (currentSession) {
        endChatSession()
      }
    }
  }, [currentSession])

  // End session when diagnosis is complete
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage && lastMessage.role === 'assistant' && isDiagnosisComplete(lastMessage.content) && currentSession) {
      setTimeout(() => {
        endChatSession()
      }, 30000) // End session 30 seconds after diagnosis complete
    }
  }, [messages, currentSession])

  // Relative time helper
  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Check if the message contains disease prediction (assessment)
  // Requires BOTH the Assessment Summary section AND a numbered Possible Conditions list,
  // matching the final assessment format defined in SYSTEM_PROMPT.
  const isDiagnosisComplete = (content) => {
    const hasAssessmentSummary = /assessment summary|summary of symptoms|symptom summary|मूल्यांकन सारांश|અસેસમેન્ટ સારાંશ|લક્ષણોનો સારાંશ|સારાંશ/i.test(content)
    const hasPossibleConditions = /possible conditions|conditions to consider|likely conditions|potential conditions|संभावित स्थितियाँ|संभावित रोग|સંભવિત સ્થિતિઓ|સંભવિત કારણો|સંબંધિત કારણો/i.test(content)
    const hasNumberedConditions = /^\s*\d+\.\s+\S/m.test(content)
    return hasNumberedConditions && (hasAssessmentSummary || hasPossibleConditions)
  }

  // Session Management Functions
  const createChatSession = async () => {
    if (!user || !token || sessionCreated) return null

    try {
      const res = await fetch(`${API_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: 'Medical Consultation'
        })
      })

      const data = await res.json()
      if (data.success) {
        setCurrentSession(data.session)
        setSessionCreated(true)
        return data.session
      }
    } catch (error) {
      console.error('Error creating session:', error)
    }
    return null
  }

  const saveMessage = async (sender, content, metadata = {}) => {
    if (!user || !token || !currentSession) return

    try {
      await fetch(`${API_URL}/sessions/${currentSession.sessionId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sender,
          content,
          metadata
        })
      })
    } catch (error) {
      console.error('Error saving message:', error)
    }
  }

  const saveCriticalSymptom = async (symptom, emergencyLevel) => {
    if (!user || !token || !currentSession) return

    try {
      await fetch(`${API_URL}/sessions/${currentSession.sessionId}/symptoms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          symptom,
          emergencyLevel: emergencyLevel.toLowerCase().replace('_', ' ')
        })
      })
    } catch (error) {
      console.error('Error saving critical symptom:', error)
    }
  }

  const endChatSession = async () => {
    if (!user || !token || !currentSession) return

    try {
      await fetch(`${API_URL}/sessions/${currentSession.sessionId}/end`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }

  // Function to save hospital search when navigating to hospitals page
  const saveHospitalSearch = async (hospitals = [], userLocation = null) => {
    if (!user || !token || !currentSession) return

    try {
      await fetch(`${API_URL}/sessions/${currentSession.sessionId}/hospitals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          hospitals,
          userLocation
        })
      })
    } catch (error) {
      console.error('Error saving hospital search:', error)
    }
  }

  // Flush current in-memory messages to localStorage when navigating away as guest
  // so AuthContext can migrate them to DB on login
  const flushGuestSession = () => {
    if (!user && !token && messages.length > 1) {
      saveGuestSession(messages)
    }
  }

  // Enhanced navigation to hospitals with session tracking
  const navigateToHospitals = async () => {
    if (user && token) {
      try {
        // Create session if one doesn't exist yet (user clicked emergency button before sending a message)
        let session = currentSession
        if (!session) {
          session = await createChatSession()
        }

        // If we have a session, flush all in-memory messages that weren't saved yet
        // (this happens when user navigates mid-conversation via emergency button)
        if (session) {
          for (const msg of messages) {
            if (msg.role === 'user' || msg.role === 'assistant') {
              await saveMessage(
                msg.role === 'user' ? 'user' : 'ai',
                msg.content,
                { flushedOnNavigation: true }
              )
            }
          }
          // Mark hospital search on this session
          await saveHospitalSearch()
          // End session so it appears complete in dashboard
          await endChatSession()
        }
      } catch (err) {
        console.error('Error saving session before navigation:', err)
      }
    } else {
      // Guest: flush current conversation to localStorage before navigating
      // AuthContext will migrate it to DB when they log in
      flushGuestSession()
    }
    navigate('/nearby-hospitals')
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Store input value before clearing to prevent UI lag
    const currentInput = input.trim()
    setInput('') // Clear immediately for better UX
    setIsLoading(true)

    // Create session for authenticated users if first message
    let session = currentSession
    if (user && token && !sessionCreated) {
      session = await createChatSession()
      // Ensure the session state is updated immediately
      if (session) {
        setCurrentSession(session)
        setSessionCreated(true)
      }
    }

    const userMessage = { role: 'user', content: currentInput }
    setMessages(prev => [...prev, userMessage])

    // Save user message if authenticated
    if (user && token && session) {
      await saveMessage('user', currentInput)
    }
    // For guests, save to localStorage (always save current state)
    else {
      const updatedMessages = [...messages, userMessage]
      saveGuestSession(updatedMessages)
    }

    try {
      // Build messages for Groq API with system prompt (language-aware)
      const activeSystemPrompt = SYSTEM_PROMPT_BY_LANGUAGE[language] || SYSTEM_PROMPT
      const chatMessages = [
        { role: 'system', content: activeSystemPrompt },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: userMessage.content }
      ]

      const completion = await groq.chat.completions.create({
        messages: chatMessages,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1024
      })

      const assistantMessage = {
        role: 'assistant',
        content: completion.choices[0].message.content
      }
      setMessages(prev => [...prev, assistantMessage])

      // Save AI message if authenticated
      if (user && token && session) {
        await saveMessage('ai', assistantMessage.content)
      }
      // For guests, save to localStorage (always save current conversation)
      else {
        const updatedMessages = [...messages, userMessage, assistantMessage]
        saveGuestSession(updatedMessages)
      }
      
      // Check for critical symptoms in both user input and AI response
      const userDetection = detectCriticalSymptoms(currentInput)
      const aiDetection = detectCriticalSymptoms(assistantMessage.content)
      const criticalDetection = userDetection || aiDetection
      const detectedSymptoms = Array.isArray(criticalDetection?.symptoms)
        ? criticalDetection.symptoms
        : (criticalDetection?.matchedKeyword ? [criticalDetection.matchedKeyword] : [])
      const symptomSummary = detectedSymptoms.length > 0
        ? detectedSymptoms.join(', ')
        : (criticalDetection?.condition || 'critical symptom detected')
      
      // If critical symptoms detected, show emergency warning and save to session
      if (criticalDetection) {
        // Save critical symptom to session if authenticated
        if (user && token && session) {
          await saveCriticalSymptom(
            symptomSummary,
            criticalDetection.severity
          )
        }
        // For guests, save to localStorage with symptom data
        else {
          const currentMessages = [...messages, userMessage, assistantMessage]
          const symptoms = [{
            symptom: symptomSummary,
            emergencyLevel: criticalDetection.severity,
            timestamp: new Date().toISOString()
          }]
          saveGuestSession(currentMessages, symptoms)
        }

        setTimeout(() => {
          const emergencyAdvice = getEmergencyAdvice(criticalDetection.severity)
          setMessages(prev => [...prev, {
            role: 'system',
            content: `emergency-warning|||${criticalDetection.warning}|||${emergencyAdvice}|||${criticalDetection.severity}`
          }])
        }, 500)
      }
      // Otherwise, check if diagnosis is complete and show hospital finder button
      else if (isDiagnosisComplete(assistantMessage.content)) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'system',
            content: 'hospital-finder-prompt'
          }])
        }, 1000)
      }
    } catch (error) {
      console.error('Error:', error)
      
      let errorMessage = t.errorGeneral
      
      // Check for rate limit or overload errors
      if (error.message?.includes('overloaded') || error.message?.includes('503')) {
        errorMessage = t.errorOverloaded
      } else if (error.message?.includes('429') || error.message?.includes('quota')) {
        errorMessage = t.errorRateLimit
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage
      }])
    } finally {
      setIsLoading(false)
    }
  }
  
  // Toggle between login and signup
  const switchToSignup = () => setIsLogin(false)
  const switchToLogin = () => setIsLogin(true)
  const closeAuth = () => setShowAuth(false)

  return (
    <div className="app-container">
      <Canvas 
        className="canvas-background"
        dpr={[1, 1.5]} // Limit device pixel ratio for better performance
        performance={{ min: 0.5 }} // Lower performance threshold
        frameloop="demand" // Only render when needed
      >
        <Suspense fallback={null}>
          <Scene3D />
        </Suspense>
      </Canvas>
      
      <div className="chat-container">
        <div className="chat-header">
          <div className="header-top">
            <h1>{t.appTitle}</h1>
            <div className="header-controls">
              {user ? (
                <>
                  <button 
                    onClick={toggleDashboard}
                    className={`dashboard-toggle ${showDashboard ? 'active' : ''}`}
                    title={t.historyTitle}
                  >
                    📊 {showDashboard ? t.hideBtn : t.historyBtn}
                  </button>
                  <div className="user-info">
                    <span>{t.welcomeUser} {user.name}</span>
                    <button onClick={logout} className="logout-btn">{t.logout}</button>
                  </div>
                </>
              ) : (
                <div className="guest-auth">
                  <button 
                    onClick={() => { setShowAuth(true); setIsLogin(true); }}
                    className="auth-btn login-btn-small"
                  >
                    {t.login}
                  </button>
                  <button 
                    onClick={() => { setShowAuth(true); setIsLogin(false); }}
                    className="auth-btn signup-btn-small"
                  >
                    {t.signUp}
                  </button>
                </div>
              )}
              <div className="language-control">
                <select
                  className="language-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  aria-label={t.langSelectLabel || 'Select language'}
                  title={t.langSelectLabel || 'Select language'}
                >
                  <option value="en">EN - {t.langEnglish || 'English'}</option>
                  <option value="hi">HI - {t.langHindi || 'Hindi'}</option>
                  <option value="gu">GU - {t.langGujarati || 'Gujarati'}</option>
                </select>
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: '0.5rem 0 0 0' }}>
            {t.disclaimer}
          </p>
        </div>
        
        <>
          {/* Show auth modal when needed */}
          {showAuth && (
            <div className="auth-modal-overlay">
              <div className="auth-modal">
                {isLogin ? (
                  <Login 
                    onSwitchToSignup={switchToSignup}
                    onClose={closeAuth}
                    onSuccess={migrateGuestSession}
                  />
                ) : (
                  <Signup 
                    onSwitchToLogin={switchToLogin}
                    onClose={closeAuth}
                    onSuccess={migrateGuestSession}
                  />
                )}
              </div>
            </div>
          )}

          {/* Inline Dashboard */}
          {showDashboard && user && (
          <div className="inline-dashboard">
            <div className="dashboard-header-inline">
              <div className="dashboard-title">
                <div className="title-icon">📊</div>
                <div className="title-text">
                  <h2>{t.dashboardTitle}</h2>
                  <p>{t.dashboardSubtitle}</p>
                </div>
              </div>
              <div className="dashboard-actions">
                <button onClick={() => setShowDashboard(false)} className="dashboard-close">
                  ✕
                </button>
              </div>
            </div>
            
            {dashboardLoading ? (
              <div className="dashboard-loading-inline">
                <div className="loading-spinner-small"></div>
                <p>Loading your consultation history...</p>
              </div>
            ) : (
              <>
                {dashboardLoading && (
                  <div className="dashboard-loading-inline">
                    <div className="loading-spinner-small"></div>
                    <p>{t.loadingHistory}</p>
                  </div>
                )}
                {/* Statistics Cards */}
                {dashboardStats && (
                  <div className="stats-grid-inline">
                    <div className="stat-card-inline sessions">
                      <div className="stat-visual">
                        <div className="stat-icon">💬</div>
                        <div className="stat-trend">+{dashboardStats.totalSessions}</div>
                      </div>
                      <div className="stat-content">
                        <h3>{dashboardStats.totalSessions}</h3>
                        <p>{t.medicalSessions}</p>
                        <span className="stat-subtitle">{t.totalConsultations}</span>
                      </div>
                    </div>
                    
                    <div className="stat-card-inline messages">
                      <div className="stat-visual">
                        <div className="stat-icon">💭</div>
                        <div className="stat-trend">+{dashboardStats.totalMessages}</div>
                      </div>
                      <div className="stat-content">
                        <h3>{dashboardStats.totalMessages}</h3>
                        <p>{t.messagesExchanged}</p>
                        <span className="stat-subtitle">{t.aiInteractions}</span>
                      </div>
                    </div>
                    
                    <div className="stat-card-inline emergency">
                      <div className="stat-visual">
                        <div className="stat-icon">🚨</div>
                        <div className="stat-trend">{dashboardStats.emergencySessions > 0 ? '❗' : '✅'}</div>
                      </div>
                      <div className="stat-content">
                        <h3>{dashboardStats.emergencySessions}</h3>
                        <p>{t.emergencyCases}</p>
                        <span className="stat-subtitle">{dashboardStats.emergencySessions > 0 ? t.urgentDetection : t.allClear}</span>
                      </div>
                    </div>
                    
                    <div className="stat-card-inline hospitals">
                      <div className="stat-visual">
                        <div className="stat-icon">🏥</div>
                        <div className="stat-trend">+{dashboardStats.hospitalSearches}</div>
                      </div>
                      <div className="stat-content">
                        <h3>{dashboardStats.hospitalSearches}</h3>
                        <p>{t.hospitalSearches}</p>
                        <span className="stat-subtitle">{t.locationQueries}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Recent Sessions */}
                <div className="recent-sessions-inline">
                  <div className="sessions-header">
                    <h3>{t.recentConsultations}</h3>
                    <span className="sessions-count">{recentSessions.length} {t.sessions}</span>
                  </div>
                  {recentSessions.length > 0 ? (
                    <div className="sessions-list-inline">
                      {recentSessions.map((session, index) => {
                        // Use structured medical data instead of conversation snippets
                        const userContent = session.messages?.find(m => m.sender === 'user')?.content;
                        const symptoms = session.reportedSymptoms?.length > 0
                          ? session.reportedSymptoms.join(', ')
                          : userContent ? userContent.substring(0, 60) + '...' : t.medicalConsultation;
                        const aiContent = session.messages?.find(m => m.sender === 'ai' && isDiagnosisComplete(m.content))?.content;
                        const diagnosis = session.finalDiagnosis || session.aiConclusion ||
                          (aiContent ? aiContent.substring(0, 100) + '...' : t.assessmentInProgress);
                        
                        return (
                          <div key={session._id} className="session-item-inline" onClick={() => openChatSession(session.sessionId)}>
                            <div className="session-header">
                              <div className={`priority-indicator ${session.emergencyLevel || 'normal'}`}></div>
                            </div>
                            
                            <div className="session-main">
                              <div className="session-header-inline">
                                <div className="session-title-group">
                                  <h4>{session.title || t.medicalConsultation}</h4>
                                  {session.emergencyLevel && (
                                    <span className={`emergency-badge ${session.emergencyLevel}`}>
                                      🚨 {session.emergencyLevel.toUpperCase()}
                                    </span>
                                  )}
                                  {index === 0 && (
                                    <span className="latest-badge">{t.latestBadge || 'Latest'}</span>
                                  )}
                                  </div>
                                  <div className="session-meta">
                                    <span className="session-date" title={new Date(session.createdAt).toLocaleString()}>
                                      {timeAgo(session.createdAt)}
                                    </span>
                                    {session.migratedFromGuest && (
                                      <span className="migrated-badge" title={t.migratedFromGuest || 'Migrated from guest session'}>{t.migrated}</span>
                                    )}
                                  </div>
                                  <div className="medical-content">
                                    {symptoms.length > 80 ? symptoms.substring(0, 80) + '...' : symptoms}
                                  </div>
                                </div>
                                <div className="medical-row diagnosis">
                                  <div className="medical-label">
                                    <span className="medical-icon">🔬</span>
                                    <strong>{t.aiAssessment}</strong>
                                  </div>
                                  <div className="medical-content">
                                    {diagnosis.length > 120 ? diagnosis.substring(0, 120) + '...' : diagnosis}
                                  </div>
                                </div>
                              
                              <div className="session-stats-inline">
                                <span className="stat-item messages">
                                  <span className="stat-icon">💭</span>
                                  {session.messageCount} {t.messages}
                                </span>
                                <span className="stat-item duration">
                                  <span className="stat-icon">⏱️</span>
                                  {timeAgo(session.createdAt)}
                                </span>
                                {session.hospitalSearched && (
                                  <span className="stat-item hospital">
                                    <span className="stat-icon">🏥</span>
                                    {t.hospitalSearched}
                                  </span>
                                )}
                                <span className="stat-item view-chat">
                                  <span className="stat-icon">💬</span>
                                  {t.viewChat}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="no-sessions-inline">
                      <div className="no-sessions-icon">🩺</div>
                      <div className="no-sessions-content">
                        <h4>{t.noConsultations}</h4>
                        <p>{t.noConsultationsDesc}</p>
                        <div className="features-preview">
                          <div className="feature-item">
                            <span className="feature-icon">🔍</span>
                            <span>{t.symptomAnalysis}</span>
                          </div>
                          <div className="feature-item">
                            <span className="feature-icon">📊</span>
                            <span>{t.medicalHistoryDash}</span>
                          </div>
                          <div className="feature-item">
                            <span className="feature-icon">🏥</span>
                            <span>{t.emergencyDetection}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        </>

        {/* Chat History Viewer Modal */}
        {selectedChatSession && (
          <div className="chat-viewer-overlay" onClick={() => setSelectedChatSession(null)}>
            <div className="chat-viewer-modal" onClick={e => e.stopPropagation()}>
              <div className="chat-viewer-header">
                <div className="chat-viewer-title">
                  <span>💬</span>
                  <h3>{selectedChatSession.title || t.medicalConsultation}</h3>
                  {selectedChatSession.createdAt && (
                    <span className="chat-viewer-date">{new Date(selectedChatSession.createdAt).toLocaleString()}</span>
                  )}
                </div>
                <button className="chat-viewer-close" onClick={() => setSelectedChatSession(null)}>✕</button>
              </div>
              <div className="chat-viewer-body">
                {chatSessionLoading || selectedChatSession.loading ? (
                  <div className="chat-viewer-loading">
                    <div className="loading-spinner-small"></div>
                    <p>{t.loadingConversation}</p>
                  </div>
                ) : selectedChatSession.messages?.length > 0 ? (
                  selectedChatSession.messages.map((msg, i) => (
                    <div key={i} className={`chat-viewer-msg ${msg.sender}`}>
                      <div className="chat-viewer-msg-label">
                        {msg.sender === 'user' ? t.youLabel : t.aiLabel}
                      </div>
                      <div className="chat-viewer-msg-content">
                        {msg.sender === 'ai' ? (
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        ) : msg.content}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="chat-viewer-empty">{t.noMessages}</div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="chat-messages">
          {messages.map((message, index) => {
            // Handle emergency warning
            if (message.content.startsWith('emergency-warning|||')) {
              const [, warning, advice, severity] = message.content.split('|||')
              return (
                <div key={index} className={`emergency-alert ${severity.toLowerCase()}`}>
                  <div className="emergency-header">
                    {warning}
                  </div>
                  <div className="emergency-advice">
                    <ReactMarkdown>{advice}</ReactMarkdown>
                  </div>
                  <div className="emergency-buttons">
                    <button onClick={navigateToHospitals} className="emergency-hospitals-btn">
                      {t.findHospitalsNow}
                    </button>
                    {severity === 'EMERGENCY' && (
                      <a href="tel:112" className="call-911-btn">
                        {t.call911}
                      </a>
                    )}
                  </div>
                </div>
              )
            }
            
            // Handle regular hospital finder prompt
            if (message.content === 'hospital-finder-prompt') {
              return (
                <div key={index} className="hospital-finder-prompt">
                  <button onClick={navigateToHospitals} className="find-hospitals-btn">
                    {t.findNearbyHospitals}
                  </button>
                </div>
              )
            }
            
            // Handle regular messages
            return (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-content">
                  {message.role === 'assistant' ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            )
          })}
          
          {isLoading && (
            <div className="message assistant">
              <div className="message-content typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="chat-input-form">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.inputPlaceholder}
            disabled={isLoading}
            className="chat-input"
            autoFocus
            autoComplete="off"
            spellCheck="false"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="send-button"
          >
            {t.sendBtn}
          </button>
        </form>
      </div>
    </div>
  )
}

export default App
