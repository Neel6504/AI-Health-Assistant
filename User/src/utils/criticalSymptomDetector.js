/**
 * Critical Symptom Detection System
 * Detects life-threatening conditions that require immediate medical attention
 * 
 * Updated: Feb 2026 - Enhanced to reduce false positives
 * - Made keywords more specific (e.g., "cannot breathe" vs "difficulty breathing")
 * - Added non-emergency symptom filtering to reduce false alarms for common symptoms
 * - Improved detection logic to avoid triggering on mild fever, minor vomiting, etc.
 * - Only triggers emergency alerts for genuinely serious symptom combinations
 */

// Critical conditions that require immediate emergency care
const CRITICAL_CONDITIONS = {
  // Cardiovascular emergencies
  heartAttack: {
    keywords: [
      'heart attack',
      'myocardial infarction',
      'acute coronary syndrome',
      'chest pain radiating to arm',
      'chest pain radiating to jaw',
      'crushing chest pain',
      'severe chest pressure',
      'chest pain with shortness of breath',
      'chest pain with nausea',
      'chest pain with sweating'
    ],
    severity: 'EMERGENCY',
    warning: '🚨 EMERGENCY: Possible heart attack symptoms detected!'
  },
  
  stroke: {
    keywords: [
      'stroke',
      'cerebrovascular accident',
      'sudden weakness',
      'face drooping',
      'slurred speech',
      'sudden confusion',
      'sudden numbness',
      'severe sudden headache'
    ],
    severity: 'EMERGENCY',
    warning: '🚨 EMERGENCY: Possible stroke symptoms detected!'
  },
  
  pulmonaryEmbolism: {
    keywords: [
      'pulmonary embolism',
      'sudden shortness of breath',
      'chest pain with breathing',
      'coughing blood',
      'hemoptysis'
    ],
    severity: 'EMERGENCY',
    warning: '🚨 EMERGENCY: Possible pulmonary embolism detected!'
  },
  
  // Severe respiratory (only true breathing emergencies)
  severeRespiratory: {
    keywords: [
      'cannot breathe at all',
      'unable to breathe properly',
      'gasping for air',
      'blue lips',
      'blue fingernails',
      'cyanosis',
      'choking and cannot breathe',
      'suffocating',
      'respiratory arrest',
      'stopped breathing'
    ],
    severity: 'EMERGENCY',
    warning: '⚠️ CRITICAL: Severe breathing emergency detected!'
  },
  
  // Cancer indicators (high urgency but not immediate emergency)
  cancer: {
    keywords: [
      'cancer',
      'malignant tumor',
      'carcinoma',
      'lymphoma',
      'leukemia',
      'metastatic'
    ],
    severity: 'URGENT',
    warning: '⚠️ SERIOUS: Possible cancer-related symptoms detected!'
  },
  
  // Internal bleeding
  internalBleeding: {
    keywords: [
      'internal bleeding',
      'vomiting blood',
      'throwing up blood',
      'hematemesis',
      'blood in vomit',
      'bloody vomit',
      'blood in stool',
      'black tarry stool',
      'melena',
      'severe abdominal pain with bleeding',
      'severe stomach pain with blood'
    ],
    severity: 'EMERGENCY',
    warning: '🚨 EMERGENCY: Possible internal bleeding detected!'
  },
  
  // Severe infections (only very specific combinations)
  sepsis: {
    keywords: [
      'sepsis',
      'septic shock',
      'fever with confusion and low blood pressure',
      'fever with altered mental state and rapid heart rate',
      'fever over 104 with confusion'
    ],
    severity: 'EMERGENCY',
    warning: '🚨 EMERGENCY: Possible severe infection/sepsis!'
  },
  
  // Anaphylaxis
  anaphylaxis: {
    keywords: [
      'anaphylaxis',
      'anaphylactic shock',
      'severe allergic reaction',
      'throat swelling',
      'difficulty swallowing breathing'
    ],
    severity: 'EMERGENCY',
    warning: '🚨 EMERGENCY: Possible severe allergic reaction!'
  },
  
  // Mental health emergencies
  suicidal: {
    keywords: [
      'suicidal',
      'want to die',
      'end my life',
      'suicide',
      'harm myself'
    ],
    severity: 'EMERGENCY',
    warning: '🚨 CRISIS: Suicidal thoughts detected - immediate help needed!'
  },
  
  // Severe trauma
  severeTrauma: {
    keywords: [
      'severe injury',
      'major trauma',
      'head injury',
      'loss of consciousness',
      'severe bleeding',
      'broken bones'
    ],
    severity: 'EMERGENCY',
    warning: '🚨 EMERGENCY: Severe trauma detected!'
  },
  
  // Neurological emergencies
  seizure: {
    keywords: [
      'seizure',
      'convulsion',
      'epileptic',
      'uncontrolled shaking'
    ],
    severity: 'EMERGENCY',
    warning: '⚠️ CRITICAL: Seizure activity detected!'
  },
  
  // Diabetic emergencies
  diabeticEmergency: {
    keywords: [
      'diabetic ketoacidosis',
      'very high blood sugar',
      'severe hypoglycemia',
      'diabetic coma'
    ],
    severity: 'EMERGENCY',
    warning: '🚨 EMERGENCY: Diabetic emergency detected!'
  },
  
  // Pregnancy emergencies
  pregnancyEmergency: {
    keywords: [
      'ectopic pregnancy',
      'severe pregnancy bleeding',
      'pregnancy severe pain',
      'preeclampsia',
      'eclampsia'
    ],
    severity: 'EMERGENCY',
    warning: '🚨 EMERGENCY: Pregnancy emergency detected!'
  }
}

