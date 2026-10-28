import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_DASHBOARDS = {
  STUDENT: '/student/dashboard',
  INSTITUTION: '/institution/dashboard',
  ADMIN: '/admin/dashboard',
}

export default function PublicLayout() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-white">
        <div className="container-app flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 text-base font-bold text-[var(--color-primary-700)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 text-[var(--color-primary-600)]">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>CertiVerify Global</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-5">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-[var(--color-primary-700)] font-semibold' : 'text-[var(--color-body)] hover:text-[var(--color-primary-700)]'
                }`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/verify"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-[var(--color-primary-700)] font-semibold' : 'text-[var(--color-body)] hover:text-[var(--color-primary-700)]'
                }`
              }
            >
              Verify Certificate
            </NavLink>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={ROLE_DASHBOARDS[user.role] || '/'}
                  className="btn btn-primary text-sm !py-1.5 !px-4"
                >
                  Go to Dashboard →
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-ghost text-xs font-semibold"
                  style={{ color: 'var(--color-muted)' }}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn btn-outline text-sm !py-1.5 !px-4">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary text-sm !py-1.5 !px-4">
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface-alt)] py-10">
        <div className="container-app" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-[var(--color-primary-700)] mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-[var(--color-primary-600)]">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                CertiVerify Global
              </div>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                Centralized academic credential issuance, cryptographic integrity verification, and digital registry for global educational institutions.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[var(--color-heading)] uppercase tracking-wider mb-3">
                Quick Navigation
              </h4>
              <ul className="space-y-2 text-xs text-[var(--color-muted)]">
                <li>
                  <Link to="/" className="hover:text-[var(--color-primary-700)] transition-colors">Home Page</Link>
                </li>
                <li>
                  <Link to="/verify" className="hover:text-[var(--color-primary-700)] transition-colors">Verify Certificate</Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-[var(--color-primary-700)] transition-colors">Portal Login</Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-[var(--color-primary-700)] transition-colors">Student Account Registration</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-[var(--color-heading)] uppercase tracking-wider mb-3">
                Verification Assurance
              </h4>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed mb-2">
                All certificates are cryptographically checked against the issuing institution's records. Verification requires no login and is free for employers and academic bodies.
              </p>
              <div className="text-[11px] font-mono text-[var(--color-muted)]">
                SHA-256 Digital Fingerprint
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--color-border)] pt-6 text-center text-xs text-[var(--color-muted)]">
            <p>&copy; {new Date().getFullYear()} CertiVerify Global. All rights reserved. Academic Credential Verification Platform.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
