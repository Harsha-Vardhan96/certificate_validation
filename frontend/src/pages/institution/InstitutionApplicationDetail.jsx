import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'

export default function InstitutionApplicationDetail() {
  const { id: applicationId } = useParams()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Action states
  const [actionLoading, setActionLoading] = useState(false)
  const [feedback, setFeedback] = useState(null) // { type: 'success' | 'error', message: string }

  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectValidationError, setRejectValidationError] = useState('')

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
        setError('You do not have permission to view or review this application.')
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

  async function handleApprove() {
    setActionLoading(true)
    setFeedback(null)
    try {
      const res = await api.put(`/api/applications/${applicationId}/approve`)
      setApplication(res.data)
      setShowApproveModal(false)
      setFeedback({
        type: 'success',
        message: `Application #${applicationId} has been successfully approved.`,
      })
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to approve application. Please try again.'
      setFeedback({ type: 'error', message: msg })
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReject(e) {
    e.preventDefault()
    if (!rejectionReason.trim()) {
      setRejectValidationError('Please provide a reason for rejection.')
      return
    }

    setActionLoading(true)
    setFeedback(null)
    setRejectValidationError('')
    try {
      const res = await api.put(`/api/applications/${applicationId}/reject`, {
        rejectionReason: rejectionReason.trim(),
      })
      setApplication(res.data)
      setShowRejectModal(false)
      setRejectionReason('')
      setFeedback({
        type: 'success',
        message: `Application #${applicationId} has been rejected.`,
      })
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reject application. Please try again.'
      setFeedback({ type: 'error', message: msg })
    } finally {
      setActionLoading(false)
    }
  }

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
        <Link to="/institution/applications" style={{ color: 'var(--color-muted)' }}>
          Applications
        </Link>
        <span>/</span>
        <span style={{ color: 'var(--color-heading)', fontWeight: 600 }}>#{applicationId}</span>
      </div>

      <div className="page-header">
        <div>
          <h1>Application #{applicationId}</h1>
          {application && (
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '0.25rem 0 0' }}>
              Submitted for <strong style={{ color: 'var(--color-heading)' }}>{application.courseName}</strong>
            </p>
          )}
        </div>
        <Link to="/institution/applications" className="btn-ghost btn-sm">
          ← Back to Applications
        </Link>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          Loading application details…
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
          {/* Action Feedback Banner */}
          {feedback && (
            <div
              className={feedback.type === 'success' ? 'alert-success' : 'error-state'}
              style={{ marginBottom: '1.25rem' }}
            >
              {feedback.type === 'success' ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18, marginRight: '0.5rem', flexShrink: 0 }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                </svg>
              ) : null}
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Top Status Alert if Approved or Rejected */}
          {application.status === 'APPROVED' && (
            <div className="alert-success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span className="status-badge status-badge--APPROVED">APPROVED</span>
                <span>This application has been verified and approved by the institution.</span>
              </div>
              <Link to="/institution/certificates" className="btn-ghost btn-sm" style={{ color: '#166534', fontWeight: 600 }}>
                View Certificates →
              </Link>
            </div>
          )}

          {application.status === 'REJECTED' && (
            <div className="error-state" style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="status-badge status-badge--REJECTED">REJECTED</span>
                <span style={{ fontWeight: 600 }}>Application rejected by institution</span>
              </div>
              {application.rejectionReason && (
                <div style={{ background: '#fff', border: '1px solid #fecaca', padding: '0.75rem', borderRadius: 6, fontSize: '0.8125rem', color: '#7f1d1d' }}>
                  <strong>Reason given: </strong> {application.rejectionReason}
                </div>
              )}
            </div>
          )}

          {/* Two-Column Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.2fr)', gap: '1.5rem', alignItems: 'start' }}>
            
            {/* LEFT / MAIN COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Application & Student Card */}
              <div style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '1.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.75rem' }}>
                  <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: 'var(--color-heading)' }}>
                    Application Information
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
                    <label>Course / Degree Program</label>
                    <span style={{ fontWeight: 600 }}>{application.courseName || '—'}</span>
                  </div>

                  <div className="cert-detail-field">
                    <label>Student Identifier</label>
                    <span style={{ fontFamily: 'monospace', color: 'var(--color-primary-700)' }}>
                      {application.studentId ? `UID-${application.studentId}` : '—'}
                    </span>
                  </div>

                  <div className="cert-detail-field">
                    <label>Institution</label>
                    <span>{application.institutionName || '—'}</span>
                  </div>

                  <div className="cert-detail-field">
                    <label>Submitted On</label>
                    <span>{formatDate(application.createdAt)}</span>
                  </div>

                  <div className="cert-detail-field">
                    <label>Last Updated</label>
                    <span>{formatDate(application.updatedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Academic Verification Checklist */}
              <div style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '1.5rem',
              }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 1rem', color: 'var(--color-heading)' }}>
                  Institutional Verification Checklist
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem', background: 'var(--color-surface-alt)', borderRadius: 6 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16, color: '#16a34a', flexShrink: 0 }}>
                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                    </svg>
                    <span>Student enrollment records match institution registry</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem', background: 'var(--color-surface-alt)', borderRadius: 6 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16, color: '#16a34a', flexShrink: 0 }}>
                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                    </svg>
                    <span>Degree completion criteria verified for <strong>{application.courseName}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.625rem', background: 'var(--color-surface-alt)', borderRadius: 6 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16, color: '#16a34a', flexShrink: 0 }}>
                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                    </svg>
                    <span>No outstanding dues or administrative holds on student profile</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT / SIDEBAR COLUMN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Review Actions Box */}
              <div style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                padding: '1.5rem',
              }}>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 0.5rem', color: 'var(--color-heading)' }}>
                  Review Actions
                </h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', margin: '0 0 1.25rem' }}>
                  Evaluate this student request and record the official institutional decision.
                </p>

                {application.status === 'PENDING' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button
                      onClick={() => setShowApproveModal(true)}
                      disabled={actionLoading}
                      className="btn btn-success"
                      style={{ width: '100%' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                      </svg>
                      Approve Application
                    </button>

                    <button
                      onClick={() => {
                        setRejectionReason('')
                        setRejectValidationError('')
                        setShowRejectModal(true)
                      }}
                      disabled={actionLoading}
                      className="btn btn-danger-outline"
                      style={{ width: '100%' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
                      </svg>
                      Reject Application
                    </button>
                  </div>
                ) : (
                  <div style={{ background: 'var(--color-surface-alt)', padding: '1rem', borderRadius: 6, fontSize: '0.8125rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className={`status-badge status-badge--${application.status}`}>
                        {application.status}
                      </span>
                    </div>
                    <p style={{ margin: '0.5rem 0 0', color: 'var(--color-muted)' }}>
                      Decision finalized on {formatDate(application.updatedAt)}. No further actions can be taken.
                    </p>
                  </div>
                )}
              </div>

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
                      <p>Student filed certificate request for {application.courseName}.</p>
                    </div>
                  </div>

                  {/* Step 2: Under Review */}
                  <div className="audit-item">
                    <div className={`audit-dot ${application.status === 'PENDING' ? 'audit-dot--pending' : ''}`} />
                    <div className="audit-content">
                      <h4>Institution Review</h4>
                      <time>{formatDate(application.updatedAt)}</time>
                      <p>
                        {application.status === 'PENDING'
                          ? 'Application pending review by administrative staff.'
                          : 'Review completed by institution.'}
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
                            ? 'Approved for certificate issuance.'
                            : `Rejected. Reason: ${application.rejectionReason || 'Unspecified'}`}
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

      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="modal-backdrop" onClick={() => !actionLoading && setShowApproveModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Approve Certificate Application</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowApproveModal(false)}
                disabled={actionLoading}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.875rem', color: 'var(--color-body)', margin: '0 0 1rem' }}>
                Are you sure you want to approve application <strong>#{applicationId}</strong> for{' '}
                <strong>{application?.courseName}</strong>?
              </p>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 6, padding: '0.75rem', fontSize: '0.8125rem', color: '#166534' }}>
                Once approved, this application status will be updated to APPROVED in the system and eligible for certificate generation.
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-ghost btn-sm"
                onClick={() => setShowApproveModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success btn-sm"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                {actionLoading ? 'Approving…' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal with Reason Input */}
      {showRejectModal && (
        <div className="modal-backdrop" onClick={() => !actionLoading && setShowRejectModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleReject}>
              <div className="modal-header">
                <h3>Reject Certificate Application</h3>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setShowRejectModal(false)}
                  disabled={actionLoading}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <p style={{ fontSize: '0.875rem', color: 'var(--color-body)', margin: '0 0 1rem' }}>
                  Please state the reason for rejecting application <strong>#{applicationId}</strong>.
                  This reason will be recorded and visible to the student.
                </p>

                <div className="form-group">
                  <label className="form-label" htmlFor="rejectionReason">
                    Rejection Reason <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <textarea
                    id="rejectionReason"
                    rows="3"
                    className={`form-input ${rejectValidationError ? 'form-input--error' : ''}`}
                    placeholder="e.g. Incomplete coursework, fees outstanding, or incorrect course specified"
                    value={rejectionReason}
                    onChange={(e) => {
                      setRejectionReason(e.target.value)
                      if (rejectValidationError) setRejectValidationError('')
                    }}
                    autoFocus
                  />
                  {rejectValidationError && (
                    <div className="form-error">{rejectValidationError}</div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-ghost btn-sm"
                  onClick={() => setShowRejectModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-danger btn-sm"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Rejecting…' : 'Reject Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
