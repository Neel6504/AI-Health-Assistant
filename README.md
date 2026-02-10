# Online Health AI Assistant with Emergency Support

A modern Medical AI Assistant with stunning 3D UI and emergency hospital finder feature.

## Features

- 🧬 **3D DNA Helix Background** - Interactive 3D visualization with adjustable opacity
- 💎 **Glassmorphism UI** - High-end frosted glass design with smooth animations
- 🤖 **AI-Powered Diagnosis** - Systematic symptom-based health assessment using Groq AI
- 🏥 **Hospital Finder** - Automatic nearby hospital detection with directions
- 🗺️ **Location Services** - Geolocation-based emergency support
- 📱 **Responsive Design** - Works seamlessly on all devices

## Tech Stack

- **Frontend**: React + Vite
- **3D Graphics**: Three.js, React Three Fiber
- **AI**: Groq API (LLaMA 3.3 70B)
- **Styling**: Custom CSS with glassmorphism effects
- **Maps**: OpenStreetMap + Google Maps integration

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/Neel6504/Online-Health-AI-Assistant-with-Emergency-Support.git
cd Online-Health-AI-Assistant-with-Emergency-Support
```

### 2. Install dependencies
```bash
cd User
npm install
```

### 3. Configure environment variables
Create a `.env` file in the `User` directory:
```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

Get your free Groq API key from: https://console.groq.com/

### 4. Run the development server
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## How to Use

1. **Start a Conversation**: Describe your symptoms to the AI assistant
2. **Answer Questions**: The AI will ask follow-up questions to understand your condition
3. **Get Assessment**: After gathering information, the AI provides possible diagnoses
4. **Find Hospitals**: Click the "Find Nearby Hospitals" button to locate medical facilities
5. **Get Directions**: Click on any hospital to open directions in Google Maps

## Important Note

⚠️ **This tool is for informational purposes only and is NOT a substitute for professional medical advice. Always consult a healthcare professional for proper diagnosis and treatment.**

## Features in Detail

### AI Diagnosis System
- Systematic question-based approach
- Analyzes symptoms using medical knowledge
- Provides ranked list of possible conditions
- Maintains conversation context

### Hospital Finder
- Automatic location detection
- Searches within 5km radius
- Multiple API endpoints for reliability
- Direct Google Maps integration
- Displays hospital name, address, and phone number

### 3D Interface
- Animated DNA helix with customizable opacity
- Particle effects and starfield background
- Smooth rotations and transitions
- Optimized for performance

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

Location services must be enabled for the hospital finder feature.

## License

MIT License

## Developer

Neel - [GitHub](https://github.com/Neel6504)

## Support

For issues or questions, please open an issue on GitHub.
