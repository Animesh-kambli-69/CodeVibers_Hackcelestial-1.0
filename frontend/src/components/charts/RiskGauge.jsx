import { formatProbability } from '../../lib/utils';

export function RiskGauge({ probability = 0.84 }) {
  const pct = Math.round((probability || 0) * 100);

  let color = '#3F8F70'; // Low
  if (pct >= 70) color = '#C95C5C'; // High
  else if (pct >= 40) color = '#D89A32'; // Medium

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0' }}>
      <div style={{ position: 'relative', width: 120, height: 65, overflow: 'hidden' }}>
        {/* Semi-circle background */}
        <div style={{
          width: 120,
          height: 120,
          borderRadius: '50%',
          border: '12px solid #F0F2F1',
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent',
          transform: 'rotate(-45deg)',
          boxSizing: 'border-box'
        }} />

        {/* Semi-circle progress arc */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 120,
          height: 120,
          borderRadius: '50%',
          border: `12px solid ${color}`,
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent',
          transform: `rotate(${-45 + (pct / 100) * 180}deg)`,
          boxSizing: 'border-box',
          transition: 'transform 0.4s ease'
        }} />
      </div>

      <div style={{ marginTop: -20, textAlign: 'center' }}>
        <div style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {formatProbability(probability)}
        </div>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#66716C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Estimated Cancellation
        </div>
      </div>
    </div>
  );
}

export default RiskGauge;
