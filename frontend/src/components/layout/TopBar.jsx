import { useState, useEffect } from 'react';
import { Menu, Activity, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';
import { Tooltip } from '../ui/Tooltip';
import ChangePasswordModal from '../ChangePasswordModal';

export function TopBar({ onMobileMenuOpen, title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mlStatus, setMlStatus] = useState('ok'); // 'ok' | 'down'
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    // Simulated health check or API call
    setMlStatus('ok');
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = user?.role === 'manager'
    ? 'Resort Manager'
    : user?.role === 'data_entry'
    ? 'Operations Staff'
    : user?.role === 'guest'
    ? 'Guest'
    : 'User';

  return (
    <>
      <header style={{
        height: 64,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E5EAE7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {onMobileMenuOpen && (
            <button
              onClick={onMobileMenuOpen}
              className="md:hidden"
              style={{
                background: 'none',
                border: 'none',
                padding: 6,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: '#17201C'
              }}
              aria-label="Open Navigation Menu"
            >
              <Menu size={22} />
            </button>
          )}

          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 18,
            fontWeight: 700,
            color: '#17201C',
            margin: 0,
          }}>
            {title || 'Smart Resort 360'}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* ML Status Indicator */}
          <Tooltip content={mlStatus === 'ok' ? 'ML Engine Connected & Operational' : 'Predictions Temporarily Unavailable'}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              borderRadius: 20,
              backgroundColor: mlStatus === 'ok' ? '#F0F7F4' : '#FFFBEB',
              border: `1px solid ${mlStatus === 'ok' ? '#DDEBE5' : '#FDE68A'}`,
              fontSize: 12,
              fontWeight: 600,
              color: mlStatus === 'ok' ? '#167A65' : '#D89A32',
            }}>
              <Activity size={13} />
              <span>ML ● {mlStatus === 'ok' ? 'Active' : 'Degraded'}</span>
            </div>
          </Tooltip>

          {/* Role Badge */}
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 6,
            backgroundColor: '#F7F8F6',
            border: '1px solid #E5EAE7',
            color: '#66716C',
          }}>
            {roleLabel}
          </span>

          {/* User Profile / Change Password Trigger */}
          <button 
            onClick={() => setIsPasswordModalOpen(true)}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer',
              padding: '4px 8px', borderRadius: 8, transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F0F7F4'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Click to change password"
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#167A65',
              color: '#FFFFFF',
              fontWeight: 700,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden sm:block" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#17201C', lineHeight: 1.2 }}>
                {user?.name || 'Authorized User'}
              </div>
              <div style={{ fontSize: 11, color: '#66716C', lineHeight: 1.2 }}>
                {user?.email || 'user@resort360.ai'}
              </div>
            </div>
          </button>

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 8,
              backgroundColor: '#FEF2F2',
              border: '1px solid #FEE2E2',
              color: '#DC2626',
              fontSize: 12.5,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FEE2E2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FEF2F2';
            }}
            title="Sign Out of Session"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <ChangePasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </>
  );
}

export default TopBar;