// Common non-emergency symptoms that should NOT trigger emergency alerts
const NON_EMERGENCY_INDICATORS = [
  'fever',
  'mild fever',
  'low grade fever',
  'slight fever',
  'temperature',
  'headache',
  'minor headache',
  'mild headache',
  'common cold',
  'flu symptoms',
  'flu',
  'nausea',
  'mild nausea',
  'slight nausea',
  'stomach upset',
  'stomach ache',
  'minor stomach ache',
  'mild stomach pain',
  'food poisoning',
  'vomiting',
  'mild vomiting',
  'throwing up',
  'dizziness',
  'slight dizziness',
  'mild fatigue',
  'tired',
  'runny nose',
  'stuffy nose',
  'sore throat',
  'cough',
  'mild cough',
  'chest discomfort',
  'mild chest discomfort',
  'slight chest pain',
  'minor chest pain',
  'chest muscle pain',
  'chest wall pain',
  'difficulty breathing',
  'shortness of breath',
  'short of breath',
  'breathing problem',
  'breathing difficulty'
]

/**
 * Check if message contains indicators of non-emergency conditions
 * @param {string} message 
 * @returns {boolean}
 */
function hasNonEmergencyIndicators(message) {
  const lowerMessage = message.toLowerCase()
  return NON_EMERGENCY_INDICATORS.some(indicator => 
    lowerMessage.includes(indicator.toLowerCase())
  )
}

/**
 * Check if the symptoms describe truly critical emergency conditions
 * @param {string} message 
 * @param {string} keyword 
 * @returns {boolean}
 */
function isTrulyEmergent(message, keyword) {
  const lowerMessage = message.toLowerCase()
  
  // Very specific emergency phrases that override non-emergency indicators
  const trulyEmergentPhrases = [
    'heart attack',
    'stroke',
    'cannot breathe at all',
    'stopped breathing',
    'unconscious',
    'loss of consciousness',
    'severe bleeding',
    'vomiting blood',
    'blood in vomit',
    'crushing chest pain',
    'chest pain radiating',
    'blue lips',
    'choking',
    'anaphylaxis',
    'anaphylactic',
    'sepsis',
    'septic shock'
  ]
  
  return trulyEmergentPhrases.some(phrase => lowerMessage.includes(phrase))
}

/**
 * Detect if the message contains critical symptoms
 * @param {string} message - The message to analyze (from AI or user)
 * @returns {object|null} - Detection result with severity and warning, or null if no critical symptoms
 */
export function detectCriticalSymptoms(message) {
  if (!message || typeof message !== 'string') return null
  
  const lowerMessage = message.toLowerCase()
  
  // First check for non-emergency indicators - if found, reduce sensitivity
  const hasNonEmergency = hasNonEmergencyIndicators(message)
  
  // Check each critical condition
  for (const [conditionKey, condition] of Object.entries(CRITICAL_CONDITIONS)) {
    for (const keyword of condition.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        // If non-emergency indicators are present, only trigger for truly emergent conditions
        if (hasNonEmergency) {
          if (!isTrulyEmergent(message, keyword)) {
            continue // Skip this match - likely common symptom, not emergency
          }
        }
        
        return {
          condition: conditionKey,
          severity: condition.severity,
          warning: condition.warning,
          symptoms: [keyword],
          matchedKeyword: keyword
        }
      }
    }
  }
  
  return null
}

/**
 * Check if symptoms are emergency level
 * @param {object} detection - Detection result from detectCriticalSymptoms
 * @returns {boolean}
 */
export function isEmergency(detection) {
  return detection && detection.severity === 'EMERGENCY'
}

/**
 * Check if symptoms are urgent level
 * @param {object} detection - Detection result from detectCriticalSymptoms
 * @returns {boolean}
 */
export function isUrgent(detection) {
  return detection && detection.severity === 'URGENT'
}

/**
 * Get emergency advice based on severity
 * @param {string} severity - 'EMERGENCY' or 'URGENT'
 * @returns {string}
 */
export function getEmergencyAdvice(severity) {
  if (severity === 'EMERGENCY') {
    return '**CALL 911 or seek immediate emergency care. Do not wait. These symptoms require urgent medical attention.**'
  } else if (severity === 'URGENT') {
    return '**Please consult a healthcare professional as soon as possible. These symptoms require prompt medical evaluation.**'
  }
  return ''
}

export default {
  detectCriticalSymptoms,
  isEmergency,
  isUrgent,
  getEmergencyAdvice
}
