import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export function ProtectedRoute({ children, allowedRole }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
}

export default ProtectedRoute;
