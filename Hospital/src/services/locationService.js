/**
 * Location Service for Hospital Registration
 * Gets hospital's GPS coordinates using browser geolocation API
 */

/**
 * Get current location using browser geolocation API
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        }
        console.log('Location detected:', coords)
        resolve(coords)
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location.'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please allow location access to detect hospital coordinates.'
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
        
        console.error('Geolocation error:', error)
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
 * Format coordinates for display
 */
export const formatCoordinates = (lat, lng) => {
  return {
    latitude: parseFloat(lat).toFixed(6),
    longitude: parseFloat(lng).toFixed(6)
  }
}
