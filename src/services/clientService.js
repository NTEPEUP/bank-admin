import { apiRequest } from './api.js'

export async function createClient(payload) {
  return apiRequest('/clientes', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateClient(id, payload) {
  return apiRequest(`/clientes/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export async function fetchClients() {
  return apiRequest('/clientes', { method: 'GET' })
}

export async function fetchClient(id) {
  return apiRequest(`/clientes/${id}`, { method: 'GET' })
}

export default { createClient, updateClient, fetchClients, fetchClient }
