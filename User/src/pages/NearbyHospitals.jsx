import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Loader from '../components/Loader'
import { getUserLocation, findNearbyHospitals } from '../services/locationService'
import './NearbyHospitals.css'

function NearbyHospitals() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [hospitals, setHospitals] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [selectedHospital, setSelectedHospital] = useState(null)
  const [dataSource, setDataSource] = useState(null)

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
   * Fetch nearby hospitals using location services
   */
  const fetchHospitals = async (location) => {
    try {
      setIsLoading(true)
      
      // Optional: Add your Google Places API key here for better results
      // Get it from: https://console.cloud.google.com/apis/credentials
      const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_PLACES_API_KEY || null
      
      if (GOOGLE_API_KEY) {
        console.log('Using Google Places API (preferred method)')
      } else {
        console.log('Using OpenStreetMap (no Google API key found)')
      }
      
      // Find nearby hospitals (tries Google first, falls back to OSM)
      const result = await findNearbyHospitals(location, GOOGLE_API_KEY)
      
      console.log(`Found ${result.hospitals.length} hospitals using ${result.source}`)
      setDataSource(result.source)
      
      if (result.hospitals.length > 0) {
        setHospitals(result.hospitals)
        setLocationError(null)
      } else {
        setHospitals([])
        setLocationError('No hospitals found within 5km of your location. Try searching on Google Maps.')
      }
      
    } catch (error) {
      console.error('Error fetching hospitals:', error)
      setLocationError('Unable to search for hospitals. Please check your internet connection and try again.')
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
   */
  const getDirections = (hospital) => {
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

  if (isLoading) {
    return <Loader 
      message="Finding Nearby Hospitals" 
      subtitle="Getting your location and searching for hospitals within 5km..."
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
          Back
        </button>
        <div className="header-content">
          <h1>🏥 Nearby Hospitals</h1>
          <p>
            {userLocation 
              ? `Found ${hospitals.length} hospital${hospitals.length !== 1 ? 's' : ''} within 5km`
              : 'Searching for hospitals near you'
            }
          </p>
          {dataSource && (
            <small style={{ opacity: 0.7, fontSize: '0.85em' }}>
              {dataSource === 'google_places' ? '📍 Powered by Google Places' : '🗺️ Powered by OpenStreetMap'}
            </small>
          )}
        </div>
        <button onClick={searchOnMaps} className="maps-button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          Google Maps
        </button>
      </header>

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
                📍 Retry Location
              </button>
              <button onClick={searchOnMaps} className="maps-fallback-button">
                🗺️ Search on Maps
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
          <strong>📍 Your Location:</strong> {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
          {userLocation.accuracy && ` (±${Math.round(userLocation.accuracy)}m accuracy)`}
        </div>
      )}

      {/* Hospitals Grid */}
      {hospitals.length > 0 && (
        <div className="hospitals-container">
          <div className="hospitals-stats">
            <div className="stat-card">
              <span className="stat-number">{hospitals.length}</span>
              <span className="stat-label">Hospitals Found</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {hospitals.filter(h => h.isOpen === true).length}
              </span>
              <span className="stat-label">Open Now</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">
                {hospitals[0]?.distance ? `${hospitals[0].distance} km` : 'N/A'}
              </span>
              <span className="stat-label">Nearest</span>
            </div>
          </div>

          <div className="hospitals-grid">
            {hospitals.map((hospital, index) => (
              <div 
                key={hospital.id} 
                className={`hospital-card ${selectedHospital?.id === hospital.id ? 'selected' : ''}`}
                onClick={() => setSelectedHospital(selectedHospital?.id === hospital.id ? null : hospital)}
              >
                <div className="hospital-card-header">
                  <span className="hospital-rank">#{index + 1}</span>
                  {hospital.isOpen !== null && (
                    <span className={`status-badge ${hospital.isOpen ? 'open' : 'closed'}`}>
                      {hospital.isOpen ? '🟢 Open' : '🔴 Closed'}
                    </span>
                  )}
                </div>

                <h3 className="hospital-name">{hospital.name}</h3>
                
                {/* Distance Display - REQUIRED */}
                {hospital.distance !== undefined && (
                  <p className="hospital-distance">
                    📏 <strong>{hospital.distance} km</strong> away
                  </p>
                )}
                
                <p className="hospital-address">
                  📍 {hospital.address}
                </p>

                {hospital.rating !== 'N/A' && (
                  <div className="hospital-rating">
                    <span className="rating-stars">⭐ {hospital.rating}</span>
                    <span className="rating-count">({hospital.userRatingsTotal} reviews)</span>
                  </div>
                )}

                {/* Expandable Details */}
                {selectedHospital?.id === hospital.id && (
                  <div className="hospital-details">
                    {/* Opening Hours */}
                    {hospital.openingHours && (
                      <div className="details-section">
                        <h4>🕒 Opening Hours</h4>
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
                    {(hospital.phone !== 'N/A' || hospital.website) && (
                      <div className="details-section">
                        <h4>📞 Contact Information</h4>
                        {hospital.phone !== 'N/A' && (
                          <p>Phone: <a href={`tel:${hospital.phone}`}>{hospital.phone}</a></p>
                        )}
                        {hospital.website && (
                          <p>Website: <a href={hospital.website} target="_blank" rel="noopener noreferrer">Visit Website</a></p>
                        )}
                      </div>
                    )}

                    {/* Facilities */}
                    {hospital.facilities && hospital.facilities.length > 0 && (
                      <div className="details-section">
                        <h4>🏥 Facilities & Services</h4>
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
                      getDirections(hospital)
                    }}
                    className="action-button primary"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                    Directions
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
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 714.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 712.11-.45 12.84 12.84 0 002.81.7A2 2 0 0222 16.92z"/>
                      </svg>
                      Call
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
                    {selectedHospital?.id === hospital.id ? 'Hide Details' : 'View Details'}
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
              <h3>No Hospitals Found</h3>
              <p>Try searching on Google Maps or adjust your location</p>
              <button onClick={searchOnMaps} className="search-maps-button">
                Search on Google Maps
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NearbyHospitals
