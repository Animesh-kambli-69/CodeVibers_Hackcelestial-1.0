import TopBar from './TopBar';
import BottomNav from './BottomNav';

export function GuestLayout({ children, title = 'Resort Guest Portal' }) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F8F6', paddingBottom: 72 }}>
      <TopBar title={title} />
      <main style={{ maxWidth: 640, width: '100%', margin: '0 auto', padding: '16px 16px 24px' }}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}

export default GuestLayout;
