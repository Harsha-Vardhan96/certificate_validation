import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../../services/api'

export default function StudentCertificateDetail() {
  const { id: certificateId } = useParams()
  const [certificate, setCertificate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState('')

  const fetchCertificate = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get(`/api/certificates/${certificateId}`)
      setCertificate(res.data)
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Certificate not found.')
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError('You do not have permission to view this certificate.')
      } else if (err.request) {
        setError('Unable to reach the server. Please check your connection.')
      } else {
        setError('Failed to load certificate details.')
      }
    } finally {
      setLoading(false)
    }
  }, [certificateId])

  useEffect(() => {
    fetchCertificate()
  }, [fetchCertificate])

  async function handleDownload() {
    setDownloading(true)
    setDownloadError('')
    try {
      const res = await api.get(`/api/certificates/${certificateId}/download`, {
        responseType: 'blob',
      })
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `certificate-${certificateId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch {
      setDownloadError('Failed to download certificate PDF. Please check connection and try again.')
    } finally {
      setDownloading(false)
    }
  }

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div>
      <div className="page-header">
        <h1>Certificate Details</h1>
        <Link to="/student/certificates" className="btn-ghost btn-sm">
          ← Back to Certificates
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          Loading certificate…
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

      {/* Certificate data */}
      {!loading && !error && certificate && (
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: '1.5rem',
        }}>
          {downloadError && (
            <div className="error-state" style={{ marginBottom: '1rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              <span>{downloadError}</span>
            </div>
          )}

          {/* Status and download */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span className={`status-badge status-badge--${certificate.status}`}>
              {certificate.status}
            </span>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn btn-primary btn-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
                <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
                <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
              </svg>
              {downloading ? 'Downloading…' : 'Download Certificate'}
            </button>
          </div>

          {/* Detail fields */}
          <div className="cert-detail-grid">
            <div className="cert-detail-field">
              <label>Certificate Number</label>
              <span>{certificate.certificateNumber || '—'}</span>
            </div>
            <div className="cert-detail-field">
              <label>Certificate ID</label>
              <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {certificate.certificateId}
              </span>
            </div>
            <div className="cert-detail-field">
              <label>Student Name</label>
              <span>{certificate.studentName || '—'}</span>
            </div>
            <div className="cert-detail-field">
              <label>Course</label>
              <span>{certificate.courseName || '—'}</span>
            </div>
            <div className="cert-detail-field">
              <label>Institution</label>
              <span>{certificate.institutionName || '—'}</span>
            </div>
            <div className="cert-detail-field">
              <label>Issue Date</label>
              <span>{formatDate(certificate.issueDate)}</span>
            </div>
            <div className="cert-detail-field">
              <label>Application ID</label>
              <span>{certificate.applicationId || '—'}</span>
            </div>
            <div className="cert-detail-field">
              <label>Created At</label>
              <span>{formatDate(certificate.createdAt)}</span>
            </div>
            {certificate.updatedAt && (
              <div className="cert-detail-field">
                <label>Last Updated</label>
                <span>{formatDate(certificate.updatedAt)}</span>
              </div>
            )}
          </div>

          {/* Verification / security section */}
          {(certificate.certificateHash || certificate.qrCodeData) && (
            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
              <h3 style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-heading)', margin: '0 0 0.75rem' }}>
                Verification Details
              </h3>
              <div className="cert-detail-grid">
                {certificate.certificateHash && (
                  <div className="cert-detail-field" style={{ gridColumn: '1 / -1' }}>
                    <label>SHA-256 Hash</label>
                    <span style={{
                      fontSize: '0.6875rem',
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                      background: 'var(--color-surface-muted)',
                      padding: '0.5rem 0.625rem',
                      borderRadius: 4,
                      display: 'block',
                      marginTop: '0.25rem',
                      color: 'var(--color-body)',
                    }}>
                      {certificate.certificateHash}
                    </span>
                  </div>
                )}
                {certificate.qrCodeData && (
                  <div className="cert-detail-field" style={{ gridColumn: '1 / -1' }}>
                    <label>QR Code Data</label>
                    <span style={{
                      fontSize: '0.6875rem',
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                      background: 'var(--color-surface-muted)',
                      padding: '0.5rem 0.625rem',
                      borderRadius: 4,
                      display: 'block',
                      marginTop: '0.25rem',
                      color: 'var(--color-body)',
                    }}>
                      {certificate.qrCodeData}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
