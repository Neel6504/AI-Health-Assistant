const API_BASE_URL = (
	import.meta.env.VITE_API_BASE_URL ||
	import.meta.env.VITE_API_URL ||
	'http://localhost:3001'
).replace(/\/$/, '')

export const API_BASE = API_BASE_URL
export const HOSPITALS_API = `${API_BASE_URL}/api/hospitals`
export const APPOINTMENTS_API = `${API_BASE_URL}/api/appointments`
