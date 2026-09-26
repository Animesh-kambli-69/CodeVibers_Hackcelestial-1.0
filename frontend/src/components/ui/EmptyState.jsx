import { Inbox } from 'lucide-react';

export function EmptyState({ message = 'No data available', action = null, icon: Icon = Inbox }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      textAlign: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      border: '1px border-dashed #E5EAE7'
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F0F7F4',
        color: '#167A65',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12
      }}>
        <Icon size={22} />
      </div>
      <p style={{
        fontSize: 14,
        fontWeight: 500,
        color: '#66716C',
        margin: '0 0 16px',
        maxWidth: 320
      }}>
        {message}
      </p>
      {action && (
        <div>{action}</div>
      )}
    </div>
  );
}

export default EmptyState;
