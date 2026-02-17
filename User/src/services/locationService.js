/**
 * Location Service for finding nearby hospitals
 * Supports Google Places API (preferred) and OpenStreetMap Overpass API (fallback)
 */

// Distance calculation using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  
  return parseFloat(distance.toFixed(2)) // Return distance in KM with 2 decimal places
}

const toRad = (value) => {
  return (value * Math.PI) / 180
}

/**
 * Get user's current location using browser geolocation API
 */
export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        console.log('[NearbyHospitals] Geolocation success:', coords)
        resolve(coords)
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location.'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access is required to find nearby hospitals.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out. Please try again.'
            break
          default:
            errorMessage = 'An unknown error occurred while getting location.'
        }
        
        console.error('[NearbyHospitals] Geolocation error:', error)
        reject(new Error(errorMessage))
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  })
}

/**
 * Find nearby hospitals using Google Places API (Preferred)
 * Note: Requires a valid Google API key with Places API enabled
 */
export const findHospitalsWithGooglePlaces = async (location, apiKey) => {
  try {
    const radius = 5000 // 5000 meters = 5 km
    const maxDistanceKm = radius / 1000
    
    // Using Google Places API Nearby Search
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=${radius}&type=hospital&key=${apiKey}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API status: ${data.status}`)
    }
    
    if (!data.results || data.results.length === 0) {
      return []
    }
    
    // Process and format the results
    const hospitals = data.results
      .filter(place => {
        // Filter only valid hospitals with coordinates
        return place.geometry && 
               place.geometry.location && 
               place.geometry.location.lat && 
               place.geometry.location.lng
      })
      .map(place => {
        const hospitalLat = place.geometry.location.lat
        const hospitalLng = place.geometry.location.lng
        const distance = calculateDistance(
          location.lat, 
          location.lng, 
          hospitalLat, 
          hospitalLng
        )
        
        return {
          id: place.place_id,
          name: place.name,
          address: place.vicinity || 'Address not available',
          lat: hospitalLat,
          lng: hospitalLng,
          distance: distance,
          rating: place.rating || 'N/A',
          userRatingsTotal: place.user_ratings_total || 0,
          isOpen: place.opening_hours?.open_now ?? null,
          photo: place.photos && place.photos[0] 
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${apiKey}`
            : null,
          types: place.types || []
        }
      })
      .filter(place => place.distance <= maxDistanceKm)
      .sort((a, b) => a.distance - b.distance) // Sort by nearest distance
    
    return hospitals
    
  } catch (error) {
    console.error('Google Places API error:', error)
    throw error
  }
}

/**
 * Find nearby hospitals using OpenStreetMap Overpass API (Fallback)
 */
