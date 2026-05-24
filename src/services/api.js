const SESSION_KEY = 'bank-auth-session'
const DEFAULT_API_BASE_URL = 'http://localhost:8080/api'

function getStorage() {
	if (typeof window === 'undefined') {
		return null
	}

	return window.sessionStorage
}

function parseSession(rawSession) {
	if (!rawSession) {
		return null
	}

	try {
		return JSON.parse(rawSession)
	} catch {
		return null
	}
}

export function getApiBaseUrl() {
	return (import.meta.env.VITE_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL).replace(/\/+$/, '')
}

export function buildApiUrl(path = '') {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`
	return `${getApiBaseUrl()}${normalizedPath}`
}

export function readSession() {
	const storage = getStorage()

	if (!storage) {
		return null
	}

	return parseSession(storage.getItem(SESSION_KEY))
}

export function saveSession(session) {
	const storage = getStorage()

	if (!storage) {
		return
	}

	storage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
	const storage = getStorage()

	if (!storage) {
		return
	}

	storage.removeItem(SESSION_KEY)
}

export function hasSession() {
	const session = readSession()

	return Boolean(session?.token || session?.accessToken || session?.jwt || session?.access_token)
}

export function getToken() {
	const session = readSession()

	return session?.token || session?.accessToken || session?.jwt || session?.access_token || ''
}

export async function apiRequest(path, options = {}) {
	const headers = new Headers(options.headers || {})
	const token = getToken()

	if (token && !headers.has('Authorization')) {
		headers.set('Authorization', `Bearer ${token}`)
	}

	if (options.body && !headers.has('Content-Type')) {
		headers.set('Content-Type', 'application/json')
	}

	const response = await fetch(buildApiUrl(path), {
		...options,
		headers,
	})

	const rawResponse = await response.text()
	let payload = {}

	if (rawResponse) {
		try {
			payload = JSON.parse(rawResponse)
		} catch {
			payload = rawResponse
		}
	}

	if (!response.ok) {
		const message = payload && typeof payload === 'object' ? payload?.message : ''
		throw new Error(message || response.statusText || 'Error en la petición')
	}

	return payload
}

export default {
	apiRequest,
	buildApiUrl,
	clearSession,
	getApiBaseUrl,
	getToken,
	hasSession,
	readSession,
	saveSession,
}
