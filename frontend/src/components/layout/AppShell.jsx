import { useState } from 'react';
import Sidebar from '../Sidebar';
import TopBar from './TopBar';

export function AppShell({ children, role = 'manager', title = '' }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F7F8F6' }}>
      {/* Sidebar Navigation */}
      <Sidebar
        role={role}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <TopBar
          title={title}
          onMobileMenuOpen={() => setMobileOpen(true)}
        />
        <main style={{ flex: 1, padding: '24px 28px', maxWidth: 1440, width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppShell;
