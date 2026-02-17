import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Loader from '../components/Loader'
import './NearbyHospitals.css'
import { getCurrentLocation } from '../services/geolocation'
import {
  fetchNearbyHospitalsGoogle,
  fetchNearbyHospitalsOverpass,
  sortAndAttachDistance,
} from '../services/hospitals'
import { getDistanceKm } from '../services/distance'

function NearbyHospitals() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [hospitals, setHospitals] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [selectedHospital, setSelectedHospital] = useState(null)

  useEffect(() => {
    getUserLocation()
  }, [])

  const getUserLocation = async () => {
    setIsLoading(true)
    setLocationError(null)
    try {
      const loc = await getCurrentLocation({ timeout: 15000 })
      setUserLocation(loc)
      await findNearbyHospitals(loc)
    } catch (err) {
      if (err.code === 'permission-denied') {
        setLocationError('Location access is required to find nearby hospitals.')
      } else if (err.code === 'not-supported') {
        setLocationError('Geolocation is not supported by your browser')
      } else {
        setLocationError(err.message || 'Unable to retrieve your location.')
      }
      setIsLoading(false)
    }
  }

  const findNearbyHospitals = async (location) => {
    try {
      setIsLoading(true)
      const radius = 5000
      const googleApiKey = import.meta.env?.VITE_GOOGLE_MAPS_API_KEY

      let results = []
      if (googleApiKey) {
        try {
          const googleResults = await fetchNearbyHospitalsGoogle(location, radius, googleApiKey)
          results = googleResults
        } catch (googleErr) {
          console.warn('Google Places failed, falling back to Overpass:', googleErr)
          const overpassResults = await fetchNearbyHospitalsOverpass(location, radius)
          results = overpassResults
        }
      } else {
        const overpassResults = await fetchNearbyHospitalsOverpass(location, radius)
        results = overpassResults
      }

      if (results.length === 0) {
        setHospitals([])
        setLocationError('No hospitals found within 5 km of your location.')
      } else {
        const sorted = sortAndAttachDistance(results, location)
        setHospitals(sorted)
      }
    } catch (error) {
      console.error('Error finding hospitals:', error)
      setHospitals([])
      setLocationError('Unable to search for hospitals due to an API error.')
    }
    setIsLoading(false)
  }

  // Helper functions for processing hospital data
  const formatAddress = (tags) => {
    const parts = []
    if (tags?.["addr:housenumber"]) parts.push(tags["addr:housenumber"])
    if (tags?.["addr:street"]) parts.push(tags["addr:street"])
    if (tags?.["addr:city"]) parts.push(tags["addr:city"])
    if (tags?.["addr:postcode"]) parts.push(tags["addr:postcode"])
    
    if (parts.length > 0) {
      return parts.join(', ')
    }
    
    return tags?.address || 'Address not available'
  }

  const determineOpenStatus = (tags) => {
    if (tags?.opening_hours === '24/7') return true
    if (tags?.opening_hours === 'closed') return false
    if (tags?.["opening_hours:covid19"] === 'closed') return false
    
    // For hospitals, assume open unless explicitly closed
    return tags?.emergency !== 'no' ? true : null
  }

  const parseOpeningHours = (openingHours) => {
    if (!openingHours) {
      return {
        monday: 'Hours not available',
        tuesday: 'Hours not available', 
        wednesday: 'Hours not available',
        thursday: 'Hours not available',
        friday: 'Hours not available',
        saturday: 'Hours not available',
        sunday: 'Hours not available'
      }
    }
    
    if (openingHours === '24/7') {
      return {
        monday: '24 Hours',
        tuesday: '24 Hours',
        wednesday: '24 Hours', 
        thursday: '24 Hours',
        friday: '24 Hours',
        saturday: '24 Hours',
        sunday: '24 Hours'
      }
    }
    
    // Parse more complex opening hours (basic implementation)
    return {
      monday: openingHours,
      tuesday: openingHours,
      wednesday: openingHours,
      thursday: openingHours, 
      friday: openingHours,
      saturday: openingHours,
      sunday: openingHours
    }
  }

  const extractFacilities = (tags) => {
    const facilities = []
    
    // Emergency services
    if (tags?.emergency && tags.emergency !== 'no') {
      facilities.push('Emergency Services')
    }
    
    // Specific medical services
    if (tags?.["healthcare:speciality"]) {
      const specialties = tags["healthcare:speciality"].split(';')
      facilities.push(...specialties.map(s => s.trim().replace(/_/g, ' ')))
    }
    
    // Basic facilities
    if (tags?.wheelchair === 'yes') facilities.push('Wheelchair Accessible')
    if (tags?.parking) facilities.push('Parking Available')
    if (tags?.wifi === 'yes') facilities.push('Free WiFi')
    if (tags?.pharmacy === 'yes') facilities.push('Pharmacy')
    if (tags?.laboratory === 'yes') facilities.push('Laboratory')
    
    // Default facilities for hospitals
    if (facilities.length === 0) {
      facilities.push('Medical Services', 'Healthcare Professionals')
    }
    
    return facilities
  }

  const getDirections = (hospital) => {
    const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : ''
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${hospital.lat},${hospital.lng}&travelmode=driving`
    window.open(url, '_blank')
  }

  const searchOnMaps = () => {
    if (userLocation) {
      const url = `https://www.google.com/maps/search/hospitals+near+me/@${userLocation.lat},${userLocation.lng},14z`
      window.open(url, '_blank')
    }
  }

  if (isLoading) {
    return <Loader 
      message="Searching Real Hospitals Near You" 
      subtitle="Finding actual medical facilities in your area using live location data..."
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
          <p>Healthcare facilities near your location</p>
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
              <button onClick={getUserLocation} className="retry-button">
                📍 Retry Location
              </button>
              <button onClick={searchOnMaps} className="maps-fallback-button">
                🗺️ Search on Maps
              </button>
            </div>
          </div>
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
          </div>

          <div className="hospitals-grid">
            {hospitals.map((hospital) => (
              <div 
                key={hospital.id} 
                className={`hospital-card ${selectedHospital?.id === hospital.id ? 'selected' : ''}`}
                onClick={() => setSelectedHospital(selectedHospital?.id === hospital.id ? null : hospital)}
              >
                <div className="hospital-card-header">
                  {hospital.isOpen !== null && (
                    <span className={`status-badge ${hospital.isOpen ? 'open' : 'closed'}`}>
                      {hospital.isOpen ? '🟢 Open' : '🔴 Closed'}
                    </span>
                  )}
                </div>

                <h3 className="hospital-name">{hospital.name}</h3>
                <p className="hospital-address">
                  📍 {hospital.address}
                </p>

                <p className="hospital-description">
                  Distance: {hospital.distanceKm ? hospital.distanceKm.toFixed(2) : getDistanceKm(userLocation?.lat, userLocation?.lng, hospital.lat, hospital.lng).toFixed(2)} km
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
                    {hospital.isOpen !== null && (
                      <div className="details-section">
                        <h4>📌 Status</h4>
                        <p>{hospital.isOpen ? 'Open Now' : 'Closed'}</p>
                      </div>
                    )}
                    {hospital.openingHours && (
                      <div className="details-section">
                        <h4>🕒 Opening Hours</h4>
                        <div className="opening-hours">
                          {Object.entries(hospital.openingHours).map(([day, hours]) => (
                            <div key={day} className="hours-row">
                              <span className="day">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
                              <span className="hours">{hours}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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
