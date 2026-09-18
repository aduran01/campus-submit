import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './pages/LoginPage'
import { StudentDashboardPage } from './pages/StudentDashboardPage'
import { StudentAssignmentsPage } from './pages/StudentAssignmentsPage'
import { ProfilePage } from './pages/ProfilePage'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminAssignmentsPage } from './pages/AdminAssignmentsPage'
import { AdminCreateAssignmentPage } from './pages/AdminCreateAssignmentPage'
import { AdminSubmissionsPage } from './pages/AdminSubmissionsPage'
import { NotFoundPage } from './pages/NotFoundPage'

/** Renders the right "Dashboard" page for whichever role is logged in. */
function RoleAwareDashboard() {
  const { user } = useAuth()
  return user?.role === 'admin' ? <AdminDashboardPage /> : <StudentDashboardPage />
}

/** Renders the right "Assignments" page for whichever role is logged in. */
function RoleAwareAssignments() {
  const { user } = useAuth()
  return user?.role === 'admin' ? <AdminAssignmentsPage /> : <StudentAssignmentsPage />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<RoleAwareDashboard />} />
          <Route path="/assignments" element={<RoleAwareAssignments />} />
          <Route path="/profile" element={<ProfilePage />} />

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/assignments/new" element={<AdminCreateAssignmentPage />} />
            <Route path="/submissions" element={<AdminSubmissionsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  )
}
