import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/applications', label: 'Applications' },
  { to: '/admin/certificates', label: 'Certificates' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-surface-alt)]">
      <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-primary-950)]">
        <div className="container-app flex items-center justify-between h-14">
          <Link to="/" className="text-base font-bold text-white">
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
                      ? 'bg-white/15 text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-white/60">
                {user.name}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-white/60 hover:text-white transition-colors cursor-pointer"
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
