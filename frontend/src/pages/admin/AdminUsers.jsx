import { useState } from 'react'
import api from '../../services/api'

export default function AdminUsers() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'INSTITUTION',
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Track accounts provisioned during the current administrative session
  const [sessionCreatedUsers, setSessionCreatedUsers] = useState([])

  function validate() {
    const errs = {}
    if (!formData.name.trim()) {
      errs.name = 'Full name is required'
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      errs.password = 'Password is required'
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters'
    }

    if (!formData.role) {
      errs.role = 'Please select a user role'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSuccessMessage('')
    setServerError('')

    if (!validate()) return

    setLoading(true)
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      }

      const res = await api.post('/api/auth/admin/users', payload)
      
      const createdUser = {
        name: payload.name,
        email: payload.email,
        role: payload.role,
        createdAt: new Date().toISOString(),
        userId: res.data?.userId,
      }

      setSessionCreatedUsers((prev) => [createdUser, ...prev])
      setSuccessMessage(`User "${payload.name}" (${payload.role}) created successfully!`)
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'INSTITUTION',
      })
      setErrors({})
    } catch (err) {
      if (err.response) {
        const errorMsg =
          err.response.data?.message ||
          err.response.data?.error ||
          (typeof err.response.data === 'string' ? err.response.data : null)

        if (errorMsg) {
          setServerError(errorMsg)
        } else if (err.response.status === 403 || err.response.status === 401) {
          setServerError('Permission denied. Admin authorization required.')
        } else {
          setServerError(`Request failed with status ${err.response.status}. Please verify input and try again.`)
        }
      } else if (err.request) {
        setServerError('Unable to reach the authentication service. Please check backend connection.')
      } else {
        setServerError('Failed to create user account. Please verify input and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleInputChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>User Management & Provisioning</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '0.25rem 0 0' }}>
            Provision authorized Student, Institution, and Administrator accounts on CertiVerify Global.
          </p>
        </div>
      </div>

      {/* Backend API Notice */}
      <div className="info-box" style={{ marginBottom: '1.5rem' }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
          <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
        </svg>
        <div>
          <strong>Backend Microservice Architecture Note:</strong> User provisioning is handled directly via Auth Service endpoint <code>POST /api/auth/admin/users</code>. Global user listing/querying is not currently exposed by the backend auth service. Users created below are active immediately and can authenticate with their credentials.
        </div>
      </div>

      {/* Grid: Creation Form + Session Log */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1.4fr)', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Creation Form Card */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: '1.5rem',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 1.25rem', color: 'var(--color-heading)' }}>
            Provision New User Account
          </h2>

          {/* Success Banner */}
          {successMessage && (
            <div className="alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16, flexShrink: 0 }}>
                <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {/* Server Error Banner */}
          {serverError && (
            <div className="error-state" style={{ marginBottom: '1.25rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="user-name">
                Full Name / Organization Name <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                id="user-name"
                type="text"
                className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                placeholder="e.g. Stanford University or John Doe"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={loading}
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="user-email">
                Email Address <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                id="user-email"
                type="email"
                className={`form-input ${errors.email ? 'form-input--error' : ''}`}
                placeholder="e.g. registrar@university.edu"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={loading}
              />
              {errors.email && <div className="form-error">{errors.email}</div>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="user-password">
                Password <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="user-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  disabled={loading}
                  style={{ paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.625rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-muted)',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password ? (
                <div className="form-error">{errors.password}</div>
              ) : (
                <div className="form-hint">At least 6 characters required by the backend.</div>
              )}
            </div>

            {/* Role Selection */}
            <div className="form-group">
              <label className="form-label" htmlFor="user-role">
                User Role <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                id="user-role"
                className="form-input"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                disabled={loading}
              >
                <option value="INSTITUTION">INSTITUTION (University / College Staff)</option>
                <option value="STUDENT">STUDENT (Student Applicant)</option>
                <option value="ADMIN">ADMIN (System Administrator)</option>
              </select>
              <div className="form-hint">
                Role controls dashboard access and permissions across microservices.
              </div>
            </div>

            {/* Submit Button */}
            <div className="form-actions" style={{ marginTop: '1.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%' }}
              >
                {loading ? 'Creating Account…' : 'Create User Account'}
              </button>
            </div>
          </form>
        </div>

        {/* Session Log / Created Users Card */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: '1.5rem',
        }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.5rem', color: 'var(--color-heading)' }}>
            Session Provisioning Log ({sessionCreatedUsers.length})
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: '0 0 1rem' }}>
            Accounts provisioned during this administrative browser session.
          </p>

          {sessionCreatedUsers.length === 0 ? (
            <div style={{
              padding: '2.5rem 1rem',
              textAlign: 'center',
              background: 'var(--color-surface-alt)',
              borderRadius: 6,
              border: '1px dashed var(--color-border)',
              color: 'var(--color-muted)',
              fontSize: '0.8125rem',
            }}>
              No accounts created in this session yet. Use the form to provision university or student users.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {sessionCreatedUsers.map((u, i) => (
                <div
                  key={i}
                  style={{
                    padding: '0.875rem 1rem',
                    background: 'var(--color-surface-alt)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-heading)' }}>
                      {u.name}
                    </span>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        padding: '0.125rem 0.5rem',
                        borderRadius: 4,
                        background: u.role === 'ADMIN' ? '#f3e8ff' : u.role === 'INSTITUTION' ? '#dbeafe' : '#fef3c7',
                        color: u.role === 'ADMIN' ? '#7e22ce' : u.role === 'INSTITUTION' ? '#1d4ed8' : '#b45309',
                      }}
                    >
                      {u.role}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                    {u.email}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
