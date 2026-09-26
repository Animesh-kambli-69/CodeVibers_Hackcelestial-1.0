import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { ROLE_HOME } from '../lib/constants';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoHome = () => {
    if (user?.role && ROLE_HOME[user.role]) {
      navigate(ROLE_HOME[user.role]);
    } else {
      navigate('/login');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F7F8F6',
      padding: 24,
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{
        maxWidth: 420,
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid #E5EAE7',
        padding: 32,
        textAlign: 'center',
        boxShadow: '0 10px 30px -10px rgba(23, 32, 28, 0.05)'
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#FEF2F2',
          color: '#C95C5C',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <ShieldAlert size={28} />
        </div>

        <h1 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 22,
          fontWeight: 700,
          color: '#17201C',
          margin: '0 0 8px'
        }}>
          Access Restricted
        </h1>

        <p style={{
          fontSize: 14,
          color: '#66716C',
          margin: '0 0 24px',
          lineHeight: 1.5
        }}>
          You don't have authorization to view this page under your current role.
        </p>

        <button
          onClick={handleGoHome}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            height: 44,
            borderRadius: 10,
            backgroundColor: '#167A65',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: 14,
            border: 'none',
            cursor: 'pointer',
            transition: 'background 0.15s ease'
          }}
        >
          <ArrowLeft size={16} />
          Return to My Workspace
        </button>
      </div>
    </div>
  );
}
