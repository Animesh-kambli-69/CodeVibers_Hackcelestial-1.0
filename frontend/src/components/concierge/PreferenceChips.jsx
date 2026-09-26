import { Sparkles } from 'lucide-react';

export function PreferenceChips({ preferences = [] }) {
  if (!preferences || preferences.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap',
      marginBottom: 12,
      padding: '8px 12px',
      backgroundColor: '#EEF0FB',
      borderRadius: 10,
      border: '1px solid rgba(91,99,199,0.2)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, fontWeight: 700, color: '#5B63C7', textTransform: 'uppercase' }}>
        <Sparkles size={13} />
        <span>Personalised for you:</span>
      </div>
      {preferences.map((p, i) => (
        <span
          key={i}
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 12,
            backgroundColor: '#FFFFFF',
            color: '#5B63C7',
            border: '1px solid rgba(91,99,199,0.3)'
          }}
        >
          {typeof p === 'string' ? p : p.value}
        </span>
      ))}
    </div>
  );
}

export default PreferenceChips;
