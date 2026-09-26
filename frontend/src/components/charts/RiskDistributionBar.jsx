export function RiskDistributionBar({ distribution = { high: 17, medium: 28, low: 97 }, onSegmentClick }) {
  const total = (distribution.high || 0) + (distribution.medium || 0) + (distribution.low || 0);
  if (total === 0) return null;

  const highPct = ((distribution.high / total) * 100).toFixed(1);
  const medPct = ((distribution.medium / total) * 100).toFixed(1);
  const lowPct = ((distribution.low / total) * 100).toFixed(1);

  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7', padding: 20 }}>
      <h3 style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 15,
        fontWeight: 700,
        color: '#17201C',
        margin: '0 0 14px'
      }}>
        Cancellation Risk Cohorts
      </h3>

      {/* Segmented Bar */}
      <div style={{
        height: 14,
        borderRadius: 7,
        display: 'flex',
        overflow: 'hidden',
        backgroundColor: '#F0F2F1',
        marginBottom: 16
      }}>
        <div
          onClick={() => onSegmentClick && onSegmentClick('HIGH')}
          title={`High Risk: ${distribution.high} guests (${highPct}%)`}
          style={{
            width: `${highPct}%`,
            backgroundColor: '#C95C5C',
            cursor: 'pointer',
            transition: 'opacity 0.15s'
          }}
        />
        <div
          onClick={() => onSegmentClick && onSegmentClick('MEDIUM')}
          title={`Medium Risk: ${distribution.medium} guests (${medPct}%)`}
          style={{
            width: `${medPct}%`,
            backgroundColor: '#D89A32',
            cursor: 'pointer',
            transition: 'opacity 0.15s'
          }}
        />
        <div
          onClick={() => onSegmentClick && onSegmentClick('LOW')}
          title={`Low Risk: ${distribution.low} guests (${lowPct}%)`}
          style={{
            width: `${lowPct}%`,
            backgroundColor: '#3F8F70',
            cursor: 'pointer',
            transition: 'opacity 0.15s'
          }}
        />
      </div>

      {/* Legend & Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textTransform: 'capitalize' }}>
        <div
          onClick={() => onSegmentClick && onSegmentClick('HIGH')}
          style={{ cursor: 'pointer', padding: 8, borderRadius: 6, backgroundColor: '#FEF2F2', border: '1px solid rgba(201,92,92,0.2)' }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#C95C5C' }}>● HIGH RISK</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#17201C', marginTop: 2 }}>{distribution.high}</div>
          <div style={{ fontSize: 11, color: '#66716C' }}>{highPct}% of total</div>
        </div>

        <div
          onClick={() => onSegmentClick && onSegmentClick('MEDIUM')}
          style={{ cursor: 'pointer', padding: 8, borderRadius: 6, backgroundColor: '#FFFBEB', border: '1px solid rgba(216,154,50,0.2)' }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#D89A32' }}>● MEDIUM RISK</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#17201C', marginTop: 2 }}>{distribution.medium}</div>
          <div style={{ fontSize: 11, color: '#66716C' }}>{medPct}% of total</div>
        </div>

        <div
          onClick={() => onSegmentClick && onSegmentClick('LOW')}
          style={{ cursor: 'pointer', padding: 8, borderRadius: 6, backgroundColor: '#F0F7F4', border: '1px solid rgba(63,143,112,0.2)' }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#3F8F70' }}>● LOW RISK</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#17201C', marginTop: 2 }}>{distribution.low}</div>
          <div style={{ fontSize: 11, color: '#66716C' }}>{lowPct}% of total</div>
        </div>
      </div>
    </div>
  );
}

export default RiskDistributionBar;
