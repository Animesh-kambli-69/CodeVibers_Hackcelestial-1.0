import { useState, useEffect } from 'react';
import { DollarSign, ShieldCheck, RefreshCw } from 'lucide-react';

import AppShell from '../components/layout/AppShell';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import { Badge } from '../components/ui/Badge';
import { apiRequest } from '../lib/api';
import { formatCurrency, formatPercent, formatDelta } from '../lib/utils';

export default function ManagerPricing() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pricingList, setPricingList] = useState([]);

  const fetchPricing = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/manager/pricing-recommendations');
      setPricingList(res.data || []);
    } catch (err) {
      console.error('Failed to load pricing recommendations:', err);
      setError('Unable to load pricing recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  return (
    <AppShell role="manager" title="Dynamic Pricing Review">
      {/* Banner */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E5EAE7',
        padding: 20,
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: '#DDEBE5',
            color: '#167A65',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <DollarSign size={22} />
          </div>
          <div>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 700, color: '#17201C', margin: '0 0 2px' }}>
              Optimized ADR & Rate Recommendations
            </h2>
            <p style={{ fontSize: 13, color: '#66716C', margin: 0 }}>
              Suggestions derived from forecasted occupancy, booking pace, and room demand signals.
            </p>
          </div>
        </div>

        <button
          onClick={fetchPricing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid #E5EAE7',
            backgroundColor: '#FFFFFF',
            color: '#17201C',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Pricing
        </button>
      </div>

      {error ? (
        <ErrorState section="Pricing Recommendations" onRetry={fetchPricing} />
      ) : loading ? (
        <Skeleton height="320px" />
      ) : (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ backgroundColor: '#F7F8F6', borderBottom: '1px solid #E5EAE7', color: '#66716C', fontSize: 12 }}>
                  <th style={{ padding: '14px 16px' }}>Room Category</th>
                  <th style={{ padding: '14px 16px' }}>Current ADR</th>
                  <th style={{ padding: '14px 16px' }}>Suggested ADR</th>
                  <th style={{ padding: '14px 16px' }}>Rate Change</th>
                  <th style={{ padding: '14px 16px' }}>Pred. Occupancy</th>
                  <th style={{ padding: '14px 16px' }}>Demand Level</th>
                  <th style={{ padding: '14px 16px' }}>Recommendation Reason</th>
                </tr>
              </thead>
              <tbody>
                {pricingList.map((row) => (
                  <tr key={row.roomType} style={{ borderBottom: '1px solid #F0F2F1' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#17201C' }}>{row.roomType}</td>
                    <td style={{ padding: '14px 16px', color: '#66716C' }}>{formatCurrency(row.currentADR)}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#167A65' }}>{formatCurrency(row.suggestedADR)}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: row.changePct >= 0 ? '#167A65' : '#C95C5C' }}>
                      {formatDelta(row.changePct)}
                    </td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#17201C' }}>{formatPercent(row.predictedOccupancy)}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge variant={row.demandLevel === 'HIGH' ? 'risk-high' : row.demandLevel === 'MEDIUM' ? 'risk-medium' : 'muted'}>
                        {row.demandLevel}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#66716C', fontSize: 13 }}>{row.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Human-in-the-loop notice */}
      <div style={{
        marginTop: 20,
        padding: '12px 16px',
        backgroundColor: '#F7F8F6',
        borderRadius: 8,
        border: '1px solid #E5EAE7',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 12.5,
        color: '#66716C'
      }}>
        <ShieldCheck size={18} color="#167A65" style={{ flexShrink: 0 }} />
        <span>
          <strong>Suggestions only:</strong> Dynamic prices are presented for manager review and are never updated automatically in property management systems.
        </span>
      </div>
    </AppShell>
  );
}
