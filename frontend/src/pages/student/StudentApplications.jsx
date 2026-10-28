import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function StudentApplications() {
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

  function formatDate(dateStr) {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div>
      <div className="page-header">
        <h1>My Applications</h1>
        <Link to="/student/applications/new" className="btn btn-primary btn-sm">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
            <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
          </svg>
          New Application
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          Loading applications…
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

      {/* Data */}
      {!loading && !error && (
        <>
          {applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 24, height: 24 }}>
                  <path fillRule="evenodd" d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Z" clipRule="evenodd" />
                </svg>
              </div>
              <h3>No applications yet</h3>
              <p>Submit your first certificate application to get started.</p>
              <Link to="/student/applications/new" className="btn btn-primary btn-sm">
                Apply for Certificate
              </Link>
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Application ID</th>
                    <th>Course</th>
                    <th>Institution</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Last Updated</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {[...applications]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((app) => (
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
                        <td>{formatDate(app.updatedAt)}</td>
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

          {applications.length > 0 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '0.75rem' }}>
              Showing {applications.length} application{applications.length !== 1 ? 's' : ''}
            </p>
          )}
        </>
      )}
    </div>
  )
}
