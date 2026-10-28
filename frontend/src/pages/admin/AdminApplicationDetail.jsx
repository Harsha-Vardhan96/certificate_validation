import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'

export default function AdminApplicationDetail() {
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
        setError('Application record not found.')
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Unauthorized. Administrator privileges required.')
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
      {/* Breadcrumb Header */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-muted)' }}>
        <Link to="/admin/applications" style={{ color: 'var(--color-muted)' }}>
          Applications
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--color-heading)', fontWeight: 600 }}>#{applicationId}</span>
      </div>

      <div className="page-header">
        <div>
          <h1>Application #{applicationId} Oversight</h1>
          {application && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '0.25rem 0 0' }}>
              Credential request for <strong style={{ color: 'var(--color-heading)' }}>{application.courseName}</strong> at <strong>{application.institutionName || 'Designated Institution'}</strong>
            </p>
          )}
        </div>
        <Link to="/admin/applications" className="btn-ghost btn-sm">
          ← Back to Applications
        </Link>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          Loading application audit record…
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="error-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{error}</span>
            <button onClick={fetchApplication} className="btn-ghost btn-sm">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      {!loading && !error && application && (
        <div>
          {/* Status Banner */}
          {application.status === 'APPROVED' && (
            <div className="alert-success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span className="status-badge status-badge--APPROVED">APPROVED</span>
                <span>This application was verified and approved by <strong>{application.institutionName}</strong>.</span>
              </div>
              <Link to="/admin/certificates" className="btn-ghost btn-sm" style={{ color: '#166534', fontWeight: 600 }}>
                Certificate Oversight →
              </Link>
            </div>
          )}

          {application.status === 'REJECTED' && (
            <div className="error-state" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="status-badge status-badge--REJECTED">REJECTED</span>
                <span style={{ fontWeight: 600 }}>Application rejected by issuing institution</span>
              </div>
              {application.rejectionReason && (
                <div style={{ background: '#fff', border: '1px solid #fecaca', padding: '0.75rem', borderRadius: 6, fontSize: '0.8125rem', color: '#7f1d1d' }}>
                  <strong>Recorded reason: </strong> {application.rejectionReason}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)', gap: '1.5rem', alignItems: 'start' }}>
            
            {/* LEFT / MAIN COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Record Summary Card */}
              <div style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '1.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--color-heading)' }}>
                    Application Master Record
                  </h2>
                  <span className={`status-badge status-badge--${application.status}`}>
                    {application.status}
                  </span>
                </div>

                <div className="cert-detail-grid">
                  <div className="cert-detail-field">
                    <label>Application ID</label>
                    <span style={{ fontWeight: 600 }}>#{application.applicationId}</span>
                  </div>

                  <div className="cert-detail-field">
                    <label>Course / Program</label>
                    <span style={{ fontWeight: 600 }}>{application.courseName || '—'}</span>
                  </div>

                  <div className="cert-detail-field">
                    <label>Student Identifier</label>
                    <span style={{ fontFamily: 'monospace', color: 'var(--color-primary-700)' }}>
                      {application.studentId ? `UID-${application.studentId}` : '—'}
                    </span>
                  </div>

                  <div className="cert-detail-field">
                    <label>Issuing Institution</label>
                    <span>{application.institutionName || '—'} (ID: {application.institutionId || '—'})</span>
                  </div>

                  <div className="cert-detail-field">
                    <label>Created At</label>
                    <span>{formatDate(application.createdAt)}</span>
                  </div>

                  <div className="cert-detail-field">
                    <label>Last Updated</label>
                    <span>{formatDate(application.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Administrative Oversight Notice */}
              <div className="info-box">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
                  <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
                </svg>
                <div>
                  <strong>Institutional Delegation Policy:</strong> Per CertiVerify Global governance rules, approving or rejecting student applications is performed by verified institution officers at <strong>{application.institutionName || 'the assigned institution'}</strong>. Administrators have full visibility into all application metadata and audit history across the platform.
                </div>
              </div>
            </div>

            {/* RIGHT / SIDEBAR COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Audit Timeline */}
              <div style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '1.5rem',
              }}>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 1.25rem', color: 'var(--color-heading)' }}>
                  Audit History
                </h3>

                <div className="audit-timeline">
                  {/* Step 1: Submitted */}
                  <div className="audit-item">
                    <div className="audit-dot" />
                    <div className="audit-content">
                      <h4>Application Submitted</h4>
                      <time>{formatDate(application.createdAt)}</time>
                      <p>Student filed request for {application.courseName}.</p>
                    </div>
                  </div>

                  {/* Step 2: Under Review */}
                  <div className="audit-item">
                    <div className={`audit-dot ${application.status === 'PENDING' ? 'audit-dot--pending' : ''}`} />
                    <div className="audit-content">
                      <h4>Institutional Review</h4>
                      <time>{formatDate(application.updatedAt)}</time>
                      <p>
                        {application.status === 'PENDING'
                          ? `Awaiting review by ${application.institutionName || 'institution'}.`
                          : `Evaluated by ${application.institutionName || 'institution'}.`}
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Decision */}
                  {application.status !== 'PENDING' && (
                    <div className="audit-item">
                      <div className={`audit-dot ${application.status === 'APPROVED' ? 'audit-dot--approved' : 'audit-dot--rejected'}`} />
                      <div className="audit-content">
                        <h4>Application {application.status}</h4>
                        <time>{formatDate(application.updatedAt)}</time>
                        <p>
                          {application.status === 'APPROVED'
                            ? 'Approved and recorded as valid credential.'
                            : `Rejected. Reason: ${application.rejectionReason || 'No reason specified'}`}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}
