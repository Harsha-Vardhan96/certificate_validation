import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../../services/api'

export default function AdminApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchParams, setSearchParams] = useSearchParams()

  const currentFilter = searchParams.get('status') || 'ALL'
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  async function fetchApplications() {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/api/applications/admin')
      setApplications(res.data || [])
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError('Unauthorized or session expired. Administrator access required.')
      } else if (err.request) {
        setError('Unable to reach the server. Please check your connection.')
      } else {
        setError('Failed to load platform applications. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  function handleFilterChange(status) {
    if (status === 'ALL') {
      searchParams.delete('status')
      setSearchParams(searchParams)
    } else {
      setSearchParams({ status })
    }
  }

  const counts = useMemo(() => {
    return {
      ALL: applications.length,
      PENDING: applications.filter((a) => a.status === 'PENDING').length,
      APPROVED: applications.filter((a) => a.status === 'APPROVED').length,
      REJECTED: applications.filter((a) => a.status === 'REJECTED').length,
    }
  }, [applications])

  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        if (currentFilter !== 'ALL' && app.status !== currentFilter) {
          return false
        }
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase()
          const idMatch = String(app.applicationId).toLowerCase().includes(q)
          const courseMatch = (app.courseName || '').toLowerCase().includes(q)
          const instMatch = (app.institutionName || '').toLowerCase().includes(q)
          const studentMatch = app.studentId ? String(app.studentId).toLowerCase().includes(q) : false
          return idMatch || courseMatch || instMatch || studentMatch
        }
        return true
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [applications, currentFilter, searchTerm])

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
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Platform Applications Oversight</h1>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', margin: '0.25rem 0 0' }}>
            System-wide view of certificate requests across all educational institutions.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        {/* Status Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab${currentFilter === 'ALL' ? ' filter-tab--active' : ''}`}
            onClick={() => handleFilterChange('ALL')}
          >
            All
            <span className="filter-tab-count">{counts.ALL}</span>
          </button>
          <button
            className={`filter-tab${currentFilter === 'PENDING' ? ' filter-tab--active' : ''}`}
            onClick={() => handleFilterChange('PENDING')}
          >
            Pending
            <span className="filter-tab-count">{counts.PENDING}</span>
          </button>
          <button
            className={`filter-tab${currentFilter === 'APPROVED' ? ' filter-tab--active' : ''}`}
            onClick={() => handleFilterChange('APPROVED')}
          >
            Approved
            <span className="filter-tab-count">{counts.APPROVED}</span>
          </button>
          <button
            className={`filter-tab${currentFilter === 'REJECTED' ? ' filter-tab--active' : ''}`}
            onClick={() => handleFilterChange('REJECTED')}
          >
            Rejected
            <span className="filter-tab-count">{counts.REJECTED}</span>
          </button>
        </div>

        {/* Live Search Input */}
        <div className="search-input-wrap">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}>
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            placeholder="Search by ID, course, institution, student..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          Loading platform applications…
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="error-state">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 18, height: 18 }}>
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
          </svg>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{error}</span>
            <button onClick={fetchApplications} className="btn-ghost btn-sm">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      {!loading && !error && (
        <>
          {filteredApplications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 24, height: 24 }}>
                  <path fillRule="evenodd" d="M3 3.5A1.5 1.5 0 0 1 4.5 2h6.879a1.5 1.5 0 0 1 1.06.44l4.122 4.12A1.5 1.5 0 0 1 17 7.622V16.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 16.5v-13Z" clipRule="evenodd" />
                </svg>
              </div>
              {applications.length === 0 ? (
                <>
                  <h3>No applications found</h3>
                  <p>No student certificate requests have been submitted on the platform yet.</p>
                </>
              ) : (
                <>
                  <h3>No matching applications</h3>
                  <p>No applications match the current filter or search criteria.</p>
                  <button
                    onClick={() => {
                      handleFilterChange('ALL')
                      setSearchTerm('')
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    Clear Filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>App ID</th>
                    <th>Course / Credential</th>
                    <th>Institution</th>
                    <th>Student ID</th>
                    <th>Submitted</th>
                    <th>Last Updated</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => (
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
                      <td>{formatDate(app.updatedAt)}</td>
                      <td>
                        <span className={`status-badge status-badge--${app.status}`}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link
                          to={`/admin/applications/${app.applicationId}`}
                          className="btn-ghost btn-sm"
                          style={{ color: 'var(--color-primary-700)', fontWeight: 600 }}
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
