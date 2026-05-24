import { apiRequest } from './api.js'

export async function getByDpi(dpi) {
  return apiRequest(`/clientes/dpi/${encodeURIComponent(dpi)}`, { method: 'GET' })
}

export async function getByCodigo(codigo) {
  return apiRequest(`/clientes/codigo/${encodeURIComponent(codigo)}`, { method: 'GET' })
}

export async function fetchCuentas(idCliente) {
  return apiRequest(`/cuentas/cliente/${encodeURIComponent(idCliente)}`, { method: 'GET' })
}

export async function fetchTarjetas(idCliente) {
  return apiRequest(`/tarjetas/cliente/${encodeURIComponent(idCliente)}`, { method: 'GET' })
}

export async function fetchPrestamos(idCliente) {
  return apiRequest(`/prestamos/cliente/${encodeURIComponent(idCliente)}`, { method: 'GET' })
}

export async function fetchReclamos(idCliente) {
  return apiRequest(`/reclamos/cliente/${encodeURIComponent(idCliente)}`, { method: 'GET' })
}

export async function fetchHistorial(idCliente) {
  return apiRequest(`/historial-atencion/cliente/${encodeURIComponent(idCliente)}`, { method: 'GET' })
}

export async function createCuenta(payload) {
  return apiRequest(`/cuentas`, { method: 'POST', body: JSON.stringify(payload) })
}

export async function createTarjeta(payload) {
  return apiRequest(`/tarjetas`, { method: 'POST', body: JSON.stringify(payload) })
}

export async function createPrestamo(payload) {
  return apiRequest(`/prestamos`, { method: 'POST', body: JSON.stringify(payload) })
}

export async function createReclamo(payload) {
  return apiRequest(`/reclamos`, { method: 'POST', body: JSON.stringify(payload) })
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
  createReclamo
}
