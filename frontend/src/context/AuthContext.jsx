import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

const STORAGE_KEY = 'certiverify_auth'

function loadStoredAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && parsed.token && parsed.userId && parsed.role) {
      return parsed
    }
    return null
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const stored = loadStoredAuth()
    return stored
      ? { user: { userId: stored.userId, name: stored.name, email: stored.email, role: stored.role }, token: stored.token }
      : { user: null, token: null }
  })

  const isAuthenticated = !!authState.token

  const login = useCallback((data) => {
    const { token, userId, name, email, role } = data
    const user = { userId, name, email, role }

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, userId, name, email, role }))
    setAuthState({ user, token })
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAuthState({ user: null, token: null })
  }, [])

  const value = {
    user: authState.user,
    token: authState.token,
    isAuthenticated,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
