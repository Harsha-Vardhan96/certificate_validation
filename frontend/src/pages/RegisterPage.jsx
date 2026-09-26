import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    if (!password) {
      setError('Password is required.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await api.post('/api/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
        role: 'STUDENT',
      })
      setSuccess(true)
      setName('')
      setEmail('')
      setPassword('')
    } catch (err) {
      if (err.response) {
        const msg = err.response.data?.message || err.response.data?.error
        if (err.response.status === 409 || err.response.status === 400) {
          setError(msg || 'An account with this email may already exist.')
        } else {
          setError(msg || 'Registration failed. Please try again.')
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
          <h1 className="text-2xl font-bold text-[var(--color-heading)]">Create account</h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Register as a student to get started
          </p>
        </div>

        <div className="card">
          {success ? (
            <div className="text-center py-4">
              <div className="mb-3 text-green-600 font-medium">Registration successful!</div>
              <p className="text-sm text-[var(--color-muted)] mb-4">
                Your account has been created. You can now sign in.
              </p>
              <Link to="/login" className="btn btn-primary">
                Go to Login
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="reg-name" className="block text-sm font-medium text-[var(--color-heading)] mb-1">
                    Full Name
                  </label>
                  <input
                    id="reg-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    autoComplete="name"
                    className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-white text-sm text-[var(--color-heading)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-sm font-medium text-[var(--color-heading)] mb-1">
                    Email
                  </label>
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    autoComplete="email"
                    className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-white text-sm text-[var(--color-heading)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="reg-password" className="block text-sm font-medium text-[var(--color-heading)] mb-1">
                    Password
                  </label>
                  <input
                    id="reg-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    className="w-full px-3 py-2 rounded-md border border-[var(--color-border)] bg-white text-sm text-[var(--color-heading)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-[var(--color-muted)]">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-[var(--color-primary-600)] hover:text-[var(--color-primary-800)]">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
