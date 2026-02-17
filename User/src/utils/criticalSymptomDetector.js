/**
 * Critical Symptom Detection System
 * Detects life-threatening conditions that require immediate medical attention
 */

// Critical conditions that require immediate emergency care
const CRITICAL_CONDITIONS = {
  // Cardiovascular emergencies
  heartAttack: {
    keywords: [
      'heart attack',
      'myocardial infarction',
      'acute coronary syndrome',
      'chest pain radiating',
      'crushing chest pain',
      'severe chest pressure'
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
  
  // Severe respiratory
  severeRespiratory: {
    keywords: [
      'difficulty breathing',
      'cannot breathe',
      'severe breathlessness',
      'respiratory distress',
      'gasping for air',
      'blue lips',
      'cyanosis'
    ],
    severity: 'EMERGENCY',
    warning: '⚠️ CRITICAL: Severe breathing difficulty detected!'
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
      'hematemesis',
      'blood in stool',
      'melena',
      'severe abdominal pain'
    ],
    severity: 'EMERGENCY',
    warning: '🚨 EMERGENCY: Possible internal bleeding detected!'
  },
  
  // Severe infections
  sepsis: {
    keywords: [
      'sepsis',
      'septic shock',
      'severe infection',
      'rapid heartbeat with fever',
      'confusion with fever'
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

/**
 * Detect if the message contains critical symptoms
 * @param {string} message - The message to analyze (from AI or user)
 * @returns {object|null} - Detection result with severity and warning, or null if no critical symptoms
 */
export function detectCriticalSymptoms(message) {
  if (!message || typeof message !== 'string') return null
  
  const lowerMessage = message.toLowerCase()
  
  // Check each critical condition
  for (const [conditionKey, condition] of Object.entries(CRITICAL_CONDITIONS)) {
    for (const keyword of condition.keywords) {
      if (lowerMessage.includes(keyword.toLowerCase())) {
        return {
          condition: conditionKey,
          severity: condition.severity,
          warning: condition.warning,
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
