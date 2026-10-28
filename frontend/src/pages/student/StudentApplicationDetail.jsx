import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'

export default function StudentApplicationDetail() {
  const { id: applicationId } = useParams()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchApplication = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/api/applications/${applicationId}`)
      setApplication(res.data)
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Application not found.')
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('You do not have permission to view this application.')
      } else if (err.request) {
        setError('Unable to reach the server. Please check your connection.')
      } else {
        setError('Failed to load application details.')
      }
    } finally {
      setLoading(false)
    }
  }, [applicationId])

  useEffect(() => {
    fetchApplication()
  }, [fetchApplication])

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div>
      <div className="page-header">
        <h1>Application #{applicationId}</h1>
        <Link to="/student/applications" className="btn-ghost btn-sm">
          ← Back to Applications
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          Loading application details…
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="error-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Application data */}
      {!loading && !error && application && (
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: '1.5rem',
        }}>
          {/* Status */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span className={`status-badge status-badge--${application.status}`}>
              {application.status}
            </span>
          </div>

          {/* Detail grid */}
          <div className="cert-detail-grid">
            <div className="cert-detail-field">
              <label>Application ID</label>
              <span>{application.applicationId}</span>
            </div>
            <div className="cert-detail-field">
              <label>Course Name</label>
              <span>{application.courseName || '—'}</span>
            </div>
            <div className="cert-detail-field">
              <label>Institution Name</label>
              <span>{application.institutionName || '—'}</span>
            </div>
            {application.institutionId != null && (
              <div className="cert-detail-field">
                <label>Institution ID</label>
                <span>{application.institutionId}</span>
              </div>
            )}
            {application.studentId != null && (
              <div className="cert-detail-field">
                <label>Student ID</label>
                <span>{application.studentId}</span>
              </div>
            )}
            <div className="cert-detail-field">
              <label>Submitted</label>
              <span>{formatDate(application.createdAt)}</span>
            </div>
            {application.updatedAt && (
              <div className="cert-detail-field">
                <label>Last Updated</label>
                <span>{formatDate(application.updatedAt)}</span>
              </div>
            )}
          </div>

          {/* Rejection reason */}
          {application.status === 'REJECTED' && application.rejectionReason && (
            <div style={{ marginTop: '1.25rem' }}>
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 6,
                padding: '0.875rem 1rem',
              }}>
                <div style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#991b1b',
                  marginBottom: '0.375rem',
                }}>
                  Rejection Reason
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#7f1d1d' }}>
                  {application.rejectionReason}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
