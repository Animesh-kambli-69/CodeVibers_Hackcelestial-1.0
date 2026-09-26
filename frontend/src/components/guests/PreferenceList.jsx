import { Badge } from '../ui/Badge';

export function PreferenceList({ preferences = [] }) {
  if (!preferences || preferences.length === 0) {
    return <div style={{ color: '#66716C', fontSize: 13 }}>No stored preferences recorded.</div>;
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7', padding: 20 }}>
      <h3 style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 15,
        fontWeight: 700,
        color: '#17201C',
        margin: '0 0 14px'
      }}>
        Stored Guest Preferences
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {preferences.map((pref, idx) => {
          const sourceLabel = pref.source === 'EXPLICIT' ? 'Stated' : pref.source === 'HISTORY' ? 'From History' : 'Recorded';
          const badgeVariant = pref.source === 'EXPLICIT' ? 'brand' : 'muted';

          return (
            <div key={idx} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: 8,
              backgroundColor: '#F7F8F6',
              border: '1px solid #E5EAE7'
            }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#66716C', textTransform: 'uppercase' }}>
                  {pref.type}:{' '}
                </span>
                <span style={{ fontSize: 13.5, fontWeight: 600, color: '#17201C' }}>
                  {pref.value}
                </span>
              </div>
              <Badge variant={badgeVariant}>{sourceLabel}</Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PreferenceList;
