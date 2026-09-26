import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ROLE_DASHBOARDS = {
  STUDENT: '/student/dashboard',
  INSTITUTION: '/institution/dashboard',
  ADMIN: '/admin/dashboard',
}

/**
 * Wraps routes that require authentication and optionally a specific role.
 *
 * Props:
 *   allowedRole – if provided, only users with this role may access the route.
 *                 Others are redirected to their own dashboard.
 */
export default function ProtectedRoute({ allowedRole }) {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRole && user.role !== allowedRole) {
    const dest = ROLE_DASHBOARDS[user.role] || '/'
    return <Navigate to={dest} replace />
  }

  return <Outlet />
}
