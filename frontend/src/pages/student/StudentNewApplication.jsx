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
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [success, setSuccess] = useState(false)

  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  function handleFileChange(e) {
    const selected = e.target.files[0]
    if (!selected) {
      setFile(null)
      return
    }

    const isPdf = selected.type === 'application/pdf' || selected.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) {
      setErrors((prev) => ({ ...prev, file: 'Only PDF files are supported. Please select a valid .pdf file.' }))
      setFile(null)
      e.target.value = ''
      return
    }

    if (selected.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({ ...prev, file: 'File size exceeds maximum allowed limit of 10 MB.' }))
      setFile(null)
      e.target.value = ''
      return
    }

    if (selected.size === 0) {
      setErrors((prev) => ({ ...prev, file: 'The selected file is empty. Please select a valid PDF file.' }))
      setFile(null)
      e.target.value = ''
      return
    }

    setFile(selected)
    if (errors.file) {
      setErrors((prev) => ({ ...prev, file: '' }))
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

    if (!file) {
      newErrors.file = 'Please upload a supporting certificate PDF.'
    } else {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      if (!isPdf) {
        newErrors.file = 'Only PDF files are supported.'
      } else if (file.size > MAX_FILE_SIZE) {
        newErrors.file = 'File size exceeds maximum allowed limit of 10 MB.'
      }
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
      const formData = new FormData()
      formData.append('courseName', form.courseName.trim())
      formData.append('institutionName', form.institutionName.trim())
      formData.append('institutionId', Number(form.institutionId))
      formData.append('file', file)
      formData.append('supportingDocument', file)

      await api.post('/api/applications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setSuccess(true)
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
                disabled={submitting || success}
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
                disabled={submitting || success}
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
                disabled={submitting || success}
              />
              {errors.institutionId && <div className="form-error">{errors.institutionId}</div>}
              <div className="form-hint">
                The numeric ID of the institution you are applying to.
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="supportingFile" className="form-label">
                Upload Supporting Certificate (PDF) <span style={{ color: 'var(--color-danger, #ef4444)' }}>*</span>
              </label>
              <input
                id="supportingFile"
                name="supportingFile"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className={`form-input${errors.file ? ' form-input--error' : ''}`}
                disabled={submitting || success}
              />
              {file && (
                <div style={{
                  marginTop: '0.5rem',
                  fontSize: '0.8125rem',
                  color: 'var(--color-text, #1e293b)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: 'var(--color-surface-alt, #f8fafc)',
                  padding: '0.375rem 0.625rem',
                  borderRadius: 6,
                  border: '1px solid var(--color-border, #e2e8f0)'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16, color: '#dc2626', flexShrink: 0 }}>
                    <path fillRule="evenodd" d="M4 4a2 2 0 0 1 2-2h4.586A2 2 0 0 1 12 2.586L15.414 6A2 2 0 0 1 16 7.414V16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4Zm2 6a.75.75 0 0 1 .75-.75h6.5a.75.75 0 0 1 0 1.5h-6.5A.75.75 0 0 1 6 10Zm.75 2.25a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
                  </svg>
                  <span style={{ wordBreak: 'break-all' }}>
                    Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}
              {errors.file && <div className="form-error">{errors.file}</div>}
              <div className="form-hint">
                Attach one official completion document, transcript, or certificate in PDF format (Max 10 MB).
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
