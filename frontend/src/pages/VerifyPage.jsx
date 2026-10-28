import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import api from '../services/api'

// Standard UUID regex (8-4-4-4-12 hex characters)
const UUID_REGEX = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/

export default function VerifyPage() {
  const { id: paramId } = useParams()
  const [searchParams] = useSearchParams()
  const queryId = searchParams.get('id') || searchParams.get('certificateId')

  const [inputVal, setInputVal] = useState(() => paramId || queryId || '')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [validationError, setValidationError] = useState('')

  // Helper to extract a UUID from text or full URL
  function extractUuid(str) {
    if (!str) return null
    const match = str.trim().match(UUID_REGEX)
    return match ? match[0] : null
  }

  const performVerification = useCallback(async (rawTargetId) => {
    setErrorMsg('')
    setValidationError('')
    setResult(null)

    if (!rawTargetId || !rawTargetId.trim()) {
      setValidationError('Please enter a Certificate ID to verify.')
      return
    }

    const uuid = extractUuid(rawTargetId)
    if (!uuid) {
      setValidationError(
        'Invalid Certificate ID format. A valid Certificate ID is a 36-character UUID (e.g. 550e8400-e29b-41d4-a716-446655440000).'
      )
      return
    }

    setLoading(true)
    try {
      const res = await api.get(`/api/verify/${uuid}`)
      setResult(res.data)
    } catch (err) {
      if (err.response?.data?.verificationStatus) {
        // Backend returned a structured verification response with an error HTTP status
        setResult(err.response.data)
      } else if (err.response?.status === 404) {
        // Not found is treated as INVALID
        setResult({
          certificateId: uuid,
          verificationStatus: 'INVALID',
          message: 'No certificate record was found matching this identifier.',
        })
      } else if (err.response?.status === 400) {
        setValidationError(
          'The provided Certificate ID is not recognized as a valid identifier format by the verification service.'
        )
      } else if (err.response?.status === 503) {
        setErrorMsg('The verification service is temporarily unavailable. Please try again shortly.')
      } else if (err.request) {
        setErrorMsg('Unable to connect to the verification server. Please verify your internet connection.')
      } else {
        setErrorMsg('An unexpected error occurred while verifying the certificate. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Auto-verify if ID provided via URL param or query param (e.g. scanned from QR code)
  useEffect(() => {
    const initialId = paramId || queryId
    if (initialId) {
      performVerification(initialId)
    }
  }, [paramId, queryId, performVerification])

  function handleSubmit(e) {
    e.preventDefault()
    performVerification(inputVal)
  }

  function handleReset() {
    setInputVal('')
    setResult(null)
    setErrorMsg('')
    setValidationError('')
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

  function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return '—'
    const d = new Date(dateTimeStr)
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="fade-in" style={{ padding: '3rem 1rem', minHeight: '80vh', backgroundColor: 'var(--color-surface-alt)' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        
        {/* Verification Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: 'var(--color-primary-100)',
              color: 'var(--color-primary-700)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: 28, height: 28 }}>
              <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-heading)', margin: '0 0 0.5rem' }}>
            Official Credential Verification
          </h1>
          <p style={{ fontSize: '0.9375rem', color: 'var(--color-muted)', margin: 0, maxWidth: 520, marginInline: 'auto' }}>
            Verify academic credentials, degrees, and certificates issued through the CertiVerify Global registry in real time.
          </p>
        </div>

        {/* Verification Input Card */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          padding: '1.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          marginBottom: '2rem',
        }}>
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="certificate-search-input"
              style={{
                display: 'block',
                fontSize: '0.8125rem',
                fontWeight: 600,
                color: 'var(--color-heading)',
                marginBottom: '0.5rem',
              }}
            >
              Certificate ID or Verification URL
            </label>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
                  <input
                    id="certificate-search-input"
                    type="text"
                    value={inputVal}
                    onChange={(e) => {
                      setInputVal(e.target.value)
                      if (validationError) setValidationError('')
                    }}
                    placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                    disabled={loading}
                    className={`form-input ${validationError ? 'form-input--error' : ''}`}
                    style={{
                      height: 44,
                      padding: '0 1rem',
                      fontSize: '0.875rem',
                      fontFamily: inputVal ? 'monospace' : 'inherit',
                    }}
                  />
                  {inputVal && !loading && (
                    <button
                      type="button"
                      onClick={handleReset}
                      title="Clear input"
                      style={{
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-muted)',
                        cursor: 'pointer',
                        padding: '4px',
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !inputVal.trim()}
                  className="btn btn-primary"
                  style={{ height: 44, paddingInline: '1.5rem', fontSize: '0.875rem', minWidth: 160 }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="loading-spinner" style={{ width: 16, height: 16, borderWidth: 2, margin: 0 }} />
                      Verifying…
                    </span>
                  ) : (
                    'Verify Certificate'
                  )}
                </button>
              </div>

              {validationError && (
                <div className="form-error" style={{ margin: 0 }}>
                  {validationError}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                <span>Scan a QR code on an official certificate, paste its link, or enter its UUID.</span>
                <span style={{ fontFamily: 'monospace' }}>UUID v4</span>
              </div>
            </div>
          </form>
        </div>

        {/* Network or Server Error Alert */}
        {errorMsg && (
          <div className="error-state" style={{ marginBottom: '2rem' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18, flexShrink: 0 }}>
              <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
            </svg>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <span>{errorMsg}</span>
              <button onClick={() => performVerification(inputVal)} className="btn-ghost btn-sm">
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Loading Spinner State */}
        {loading && (
          <div className="loading-state" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: '3rem 1.5rem', marginBottom: '2rem' }}>
            <div className="loading-spinner" />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-heading)', margin: '0 0 0.25rem' }}>
              Verifying Certificate Authenticity
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: 0 }}>
              Querying institutional records and evaluating cryptographic integrity…
            </p>
          </div>
        )}

        {/* Verification Result Cards */}
        {!loading && result && (
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 12,
            padding: '1.75rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            marginBottom: '2rem',
          }}>

            {/* 1. VALID Result */}
            {result.verificationStatus === 'VALID' && (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.25rem',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 8,
                  marginBottom: '1.5rem',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#22c55e', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 22, height: 22 }}>
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="status-badge status-badge--APPROVED">VALID</span>
                      <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#14532d', margin: 0 }}>
                        Authentic Certificate Verified
                      </h2>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: '#166534', margin: 0 }}>
                      Certificate record exists and its integrity check passed.
                    </p>
                  </div>
                </div>

                <div className="cert-detail-grid" style={{ marginBottom: '1.5rem' }}>
                  <div className="cert-detail-field">
                    <label>Student Name</label>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-heading)' }}>
                      {result.studentName || '—'}
                    </span>
                  </div>

                  <div className="cert-detail-field">
                    <label>Course / Credential</label>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-heading)' }}>
                      {result.courseName || '—'}
                    </span>
                  </div>

                  <div className="cert-detail-field">
                    <label>Issuing Institution</label>
                    <span style={{ fontWeight: 600 }}>{result.institutionName || '—'}</span>
                  </div>

                  <div className="cert-detail-field">
                    <label>Date of Issuance</label>
                    <span>{formatDate(result.issueDate)}</span>
                  </div>

                  <div className="cert-detail-field">
                    <label>Certificate Number</label>
                    <span style={{ fontWeight: 600 }}>{result.certificateNumber || '—'}</span>
                  </div>

                  <div className="cert-detail-field">
                    <label>Certificate Status</label>
                    <span style={{ color: '#16a34a', fontWeight: 600 }}>
                      {result.certificateStatus || 'ACTIVE'}
                    </span>
                  </div>

                  <div className="cert-detail-field" style={{ gridColumn: 'span 2' }}>
                    <label>Certificate Identifier (UUID)</label>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                      {result.certificateId}
                    </span>
                  </div>
                </div>

                <div style={{
                  padding: '0.75rem 1rem',
                  background: 'var(--color-surface-alt)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 6,
                  fontSize: '0.75rem',
                  color: 'var(--color-muted)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span>Verified at: {formatDateTime(result.verifiedAt)}</span>
                  <span>Verification ID: <span style={{ fontFamily: 'monospace' }}>{result.verificationId ? String(result.verificationId).substring(0, 8) : '—'}</span></span>
                </div>
              </div>
            )}

            {/* 2. TAMPERED Result */}
            {result.verificationStatus === 'TAMPERED' && (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.25rem',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: 8,
                  marginBottom: '1.5rem',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#dc2626', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 22, height: 22 }}>
                      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="status-badge status-badge--REJECTED">TAMPERED</span>
                      <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#991b1b', margin: 0 }}>
                        Integrity Mismatch Detected
                      </h2>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: '#b91c1c', margin: 0 }}>
                      The certificate data does not match the official record.
                    </p>
                  </div>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--color-body)', margin: '0 0 1rem' }}>
                  A record was located in the registry, but the certificate content or cryptographic signature does not correspond to the institutional hash on file. This credential should not be accepted as authentic.
                </p>

                <div className="cert-detail-grid">
                  <div className="cert-detail-field">
                    <label>Certificate Number</label>
                    <span>{result.certificateNumber || '—'}</span>
                  </div>
                  <div className="cert-detail-field">
                    <label>Claimed Institution</label>
                    <span>{result.institutionName || '—'}</span>
                  </div>
                  <div className="cert-detail-field" style={{ gridColumn: 'span 2' }}>
                    <label>Certificate UUID</label>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{result.certificateId}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. REVOKED Result */}
            {result.verificationStatus === 'REVOKED' && (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.25rem',
                  background: '#fff7ed',
                  border: '1px solid #ffedd5',
                  borderRadius: 8,
                  marginBottom: '1.5rem',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#ea580c', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 22, height: 22 }}>
                      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="status-badge status-badge--REVOKED">REVOKED</span>
                      <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#9a3412', margin: 0 }}>
                        Certificate Officially Revoked
                      </h2>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: '#c2410c', margin: 0 }}>
                      The certificate was issued but has been revoked.
                    </p>
                  </div>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--color-body)', margin: '0 0 1rem' }}>
                  This credential was previously generated but has been officially annulled or invalidated by the issuing institution or system administration.
                </p>

                <div className="cert-detail-grid">
                  <div className="cert-detail-field">
                    <label>Certificate Number</label>
                    <span style={{ fontWeight: 600 }}>{result.certificateNumber || '—'}</span>
                  </div>
                  <div className="cert-detail-field">
                    <label>Status</label>
                    <span style={{ color: '#c2410c', fontWeight: 600 }}>REVOKED</span>
                  </div>
                  <div className="cert-detail-field" style={{ gridColumn: 'span 2' }}>
                    <label>Certificate UUID</label>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{result.certificateId}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. INVALID Result */}
            {result.verificationStatus === 'INVALID' && (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '1rem',
                  padding: '1.25rem',
                  background: '#f8fafc',
                  border: '1px solid var(--color-border)',
                  borderRadius: 8,
                  marginBottom: '1rem',
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#64748b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 22, height: 22 }}>
                      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.94 6.94a.75.75 0 1 1-1.06-1.06 3 3 0 1 1 4.24 4.24l-.44.44a1.75 1.75 0 0 0-.51 1.24v.19a.75.75 0 0 1-1.5 0v-.19c0-.85.34-1.67.94-2.27l.44-.44a1.5 1.5 0 0 0-2.11-2.12ZM10 16a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="status-badge" style={{ background: '#e2e8f0', color: '#334155' }}>NOT FOUND</span>
                      <h2 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-heading)', margin: 0 }}>
                        No Record Found
                      </h2>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: 0 }}>
                      No valid certificate record was found.
                    </p>
                  </div>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--color-body)', margin: '0 0 1rem' }}>
                  The queried identifier does not match any certificate issued on CertiVerify Global. Please confirm the Certificate ID from the original document or scan the QR code again.
                </p>

                <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                  Queried ID: <span style={{ fontFamily: 'monospace' }}>{result.certificateId || inputVal}</span>
                </div>
              </div>
            )}

            <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn-outline btn-sm"
              >
                Verify Another Certificate
              </button>
            </div>
          </div>
        )}

        {/* Educational note on Verification & Cryptographic Integrity */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: '1.25rem 1.5rem',
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-heading)', margin: '0 0 0.5rem' }}>
            How Verification Works
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', lineHeight: 1.6, margin: 0 }}>
            Every certificate issued through CertiVerify Global is recorded directly in the institutional registry with an immutable SHA-256 integrity hash. When a credential is queried, the verification service matches the provided certificate against the issuing institution's stored master record to detect any tampering, alterations, or revocations.
          </p>
        </div>

      </div>
    </div>
  )
}
