import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_DASHBOARDS = {
  STUDENT: '/student/dashboard',
  INSTITUTION: '/institution/dashboard',
  ADMIN: '/admin/dashboard',
}

export default function PublicLayout() {
  const { isAuthenticated, user } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface)]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-white">
        <div className="container-app flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-2 text-base font-bold text-[var(--color-primary-700)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 text-[var(--color-primary-600)]">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            CertiVerify Global
          </Link>

          <nav className="flex items-center gap-4">
            <Link to="/verify" className="text-sm font-medium text-[var(--color-body)] hover:text-[var(--color-primary-700)] transition-colors">
              Verify
            </Link>

            {isAuthenticated && user ? (
              <Link
                to={ROLE_DASHBOARDS[user.role] || '/'}
                className="btn btn-primary text-sm !py-1.5 !px-4"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline text-sm !py-1.5 !px-4">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary text-sm !py-1.5 !px-4">
                  Register
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface-alt)] py-6">
        <div className="container-app text-center text-sm text-[var(--color-muted)]">
          <p>&copy; {new Date().getFullYear()} CertiVerify Global. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
