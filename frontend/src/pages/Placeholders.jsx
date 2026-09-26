import AppShell from '../components/layout/AppShell';
import GuestLayout from '../components/layout/GuestLayout';

export function ManagerPlaceholder({ title, description }) {
  return (
    <AppShell role="manager" title={title}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E5EAE7',
        padding: 40,
        textAlign: 'center',
        marginTop: 24
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#17201C', marginBottom: 8 }}>
          {title}
        </h2>
        <p style={{ color: '#66716C', fontSize: 14, margin: 0 }}>
          {description || 'This screen will be fully implemented in the upcoming phase.'}
        </p>
      </div>
    </AppShell>
  );
}

export function OperationsPlaceholder({ title, description }) {
  return (
    <AppShell role="data_entry" title={title}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E5EAE7',
        padding: 40,
        textAlign: 'center',
        marginTop: 24
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#17201C', marginBottom: 8 }}>
          {title}
        </h2>
        <p style={{ color: '#66716C', fontSize: 14, margin: 0 }}>
          {description || 'This screen will be fully implemented in the upcoming phase.'}
        </p>
      </div>
    </AppShell>
  );
}

export function GuestPlaceholder({ title, description }) {
  return (
    <GuestLayout title={title}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E5EAE7',
        padding: 32,
        textAlign: 'center',
        marginTop: 16
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#17201C', marginBottom: 8 }}>
          {title}
        </h2>
        <p style={{ color: '#66716C', fontSize: 13.5, margin: 0 }}>
          {description || 'This screen will be fully implemented in the upcoming phase.'}
        </p>
      </div>
    </GuestLayout>
  );
}
