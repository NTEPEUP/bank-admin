import { apiRequest, getToken } from './api.js'

export async function fetchRoles() {
  const token = getToken()

  return apiRequest('/roles', {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
}

export async function createUser(payload) {
  return apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
}

export async function fetchUsers() {
  return apiRequest('/usuarios', { method: 'GET' })
}

export async function updateUser(id, payload) {
    const token = getToken()
  return apiRequest(`/usuarios/${encodeURIComponent(id)}`, {
    method: 'PUT', headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(payload),
  })
}

export async function updateUserStatus(id, isActive) {
  return updateUser(id, { activo: Boolean(isActive) })
}

export async function deleteUser(id) {
  return apiRequest(`/usuarios/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export default {
  fetchRoles,
  createUser,
  fetchUsers,
  updateUser,
  updateUserStatus,
  deleteUser,
}