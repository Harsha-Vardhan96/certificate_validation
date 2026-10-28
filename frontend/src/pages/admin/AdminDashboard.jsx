import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchAdminData()
  }, [])

  async function fetchAdminData() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/api/applications/admin')
      setApplications(res.data || [])
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Unauthorized or session expired. Administrator privileges required.')
      } else if (err.request) {
        setError('Unable to reach the backend services. Please check network connection.')
      } else {
        setError('Failed to load system administrative data. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const stats = {
    totalApplications: applications.length,
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
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className="dashboard-welcome">
        <h1>Welcome, {user?.name || 'System Administrator'}</h1>
        <p>CertiVerify Global platform administration, user provisioning, and credential oversight.</p>
      </div>

      {/* Quick Action Navigation */}
      <div className="quick-actions">
        <Link to="/admin/users" className="quick-action-card">
          <div className="quick-action-icon" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 20, height: 20 }}>
              <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
            </svg>
          </div>
          <div>
            <span className="quick-action-label" style={{ display: 'block' }}>Manage Users</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-muted)' }}>Provision accounts</span>
          </div>
        </Link>

        <Link to="/admin/applications" className="quick-action-card">
          <div className="quick-action-icon quick-action-icon--blue">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 20, height: 20 }}>
              <path fillRule="evenodd" d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <span className="quick-action-label" style={{ display: 'block' }}>Applications Oversight</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-muted)' }}>{stats.totalApplications} records</span>
          </div>
        </Link>

        <Link to="/admin/certificates" className="quick-action-card">
          <div className="quick-action-icon quick-action-icon--green">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 20, height: 20 }}>
              <path fillRule="evenodd" d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.082l5.925 2.844A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <span className="quick-action-label" style={{ display: 'block' }}>Certificates</span>
            <span style={{ fontSize: '0.6875rem', color: 'var(--color-muted)' }}>Lookup & Revoke</span>
          </div>
        </Link>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          Loading administrator metrics…
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="error-state" style={{ marginBottom: '1.5rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{error}</span>
            <button onClick={fetchAdminData} className="btn-ghost btn-sm">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <>
          {/* Key Metric Stat Cards */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon stat-icon--total">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 20, height: 20 }}>
                  <path fillRule="evenodd" d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalApplications}</span>
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
                <span className="stat-label">Pending Review</span>
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
                <span className="stat-label">Approved Applications</span>
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
                <span className="stat-label">Rejected Applications</span>
              </div>
            </div>
          </div>

          {/* System Microservices Architecture Summary */}
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            padding: '1.25rem 1.5rem',
            margin: '1.5rem 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.25rem', color: 'var(--color-heading)' }}>
                System Services & Integration Status
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: 0 }}>
                Live metrics aggregated from <strong>Application Service</strong>. User provisioning managed via <strong>Auth Service</strong>.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '0.25rem 0.5rem', borderRadius: 4 }}>
                Auth Service: Active
              </span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '0.25rem 0.5rem', borderRadius: 4 }}>
                App Service: Active
              </span>
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '0.25rem 0.5rem', borderRadius: 4 }}>
                Certificate Service: Active
              </span>
            </div>
          </div>

          {/* Recent Applications Section */}
          <div className="section-header">
            <h2>Recent Platform Applications</h2>
            <Link to="/admin/applications" className="btn-ghost btn-sm">
              View all ({applications.length}) →
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 24, height: 24 }}>
                  <path fillRule="evenodd" d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Z" clipRule="evenodd" />
                </svg>
              </div>
              <h3>No platform applications yet</h3>
              <p>No student certificate requests have been submitted across any institutions.</p>
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>App ID</th>
                    <th>Course / Degree</th>
                    <th>Institution</th>
                    <th>Student ID</th>
                    <th>Submitted</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApplications.map((app) => (
                    <tr key={app.applicationId}>
                      <td style={{ fontWeight: 600 }}>#{app.applicationId}</td>
                      <td>
                        <span style={{ fontWeight: 500, color: 'var(--color-heading)' }}>
                          {app.courseName}
                        </span>
                      </td>
                      <td>{app.institutionName || '—'}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--color-muted)' }}>
                          {app.studentId ? `UID-${app.studentId}` : '—'}
                        </span>
                      </td>
                      <td>{formatDate(app.createdAt)}</td>
                      <td>
                        <span className={`status-badge status-badge--${app.status}`}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          to={`/admin/applications/${app.applicationId}`}
                          className="btn-ghost btn-sm"
                          style={{ color: 'var(--color-primary-700)', fontWeight: 500 }}
                        >
                          Inspect →
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
