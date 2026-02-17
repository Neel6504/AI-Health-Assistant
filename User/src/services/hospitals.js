import { getDistanceKm } from './distance'

function normalizeGooglePlace(place) {
  const lat = place?.geometry?.location?.lat
  const lng = place?.geometry?.location?.lng
  if (typeof lat !== 'number' || typeof lng !== 'number') return null

  return {
    id: place.place_id || `${lat},${lng}`,
    name: place.name || 'Hospital',
    address: place.vicinity || place.formatted_address || 'Address not available',
    lat,
    lng,
    isOpen: place.opening_hours?.open_now ?? null,
    rating: typeof place.rating === 'number' ? place.rating : 'N/A',
    userRatingsTotal: place.user_ratings_total || 0,
    phone: 'N/A',
    website: null,
    emergency: true,
  }
}

function formatAddressFromTags(tags) {
  const parts = []
  if (tags?.['addr:housenumber']) parts.push(tags['addr:housenumber'])
  if (tags?.['addr:street']) parts.push(tags['addr:street'])
  if (tags?.['addr:city']) parts.push(tags['addr:city'])
  if (tags?.['addr:postcode']) parts.push(tags['addr:postcode'])
  if (parts.length > 0) return parts.join(', ')
  return tags?.address || 'Address not available'
}

function normalizeOverpassElement(element) {
  const lat = element.lat ?? element.center?.lat
  const lng = element.lon ?? element.center?.lon
  if (typeof lat !== 'number' || typeof lng !== 'number') return null

  const tags = element.tags || {}
  const isOpen = (() => {
    if (tags.opening_hours === '24/7') return true
    if (tags.opening_hours === 'closed') return false
    if (tags['opening_hours:covid19'] === 'closed') return false
    return tags.emergency !== 'no' ? true : null
  })()

  return {
    id: String(element.id ?? `${lat},${lng}`),
    name: tags.name || tags['name:en'] || 'Hospital',
    address: formatAddressFromTags(tags),
    lat,
    lng,
    isOpen,
    rating: 'N/A',
    userRatingsTotal: 0,
    phone: tags.phone || tags['contact:phone'] || 'N/A',
    website: tags.website || tags['contact:website'] || null,
    emergency: tags.emergency ? tags.emergency !== 'no' : true,
  }
}

export async function fetchNearbyHospitalsGoogle({ lat, lng }, radius, apiKey) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
  url.searchParams.set('location', `${lat},${lng}`)
  url.searchParams.set('radius', String(radius))
  url.searchParams.set('type', 'hospital')
  url.searchParams.set('key', apiKey)

  const resp = await fetch(url.toString())
  if (!resp.ok) throw new Error(`Google Places API failed: ${resp.status}`)
  const data = await resp.json()
  const places = Array.isArray(data.results) ? data.results : []
  const normalized = places
    .map(normalizeGooglePlace)
    .filter(Boolean)
  return normalized
}

export async function fetchNearbyHospitalsOverpass({ lat, lng }, radius) {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lng});
      way["amenity"="hospital"](around:${radius},${lat},${lng});
      relation["amenity"="hospital"](around:${radius},${lat},${lng});
    );
    out center meta;
  `
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
  const resp = await fetch(url)
  if (!resp.ok) throw new Error(`Overpass API failed: ${resp.status}`)
  const data = await resp.json()
  const elements = Array.isArray(data.elements) ? data.elements : []
  const normalized = elements
    .map(normalizeOverpassElement)
    .filter((h) => h && h.name !== 'Hospital')
  return normalized
}

export function sortAndAttachDistance(hospitals, userLocation) {
  const withDistance = hospitals.map((h) => ({
    ...h,
    distanceKm: getDistanceKm(userLocation.lat, userLocation.lng, h.lat, h.lng),
  }))
  withDistance.sort((a, b) => a.distanceKm - b.distanceKm)
  return withDistance
}
