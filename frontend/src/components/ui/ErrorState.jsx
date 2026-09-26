import { AlertCircle, RefreshCw } from 'lucide-react';

export function ErrorState({ section = 'this section', onRetry }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      backgroundColor: '#FEF2F2',
      border: '1px solid #FECACA',
      borderRadius: 10,
      color: '#C95C5C',
      fontSize: 13.5,
      fontWeight: 500
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertCircle size={18} style={{ flexShrink: 0 }} />
        <span>Failed to load {section}. Other sections remain active.</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #FECACA',
            borderRadius: 6,
            color: '#C95C5C',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={13} />
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorState;
