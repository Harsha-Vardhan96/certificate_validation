import axios from 'axios'

const STORAGE_KEY = 'certiverify_auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
})

// Attach JWT to outgoing requests when available
api.interceptors.request.use((config) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const { token } = JSON.parse(raw)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
  } catch {
    // If localStorage read fails, proceed without token
  }

  // If request data is FormData, remove Content-Type so browser can set boundary
  if (config.data instanceof FormData) {
    if (config.headers && typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type')
    } else if (config.headers) {
      delete config.headers['Content-Type']
    }
  }

  return config
})

export default api
