const SESSION_KEY = 'bank-auth-session'

function getToken() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY) || '{}')
    return s.token || ''
  } catch {
    return ''
  }
}

const API_BASE = 'http://localhost:8080/api'

async function request(path, options = {}) {
  const token = getToken()
  const headers = options.headers || {}
  if (token) headers['Authorization'] = `Bearer ${token}`
  headers['Content-Type'] = headers['Content-Type'] || 'application/json'

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.message || res.statusText || 'Error en la petición')
  return json
}

export async function createClient(payload) {
  return request('/clientes', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateClient(id, payload) {
  return request(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export async function fetchClients() {
  return request('/clientes', { method: 'GET' })
}

export async function fetchClient(id) {
  return request(`/clientes/${id}`, { method: 'GET' })
}

export default { createClient, updateClient, fetchClients, fetchClient }
