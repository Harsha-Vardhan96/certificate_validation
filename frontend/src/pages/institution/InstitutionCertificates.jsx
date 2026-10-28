import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function InstitutionCertificates() {
  const [approvedApplications, setApprovedApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Certificate Lookup & Verification state
  const [lookupQuery, setLookupQuery] = useState('')
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupResult, setLookupResult] = useState(null)
  const [lookupError, setLookupError] = useState('')
  const [downloadError, setDownloadError] = useState('')

  useEffect(() => {
    fetchApprovedRecords()
  }, [])

  async function fetchApprovedRecords() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/api/applications/institution')
      const apps = res.data || []
      setApprovedApplications(apps.filter((a) => a.status === 'APPROVED'))
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expired or unauthorized. Please log in again.')
      } else if (err.request) {
        setError('Unable to reach the server. Please check your connection.')
      } else {
        setError('Failed to load institution certificate records.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleCertificateLookup(e) {
    e.preventDefault()
    const query = lookupQuery.trim()
    if (!query) return

    setLookupLoading(true)
    setLookupError('')
    setDownloadError('')
    setLookupResult(null)

    try {
      // First try fetching directly via certificate-service endpoint
      const res = await api.get(`/api/certificates/${query}`)
      setLookupResult(res.data)
    } catch (err) {
      // Fallback try verify endpoint
      try {
        const verifyRes = await api.get(`/api/verify/${query}`)
        setLookupResult({
          certificateId: verifyRes.data.certificateId || query,
          studentName: verifyRes.data.studentName,
          courseName: verifyRes.data.courseName,
          institutionName: verifyRes.data.institutionName,
          issueDate: verifyRes.data.issueDate,
          status: verifyRes.data.status,
          certificateHash: verifyRes.data.certificateHash,
        })
      } catch {
        if (err.response?.status === 404) {
          setLookupError('No certificate found matching the provided UUID or Certificate Number.')
        } else {
          setLookupError('Could not retrieve certificate details. Please ensure the UUID format is valid.')
        }
      }
    } finally {
      setLookupLoading(false)
    }
  }

  async function handleDownloadPdf(certId) {
    setDownloadError('')
    try {
      const res = await api.get(`/api/certificates/${certId}/download`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `certificate-${certId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      setDownloadError('Unable to download certificate PDF. Please check server status.')
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Institution Issued Credentials</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '0.25rem 0 0' }}>
            Inspect approved certificate applications and verify issued digital credentials.
          </p>
        </div>
      </div>

      {/* Certificate Quick Lookup / Verification Tool */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        padding: '1.25rem 1.5rem',
        marginBottom: '1.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18, color: 'var(--color-primary-600)' }}>
            <path fillRule="evenodd" d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.082l5.925 2.844A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z" clipRule="evenodd" />
          </svg>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: 0, color: 'var(--color-heading)' }}>
            Verify or Inspect an Issued Certificate
          </h2>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '0 0 1rem' }}>
          Enter a certificate UUID to instantly check issuance status, validity hash, and download the official credential.
        </p>

        <form onSubmit={handleCertificateLookup} style={{ display: 'flex', gap: '0.5rem', maxWidth: 640 }}>
          <div className="search-input-wrap" style={{ flex: 1, maxWidth: 'none' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
              <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
            </svg>
            <input
              type="text"
              placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={lookupLoading || !lookupQuery.trim()}
          >
            {lookupLoading ? 'Verifying…' : 'Inspect Certificate'}
          </button>
        </form>

        {/* Lookup Error */}
        {lookupError && (
          <div className="error-state" style={{ marginTop: '1rem', padding: '0.625rem 0.875rem' }}>
            <span>{lookupError}</span>
          </div>
        )}

        {/* Lookup Result Card */}
        {lookupResult && (
          <div style={{
            marginTop: '1.25rem',
            padding: '1.25rem',
            background: 'var(--color-surface-alt)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.6875rem', textTransform: 'uppercase', color: 'var(--color-muted)', fontWeight: 600 }}>
                  Certificate Record
                </span>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, margin: '0.125rem 0 0', color: 'var(--color-heading)' }}>
                  {lookupResult.courseName || 'Certificate of Completion'}
                </h3>
              </div>
              <span className={`status-badge status-badge--${lookupResult.status || 'ACTIVE'}`}>
                {lookupResult.status || 'ACTIVE'}
              </span>
            </div>

            <div className="cert-detail-grid" style={{ marginBottom: '1rem' }}>
              <div className="cert-detail-field">
                <label>Certificate ID</label>
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{lookupResult.certificateId}</span>
              </div>
              <div className="cert-detail-field">
                <label>Student Name</label>
                <span>{lookupResult.studentName || '—'}</span>
              </div>
              <div className="cert-detail-field">
                <label>Issuing Institution</label>
                <span>{lookupResult.institutionName || '—'}</span>
              </div>
              <div className="cert-detail-field">
                <label>Issue Date</label>
                <span>{formatDate(lookupResult.issueDate)}</span>
              </div>
              {lookupResult.certificateHash && (
                <div className="cert-detail-field" style={{ gridColumn: 'span 2' }}>
                  <label>Cryptographic Hash</label>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.6875rem', wordBreak: 'break-all', color: 'var(--color-muted)' }}>
                    {lookupResult.certificateHash}
                  </span>
                </div>
              )}
            </div>

            {downloadError && (
              <div className="error-state" style={{ marginBottom: '1rem', padding: '0.5rem 0.75rem' }}>
                <span>{downloadError}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleDownloadPdf(lookupResult.certificateId)}
                className="btn btn-outline btn-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
                  <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                  <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                </svg>
                Download Official PDF
              </button>
              <Link
                to={`/verify`}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--color-primary-700)' }}
              >
                Public Verify Page →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Approved Certificate Applications Registry */}
      <div className="section-header">
        <h2>Approved Institutional Credentials ({approvedApplications.length})</h2>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          Loading approved credentials…
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
            <button onClick={fetchApprovedRecords} className="btn-ghost btn-sm">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Registry Table */}
      {!loading && !error && (
        <>
          {approvedApplications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 24, height: 24 }}>
                  <path fillRule="evenodd" d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.082l5.925 2.844A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z" clipRule="evenodd" />
                </svg>
              </div>
              <h3>No approved certificates yet</h3>
              <p>Applications that have been reviewed and approved by your institution will appear here.</p>
              <Link to="/institution/applications?status=PENDING" className="btn btn-primary btn-sm">
                Review Pending Applications
              </Link>
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>App ID</th>
                    <th>Course / Credential</th>
                    <th>Student ID</th>
                    <th>Approval Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedApplications.map((app) => (
                    <tr key={app.applicationId}>
                      <td style={{ fontWeight: 600 }}>#{app.applicationId}</td>
                      <td>
                        <span style={{ fontWeight: 500, color: 'var(--color-heading)' }}>
                          {app.courseName}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                          {app.studentId ? `UID-${app.studentId}` : '—'}
                        </span>
                      </td>
                      <td>{formatDate(app.updatedAt)}</td>
                      <td>
                        <span className="status-badge status-badge--APPROVED">
                          APPROVED
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          to={`/institution/applications/${app.applicationId}`}
                          className="btn-ghost btn-sm"
                          style={{ color: 'var(--color-primary-700)', fontWeight: 600 }}
                        >
                          View Record →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