export const findHospitalsWithOverpass = async (location) => {
  try {
    if (!isValidCoordinates(location?.lat, location?.lng)) {
      throw new Error('Invalid coordinates received from geolocation')
    }
    const radius = 5000 // 5000 meters = 5 km
    const maxDistanceKm = radius / 1000
    
    // Overpass API query for hospitals within radius
    const overpassQuery = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radius},${location.lat},${location.lng});
        way["amenity"="hospital"](around:${radius},${location.lat},${location.lng});
        relation["amenity"="hospital"](around:${radius},${location.lat},${location.lng});
      );
      out center;
    `
    
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`
    console.log('[NearbyHospitals] Using coordinates:', location.lat, location.lng)
    console.log('[NearbyHospitals] Overpass request URL:', overpassUrl)
    
    const response = await fetch(overpassUrl)
    
    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`)
    }
    
    const data = await response.json()
    console.log('[NearbyHospitals] Overpass response elements:', Array.isArray(data?.elements) ? data.elements.length : 0)
    
    if (!data.elements || data.elements.length === 0) {
      return []
    }
    
    // Process and format the results
    const hospitals = data.elements
      .filter(element => {
        // Filter only elements with valid names and coordinates
        const hasName = element.tags?.name
        const hasCoords = element.lat || element.center?.lat
        return hasName && hasCoords
      })
      .map(element => {
        // Get hospital coordinates
        const hospitalLat = element.lat || element.center?.lat
        const hospitalLng = element.lon || element.center?.lon
        
        // Calculate distance from user location
        const distance = calculateDistance(
          location.lat,
          location.lng,
          hospitalLat,
          hospitalLng
        )
        
        return {
          id: element.id?.toString() || `osm-${element.type}-${Math.random()}`,
          name: element.tags?.name || element.tags?.["name:en"],
          address: formatAddress(element.tags),
          lat: hospitalLat,
          lng: hospitalLng,
          distance: distance,
          rating: 'N/A',
          userRatingsTotal: 0,
          isOpen: determineOpenStatus(element.tags),
          phone: element.tags?.phone || element.tags?.["contact:phone"] || 'N/A',
          website: element.tags?.website || element.tags?.["contact:website"] || null,
          emergency: element.tags?.emergency ? element.tags.emergency !== 'no' : true,
          facilities: extractFacilities(element.tags),
          openingHours: parseOpeningHours(element.tags?.opening_hours)
        }
      })
      .filter(place => place.distance <= maxDistanceKm)
      .sort((a, b) => a.distance - b.distance) // Sort by nearest distance
    
    console.log('[NearbyHospitals] First result distance (km):', hospitals[0]?.distance)
    return hospitals
    
  } catch (error) {
    console.error('Overpass API error:', error)
    throw error
  }
}

// Helper functions for OpenStreetMap data processing
const formatAddress = (tags) => {
  const parts = []
  
  if (tags?.["addr:housenumber"]) parts.push(tags["addr:housenumber"])
  if (tags?.["addr:street"]) parts.push(tags["addr:street"])
  if (tags?.["addr:city"]) parts.push(tags["addr:city"])
  if (tags?.["addr:state"]) parts.push(tags["addr:state"])
  if (tags?.["addr:postcode"]) parts.push(tags["addr:postcode"])
  
  if (parts.length > 0) {
    return parts.join(', ')
  }
  
  return 'Address not available'
}

const determineOpenStatus = (tags) => {
  if (tags?.opening_hours === '24/7') return true
  if (tags?.opening_hours === 'closed') return false
  
  // For hospitals with emergency services, assume open
  if (tags?.emergency && tags.emergency !== 'no') return true
  
  // Otherwise, status unknown
  return null
}

const parseOpeningHours = (openingHours) => {
  if (!openingHours) {
    return 'Hours not available'
  }
  
  if (openingHours === '24/7') {
    return '24 Hours'
  }
  
  return openingHours
}

const extractFacilities = (tags) => {
  const facilities = []
  
  // Emergency services
  if (tags?.emergency && tags.emergency !== 'no') {
    facilities.push('Emergency Services')
  }
  
  // Healthcare specialties
  if (tags?.["healthcare:speciality"]) {
    const specialties = tags["healthcare:speciality"].split(';')
    facilities.push(...specialties.map(s => s.trim().replace(/_/g, ' ')))
  }
  
  // Accessibility and amenities
  if (tags?.wheelchair === 'yes') facilities.push('Wheelchair Accessible')
  if (tags?.parking) facilities.push('Parking Available')
  if (tags?.wifi === 'yes') facilities.push('Free WiFi')
  if (tags?.["amenity:pharmacy"] === 'yes' || tags?.pharmacy === 'yes') {
    facilities.push('Pharmacy')
  }
  
  return facilities
}

/**
 * Main function to find nearby hospitals
 * Uses OpenStreetMap Overpass API strictly (no Google Maps)
 */
export const findNearbyHospitals = async (location, googleApiKey = null) => {
  try {
    if (!isValidCoordinates(location?.lat, location?.lng)) {
      throw new Error('Invalid coordinates received from geolocation')
    }
    
    // Use OpenStreetMap Overpass API only
    console.log('Fetching hospitals using OpenStreetMap Overpass API...')
    const hospitals = await findHospitalsWithOverpass(location)
    
    if (hospitals && hospitals.length > 0) {
      console.log(`Found ${hospitals.length} hospitals using OpenStreetMap`)
      return {
        hospitals,
        source: 'openstreetmap'
      }
    }
    
    // No hospitals found
    return {
      hospitals: [],
      source: 'none'
    }
    
  } catch (error) {
    console.error('Error finding nearby hospitals:', error)
    throw error
  }
}

// Validate coordinates to ensure they are real numbers and in bounds
const isValidCoordinates = (lat, lng) => {
  const isFiniteNumber = (n) => typeof n === 'number' && Number.isFinite(n)
  if (!isFiniteNumber(lat) || !isFiniteNumber(lng)) return false
  if (lat < -90 || lat > 90) return false
  if (lng < -180 || lng > 180) return false
  return true
}
