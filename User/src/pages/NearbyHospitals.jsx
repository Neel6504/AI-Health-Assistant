import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import AuthModal from '../components/AuthModal'
import BookAppointment from '../components/BookAppointment'
import Loader from '../components/Loader'
import { getUserLocation, findHospitalsFromDatabase, getAllHospitalsWithLocation } from '../services/locationService'
import enT from '../locales/en/translations'
import hiT from '../locales/hi/translations'
import guT from '../locales/gu/translations'
import './NearbyHospitals.css'

const TRANSLATIONS_BY_LANGUAGE = {
  en: enT,
  hi: hiT,
  gu: guT
}

function NearbyHospitals() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { language, setLanguage } = useLanguage()
  const t = TRANSLATIONS_BY_LANGUAGE[language] || enT
  const [isLoading, setIsLoading] = useState(true)
  const [hospitals, setHospitals] = useState([])
  const [allHospitals, setAllHospitals] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [dataSource, setDataSource] = useState(null)
  const [activeTab, setActiveTab] = useState('nearby') // 'nearby' or 'all'
  const [allHospitalsLoaded, setAllHospitalsLoaded] = useState(false)
  
  // Authentication modal state
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  // Appointment modal state
  const [appointmentHospital, setAppointmentHospital] = useState(null)
  const [appointmentSuccess, setAppointmentSuccess] = useState(null)

  useEffect(() => {
    initializeLocation()
  }, [])

  /**
   * Initialize user location and fetch nearby hospitals
   */
  const initializeLocation = async () => {
    setIsLoading(true)
    setLocationError(null)

    try {
      // Get user's current location
      console.log('Getting user location...')
      const location = await getUserLocation()
      
      console.log('User location obtained:', location)
      setUserLocation(location)
      
      // Fetch nearby hospitals using the location
      await fetchHospitals(location)
      
    } catch (error) {
      console.error('Location error:', error)
      setLocationError(error.message)
      setIsLoading(false)
    }
  }

  /**
   * Fetch all hospitals from database
   */
  const fetchAllHospitals = async () => {
    if (allHospitalsLoaded) return // Don't fetch again if already loaded
    
    try {
      setIsLoading(true)
      console.log('Fetching all hospitals from database...')
      
      const result = await getAllHospitalsWithLocation(userLocation)
      
      console.log(`Found ${result.hospitals.length} total hospitals from database`)
      setAllHospitals(result.hospitals)
      setAllHospitalsLoaded(true)
      
    } catch (error) {
      console.error('Error fetching all hospitals:', error)
      setLocationError(t.nhNoHospitalsError)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle tab switch between nearby and all hospitals
   */
  const handleTabSwitch = (tab) => {
    setActiveTab(tab)
    
    if (tab === 'all' && !allHospitalsLoaded) {
      fetchAllHospitals()
    }
  }

  /**
   * Fetch nearby hospitals using ONLY database (location-based)
   */
  const fetchHospitals = async (location) => {
    try {
      setIsLoading(true)
      
      console.log('Fetching nearby hospitals from database only...')
      
      // Use ONLY database for nearby hospitals (within 5km radius)
      const hospitals = await findHospitalsFromDatabase(location, 5)
      
      console.log(`Found ${hospitals.length} nearby hospitals from database`)
      setDataSource('database')
      
      if (hospitals.length > 0) {
        setHospitals(hospitals)
        setLocationError(null)
      } else {
        setHospitals([])
        setLocationError(t.nhNoHospitalsError)
      }
      
    } catch (error) {
      console.error('Error fetching nearby hospitals from database:', error)
      setLocationError('Unable to search for nearby hospitals in database. Please check your internet connection and try again.')
      setHospitals([])
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Retry getting location
   */
  const handleRetry = () => {
    initializeLocation()
  }

  /**
   * Open Google Maps directions from user location to hospital
   * Requires user authentication
   */
  const getDirections = (hospital) => {
    // Check if user is authenticated before allowing directions
    if (!user) {
      setShowAuthModal(true)
      setAuthMode('login')
      return
    }
    
    if (!hospital?.lat || !hospital?.lng) return
    if (userLocation?.lat && userLocation?.lng) {
      const url = `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${hospital.lat},${hospital.lng}`
      console.log('[NearbyHospitals] Opening Google Maps directions:', url)
      window.open(url, '_blank')
    } else {
      // If user location is missing, open Google Maps directions to the hospital only
      const url = `https://www.google.com/maps/dir//${hospital.lat},${hospital.lng}`
      console.log('[NearbyHospitals] Opening Google Maps directions (no user location):', url)
      window.open(url, '_blank')
    }
  }

  /**
   * Search for hospitals on Google Maps
   */
  const searchOnMaps = () => {
    if (userLocation) {
      const url = `https://www.google.com/maps/search/hospitals/@${userLocation.lat},${userLocation.lng},14z`
      window.open(url, '_blank')
    } else {
      window.open('https://www.google.com/maps/search/hospitals', '_blank')
    }
  }

  // Authentication handlers
  const handleShowLogin = () => {
    setAuthMode('login')
    setShowAuthModal(true)
  }

  const handleShowSignup = () => {
    setAuthMode('signup')
    setShowAuthModal(true)
  }

  const handleCloseModal = () => {
    setShowAuthModal(false)
  }

  const handleBookAppointment = (hospital) => {
    if (!user) {
      setShowAuthModal(true)
      setAuthMode('login')
      return
    }
    setAppointmentHospital(hospital)
  }

  const handleAppointmentSuccess = (appointment) => {
    setAppointmentHospital(null)
    setAppointmentSuccess(appointment)
    // Auto-hide success toast after 5 seconds
    setTimeout(() => setAppointmentSuccess(null), 5000)
  }

  if (isLoading) {
    return <Loader 
      message={activeTab === 'nearby' ? t.nhLoadingNearby : t.nhLoadingAll} 
      subtitle={activeTab === 'nearby' 
        ? t.nhLoadingNearbySubtitle
        : t.nhLoadingAllSubtitle
      }
    />
  }

  return (
    <div className="nearby-hospitals-page">
      {/* Header */}
      <header className="hospitals-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          {t.nhBack}
        </button>
        <div className="header-content">
          <h1>{t.nhTitle}</h1>
          
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'nearby' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('nearby')}
            >
              {t.nhTabNearby}
              {hospitals.length > 0 && <span className="tab-count">({hospitals.length})</span>}
            </button>
            <button 
              className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('all')}
            >
              {t.nhTabAll}
              {allHospitals.length > 0 && <span className="tab-count">({allHospitals.length})</span>}
            </button>
          </div>

          <p>
            {activeTab === 'nearby' 
              ? (userLocation 
                  ? t.nhFoundHospitals(hospitals.length)
                  : t.nhSearching
                )
              : t.nhShowingAll(allHospitals.length)
            }
          </p>
          {dataSource && activeTab === 'nearby' && (
            <small style={{ opacity: 0.7, fontSize: '0.85em' }}>
              {t.nhRegistered}
            </small>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button onClick={searchOnMaps} className="maps-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {t.nhGoogleMaps}
          </button>
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
      </header>

      {/* Authentication Banner */}
      {!user ? (
        <div className="nh-auth-banner">
          <div className="nh-auth-message">
            <svg viewBox="0 0 24 24" fill="currentColor" className="nh-auth-icon">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <div>
              <h3>{t.nhSaveHistory}</h3>
              <p>{t.nhLoginPrompt}</p>
            </div>
          </div>
          <div className="nh-auth-buttons">
            <button onClick={handleShowLogin} className="nh-auth-btn nh-login-btn">
              {t.nhLogin}
            </button>
            <button onClick={handleShowSignup} className="nh-auth-btn nh-signup-btn">
              {t.nhSignUp}
            </button>
          </div>
        </div>
      ) : (
        <div className="nh-welcome-banner">
          <div className="nh-welcome-message">
            <svg viewBox="0 0 24 24" fill="currentColor" className="nh-user-icon">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <div>
              <h3>{t.nhWelcomeBack(user.name)}</h3>
              <p>{t.nhSearchesSaved}</p>
            </div>
          </div>
          <div className="nh-user-actions">
            <button onClick={() => navigate('/dashboard')} className="nh-dashboard-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
              {t.nhDashboard}
            </button>
            <button onClick={logout} className="nh-logout-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              {t.nhLogout}
            </button>
          </div>
        </div>
      )}

      {/* Error State */}
      {locationError && (
        <div className="error-banner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            <p className="error-title">{locationError}</p>
            <div className="error-actions">
              <button onClick={handleRetry} className="retry-button">
                {t.nhRetry}
              </button>
              <button onClick={searchOnMaps} className="maps-fallback-button">
                {t.nhSearchMaps}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info (only shown when user location is available) */}
      {userLocation && hospitals.length > 0 && (
        <div style={{ 
          padding: '10px', 
          background: '#f0f8ff', 
          borderRadius: '8px', 
          margin: '10px 20px',
          fontSize: '0.9em',
          color: '#333'
        }}>
          <strong>{t.nhYourLocation}</strong> {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
          {userLocation.accuracy && ` (±${Math.round(userLocation.accuracy)}m accuracy)`}
        </div>
      )}

      {/* Hospitals Grid */}
      {((activeTab === 'nearby' && hospitals.length > 0) || (activeTab === 'all' && allHospitals.length > 0)) && (
        <div className="hospitals-container">
          <div className="hospitals-stats">
            <div className="stat-card">
              <span className="stat-number">
                {activeTab === 'nearby' ? hospitals.length : allHospitals.length}
              </span>
              <span className="stat-label">
                {activeTab === 'nearby' ? t.nhHospitalsFound : t.nhTotalHospitals}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {activeTab === 'nearby' 
                  ? hospitals.filter(h => h.isOpen === true).length
                  : allHospitals.filter(h => h.isOpen === true).length
                }
              </span>
              <span className="stat-label">{t.nhOpenNow}</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {activeTab === 'nearby' 
                  ? (hospitals[0]?.distance ? `${hospitals[0].distance} km` : 'N/A')
                  : (allHospitals[0]?.distance ? `${allHospitals[0].distance} km` : 'N/A')
                }
              </span>
              <span className="stat-label">
                {activeTab === 'nearby' ? t.nhNearest : t.nhClosest}
              </span>
            </div>
          </div>

          <div className="hospitals-grid">
            {(activeTab === 'nearby' ? hospitals : allHospitals).map((hospital, index) => (
              <div 
                key={hospital.id} 
                className={`hospital-card ${selectedHospital?.id === hospital.id ? 'selected' : ''}`}
                onClick={() => setSelectedHospital(selectedHospital?.id === hospital.id ? null : hospital)}
              >
                <div className="hospital-card-header">
                  <span className="hospital-rank">#{index + 1}</span>
                  {hospital.isOpen !== null && (
                    <span className={`status-badge ${hospital.isOpen ? 'open' : 'closed'}`}>
                      {hospital.isOpen ? t.nhOpen : t.nhClosed}
                    </span>
                  )}
                </div>

                <h3 className="hospital-name">{hospital.name}</h3>
                
                {/* Distance Display - REQUIRED */}
                {hospital.distance !== undefined && (
                  <p className="hospital-distance">
                    📏 <strong>{hospital.distance} km</strong> {t.nhAway}
                  </p>
                )}
                
                <p className="hospital-address">
                  📍 {hospital.address}
                </p>

                {hospital.rating !== 'N/A' && (
                  <div className="hospital-rating">
                    <span className="rating-stars">⭐ {hospital.rating}</span>
                    <span className="rating-count">({hospital.userRatingsTotal} {t.nhReviews})</span>
                  </div>
                )}

                {/* Expandable Details */}
                {selectedHospital?.id === hospital.id && (
                  <div className="hospital-details">
                    {/* Hospital Type & Beds (if from database) */}
                    {(hospital.hospitalType || hospital.totalBeds) && (
                      <div className="details-section">
                        <h4>{t.nhHospitalInfo}</h4>
                        {hospital.hospitalType && <p><strong>{t.nhType}</strong> {hospital.hospitalType}</p>}
                        {hospital.totalBeds && <p><strong>{t.nhTotalBeds}</strong> {hospital.totalBeds}</p>}
                        {hospital.specializations && <p><strong>{t.nhSpecializations}</strong> {hospital.specializations}</p>}
                      </div>
                    )}

                    {/* Emergency Services (if from database) */}
                    {(hospital.emergency !== undefined || hospital.ambulance !== undefined) && (
                      <div className="details-section">
                        <h4>{t.nhEmergencyServices}</h4>
                        {hospital.emergency !== undefined && (
                          <p>
                            <strong>{t.nhEmergencyWard}</strong>{' '}
                            <span className={hospital.emergency ? 'text-success' : 'text-danger'}>
                              {hospital.emergency ? t.nhAvailable : t.nhNotAvailable}
                            </span>
                          </p>
                        )}
                        {hospital.ambulance !== undefined && (
                          <p>
                            <strong>{t.nhAmbulanceService}</strong>{' '}
                            <span className={hospital.ambulance ? 'text-success' : 'text-danger'}>
                              {hospital.ambulance ? t.nhAvailable : t.nhNotAvailable}
                            </span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Opening Hours */}
                    {hospital.openingHours && (
                      <div className="details-section">
                        <h4>{t.nhOpeningHours}</h4>
                        <div className="opening-hours">
                          {typeof hospital.openingHours === 'string' ? (
                            <p>{hospital.openingHours}</p>
                          ) : (
                            Object.entries(hospital.openingHours).map(([day, hours]) => (
                              <div key={day} className="hours-row">
                                <span className="day">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                                <span className="hours">{hours}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact Info */}
                    {(hospital.phone !== 'N/A' || hospital.email || hospital.website) && (
                      <div className="details-section">
                        <h4>{t.nhContactInfo}</h4>
                        {hospital.phone !== 'N/A' && (
                          <p>{t.nhPhone} <a href={`tel:${hospital.phone}`}>{hospital.phone}</a></p>
                        )}
                        {hospital.email && (
                          <p>{t.nhEmail} <a href={`mailto:${hospital.email}`}>{hospital.email}</a></p>
                        )}
                        {hospital.website && (
                          <p>{t.nhWebsite} <a href={hospital.website} target="_blank" rel="noopener noreferrer">{t.nhVisitWebsite}</a></p>
                        )}
                      </div>
                    )}

                    {/* Facilities */}
                    {hospital.facilities && hospital.facilities.length > 0 && (
                      <div className="details-section">
                        <h4>{t.nhFacilities}</h4>
                        <div className="facilities-grid">
                          {hospital.facilities.map((facility, index) => (
                            <span key={index} className="facility-tag">
                              {facility}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="hospital-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleBookAppointment(hospital)
                    }}
                    className="action-button book"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    {t.nhBookAppointment}
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      getDirections(hospital)
                    }}
                    className="action-button primary"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                    {t.nhDirections}
                  </button>
                  {hospital.phone !== 'N/A' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(`tel:${hospital.phone}`, '_self')
                      }}
                      className="action-button secondary"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 714.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 712.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                      </svg>
                      {t.nhCall}
                    </button>
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedHospital(selectedHospital?.id === hospital.id ? null : hospital)
                    }}
                    className="action-button info"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    {selectedHospital?.id === hospital.id ? t.nhHideDetails : t.nhViewDetails}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {hospitals.length === 0 && !locationError && (
            <div className="no-results">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="8" y1="15" x2="16" y2="15"/>
                <line x1="9" y1="9" x2="9.01" y2="9"/>
                <line x1="15" y1="9" x2="15.01" y2="9"/>
              </svg>
              <h3>{t.nhNoHospitals}</h3>
              <p>{t.nhNoHospitalsDesc}</p>
              <button onClick={searchOnMaps} className="search-maps-button">
                {t.nhSearchGoogleMaps}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Appointment Success Toast */}
      {appointmentSuccess && (
        <div className="appointment-toast">
          <span className="appointment-toast-icon">✅</span>
          <div>
            <strong>{t.nhAppointmentBooked}</strong>
            <p>
              {appointmentSuccess.hospitalName} &mdash;&nbsp;
              {new Date(appointmentSuccess.appointmentDate).toLocaleDateString()} at {appointmentSuccess.appointmentTime}
            </p>
          </div>
          <button className="appointment-toast-close" onClick={() => setAppointmentSuccess(null)}>✕</button>
        </div>
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <AuthModal 
          mode={authMode}
          onClose={handleCloseModal}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}

      {/* Book Appointment Modal */}
      {appointmentHospital && (
        <BookAppointment
          hospital={appointmentHospital}
          onClose={() => setAppointmentHospital(null)}
          onSuccess={handleAppointmentSuccess}
        />
      )}
    </div>
  )
}

export default NearbyHospitals
