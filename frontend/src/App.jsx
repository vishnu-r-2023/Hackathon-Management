import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/store';
import { PrivateRoute, RoleRoute } from './routes/ProtectedRoutes';

// Layouts
import { AdminLayout } from './layouts/AdminLayout';
import { ParticipantLayout } from './layouts/ParticipantLayout';
import { JudgeLayout } from './layouts/JudgeLayout';

// Pages - Auth
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Unauthorized } from './pages/Unauthorized';

// Pages - Admin
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminHackathons } from './pages/admin/AdminHackathons';
import { AdminUsers } from './pages/admin/AdminUsers';

// Pages - Participant
import { ParticipantDashboard } from './pages/participant/ParticipantDashboard';
import { ParticipantHackathons } from './pages/participant/ParticipantHackathons';
import { ParticipantTeams } from './pages/participant/ParticipantTeams';
import { ParticipantSubmissions } from './pages/participant/ParticipantSubmissions';
import { ParticipantResults } from './pages/participant/ParticipantResults';

// Pages - Judge
import { JudgeDashboard } from './pages/judge/JudgeDashboard';

// Navbar (only for public pages)
import { Navbar } from './components/Navbar';

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const defaultAuthedPath =
    user?.role === 'admin' ? '/admin' : user?.role === 'judge' ? '/judge' : '/dashboard';

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <>
            <Navbar />
            <Home />
          </>
        }
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={defaultAuthedPath} /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to={defaultAuthedPath} /> : <Register />}
      />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminLayout />
          </RoleRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="hackathons" element={<AdminHackathons />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>

      {/* Participant Routes */}
      <Route
        path="/dashboard"
        element={
          <RoleRoute allowedRoles={['participant']}>
            <ParticipantLayout />
          </RoleRoute>
        }
      >
        <Route index element={<ParticipantDashboard />} />
        <Route path="dashboard" element={<ParticipantDashboard />} />
        <Route path="hackathons" element={<ParticipantHackathons />} />
        <Route path="teams" element={<ParticipantTeams />} />
        <Route path="submissions" element={<ParticipantSubmissions />} />
        <Route path="results" element={<ParticipantResults />} />
      </Route>

      {/* Judge Routes */}
      <Route
        path="/judge"
        element={
          <RoleRoute allowedRoles={['judge']}>
            <JudgeLayout />
          </RoleRoute>
        }
      >
        <Route index element={<JudgeDashboard />} />
        <Route path="dashboard" element={<JudgeDashboard />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
