import { Sparkles } from 'lucide-react';

export function ForecastTag({ modelVersion }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      padding: '2px 8px',
      borderRadius: 4,
      backgroundColor: '#EEF0FB',
      border: '1px solid rgba(91, 99, 199, 0.25)',
      color: '#5B63C7',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '0.05em',
      textTransform: 'uppercase'
    }}>
      <Sparkles size={11} />
      FORECAST{modelVersion ? ` · ${modelVersion}` : ''}
    </span>
  );
}

export default ForecastTag;
