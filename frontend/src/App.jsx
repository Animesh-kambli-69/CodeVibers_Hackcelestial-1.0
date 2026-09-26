import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import { AuthProvider, useAuth } from './AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ROLE_HOME } from './lib/constants';

import LoginPage from './pages/LoginPage';
import ForbiddenPage from './pages/ForbiddenPage';
import ManagerSettings from './pages/ManagerSettings';
import { DataEntryDashboard, GuestDashboard } from './pages/Dashboards';
import ManagerDashboard from './pages/ManagerDashboard';

import ManagerRoutes from './routes/ManagerRoutes';
import OperationsRoutes from './routes/OperationsRoutes';
import GuestRoutes from './routes/GuestRoutes';

function RootRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const target = ROLE_HOME[user.role] || '/login';
  return <Navigate to={target} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />

          {/* ── Modular Role Routes ── */}
          <Route path="/manager/*" element={
            <ProtectedRoute allowedRole="RESORT_MANAGER">
              <ManagerRoutes />
            </ProtectedRoute>
          } />
          
          <Route path="/operations/*" element={
            <ProtectedRoute allowedRole="OPERATIONS_MANAGER">
              <OperationsRoutes />
            </ProtectedRoute>
          } />
          
          <Route path="/guest/*" element={
            <ProtectedRoute allowedRole="GUEST">
              <GuestRoutes />
            </ProtectedRoute>
          } />

          {/* ── Top-Level / Legacy Routes ── */}
          <Route path="/settings" element={
            <ProtectedRoute allowedRole="RESORT_MANAGER">
              <ManagerSettings />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/manager" element={
            <ProtectedRoute allowedRole="RESORT_MANAGER">
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/data-entry" element={
            <ProtectedRoute allowedRole="OPERATIONS_MANAGER">
              <DataEntryDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard/guest" element={
            <ProtectedRoute allowedRole="GUEST">
              <GuestDashboard />
            </ProtectedRoute>
          } />

          {/* 404 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
