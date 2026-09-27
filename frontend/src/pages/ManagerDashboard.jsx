import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Sparkles, Lightbulb } from 'lucide-react';

import AppShell from '../components/layout/AppShell';
import OccupancyAreaChart from '../components/charts/OccupancyAreaChart';
import RoomDemandBarChart from '../components/charts/RoomDemandBarChart';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { apiRequest } from '../lib/api';
import { formatPercent, formatProbability, titleCaseEnum } from '../lib/utils';

const C = {
  bg: '#F7F8F6', surface: '#FFFFFF',
  text: '#17201C', sub: '#66716C',
  border: '#E5EAE7', emerald: '#167A65',
  emeraldSoft: '#DDEBE5', emeraldLight: '#F0F7F4',
  indigo: '#5B63C7', indigoSoft: '#EEF0FB',
  warning: '#D89A32', critical: '#C95C5C',
  success: '#3F8F70',
};

function card(extra = {}) {
  return {
    background: C.surface, borderRadius: 12,
    border: `1px solid ${C.border}`,
    boxShadow: '0 1px 4px rgba(23,32,28,0.05)',
    ...extra,
  };
}

/* ─── KPI Cards ─── */
function KpiCard({ label, value, sub, badge, badgeColor, badgeBg, trendColor, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      style={{
        ...card(), padding: '18px 20px',
        transition: 'transform 0.15s, box-shadow 0.15s',
        transform: hover ? 'translateY(-2px)' : 'none',
        boxShadow: hover
          ? '0 6px 20px rgba(23,32,28,0.08)'
          : '0 1px 4px rgba(23,32,28,0.05)',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: C.sub, letterSpacing: '0.02em' }}>{label}</span>
        {badge && (
          <span style={{
            fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', padding: '2px 7px', borderRadius: 20,
            background: badgeBg || C.indigoSoft, color: badgeColor || C.indigo,
            border: `1px solid ${badgeColor ? badgeColor + '40' : '#5B63C740'}`,
          }}>
            {badge}
          </span>
        )}
      </div>
      <div style={{
        fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700,
        fontSize: 'clamp(26px,2.8vw,34px)', color: C.text,
        lineHeight: 1, marginBottom: 8, letterSpacing: '-0.5px',
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 12.5, color: trendColor || C.sub, fontWeight: 500 }}>{sub}</div>
      )}
    </div>
  );
}

function KpiGrid({ kpis, recommendationCount, highPriorityCount }) {
  const navigate = useNavigate();
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))',
      gap: 14, marginBottom: 28,
    }}>
      <KpiCard label="Current Occupancy" value={formatPercent(kpis.currentOccupancy)} sub={`${kpis.totalRooms} rooms total`} />
      <KpiCard
        label="Predicted Occupancy"
        value={formatPercent(kpis.avgPredictedOccupancy)}
        sub="Next 7 days"
        badge="FORECAST"
        badgeColor={C.indigo}
        badgeBg={C.indigoSoft}
        onClick={() => navigate('/manager/forecast')}
      />
      <KpiCard label="Upcoming Bookings" value={kpis.upcomingBookings} sub="Next 30 days" />
      <KpiCard label="Booking Demand" value={titleCaseEnum(kpis.bookingDemand)} trendColor={C.emerald} />
      <KpiCard
        label="High Cancellation Risk"
        value={kpis.highRiskCancellationCount}
        sub="Require attention"
        trendColor={C.critical}
        onClick={() => navigate('/manager/recommendations?category=CANCELLATION')}
      />
      <KpiCard
        label="AI Recommendations"
        value={recommendationCount}
        sub={highPriorityCount > 0 ? `${highPriorityCount} high priority` : 'None pending'}
        badge="AI"
        badgeColor={C.indigo}
        badgeBg={C.indigoSoft}
        trendColor={C.indigo}
        onClick={() => navigate('/manager/recommendations')}
      />
    </div>
  );
}

