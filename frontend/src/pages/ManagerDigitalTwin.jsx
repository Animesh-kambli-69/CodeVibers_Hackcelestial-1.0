import { useState, useEffect } from 'react';
import { CloudRain, Wind, Thermometer, AlertTriangle, RefreshCcw, Activity } from 'lucide-react';
import AppShell from '../components/layout/AppShell';
import { apiRequest } from '../lib/api';

export default function ManagerDigitalTwin() {
  const [loading, setLoading] = useState(true);
  const [twinState, setTwinState] = useState(null);
  const [error, setError] = useState(null);

  const fetchTwinState = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest('/manager/digital-twin/state');
      setTwinState(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch Digital Twin state');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTwinState();
  }, []);

  return (
    <AppShell role="RESORT_MANAGER" title="Digital Twin & Environment">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: '#17201C' }}>Weather & Digital Twin</h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: '#66716C' }}>
            Live environment data and operational impact analysis.
          </p>
        </div>
        <button 
          onClick={fetchTwinState}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 8, border: '1px solid #E5EAE7',
            background: 'white', color: '#17201C', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          <RefreshCcw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh Data
        </button>
      </div>

      {error && (
        <div style={{ padding: 16, background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 8, color: '#C95C5C', marginBottom: 24 }}>
          {error}
        </div>
      )}

      {loading && !twinState ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#66716C' }}>Loading Digital Twin state...</div>
      ) : twinState ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* Current Weather Card */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5EAE7', padding: 24 }}>
            <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#17201C', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CloudRain size={20} color="#167A65" /> Current Weather Conditions
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div style={{ padding: 16, background: '#F7F8F6', borderRadius: 8 }}>
                <div style={{ fontSize: 13, color: '#66716C', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Thermometer size={16} /> Temperature
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#17201C', marginTop: 8 }}>
                  {twinState.weather?.current?.temperatureC ?? '--'}°C
                </div>
                <div style={{ fontSize: 13, color: '#66716C', marginTop: 4 }}>
                  Feels like {twinState.weather?.current?.feelsLikeC ?? '--'}°C
                </div>
              </div>
              
              <div style={{ padding: 16, background: '#F7F8F6', borderRadius: 8 }}>
                <div style={{ fontSize: 13, color: '#66716C', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Wind size={16} /> Wind Speed
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#17201C', marginTop: 8 }}>
                  {twinState.weather?.current?.windSpeedKmh ?? '--'} <span style={{fontSize: 16}}>km/h</span>
                </div>
              </div>
              
              <div style={{ padding: 16, background: '#F7F8F6', borderRadius: 8 }}>
                <div style={{ fontSize: 13, color: '#66716C', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CloudRain size={16} /> Precipitation
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#17201C', marginTop: 8 }}>
                  {twinState.weather?.current?.precipitationMm ?? '0'} <span style={{fontSize: 16}}>mm</span>
                </div>
              </div>

              <div style={{ padding: 16, background: '#F7F8F6', borderRadius: 8 }}>
                <div style={{ fontSize: 13, color: '#66716C', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Activity size={16} /> Condition
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#17201C', marginTop: 8 }}>
                  {twinState.weather?.current?.condition ?? 'Clear'}
                </div>
              </div>
            </div>
          </div>

          {/* Forecast & Operations Impact */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5EAE7', padding: 24 }}>
              <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#17201C' }}>7-Day Forecast</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(twinState.weather?.forecast || []).map((day, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i === 6 ? 'none' : '1px solid #F0F7F4' }}>
                    <div style={{ width: 100, fontWeight: 600, color: '#17201C' }}>
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </div>
                    <div style={{ flex: 1, color: '#66716C', fontSize: 14 }}>{day.condition}</div>
                    <div style={{ width: 80, textAlign: 'right', fontWeight: 700, color: '#17201C' }}>
                      {day.temperatureMaxC}° / <span style={{color: '#66716C', fontWeight: 500}}>{day.temperatureMinC}°</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #E5EAE7', padding: 24 }}>
              <h2 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600, color: '#17201C' }}>Operational Impact</h2>
              
              {twinState.impacts && twinState.impacts.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {twinState.impacts.map((impact, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, padding: 16, background: '#FFFBEB', border: '1px solid #FEF3C7', borderRadius: 8 }}>
                      <AlertTriangle size={20} color="#B45309" style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: 600, color: '#92400E', fontSize: 14 }}>{impact.category || 'Warning'}</div>
                        <div style={{ color: '#B45309', fontSize: 13, marginTop: 4 }}>{impact.description || impact.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: 32, textAlign: 'center', background: '#F0F7F4', borderRadius: 8, color: '#167A65' }}>
                  <Activity size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                  <div style={{ fontWeight: 600 }}>Normal Operations</div>
                  <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>No significant weather disruptions predicted.</div>
                </div>
              )}

              <h2 style={{ margin: '24px 0 16px', fontSize: 16, fontWeight: 600, color: '#17201C' }}>Social Signals</h2>
              {twinState.socialSignals && twinState.socialSignals.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {twinState.socialSignals.map((sig, i) => (
                    <div key={i} style={{ fontSize: 13, padding: 12, border: '1px solid #E5EAE7', borderRadius: 8 }}>
                      <span style={{ fontWeight: 600, color: '#17201C', marginRight: 8 }}>@{sig.platform}</span>
                      <span style={{ color: '#66716C' }}>{sig.content}</span>
                      <div style={{ marginTop: 6, fontSize: 11, color: sig.sentiment === 'positive' ? '#16A34A' : sig.sentiment === 'negative' ? '#DC2626' : '#66716C', textTransform: 'uppercase', fontWeight: 600 }}>
                        {sig.sentiment}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#66716C', padding: 16, border: '1px dashed #E5EAE7', borderRadius: 8, textAlign: 'center' }}>
                  No recent social signals found.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
