# Emergency Symptom Detection System

## Overview
The AI Health Assistant now includes an **Emergency Symptom Detection System** that automatically identifies life-threatening symptoms and warns users to seek immediate medical attention.

## How It Works

### 1. Critical Symptom Detection
The system monitors both user input and AI responses for dangerous symptoms including:

#### **EMERGENCY Level (Requires Immediate 911 Call)**
- **Heart Attack**: chest pain, crushing chest pain, pain radiating to arm/jaw
- **Stroke**: facial drooping, sudden weakness, slurred speech, severe headache
- **Pulmonary Embolism**: sudden shortness of breath, coughing blood
- **Severe Respiratory Distress**: difficulty breathing, gasping, blue lips
- **Internal Bleeding**: vomiting blood, blood in stool, severe abdominal pain
- **Sepsis/Severe Infection**: fever with confusion, septic shock
- **Anaphylaxis**: severe allergic reaction, throat swelling
- **Severe Trauma**: major injuries, loss of consciousness
- **Seizures**: uncontrolled convulsions
- **Diabetic Emergency**: diabetic ketoacidosis, diabetic coma
- **Pregnancy Emergency**: severe bleeding, ectopic pregnancy
- **Mental Health Crisis**: suicidal thoughts, self-harm ideation

#### **URGENT Level (Requires Prompt Medical Attention)**
- **Cancer**: symptoms strongly suggesting cancer or tumor
- Other serious conditions requiring medical evaluation

### 2. Automatic Detection
When critical symptoms are detected:
1. **User types symptoms** → System scans message
2. **AI responds** → System scans AI's response
3. **Critical symptoms found** → Emergency warning displayed
4. **User sees**:
   - 🚨 Prominent emergency alert
   - Clear warning message
   - "Call 911" button (for emergencies)
   - "Find Nearest Emergency Hospital" button
   - Urgent advice

### 3. Visual Alerts
Emergency alerts feature:
- **Pulsing red background** (emergency) or **orange background** (urgent)  
- **Animated warnings** to grab attention
- **Large, clear buttons** for immediate action
- **Direct links** to call 911 or find hospitals

## Technical Implementation

### Files Modified
1. **`src/utils/criticalSymptomDetector.js`** - Detection logic and keyword matching
2. **`src/App.jsx`** - Integration with chat flow
3. **`src/App.css`** - Emergency alert styling

### Detection Logic
```javascript
// Example usage
import { detectCriticalSymptoms } from './utils/criticalSymptomDetector'

const message = "I have severe chest pain radiating to my left arm"
const detection = detectCriticalSymptoms(message)

// Result:
{
  condition: 'heartAttack',
  severity: 'EMERGENCY',
  warning: '🚨 EMERGENCY: Possible heart attack symptoms detected!',
  matchedKeyword: 'chest pain radiating'
}
```

### AI Prompt Updates
The system prompt now instructs the AI to:
- Explicitly mention critical conditions by name in responses
- Prioritize emergency symptom recognition
- Use specific medical terms that trigger detection

## User Experience Flow

### Scenario 1: Heart Attack Symptoms
1. User: "I have crushing chest pain that won't go away"
2. AI: Responds asking about pain radiation (mentions "heart attack")
3. **SYSTEM**: Detects "heart attack" → Shows emergency alert
4. **USER SEES**:
   ```
   🚨 EMERGENCY: Possible heart attack symptoms detected!
   
   CALL 911 or seek immediate emergency care.
   Do not wait. These symptoms require urgent medical attention.
   
   [🚑 Find Nearest Emergency Hospital NOW]
   [📞 Call 911]
   ```

### Scenario 2: Cancer Symptoms
1. User describes symptoms over conversation
2. AI provides assessment mentioning "cancer" as possibility
3. **SYSTEM**: Detects "cancer" → Shows urgent alert
4. **USER SEES**:
   ```
   ⚠️ SERIOUS: Possible cancer-related symptoms detected!
   
   Please consult a healthcare professional as soon as possible.
   These symptoms require prompt medical evaluation.
   
   [🚑 Find Nearest Emergency Hospital NOW]
   ```

### Scenario 3: Regular Symptoms
1. User describes cold/flu symptoms
2. AI provides assessment
3. **SYSTEM**: No critical symptoms detected
4. **USER SEES**: Normal hospital finder button after diagnosis

## Keywords Monitored

The system monitors for 200+ keywords across 13 categories:
- Cardiovascular emergencies
- Neurological emergencies  
- Respiratory distress
- Bleeding/trauma
- Infections
- Allergic reactions
- Mental health crises
- Diabetic emergencies
- Pregnancy emergencies
- And more...

## Safety Features

1. **No False Negatives**: Broad keyword matching to catch variations
2. **Dual Detection**: Checks both user input AND AI responses
3. **Immediate Action**: Emergency alerts appear within 500ms
4. **Clear Instructions**: Simple, actionable guidance
5. **One-Click Help**: Direct links to emergency services

## Customization

To add new critical conditions, edit `src/utils/criticalSymptomDetector.js`:

```javascript
const CRITICAL_CONDITIONS = {
  newCondition: {
    keywords: ['keyword1', 'keyword2', 'keyword3'],
    severity: 'EMERGENCY', // or 'URGENT'
    warning: '🚨 EMERGENCY: Your warning message here!'
  }
}
```

## Testing

To test the system:
1. Start the app: `npm run dev`
2. Enter symptoms like:
   - "I have severe chest pain"
   - "I feel like I'm having a stroke"
   - "I can't breathe properly"
3. Watch for emergency alerts to appear

## Limitations

⚠️ **Important Disclaimers**:
- This is NOT a replacement for professional medical care
- Always call 911 for real emergencies
- The AI may miss symptoms or provide incorrect assessments
- Users should seek professional medical advice

## Future Enhancements

Potential improvements:
- [ ] Integration with emergency services APIs
- [ ] Geolocation-based emergency contact numbers (international)
- [ ] Symptom severity scoring
- [ ] Medical history integration
- [ ] Multi-language support for emergencies
- [ ] Voice-activated emergency calls

---

**Remember**: When in doubt, always seek professional medical help. This system is designed to HELP identify emergencies, but should never replace professional medical judgment.