/* ─── AI Insights (real, plain-text templates from insightService) ─── */
function AiInsightsPanel({ insights }) {
  return (
    <div style={{ ...card(), padding: '22px 20px', flex: '0 0 300px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <Sparkles size={15} color={C.indigo} />
        <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 15.5, color: C.text, margin: 0 }}>
          AI Insights
        </h3>
      </div>
      <p style={{ margin: '0 0 12px', fontSize: 12.5, color: C.sub }}>
        What the intelligence layer is noticing.
      </p>
      {insights.length === 0 ? (
        <p style={{ fontSize: 12.5, color: C.sub }}>No notable conditions right now.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {insights.map((text, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', paddingBottom: 10, borderBottom: i < insights.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <Lightbulb size={14} color={C.indigo} style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: 12.5, color: C.text, lineHeight: 1.5 }}>{text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Donut Chart (real cancellation risk counts) ─── */
function DonutChart({ summary }) {
  const { highRiskCount = 0, mediumRiskCount = 0, lowRiskCount = 0, totalEvaluated = 0 } = summary || {};
  const cx = 80, cy = 80, r = 60, stroke = 22;
  const slices = [
    { label: 'Low Risk', value: lowRiskCount, color: C.success },
    { label: 'Medium Risk', value: mediumRiskCount, color: C.warning },
    { label: 'High Risk', value: highRiskCount, color: C.critical },
  ];
  const circ = 2 * Math.PI * r;

  return (
    <div style={{ ...card(), padding: '22px 20px' }}>
      <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 15.5, color: C.text, margin: '0 0 4px' }}>
        Cancellation Risk
      </h3>
      <p style={{ margin: '0 0 18px', fontSize: 12.5, color: C.sub }}>Distribution across upcoming bookings.</p>

      {totalEvaluated === 0 ? (
        <p style={{ fontSize: 12.5, color: C.sub }}>No upcoming bookings to evaluate.</p>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg width={160} height={160} viewBox="0 0 160 160">
              {slices.reduce((acc, s) => {
                const pct = s.value / totalEvaluated;
                const dashLen = pct * circ;
                const offset = acc.offset;
                acc.nodes.push(
                  <circle key={s.label} cx={cx} cy={cy} r={r}
                    fill="none" stroke={s.color} strokeWidth={stroke}
                    strokeDasharray={`${dashLen} ${circ - dashLen}`}
                    strokeDashoffset={-circ * offset + circ / 4}
                    strokeLinecap="butt"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px', transition: 'all 0.3s' }}
                  />
                );
                acc.offset += pct;
                return acc;
              }, { offset: 0, nodes: [] }).nodes}
              <text x={cx} y={cy - 8} textAnchor="middle" fontSize="22" fontWeight="700" fill={C.critical} fontFamily="'Plus Jakarta Sans',sans-serif">
                {highRiskCount}
              </text>
              <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill={C.sub}>High Risk</text>
            </svg>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {slices.map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{s.label}</span>
                <span style={{ fontSize: 13, color: C.sub, marginLeft: 'auto', paddingLeft: 12 }}>{s.value}</span>
              </div>
            ))}
            <p style={{ margin: '6px 0 0', fontSize: 12, color: C.sub, lineHeight: 1.5 }}>
              {totalEvaluated} bookings evaluated · {highRiskCount} require attention.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Recommendations Preview ─── */
const PRIORITY_COLORS = {
  CRITICAL: { color: C.critical, bg: '#FEF2F2' },
  HIGH: { color: C.critical, bg: '#FEF2F2' },
  MEDIUM: { color: C.warning, bg: '#FFFBEB' },
  LOW: { color: C.emerald, bg: C.emeraldSoft },
};

function RecommendationPreviewCard({ rec, onReview }) {
  const [hover, setHover] = useState(false);
  const colors = PRIORITY_COLORS[rec.priority] || PRIORITY_COLORS.LOW;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...card(),
        padding: '20px',
        borderTop: `3px solid ${colors.color}`,
        transition: 'transform 0.15s, box-shadow 0.15s',
        transform: hover ? 'translateY(-2px)' : 'none',
        boxShadow: hover ? '0 8px 24px rgba(23,32,28,0.09)' : '0 1px 4px rgba(23,32,28,0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', padding: '2px 8px', borderRadius: 20,
          background: colors.bg, color: colors.color,
        }}>
          {rec.priority}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Sparkles size={10} color={C.indigo} />
          <span style={{ fontSize: 11, color: C.indigo, fontWeight: 600 }}>{formatProbability(rec.confidence)} confidence</span>
        </div>
      </div>

      <h4 style={{
        fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700,
        fontSize: 14.5, color: C.text, margin: '0 0 6px', letterSpacing: '-0.1px',
      }}>
        {rec.title}
      </h4>
      <p style={{ margin: '0 0 10px', fontSize: 13, color: C.sub, lineHeight: 1.55 }}>
        {rec.reason}
      </p>

      <div style={{
        padding: '8px 12px', background: '#F7F8F6',
        borderRadius: 7, marginBottom: 14,
        borderLeft: `3px solid ${colors.color}`,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: colors.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Suggested action
        </span>
        <p style={{ margin: '2px 0 0', fontSize: 12.5, color: C.text }}>{rec.suggestedAction}</p>
      </div>

      <button
        onClick={onReview}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'none', border: `1.5px solid ${C.border}`,
          borderRadius: 8, padding: '7px 14px',
          cursor: 'pointer', fontSize: 13, fontWeight: 600, color: C.text,
          transition: 'all 0.15s',
          ...(hover ? { borderColor: C.emerald, color: C.emerald, background: C.emeraldLight } : {}),
        }}
      >
        Review →
      </button>
    </div>
  );
}

function RecommendationsSection({ recommendations }) {
  const navigate = useNavigate();
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{
          fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700,
          fontSize: 17, color: C.text, margin: 0,
        }}>
          Recommended Actions
        </h2>
        <p style={{ margin: '3px 0 0', fontSize: 13, color: C.sub }}>
          Actions generated from current resort conditions.
        </p>
      </div>
      {recommendations.length === 0 ? (
        <EmptyState message="No active recommendations right now." />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
          gap: 16,
        }}>
          {recommendations.map(rec => (
            <RecommendationPreviewCard key={rec.id} rec={rec} onReview={() => navigate('/manager/recommendations')} />
          ))}
        </div>
      )}
      <p style={{
        margin: '14px 0 0', fontSize: 12, color: '#B0BAB5',
        textAlign: 'center',
      }}>
        AI suggestions are advisory. Final decisions remain with the resort manager.
      </p>
    </div>
  );
}

