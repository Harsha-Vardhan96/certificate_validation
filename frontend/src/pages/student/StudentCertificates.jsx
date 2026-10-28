import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function StudentCertificates() {
  const { user } = useAuth()
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloadingId, setDownloadingId] = useState(null)
  const [downloadError, setDownloadError] = useState('')

  useEffect(() => {
    fetchCertificates()
  }, [])

  async function fetchCertificates() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/api/certificates/my')
      setCertificates(res.data || [])
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expired or unauthorized. Please log in again.')
      } else if (err.request) {
        setError('Unable to reach the server. Please check your connection.')
      } else {
        setError('Failed to load certificates. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleDownloadPdf(certId, certNumber) {
    setDownloadingId(certId)
    setDownloadError('')
    try {
      const res = await api.get(`/api/certificates/${certId}/download`, {
        responseType: 'blob',
      })
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${certNumber || 'certificate-' + certId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch {
      setDownloadError('Failed to download certificate PDF. Please check connection and try again.')
    } finally {
      setDownloadingId(null)
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
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>My Certificates</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '0.25rem 0 0' }}>
            View and download your verified educational and credential certificates.
          </p>
        </div>
        <Link to="/student/applications" className="btn-ghost btn-sm">
          View Applications →
        </Link>
      </div>

      {/* Download Error Alert */}
      {downloadError && (
        <div className="error-state" style={{ marginBottom: '1.25rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{downloadError}</span>
            <button onClick={() => setDownloadError('')} className="btn-ghost btn-sm">
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          Loading your certificates…
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
            <button onClick={fetchCertificates} className="btn-ghost btn-sm">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && certificates.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 24, height: 24 }}>
              <path fillRule="evenodd" d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.082l5.925 2.844A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z" clipRule="evenodd" />
            </svg>
          </div>
          <h3>No certificates issued yet</h3>
          <p>
            Certificates will appear here once your application has been approved and issued by your institution.
          </p>
          <Link to="/student/applications" className="btn btn-primary btn-sm">
            View Applications
          </Link>
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && certificates.length > 0 && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Certificate No. / ID</th>
                <th>Course / Credential</th>
                <th>Institution</th>
                <th>Issue Date</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map((cert) => (
                <tr key={cert.certificateId}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--color-heading)' }}>
                      {cert.certificateNumber || '—'}
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.6875rem', color: 'var(--color-muted)' }}>
                      {cert.certificateId}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500, color: 'var(--color-heading)' }}>
                      {cert.courseName}
                    </span>
                  </td>
                  <td>
                    <span>{cert.institutionName || '—'}</span>
                  </td>
                  <td>{formatDate(cert.issueDate)}</td>
                  <td>
                    <span className={`status-badge status-badge--${cert.status}`}>
                      {cert.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.375rem', alignItems: 'center' }}>
                      <Link
                        to={`/student/certificates/${cert.certificateId}`}
                        className="btn-ghost btn-sm"
                        title="View Certificate Details"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleDownloadPdf(cert.certificateId, cert.certificateNumber)}
                        disabled={downloadingId === cert.certificateId}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                        title="Download PDF Certificate"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
                          <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                          <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
                        </svg>
                        {downloadingId === cert.certificateId ? 'Downloading…' : 'Download'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
