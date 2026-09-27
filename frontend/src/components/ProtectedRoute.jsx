import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export function ProtectedRoute({ children, allowedRole }) {
  const { user, checkingSession } = useAuth();
  const location = useLocation();

  // Wait for the /auth/me session validation (AuthContext) to resolve before
  // deciding to redirect — otherwise a valid, still-loading session briefly
  // flashes to the login page on every hard refresh.
  if (checkingSession) {
    return null;
  }

  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
}

export default ProtectedRoute;
