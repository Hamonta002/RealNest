const API_BASE = import.meta.env.VITE_API_URL || '/api'

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('token')
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Something went wrong')
  return data
}

export const getProperties = () => apiRequest('/properties')
export const getProperty = (id) => apiRequest(`/properties/${id}`)
export const createProperty = (payload) => apiRequest('/properties', { method: 'POST', body: JSON.stringify(payload) })
export const login = (payload) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) })
export const googleLogin = (payload) => apiRequest('/auth/google', { method: 'POST', body: JSON.stringify(payload) })
export const register = (payload) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) })
export const createInquiry = (payload) => apiRequest('/inquiries', { method: 'POST', body: JSON.stringify(payload) })
export const getAdminOverview = () => apiRequest('/admin/overview')
export const updateAdminUserRole = (id, payload) => apiRequest(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify(payload) })
export const removeAdminUser = (id) => apiRequest(`/admin/users/${id}`, { method: 'DELETE' })
export const updateAdminListingStatus = (id, payload) => apiRequest(`/admin/properties/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) })
