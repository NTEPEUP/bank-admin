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
  if (!headers['Content-Type'] && options.body) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(json?.message || res.statusText || 'Error en la petición')
  return json
}

export async function getByDpi(dpi) {
  return request(`/clientes/dpi/${encodeURIComponent(dpi)}`, { method: 'GET' })
}

export async function getByCodigo(codigo) {
  return request(`/clientes/codigo/${encodeURIComponent(codigo)}`, { method: 'GET' })
}

export async function fetchCuentas(idCliente) {
  return request(`/cuentas/cliente/${encodeURIComponent(idCliente)}`, { method: 'GET' })
}

export async function fetchTarjetas(idCliente) {
  return request(`/tarjetas/cliente/${encodeURIComponent(idCliente)}`, { method: 'GET' })
}

export async function fetchPrestamos(idCliente) {
  return request(`/prestamos/cliente/${encodeURIComponent(idCliente)}`, { method: 'GET' })
}

export async function fetchReclamos(idCliente) {
  return request(`/reclamos/cliente/${encodeURIComponent(idCliente)}`, { method: 'GET' })
}

export async function fetchHistorial(idCliente) {
  return request(`/historial-atencion/cliente/${encodeURIComponent(idCliente)}`, { method: 'GET' })
}

export async function createCuenta(payload) {
  return request(`/cuentas`, { method: 'POST', body: JSON.stringify(payload) })
}

export async function createTarjeta(payload) {
  return request(`/tarjetas`, { method: 'POST', body: JSON.stringify(payload) })
}

export async function createPrestamo(payload) {
  return request(`/prestamos`, { method: 'POST', body: JSON.stringify(payload) })
}

export default {
  getByDpi,
  getByCodigo,
  fetchCuentas,
  fetchTarjetas,
  fetchPrestamos,
  fetchReclamos,
  fetchHistorial,
  createCuenta,
  createTarjeta,
  createPrestamo,
}
