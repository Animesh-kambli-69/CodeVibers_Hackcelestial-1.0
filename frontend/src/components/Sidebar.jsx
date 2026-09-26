import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, Sparkles, Users, AlertTriangle,
  DollarSign, MessageSquare, UserCheck, ClipboardList,
  Settings, HelpCircle, LogOut, X, Lightbulb
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { NAV_ITEMS, FEATURE_FLAGS } from '../lib/constants';

const ICON_MAP = {
  LayoutDashboard,
  TrendingUp,
  Sparkles,
  Users,
  AlertTriangle,
  DollarSign,
  MessageSquare,
  UserCheck,
  ClipboardList,
  Lightbulb
};

const BOTTOM_NAV = [
  { label: 'Settings', icon: Settings, path: '/settings' },
  { label: 'Help & Docs', icon: HelpCircle, path: '/help' },
];

/* ─── Brand Logo ─── */
function SidebarLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '24px 20px 20px' }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8,
        background: '#167A65',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
          <path d="M9 2L14.5 5.5V12.5L9 16L3.5 12.5V5.5L9 2Z" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
          <circle cx="9" cy="9" r="2" fill="white"/>
        </svg>
      </div>
      <span style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontWeight: 700, fontSize: 15, color: '#17201C',
        letterSpacing: '-0.2px', lineHeight: 1,
      }}>
        Smart Resort 360
      </span>
    </div>
  );
}

/* ─── Nav Item ─── */
function NavItem({ item, isActive, onClick }) {
  const [hover, setHover] = useState(false);
  const Icon = (typeof item.icon === 'string' ? ICON_MAP[item.icon] : item.icon) || LayoutDashboard;

  return (
    <button
      onClick={() => onClick(item.path)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '8px 12px',
        background: isActive ? '#DDEBE5' : hover ? '#F0F7F4' : 'transparent',
        border: 'none', borderRadius: 8,
        cursor: 'pointer',
        color: isActive ? '#167A65' : '#66716C',
        fontFamily: "'Inter', sans-serif",
        fontSize: 13.5, fontWeight: isActive ? 600 : 500,
        textAlign: 'left',
        transition: 'all 0.15s ease',
        letterSpacing: '0.01em',
      }}
    >
      <Icon size={16} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.isP1 && (
        <span style={{
          fontSize: 9.5,
          fontWeight: 700,
          padding: '1px 5px',
          borderRadius: 4,
          backgroundColor: '#EEF0FB',
          color: '#5B63C7',
          textTransform: 'uppercase'
        }}>
          P1
        </span>
      )}
    </button>
  );
}

/* ─── Sidebar Component ─── */
export default function Sidebar({ role, mobileOpen, onMobileClose }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const currentRole = role || user?.role || 'manager';

  let rawNavItems = NAV_ITEMS.RESORT_MANAGER;
  if (currentRole === 'data_entry') {
    rawNavItems = NAV_ITEMS.OPERATIONS_MANAGER;
  }

  // Filter out P1 items unless FEATURE_FLAGS.SHOW_P1_NAV is enabled
  const navItems = rawNavItems.filter((item) => !item.isP1 || FEATURE_FLAGS.SHOW_P1_NAV);

  const handleNav = (path) => {
    navigate(path);
    if (onMobileClose) onMobileClose();
  };

  const sidebarContent = (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#FFFFFF',
      borderRight: '1px solid #E5EAE7',
    }}>
      <SidebarLogo />
      <div style={{ height: 1, background: '#E5EAE7', margin: '0 16px' }} />

      {/* Nav List */}
      <nav style={{ flex: 1, padding: '16px 8px', overflowY: 'auto' }}>
        <div style={{
          fontSize: 10.5, fontWeight: 600,
          color: '#B0BAB5', letterSpacing: '0.08em',
          textTransform: 'uppercase',
          padding: '0 12px', marginBottom: 8,
        }}>
          {currentRole === 'data_entry' ? 'Operations Workspace' : 'Resort Management'}
        </div>
        {navItems.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            isActive={location.pathname === item.path}
            onClick={handleNav}
          />
        ))}
      </nav>

      {/* Bottom Actions */}
      <div style={{ padding: '8px 8px', borderTop: '1px solid #E5EAE7' }}>
        {BOTTOM_NAV.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            isActive={false}
            onClick={handleNav}
          />
        ))}
        <LogoutButton onLogout={() => { logout(); navigate('/login'); }} />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{
        width: 230, flexShrink: 0, height: '100vh',
        position: 'sticky', top: 0,
      }} className="sidebar-desktop">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50,
            display: 'flex',
          }}
          onClick={onMobileClose}
        >
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(23,32,28,0.4)' }}
          />
          <aside
            style={{
              position: 'relative', zIndex: 1,
              width: 250, height: '100%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'absolute', top: 12, right: -40 }}>
              <button
                onClick={onMobileClose}
                style={{
                  background: 'white', border: 'none', borderRadius: 8,
                  padding: 6, cursor: 'pointer', display: 'flex',
                }}
              >
                <X size={18} color="#17201C" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
        }
      `}</style>
    </>
  );
}

function LogoutButton({ onLogout }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onLogout}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        width: '100%', padding: '8px 12px',
        background: hover ? '#FEF2F2' : 'transparent',
        border: 'none', borderRadius: 8, cursor: 'pointer',
        color: hover ? '#C95C5C' : '#66716C',
        fontFamily: "'Inter', sans-serif",
        fontSize: 13.5, fontWeight: 500, textAlign: 'left',
        transition: 'all 0.15s ease',
      }}
    >
      <LogOut size={16} />
      Sign Out
    </button>
  );
}
