import axios from 'axios'

const STORAGE_KEY = 'certiverify_auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
  return config
})

export default api
