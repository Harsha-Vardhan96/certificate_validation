import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_DASHBOARDS = {
  STUDENT: '/student/dashboard',
  INSTITUTION: '/institution/dashboard',
  ADMIN: '/admin/dashboard',
}

export default function HomePage() {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="fade-in" style={{ backgroundColor: 'var(--color-surface)' }}>
      {/* ── Hero Section ── */}
      <section style={{
        background: 'linear-gradient(180deg, var(--color-primary-50) 0%, #ffffff 100%)',
        borderBottom: '1px solid var(--color-border)',
        padding: '4.5rem 1rem 4rem',
      }}>
        <div className="container-app" style={{ maxWidth: 860, textAlign: 'center', margin: '0 auto' }}>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 0.875rem',
            borderRadius: 999,
            background: 'var(--color-primary-100)',
            color: 'var(--color-primary-700)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            marginBottom: '1.25rem',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
              <path fillRule="evenodd" d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
            </svg>
            Academic Credential & Verification Registry
          </div>

          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            color: 'var(--color-heading)',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            margin: '0 0 1rem',
          }}>
            CertiVerify Global
          </h1>

          <p style={{
            fontSize: '1.125rem',
            color: 'var(--color-primary-700)',
            fontWeight: 600,
            margin: '0 0 1rem',
          }}>
            Official Digital Academic Certificates with Public Online Verification
          </p>

          <p style={{
            fontSize: '0.9375rem',
            color: 'var(--color-body)',
            lineHeight: 1.7,
            maxWidth: 680,
            margin: '0 auto 2rem',
          }}>
            CertiVerify Global connects educational institutions, students, and verifying bodies through a unified platform. Students submit credential applications, universities review and authorize issuance, and anyone can independently verify certificate integrity in real time.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
            <Link to="/verify" className="btn btn-primary" style={{ padding: '0.6875rem 1.75rem', fontSize: '0.9375rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
              </svg>
              Verify a Certificate
            </Link>

            {isAuthenticated && user ? (
              <Link to={ROLE_DASHBOARDS[user.role] || '/'} className="btn btn-outline" style={{ padding: '0.6875rem 1.5rem', fontSize: '0.9375rem' }}>
                Go to {user.role === 'ADMIN' ? 'Admin' : user.role === 'INSTITUTION' ? 'Institution' : 'Student'} Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline" style={{ padding: '0.6875rem 1.5rem', fontSize: '0.9375rem' }}>
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-ghost" style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-primary-700)' }}>
                  Student Registration →
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Platform Process Workflow ── */}
      <section style={{ padding: '4rem 1rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <div className="container-app" style={{ maxWidth: 1100, margin: '0 auto' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-heading)', margin: '0 0 0.5rem' }}>
              The Credential Lifecycle
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)', margin: 0, maxWidth: 540, marginInline: 'auto' }}>
              How certificates transition from student request to cryptographically authenticated credential.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.5rem',
          }}>
            {/* Step 1 */}
            <div style={{
              background: 'var(--color-surface-alt)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '1.5rem',
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: 'var(--color-primary-100)',
                color: 'var(--color-primary-700)',
                fontWeight: 700,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                1
              </div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-heading)', margin: '0 0 0.5rem' }}>
                Application Submission
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', lineHeight: 1.6, margin: 0 }}>
                Students submit credential requests specifying their completed degree or program and designated educational institution.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{
              background: 'var(--color-surface-alt)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '1.5rem',
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: '#fef3c7',
                color: '#b45309',
                fontWeight: 700,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                2
              </div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-heading)', margin: '0 0 0.5rem' }}>
                Institutional Review
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', lineHeight: 1.6, margin: 0 }}>
                University administrative staff evaluate student eligibility against registry records to officially approve or decline requests.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{
              background: 'var(--color-surface-alt)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '1.5rem',
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: '#dcfce7',
                color: '#15803d',
                fontWeight: 700,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                3
              </div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-heading)', margin: '0 0 0.5rem' }}>
                Digital Issuance
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', lineHeight: 1.6, margin: 0 }}>
                Upon approval, an official certificate is generated with a unique serial number, SHA-256 integrity hash, QR code, and downloadable PDF.
              </p>
            </div>

            {/* Step 4 */}
            <div style={{
              background: 'var(--color-surface-alt)',
              border: '1px solid var(--color-border)',
              borderRadius: 8,
              padding: '1.5rem',
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 6,
                background: '#f3e8ff',
                color: '#7e22ce',
                fontWeight: 700,
                fontSize: '0.875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                4
              </div>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-heading)', margin: '0 0 0.5rem' }}>
                Public Verification
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', lineHeight: 1.6, margin: 0 }}>
                Employers, academic admissions, and background verifiers can inspect authenticity anytime via direct UUID or certificate QR code.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Security & Integrity Concept ── */}
      <section style={{ padding: '3.5rem 1rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-alt)' }}>
        <div className="container-app" style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: 'var(--color-heading)', margin: '0 0 0.75rem' }}>
            Integrity Verification Principle
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-body)', lineHeight: 1.7, margin: '0 0 1.5rem' }}>
            CertiVerify Global ensures trust by comparing queried certificates against the cryptographic SHA-256 hash calculated at issuance and stored in the central database. If any document attribute is modified or if an institution revokes a credential, the verification engine instantly detects the discrepancy and flags it as <strong>TAMPERED</strong> or <strong>REVOKED</strong>.
          </p>
          <Link to="/verify" className="btn btn-outline btn-sm">
            Try the Public Verification Tool →
          </Link>
        </div>
      </section>

      {/* ── Role Portal Links ── */}
      <section style={{ padding: '3.5rem 1rem', backgroundColor: 'var(--color-surface)' }}>
        <div className="container-app" style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-heading)', margin: '0 0 0.25rem' }}>
              Portal Access
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: 0 }}>
              Dedicated workspaces for each academic stakeholder.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{ padding: '1.25rem', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface)' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-heading)', margin: '0 0 0.375rem' }}>
                For Students
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '0 0 1rem', lineHeight: 1.5 }}>
                Submit applications, track approval status in real-time, view issued certificates, and download official PDF copies.
              </p>
              <Link to="/login" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary-600)' }}>
                Student Login →
              </Link>
            </div>

            <div style={{ padding: '1.25rem', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface)' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-heading)', margin: '0 0 0.375rem' }}>
                For Institutions
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '0 0 1rem', lineHeight: 1.5 }}>
                Manage certificate applications received from enrolled students, conduct academic audits, approve, or reject with reasons.
              </p>
              <Link to="/login" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary-600)' }}>
                Institution Portal →
              </Link>
            </div>

            <div style={{ padding: '1.25rem', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface)' }}>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--color-heading)', margin: '0 0 0.375rem' }}>
                For Verifiers & Public
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '0 0 1rem', lineHeight: 1.5 }}>
                No account or sign-up required. Simply enter a Certificate ID or scan a certificate QR code to inspect authenticity.
              </p>
              <Link to="/verify" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary-600)' }}>
                Open Verifier →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
