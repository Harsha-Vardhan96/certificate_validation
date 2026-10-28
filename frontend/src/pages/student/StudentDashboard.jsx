import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  async function fetchApplications() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/api/applications/my')
      setApplications(res.data || [])
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Session expired. Please log in again.')
      } else if (err.request) {
        setError('Unable to reach the server. Please check your connection.')
      } else {
        setError('Failed to load applications. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'PENDING').length,
    approved: applications.filter((a) => a.status === 'APPROVED').length,
    rejected: applications.filter((a) => a.status === 'REJECTED').length,
  }

  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div>
      {/* Welcome */}
      <div className="dashboard-welcome">
        <h1>Welcome, {user?.name || 'Student'}</h1>
        <p>Here's an overview of your certificate applications.</p>
      </div>

      {/* Quick actions */}
      <div className="quick-actions">
        <Link to="/student/applications/new" className="quick-action-card">
          <div className="quick-action-icon quick-action-icon--primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 20, height: 20 }}>
              <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
            </svg>
          </div>
          <span className="quick-action-label">Apply for Certificate</span>
        </Link>

        <Link to="/student/applications" className="quick-action-card">
          <div className="quick-action-icon quick-action-icon--blue">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 20, height: 20 }}>
              <path fillRule="evenodd" d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="quick-action-label">My Applications</span>
        </Link>

        <Link to="/student/certificates" className="quick-action-card">
          <div className="quick-action-icon quick-action-icon--green">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 20, height: 20 }}>
              <path fillRule="evenodd" d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.082l5.925 2.844A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="quick-action-label">My Certificates</span>
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          Loading your applications…
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="error-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          <div>
            <span>{error}</span>
            <button onClick={fetchApplications} className="btn-ghost btn-sm" style={{ marginLeft: '0.5rem' }}>
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Data loaded */}
      {!loading && !error && (
        <>
          {/* Stats */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon stat-icon--total">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 20, height: 20 }}>
                  <path fillRule="evenodd" d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total Applications</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon--pending">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 20, height: 20 }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.pending}</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon--approved">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 20, height: 20 }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.approved}</span>
                <span className="stat-label">Approved</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon--rejected">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 20, height: 20 }}>
                  <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.rejected}</span>
                <span className="stat-label">Rejected</span>
              </div>
            </div>
          </div>

          {/* Recent applications */}
          <div className="section-header">
            <h2>Recent Applications</h2>
            {applications.length > 5 && (
              <Link to="/student/applications" className="btn-ghost btn-sm">
                View all →
              </Link>
            )}
          </div>

          {recentApplications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 24, height: 24 }}>
                  <path fillRule="evenodd" d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Z" clipRule="evenodd" />
                </svg>
              </div>
              <h3>No applications yet</h3>
              <p>Start by submitting your first certificate application.</p>
              <Link to="/student/applications/new" className="btn btn-primary btn-sm">
                Apply for Certificate
              </Link>
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Course</th>
                    <th>Institution</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((app) => (
                    <tr key={app.applicationId}>
                      <td style={{ fontWeight: 500 }}>#{app.applicationId}</td>
                      <td>{app.courseName}</td>
                      <td>{app.institutionName}</td>
                      <td>
                        <span className={`status-badge status-badge--${app.status}`}>
                          {app.status}
                        </span>
                      </td>
                      <td>{formatDate(app.createdAt)}</td>
                      <td>
                        <Link
                          to={`/student/applications/${app.applicationId}`}
                          className="btn-ghost btn-sm"
                        >
                          View
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
