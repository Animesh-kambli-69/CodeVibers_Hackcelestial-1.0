import RiskGauge from '../charts/RiskGauge';
import { AlertCircle } from 'lucide-react';

export function CancellationRiskCard({ cancellation }) {
  if (!cancellation) return null;

  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h3 style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontSize: 15,
          fontWeight: 700,
          color: '#17201C',
          margin: 0
        }}>
          Cancellation Risk Analysis
        </h3>
        <span style={{ fontSize: 11, color: '#66716C', fontStyle: 'italic' }}>
          Estimated probability — not certain
        </span>
      </div>

      <RiskGauge probability={cancellation.probability} />

      {/* Factors List */}
      {cancellation.factors && cancellation.factors.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#17201C', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Primary Risk Factors:
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: '#66716C', lineHeight: 1.6 }}>
            {cancellation.factors.map((factor, idx) => (
              <li key={idx} style={{ marginBottom: 4 }}>
                {factor}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CancellationRiskCard;
