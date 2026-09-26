import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/student/dashboard', label: 'Dashboard' },
  { to: '/student/applications', label: 'Applications' },
  { to: '/student/certificates', label: 'Certificates' },
]

export default function StudentLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface-alt)]">
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-white">
        <div className="container-app flex items-center justify-between h-14">
          <Link to="/" className="text-base font-bold text-[var(--color-primary-700)]">
            CertiVerify
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--color-primary-50)] text-[var(--color-primary-700)]'
                      : 'text-[var(--color-body)] hover:bg-[var(--color-surface-muted)]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-[var(--color-muted)]">
                {user.name}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-[var(--color-muted)] hover:text-red-600 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-6">
        <div className="container-app">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
