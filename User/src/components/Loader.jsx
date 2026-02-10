import './Loader.css'

function Loader({ message = "Finding Nearby Hospitals", subtitle = "Searching for healthcare facilities in your area..." }) {
  return (
    <div className="loader-container">
      <div className="loader-content">
        <div className="medical-loader">
          <div className="pulse-ring"></div>
          <div className="pulse-ring delay-1"></div>
          <div className="pulse-ring delay-2"></div>
          <div className="hospital-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <h2 className="loader-title">{message}</h2>
        <p className="loader-subtitle">{subtitle}</p>
        <div className="location-steps">
          <div className="step">📍 Getting your location</div>
          <div className="step">🔍 Searching real hospitals nearby</div>
          <div className="step">🏥 Loading hospital details</div>
        </div>
        <div className="loader-progress">
          <div className="loader-progress-bar"></div>
        </div>
      </div>
    </div>
  )
}

export default Loader