/* ─── Main Dashboard Page ─── */
export default function ManagerDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [kpis, setKpis] = useState(null);
  const [insights, setInsights] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [occupancyData, setOccupancyData] = useState(null);
  const [cancellationSummary, setCancellationSummary] = useState(null);
  const [roomDemands, setRoomDemands] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, occRes, cancelRes, demandRes] = await Promise.all([
        apiRequest('/manager/dashboard'),
        apiRequest('/manager/occupancy-forecast?days=7'),
        apiRequest('/manager/cancellation-summary?window=30'),
        apiRequest('/manager/room-demand'),
      ]);

      setKpis(dashRes.data.kpis);
      setInsights(dashRes.data.insights || []);
      setRecommendations(dashRes.data.topRecommendations || []);

      const occRaw = occRes.data || {};
      const occPoints = occRaw.forecast || [];
      setOccupancyData({
        ...occRaw,
        points: occPoints.map(p => ({
          ...p,
          occupancy: p.predictedOccupancy,
          day: p.dayOfWeek || new Date(p.date).toLocaleDateString('en-US', { weekday: 'short' }),
        })),
        peakDay: occRaw.peak,
      });

      setCancellationSummary(cancelRes.data);

      const demandRaw = demandRes.data?.roomDemands || demandRes.data || [];
      setRoomDemands(demandRaw.map(d => ({
        ...d,
        occupancyPct: d.occupancyRatePct,
        trendDeltaPct: d.demandChangePct,
      })));
    } catch (err) {
      console.error('Failed to load manager dashboard:', err);
      setError('Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const highPriorityCount = recommendations.filter(r => r.priority === 'CRITICAL' || r.priority === 'HIGH').length;

  return (
    <AppShell role="manager" title="Dashboard">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700,
            fontSize: 'clamp(20px,2.2vw,26px)', color: C.text,
            margin: 0, letterSpacing: '-0.4px',
          }}>
            Good morning, Manager
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: 14, color: C.sub }}>
            Here's what's happening across your resort today.
          </p>
        </div>
        <button
          onClick={fetchData}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 8, padding: '6px 14px',
            cursor: 'pointer', fontSize: 13, fontWeight: 600, color: C.sub,
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {error ? (
        <ErrorState section="Manager Dashboard" onRetry={fetchData} />
      ) : loading || !kpis ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Skeleton height="120px" />
          <Skeleton height="280px" />
          <Skeleton height="220px" />
        </div>
      ) : (
        <>
          <KpiGrid kpis={kpis} recommendationCount={recommendations.length} highPriorityCount={highPriorityCount} />

          <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ ...card(), padding: '22px 24px', flex: '1 1 0' }}>
              <OccupancyAreaChart
                points={occupancyData?.points}
                highOccupancyThreshold={occupancyData?.highOccupancyThreshold || 90}
                peakDay={occupancyData?.peakDay}
              />
            </div>
            <AiInsightsPanel insights={insights} />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))',
            gap: 16, marginBottom: 28,
          }}>
            <DonutChart summary={cancellationSummary} />
            <RoomDemandBarChart data={roomDemands} />
          </div>

          <RecommendationsSection recommendations={recommendations} />
        </>
      )}
    </AppShell>
  );
}
