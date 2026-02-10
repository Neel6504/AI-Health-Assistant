import { useState, useRef, useEffect, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import Groq from 'groq-sdk'
import ReactMarkdown from 'react-markdown'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial, Stars, Float, Environment, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import './App.css'

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true
})

const SYSTEM_PROMPT = `You are a professional Medical AI Assistant designed to diagnose health conditions through a systematic question-based approach.

Your role is to:
- Ask ONE specific, relevant question at a time to gather information about the patient's symptoms.
- Build a complete picture through sequential questioning (location, duration, severity, associated symptoms, triggers, etc.).
- Analyze the collected information logically using medical knowledge and pattern recognition.
- After gathering sufficient information through your questions, provide a list of possible conditions or diseases based on the symptoms.
- Maintain a calm, empathetic, and professional tone throughout the consultation.

Guidelines you must follow:
1. ALWAYS ask only ONE question per response until you have enough information.
2. Questions should be clear, specific, and directly relevant to narrowing down possible conditions.
3. After 5-7 questions (or when you have sufficient information), provide your assessment.
4. In your final assessment, list possible conditions in order of likelihood.
5. Do NOT provide practical steps, precautions, or "when to consult a professional" sections.
6. Do NOT provide treatment advice, medication recommendations, or home remedies.
7. Focus only on identifying possible conditions based on the symptoms described.
8. Use simple, patient-friendly language without unnecessary medical jargon.
9. Be unbiased, ethical, and privacy-conscious at all times.
10. Always remind users in your final assessment that this is for informational purposes only and they should consult a healthcare professional for confirmation and treatment.

Question Strategy:
- Start with location and nature of the main symptom
- Ask about duration and progression
- Inquire about severity and pattern
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

Your goal is to conduct a thorough diagnostic interview and provide an informed assessment of possible conditions.`

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
  const helixPoints = 40
  const radius = 1.2
  const height = 8
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.3
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
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color="#00d4ff"
            emissive="#00d4ff"
            emissiveIntensity={0.4}
            metalness={0.6}
            roughness={0.3}
            transparent={true}
            opacity={0.1}
          />
        </mesh>
      ))}
      
      {/* Second DNA Strand */}
      {strand2Points.map((point, i) => (
        <mesh key={`strand2-${i}`} position={[point.x, point.y, point.z]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={0.4}
            metalness={0.6}
            roughness={0.3}
            transparent={true}
            opacity={0.1}
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
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      <pointLight position={[-10, -10, -10]} color="#8b5cf6" intensity={1} />
      
      <DNAHelix position={[0, 0, -3]} scale={1.8} />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <Environment preset="night" />
    </>
  )
}

function App() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m here to help identify possible health conditions based on your symptoms. I\'ll ask you a few questions to better understand what you\'re experiencing. Let\'s start: **What is your main symptom or concern today?**'
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
    // Auto-focus input when new message arrives
    if (inputRef.current && !isLoading) {
      inputRef.current.focus()
    }
  }, [messages, isLoading])

  // Check if the message contains disease prediction (assessment)
  const isDiagnosisComplete = (content) => {
    const keywords = ['Possible Conditions', 'Assessment Summary', 'possible condition', 'diagnosis', 'may have', 'could be', 'likely']
    return keywords.some(keyword => content.toLowerCase().includes(keyword.toLowerCase()))
  }

  // Get user's current location
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          reject(error)
        }
      )
    })
  }

  // Find nearby hospitals using Overpass API (OpenStreetMap data - free)
  const findNearbyHospitals = async (lat, lng) => {
    try {
      const radius = 5000 // 5km radius
      
      // Simplified query for better performance
      const query = `[out:json][timeout:25];(node["amenity"="hospital"](around:${radius},${lat},${lng});way["amenity"="hospital"](around:${radius},${lat},${lng}););out center 10;`
      
      // Try multiple Overpass API endpoints as fallback
      const endpoints = [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
        'https://overpass.openstreetmap.ru/api/interpreter'
      ]
      
      let data = null
      let lastError = null
      
      for (const endpoint of endpoints) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
          
          const response = await fetch(`${endpoint}?data=${encodeURIComponent(query)}`, {
            signal: controller.signal
          })
          
          clearTimeout(timeoutId)
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          const text = await response.text()
          
          // Check if response is JSON
          if (text.startsWith('{') || text.startsWith('[')) {
            data = JSON.parse(text)
            break // Success, exit loop
          } else {
            throw new Error('Invalid JSON response')
          }
        } catch (error) {
          lastError = error
          console.log(`Endpoint ${endpoint} failed, trying next...`)
          continue
        }
      }
      
      if (!data || !data.elements || data.elements.length === 0) {
        // Fallback: Generate sample hospitals based on location
        return generateSampleHospitals(lat, lng)
      }
      
      const hospitalList = data.elements
        .filter(el => el.tags && el.tags.name)
        .map(el => ({
          name: el.tags.name,
          lat: el.lat || el.center?.lat,
          lng: el.lon || el.center?.lon,
          address: el.tags['addr:full'] || el.tags['addr:street'] || 'Address not available',
          phone: el.tags.phone || el.tags['contact:phone'] || 'N/A',
          type: el.tags.amenity === 'hospital' ? 'Hospital' : 'Clinic'
        }))
        .slice(0, 5)

      return hospitalList.length > 0 ? hospitalList : generateSampleHospitals(lat, lng)
    } catch (error) {
      console.error('Error fetching hospitals:', error)
      return generateSampleHospitals(lat, lng)
    }
  }

  // Generate sample hospitals when API fails
  const generateSampleHospitals = (lat, lng) => {
    return [
      {
        name: 'Search on Google Maps',
        lat: lat,
        lng: lng,
        address: 'Click below to search for hospitals near your location',
        phone: 'N/A',
        type: 'Search'
      }
    ]
  }

  // Handle showing nearby hospitals
  const handleShowHospitals = async () => {
    setLocationError(null)
    try {
      const location = await getUserLocation()
      setUserLocation(location)
      
      const nearbyHospitals = await findNearbyHospitals(location.lat, location.lng)
      setHospitals(nearbyHospitals)
      setShowHospitals(true)
    } catch (error) {
      setLocationError(error.message || 'Unable to get location. Please enable location services.')
      console.error('Location error:', error)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    const currentInput = input
    setInput('')
    setIsLoading(true)

    try {
      // Build messages for Groq API with system prompt
      const chatMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
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
      
      // Check if diagnosis is complete and show hospital finder button
      if (isDiagnosisComplete(assistantMessage.content)) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            role: 'system',
            content: 'hospital-finder-prompt'
          }])
        }, 1000)
      }
    } catch (error) {
      console.error('Error:', error)
      
      let errorMessage = 'Sorry, I encountered an error. Please try again.'
      
      // Check for rate limit or overload errors
      if (error.message?.includes('overloaded') || error.message?.includes('503')) {
        errorMessage = '⚠️ The AI model is currently overloaded. Please wait a minute and try again. (Free tier has limited requests per minute)'
      } else if (error.message?.includes('429') || error.message?.includes('quota')) {
        errorMessage = '⚠️ Rate limit reached. You can only make 5 requests per minute and 20 per day on the free tier. Please wait before trying again.'
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMessage
      }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app-container">
      <Canvas className="canvas-background">
        <Suspense fallback={null}>
          <Scene3D />
        </Suspense>
      </Canvas>
      
      <div className="chat-container">
        <div className="chat-header">
          <h1>Medical AI Assistant</h1>
          <p style={{ fontSize: '0.85rem', opacity: 0.9, margin: '0.5rem 0 0 0' }}>
            For informational purposes only. Not a substitute for professional medical advice.
          </p>
        </div>
        
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index}>
              {message.content === 'hospital-finder-prompt' ? (
                <div className="hospital-finder-prompt">
                  <button onClick={() => navigate('/nearby-hospitals')} className="find-hospitals-btn">
                    🏥 Find Nearby Hospitals
                  </button>
                </div>
              ) : (
                <div className={`message ${message.role}`}>
                  <div className="message-content">
                    {message.role === 'assistant' ? (
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
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
            placeholder="Describe your symptoms..."
            disabled={isLoading}
            className="chat-input"
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="send-button"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}

export default App
