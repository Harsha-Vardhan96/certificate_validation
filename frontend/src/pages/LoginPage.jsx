import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const ROLE_DASHBOARDS = {
  STUDENT: '/student/dashboard',
  INSTITUTION: '/institution/dashboard',
  ADMIN: '/admin/dashboard',
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isAuthenticated, user } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const dest = ROLE_DASHBOARDS[user.role] || '/'
      navigate(dest, { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    if (!password) {
      setError('Password is required.')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/api/auth/login', { email: email.trim(), password })
      const data = res.data

      login(data)

      const dest = ROLE_DASHBOARDS[data.role] || '/'
      navigate(dest, { replace: true })
    } catch (err) {
      if (err.response) {
        const msg = err.response.data?.message || err.response.data?.error
        if (err.response.status === 401 || err.response.status === 403) {
          setError(msg || 'Invalid email or password.')
        } else if (err.response.status === 400) {
          setError(msg || 'Please check your input and try again.')
        } else {
          setError(msg || 'Something went wrong. Please try again.')
        }
      } else if (err.request) {
        setError('Unable to reach the server. Please check your connection.')
      } else {
        setError('An unexpected error occurred.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container-app py-16">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[var(--color-heading)]">Sign in</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Access your CertiVerify portal
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-[var(--color-heading)] mb-1">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                autoComplete="email"
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-white text-sm text-[var(--color-heading)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-[var(--color-heading)] mb-1">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-white text-sm text-[var(--color-heading)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-[var(--color-muted)]">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-800)]">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
