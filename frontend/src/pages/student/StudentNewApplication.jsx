import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'

export default function StudentNewApplication() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    courseName: '',
    institutionName: '',
    institutionId: '',
  })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  function validate() {
    const newErrors = {}
    if (!form.courseName.trim()) {
      newErrors.courseName = 'Course name is required.'
    }
    if (!form.institutionName.trim()) {
      newErrors.institutionName = 'Institution name is required.'
    }
    if (!form.institutionId) {
      newErrors.institutionId = 'Institution ID is required.'
    } else if (isNaN(Number(form.institutionId)) || Number(form.institutionId) <= 0) {
      newErrors.institutionId = 'Institution ID must be a positive number.'
    }
    return newErrors
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        courseName: form.courseName.trim(),
        institutionName: form.institutionName.trim(),
        institutionId: Number(form.institutionId),
      }
      await api.post('/api/applications', payload)
      setSuccess(true)
      // Redirect after brief delay so user sees feedback
      setTimeout(() => {
        navigate('/student/applications')
      }, 1500)
    } catch (err) {
      if (err.response) {
        const msg =
          err.response.data?.message ||
          err.response.data?.error ||
          (typeof err.response.data === 'string' ? err.response.data : null)

        if (err.response.status === 400) {
          setSubmitError(msg || 'Invalid request. Please check your input.')
        } else if (err.response.status === 401 || err.response.status === 403) {
          setSubmitError('Session expired. Please log in again.')
        } else {
          setSubmitError(msg || 'Something went wrong. Please try again.')
        }
      } else if (err.request) {
        setSubmitError('Unable to reach the server. Please check your connection.')
      } else {
        setSubmitError('An unexpected error occurred.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Apply for Certificate</h1>
      </div>

      <div style={{ maxWidth: 520 }}>
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: '1.5rem',
        }}>
          {success && (
            <div className="alert-success">
              Application submitted successfully! Redirecting to My Applications…
            </div>
          )}

          {submitError && (
            <div className="error-state" style={{ marginBottom: '1rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="courseName" className="form-label">Course Name</label>
              <input
                id="courseName"
                name="courseName"
                type="text"
                value={form.courseName}
                onChange={handleChange}
                className={`form-input${errors.courseName ? ' form-input--error' : ''}`}
                placeholder="e.g. Bachelor of Computer Science"
                disabled={success}
              />
              {errors.courseName && <div className="form-error">{errors.courseName}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="institutionName" className="form-label">Institution Name</label>
              <input
                id="institutionName"
                name="institutionName"
                type="text"
                value={form.institutionName}
                onChange={handleChange}
                className={`form-input${errors.institutionName ? ' form-input--error' : ''}`}
                placeholder="e.g. University of Technology"
                disabled={success}
              />
              {errors.institutionName && <div className="form-error">{errors.institutionName}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="institutionId" className="form-label">Institution ID</label>
              <input
                id="institutionId"
                name="institutionId"
                type="number"
                min="1"
                value={form.institutionId}
                onChange={handleChange}
                className={`form-input${errors.institutionId ? ' form-input--error' : ''}`}
                placeholder="e.g. 1"
                disabled={success}
              />
              {errors.institutionId && <div className="form-error">{errors.institutionId}</div>}
              <div className="form-hint">
                The numeric ID of the institution you are applying to.
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                disabled={submitting || success}
                className="btn btn-primary btn-sm"
                style={{ minWidth: 140 }}
              >
                {submitting ? 'Submitting…' : 'Submit Application'}
              </button>
              <Link
                to="/student/applications"
                className="btn-ghost btn-sm"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
