export async function getCurrentLocation(options = {}) {
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
  }

  const opts = { ...defaultOptions, ...options }

  if (!navigator.geolocation) {
    const error = new Error('Geolocation is not supported by your browser')
    error.code = 'not-supported'
    throw error
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        let err = new Error('Unable to retrieve your location')
        switch (error.code) {
          case error.PERMISSION_DENIED:
            err = new Error('Location access is required to find nearby hospitals.')
            err.code = 'permission-denied'
            break
          case error.POSITION_UNAVAILABLE:
            err = new Error('Location information is unavailable')
            err.code = 'position-unavailable'
            break
          case error.TIMEOUT:
            err = new Error('Location request timed out')
            err.code = 'timeout'
            break
          default:
            err.code = 'unknown'
        }
        reject(err)
      },
      opts,
    )
  })
}
