import { AlertTriangle } from 'lucide-react';

export function PredictionUnavailable({ compact = false }) {
  if (compact) {
    return <span style={{ color: '#66716C', fontStyle: 'italic' }}>—</span>;
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      backgroundColor: '#FFFBEB',
      border: '1px solid #FDE68A',
      borderRadius: 6,
      color: '#D89A32',
      fontSize: 12,
      fontWeight: 500
    }}>
      <AlertTriangle size={14} />
      <span>Predictions temporarily unavailable</span>
    </div>
  );
}

export default PredictionUnavailable;
