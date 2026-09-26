import { useLocation, useNavigate } from 'react-router-dom';
import { Home, MessageSquareText, User } from 'lucide-react';

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { label: 'Home', path: '/guest/home', icon: Home },
    { label: 'Concierge', path: '/guest/concierge', icon: MessageSquareText },
    { label: 'Profile', path: '/guest/profile', icon: User },
  ];

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
      backgroundColor: '#FFFFFF',
      borderTop: '1px solid #E5EAE7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 50,
      boxShadow: '0 -4px 12px rgba(23, 32, 28, 0.04)',
    }}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: isActive ? '#167A65' : '#66716C',
              fontWeight: isActive ? 600 : 500,
              fontSize: 11.5,
              fontFamily: "'Inter', sans-serif",
              transition: 'color 0.15s ease',
            }}
          >
            <Icon size={19} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default BottomNav;
