// Quick test to verify emergency detection improvements
import { detectCriticalSymptoms } from '../src/utils/criticalSymptomDetector.js'

console.log('=== Testing Emergency Detection Improvements ===\n')

// Test cases that SHOULD trigger emergency alerts
const emergencyTests = [
  "I'm having severe crushing chest pain radiating to my arm",
  "I cannot breathe at all and I'm gasping for air", 
  "I'm vomiting blood right now",
  "I have high fever with confusion and altered mental state",
  "I think I'm having a heart attack - crushing chest pain"
]

// Test cases that should NOT trigger emergency alerts
const nonEmergencyTests = [
  "I have a mild fever and slight nausea",
  "I'm feeling tired with minor headache",
  "I have mild vomiting from food poisoning",
  "Low grade fever with runny nose", 
  "Slight chest discomfort and mild fatigue"
]

console.log('🚨 EMERGENCY CASES (should trigger):')
emergencyTests.forEach((test, i) => {
  const result = detectCriticalSymptoms(test)
  console.log(`${i+1}. "${test}"`)
  console.log(`   Result: ${result ? '✅ DETECTED - ' + result.warning : '❌ NOT DETECTED'}`)
  console.log()
})

console.log('✅ NON-EMERGENCY CASES (should NOT trigger):')
nonEmergencyTests.forEach((test, i) => {
  const result = detectCriticalSymptoms(test)
  console.log(`${i+1}. "${test}"`)
  console.log(`   Result: ${result ? '❌ FALSE POSITIVE - ' + result.warning : '✅ CORRECTLY IGNORED'}`)
  console.log()
})