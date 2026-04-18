/**
 * Location Service for finding nearby hospitals
 * Supports Google Places API (preferred) and OpenStreetMap Overpass API (fallback)
 */

import { API_BASE } from '../config/api'

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
 * Find nearby hospitals from our database
 * This is the preferred method as it uses registered hospitals
 */
export const findHospitalsFromDatabase = async (location, radiusKm = 5) => {
  try {
    const API_URL = API_BASE
    
    const response = await fetch(`${API_URL}/api/hospitals/nearby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude: location.lat,
        longitude: location.lng,
        radius: radiusKm
      })
    })

    if (!response.ok) {
      throw new Error(`Database API error: ${response.status}`)
    }

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch hospitals from database')
    }

    // Transform database format to match our UI format
    const hospitals = result.data.map(hospital => ({
      id: hospital._id,
      name: hospital.hospitalName,
      address: `${hospital.address}, ${hospital.city}, ${hospital.state} - ${hospital.pincode}`,
      lat: hospital.latitude,
      lng: hospital.longitude,
      distance: hospital.distance,
      rating: 'N/A',
      userRatingsTotal: 0,
      isOpen: hospital.isOpen,
      phone: hospital.phone,
      email: hospital.email,
      website: null,
      emergency: hospital.emergencyAvailable,
      ambulance: hospital.ambulanceAvailable,
      hospitalType: hospital.hospitalType,
      totalBeds: hospital.totalBeds,
      specializations: hospital.specializations,
      openDays: hospital.openDays || [],
      operatingHours: hospital.operatingHours || null,
      availableServices: hospital.availableServices,
      facilities: hospital.availableServices || [],
      openingHours: hospital.operatingHours
        ? `${hospital.operatingHours.openingTime} - ${hospital.operatingHours.closingTime}`
        : null
    }))

    console.log(`Found ${hospitals.length} hospitals from database within ${radiusKm}km`)
    return hospitals

  } catch (error) {
    console.error('Database fetch error:', error)
    throw error
  }
}

/**
 * Main function to find nearby hospitals
 * Combines database hospitals with external API results
 */
export const findNearbyHospitals = async (location, googleApiKey = null) => {
  try {
    if (!isValidCoordinates(location?.lat, location?.lng)) {
      throw new Error('Invalid coordinates received from geolocation')
    }
    
    let allHospitals = []
    let dataSources = []
    
    // 1. First, try to get hospitals from our database (nearby)
    try {
      console.log('Fetching nearby hospitals from database...')
      const dbHospitals = await findHospitalsFromDatabase(location, 10) // 10km radius for nearby
      
      if (dbHospitals && dbHospitals.length > 0) {
        allHospitals = [...allHospitals, ...dbHospitals]
        dataSources.push('database')
        console.log(`Found ${dbHospitals.length} hospitals from database`)
      }
    } catch (dbError) {
      console.warn('Database search failed:', dbError.message)
    }
    
    // 2. Try Google Places API if available
    if (googleApiKey) {
      try {
        console.log('Fetching hospitals using Google Places API...')
        const googleHospitals = await findHospitalsWithGooglePlaces(location, googleApiKey)
        
        // Filter out duplicates based on proximity (within 100m)
        const filteredGoogleHospitals = googleHospitals.filter(googleHospital => {
          return !allHospitals.some(existingHospital => {
            const distance = calculateDistance(
              existingHospital.lat, existingHospital.lng,
              googleHospital.lat, googleHospital.lng
            )
            return distance < 0.1 // 100 meters
          })
        })
        
        if (filteredGoogleHospitals.length > 0) {
          allHospitals = [...allHospitals, ...filteredGoogleHospitals]
          dataSources.push('google-places')
          console.log(`Found ${filteredGoogleHospitals.length} additional hospitals from Google Places`)
        }
      } catch (googleError) {
        console.warn('Google Places search failed:', googleError.message)
      }
    }
    
    // 3. Fallback to OpenStreetMap if we don't have enough results
    if (allHospitals.length < 5) {
      try {
        console.log('Fetching additional hospitals using OpenStreetMap...')
        const osmHospitals = await findHospitalsWithOverpass(location)
        
        // Filter out duplicates
        const filteredOsmHospitals = osmHospitals.filter(osmHospital => {
          return !allHospitals.some(existingHospital => {
            const distance = calculateDistance(
              existingHospital.lat, existingHospital.lng,
              osmHospital.lat, osmHospital.lng
            )
            return distance < 0.1 // 100 meters
          })
        })
        
        if (filteredOsmHospitals.length > 0) {
          allHospitals = [...allHospitals, ...filteredOsmHospitals]
          dataSources.push('openstreetmap')
          console.log(`Found ${filteredOsmHospitals.length} additional hospitals from OpenStreetMap`)
        }
      } catch (osmError) {
        console.warn('OpenStreetMap search failed:', osmError.message)
      }
    }
    
    // Calculate distances for all hospitals and sort by distance
    allHospitals = allHospitals.map(hospital => {
      const distance = calculateDistance(
        location.lat, location.lng,
        hospital.lat, hospital.lng
      )
      return { ...hospital, distance }
    }).sort((a, b) => a.distance - b.distance)
    
    console.log(`Total found: ${allHospitals.length} hospitals from sources: ${dataSources.join(', ')}`)
    
    return {
      hospitals: allHospitals,
      source: dataSources.join(' + '),
      counts: {
        total: allHospitals.length,
        database: allHospitals.filter(h => h.source === 'database').length,
        external: allHospitals.filter(h => h.source !== 'database').length
      }
    }
    
  } catch (error) {
    console.error('Error finding nearby hospitals:', error)
    throw error
  }
}

/**
 * Get all hospitals from database (not location-filtered)
 * @returns {Promise<Array>} - Array of all hospital objects
 */
export const getAllHospitalsFromDatabase = async () => {
  try {
    const API_URL = API_BASE
    
    // Fetch all hospitals from database
    const response = await fetch(`${API_URL}/api/hospitals/`)
    
    if (!response.ok) {
      throw new Error(`Database API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.success || !data.data) {
      throw new Error('Invalid response from database')
    }
    
    // Transform database results to match our format
    const hospitals = data.data.map(hospital => ({
      id: hospital._id,
      name: hospital.hospitalName,
      address: `${hospital.address}, ${hospital.city}, ${hospital.state} - ${hospital.pincode}`,
      lat: hospital.latitude,
      lng: hospital.longitude,
      distance: null, // Will be calculated if user location is available
      rating: 'N/A',
      userRatingsTotal: 0,
      isOpen: true,
      phone: hospital.phone,
      email: hospital.email,
      website: null,
      emergency: hospital.emergencyAvailable,
      ambulance: hospital.ambulanceAvailable,
      hospitalType: hospital.hospitalType,
      totalBeds: hospital.totalBeds,
      specializations: hospital.specializations,
      openDays: hospital.openDays || [],
      operatingHours: hospital.operatingHours || null,
      availableServices: hospital.availableServices,
      facilities: hospital.availableServices || [],
      openingHours: hospital.operatingHours
        ? `${hospital.operatingHours.openingTime} - ${hospital.operatingHours.closingTime}`
        : null,
      source: 'database'
    }))

    console.log(`Found ${hospitals.length} total hospitals in database`)
    return hospitals

  } catch (error) {
    console.error('Database fetch all hospitals error:', error)
    throw error
  }
}

/**
 * Get all hospitals from database with optional location for distance calculation
 */
export const getAllHospitalsWithLocation = async (userLocation = null) => {
  try {
    console.log('Fetching all hospitals from database...')
    let allHospitals = await getAllHospitalsFromDatabase()
    
    // If user location is available, calculate distances and sort
    if (userLocation && isValidCoordinates(userLocation.lat, userLocation.lng)) {
      allHospitals = allHospitals.map(hospital => {
        const distance = calculateDistance(
          userLocation.lat, userLocation.lng,
          hospital.lat, hospital.lng
        )
        return { ...hospital, distance }
      }).sort((a, b) => a.distance - b.distance)
    }
    
    return {
      hospitals: allHospitals,
      source: 'database-all',
      counts: {
        total: allHospitals.length,
        database: allHospitals.length,
        external: 0
      }
    }
    
  } catch (error) {
    console.error('Error getting all hospitals:', error)
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
