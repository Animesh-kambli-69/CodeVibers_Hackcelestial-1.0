import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import { AuthProvider, useAuth } from './AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ROLE_HOME } from './lib/constants';

import LoginPage from './pages/LoginPage';
import ForbiddenPage from './pages/ForbiddenPage';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerForecast from './pages/ManagerForecast';
import ManagerRecommendations from './pages/ManagerRecommendations';
import ManagerPricing from './pages/ManagerPricing';
import ManagerSentiment from './pages/ManagerSentiment';

import OperationsDashboard from './pages/OperationsDashboard';
import GuestList from './pages/GuestList';
import GuestProfile from './pages/GuestProfile';
import CancellationRisk from './pages/CancellationRisk';
import OperationsStaffing from './pages/OperationsStaffing';
import OperationsRequests from './pages/OperationsRequests';

import GuestHome from './pages/GuestHome';
import GuestConcierge from './pages/GuestConcierge';
import GuestProfilePage from './pages/GuestProfilePage';
import GuestRequests from './pages/GuestRequests';

import { DataEntryDashboard, GuestDashboard } from './pages/Dashboards';

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

          {/* ── Manager Role (P0 + P1) ── */}
          <Route path="/manager/dashboard" element={
            <ProtectedRoute allowedRole="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/manager/forecast" element={
            <ProtectedRoute allowedRole="manager">
              <ManagerForecast />
            </ProtectedRoute>
          } />
          <Route path="/manager/recommendations" element={
            <ProtectedRoute allowedRole="manager">
              <ManagerRecommendations />
            </ProtectedRoute>
          } />
          <Route path="/manager/pricing" element={
            <ProtectedRoute allowedRole="manager">
              <ManagerPricing />
            </ProtectedRoute>
          } />
          <Route path="/manager/sentiment" element={
            <ProtectedRoute allowedRole="manager">
              <ManagerSentiment />
            </ProtectedRoute>
          } />
          {/* Legacy fallback */}
          <Route path="/dashboard/manager" element={
            <ProtectedRoute allowedRole="manager">
              <ManagerDashboard />
            </ProtectedRoute>
          } />

          {/* ── Operations Role (P0 + P1) ── */}
          <Route path="/operations/dashboard" element={
            <ProtectedRoute allowedRole="data_entry">
              <OperationsDashboard />
            </ProtectedRoute>
          } />
          <Route path="/operations/guests" element={
            <ProtectedRoute allowedRole="data_entry">
              <GuestList />
            </ProtectedRoute>
          } />
          <Route path="/operations/guests/:guestId" element={
            <ProtectedRoute allowedRole="data_entry">
              <GuestProfile />
            </ProtectedRoute>
          } />
          <Route path="/operations/cancellations" element={
            <ProtectedRoute allowedRole="data_entry">
              <CancellationRisk />
            </ProtectedRoute>
          } />
          <Route path="/operations/staffing" element={
            <ProtectedRoute allowedRole="data_entry">
              <OperationsStaffing />
            </ProtectedRoute>
          } />
          <Route path="/operations/requests" element={
            <ProtectedRoute allowedRole="data_entry">
              <OperationsRequests />
            </ProtectedRoute>
          } />
          {/* Legacy fallback */}
          <Route path="/dashboard/data-entry" element={
            <ProtectedRoute allowedRole="data_entry">
              <DataEntryDashboard />
            </ProtectedRoute>
          } />

          {/* ── Guest Role (P0 + P1) ── */}
          <Route path="/guest/home" element={
            <ProtectedRoute allowedRole="guest">
              <GuestHome />
            </ProtectedRoute>
          } />
          <Route path="/guest/concierge" element={
            <ProtectedRoute allowedRole="guest">
              <GuestConcierge />
            </ProtectedRoute>
          } />
          <Route path="/guest/profile" element={
            <ProtectedRoute allowedRole="guest">
              <GuestProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/guest/requests" element={
            <ProtectedRoute allowedRole="guest">
              <GuestRequests />
            </ProtectedRoute>
          } />
          {/* Legacy fallback */}
          <Route path="/dashboard/guest" element={
            <ProtectedRoute allowedRole="guest">
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
