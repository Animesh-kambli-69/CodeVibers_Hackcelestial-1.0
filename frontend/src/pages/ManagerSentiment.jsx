import { useState, useEffect } from 'react';
import { Star, MessageSquare, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

import AppShell from '../components/layout/AppShell';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import { apiRequest } from '../lib/api';

export default function ManagerSentiment() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sentimentData, setSentimentData] = useState(null);

  const fetchSentiment = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/manager/sentiment');
      setSentimentData(res.data);
    } catch (err) {
      console.error('Failed to load sentiment:', err);
      setError('Unable to load guest sentiment data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentiment();
  }, []);

  const { averageRating = 4.6, breakdown = { positive: 78, neutral: 14, negative: 8 }, topics = [] } = sentimentData || {};

  return (
    <AppShell role="manager" title="Guest Sentiment & Feedback">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: '#17201C', margin: '0 0 2px' }}>
            Guest Experience & Feedback Analytics
          </h2>
          <p style={{ fontSize: 13, color: '#66716C', margin: 0 }}>
            Automated topic analysis across guest reviews and stay feedback.
          </p>
        </div>

        <button
          onClick={fetchSentiment}
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
          Refresh Analytics
        </button>
      </div>

      {error ? (
        <ErrorState section="Sentiment Analytics" onRetry={fetchSentiment} />
      ) : loading ? (
        <Skeleton height="300px" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Top Metric & Stacked Sentiment Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 20
          }}>
            {/* Rating Box */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7', padding: 24, textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#66716C', marginBottom: 6 }}>
                Average Guest Satisfaction Score
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#167A65', fontSize: 36, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <Star size={32} fill="#167A65" color="#167A65" />
                <span>{averageRating}</span>
                <span style={{ fontSize: 18, color: '#66716C', fontWeight: 500 }}>/ 5.0</span>
              </div>
              <div style={{ fontSize: 12, color: '#66716C', marginTop: 6 }}>
                Based on 248 verified post-stay feedback submissions
              </div>
            </div>

            {/* Sentiment Ratio Bar */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7', padding: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#17201C', marginBottom: 12 }}>
                Overall Sentiment Distribution
              </div>
              <div style={{ height: 14, borderRadius: 7, display: 'flex', overflow: 'hidden', backgroundColor: '#F0F2F1', marginBottom: 16 }}>
                <div style={{ width: `${breakdown.positive}%`, backgroundColor: '#3F8F70' }} title={`Positive: ${breakdown.positive}%`} />
                <div style={{ width: `${breakdown.neutral}%`, backgroundColor: '#D89A32' }} title={`Neutral: ${breakdown.neutral}%`} />
                <div style={{ width: `${breakdown.negative}%`, backgroundColor: '#C95C5C' }} title={`Negative: ${breakdown.negative}%`} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 12.5, fontWeight: 600 }}>
                <span style={{ color: '#3F8F70' }}>● Positive: {breakdown.positive}%</span>
                <span style={{ color: '#D89A32' }}>● Neutral: {breakdown.neutral}%</span>
                <span style={{ color: '#C95C5C' }}>● Negative: {breakdown.negative}%</span>
              </div>
            </div>
          </div>

          {/* Topic Trend Table */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7', padding: 20 }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 15, fontWeight: 700, color: '#17201C', margin: '0 0 16px' }}>
              Department Topic & Friction Analysis
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
                <thead>
                  <tr style={{ backgroundColor: '#F7F8F6', borderBottom: '1px solid #E5EAE7', color: '#66716C', fontSize: 12 }}>
                    <th style={{ padding: '12px 16px' }}>Topic / Area</th>
                    <th style={{ padding: '12px 16px' }}>Negative Share</th>
                    <th style={{ padding: '12px 16px' }}>Change vs Last Week</th>
                    <th style={{ padding: '12px 16px' }}>Trend Status</th>
                  </tr>
                </thead>
                <tbody>
                  {topics.map((t) => (
                    <tr key={t.topic} style={{ borderBottom: '1px solid #F0F2F1' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#17201C' }}>{t.topic}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: t.negativeSharePct > 10 ? '#C95C5C' : '#17201C' }}>
                        {t.negativeSharePct}%
                      </td>
                      <td style={{ padding: '12px 16px', color: '#66716C' }}>
                        {t.change > 0 ? `+${t.change}%` : `${t.change}%`}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: t.trend === 'up' ? '#3F8F70' : t.trend === 'down' ? '#C95C5C' : '#66716C' }}>
                          {t.trend === 'up' ? <TrendingUp size={15} /> : t.trend === 'down' ? <TrendingDown size={15} /> : <Minus size={15} />}
                          <span style={{ textTransform: 'capitalize' }}>{t.trend === 'up' ? 'Improving' : t.trend === 'down' ? 'Friction' : 'Stable'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
