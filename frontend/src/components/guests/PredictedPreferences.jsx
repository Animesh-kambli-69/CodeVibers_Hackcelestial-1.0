import { Sparkles, Info } from 'lucide-react';
import { formatProbability } from '../../lib/utils';
import { ForecastTag } from '../ui/ForecastTag';

export function PredictedPreferences({ predictions = [], status = 'AVAILABLE' }) {
  if (status === 'UNAVAILABLE' || !predictions || predictions.length === 0) {
    return (
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7', padding: 20 }}>
        <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700, color: '#17201C', margin: '0 0 10px' }}>
          Predicted Preferences ✦ ML
        </h3>
        <p style={{ color: '#66716C', fontSize: 13, fontStyle: 'italic', margin: 0 }}>
          Preference predictions unavailable for this guest profile.
        </p>
      </div>
    );
  }

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
          Predicted Preferences
        </h3>
        <ForecastTag />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {predictions.map((p, idx) => {
          const pct = Math.round((p.probability || 0) * 100);
          return (
            <div key={idx}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: '#17201C', marginBottom: 4 }}>
                <span>{p.type}: {p.value}</span>
                <span style={{ color: '#5B63C7' }}>{formatProbability(p.probability)}</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, backgroundColor: '#EEF0FB', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${pct}%`,
                  backgroundColor: '#5B63C7',
                  borderRadius: 3
                }} />
              </div>
            </div>
          );
        })}

        {/* ML v1 Disclaimer note */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#66716C', marginTop: 4 }}>
          <Info size={13} color="#5B63C7" />
          <span>ML v1 predicts Room & Dining preferences only. Activity predictions coming in v2.</span>
        </div>
      </div>
    </div>
  );
}

export default PredictedPreferences;
