import { Routes, Route } from 'react-router-dom'

// Layouts
import PublicLayout from '../layouts/PublicLayout'
import StudentLayout from '../layouts/StudentLayout'
import InstitutionLayout from '../layouts/InstitutionLayout'
import AdminLayout from '../layouts/AdminLayout'

// Route protection
import ProtectedRoute from '../components/ProtectedRoute'

// Public pages
import HomePage from '../pages/HomePage'
import VerifyPage from '../pages/VerifyPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'

// Student pages
import StudentDashboard from '../pages/student/StudentDashboard'
import StudentApplications from '../pages/student/StudentApplications'
import StudentNewApplication from '../pages/student/StudentNewApplication'
import StudentCertificates from '../pages/student/StudentCertificates'
import StudentCertificateDetail from '../pages/student/StudentCertificateDetail'

// Institution pages
import InstitutionDashboard from '../pages/institution/InstitutionDashboard'
import InstitutionApplications from '../pages/institution/InstitutionApplications'
import InstitutionApplicationDetail from '../pages/institution/InstitutionApplicationDetail'
import InstitutionCertificates from '../pages/institution/InstitutionCertificates'

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminUsers from '../pages/admin/AdminUsers'
import AdminApplications from '../pages/admin/AdminApplications'
import AdminCertificates from '../pages/admin/AdminCertificates'

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── Public Routes ── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* ── Student Routes (STUDENT only) ── */}
      <Route element={<ProtectedRoute allowedRole="STUDENT" />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="applications" element={<StudentApplications />} />
          <Route path="applications/new" element={<StudentNewApplication />} />
          <Route path="certificates" element={<StudentCertificates />} />
          <Route path="certificates/:id" element={<StudentCertificateDetail />} />
        </Route>
      </Route>

      {/* ── Institution Routes (INSTITUTION only) ── */}
      <Route element={<ProtectedRoute allowedRole="INSTITUTION" />}>
        <Route path="/institution" element={<InstitutionLayout />}>
          <Route path="dashboard" element={<InstitutionDashboard />} />
          <Route path="applications" element={<InstitutionApplications />} />
          <Route path="applications/:id" element={<InstitutionApplicationDetail />} />
          <Route path="certificates" element={<InstitutionCertificates />} />
        </Route>
      </Route>

      {/* ── Admin Routes (ADMIN only) ── */}
      <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="applications" element={<AdminApplications />} />
          <Route path="certificates" element={<AdminCertificates />} />
        </Route>
      </Route>
    </Routes>
  )
}
