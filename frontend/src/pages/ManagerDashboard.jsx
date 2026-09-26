import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Sparkles, TrendingUp, TrendingDown, Minus, Menu } from 'lucide-react';
import { useAuth } from '../AuthContext';
import Sidebar from '../components/Sidebar';
import {
  kpiData, forecastData, cancellationData,
  roomDemandData, insightsData, recommendationsData,
} from '../data/managerDashboardData';

/* ─── Helpers ─── */
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

/* ─── Top Bar ─── */
function TopBar({ onMenuClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <header style={{
      height: 56, borderBottom: `1px solid ${C.border}`,
      background: C.surface,
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 16, flexShrink: 0,
      position: 'sticky', top: 0, zIndex: 20,
    }}>
      {/* Hamburger (mobile) */}
      <button
        onClick={onMenuClick}
        className="sidebar-hamburger"
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 4, display: 'none', color: C.text,
        }}
      >
        <Menu size={20} />
      </button>

      {/* Left: brand + role */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <span style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 15, color: C.text, letterSpacing: '-0.2px' }}>
          Smart Resort 360
        </span>
        <div style={{ width: 1, height: 16, background: C.border }} />
        <span style={{ fontSize: 13, fontWeight: 500, color: C.sub }}>Manager</span>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: '#DDEBE5', borderRadius: 20, padding: '3px 10px',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.success }} />
          <span style={{ fontSize: 11.5, fontWeight: 600, color: C.success }}>AI Systems Operational</span>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Right: user */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 13, color: C.sub, fontWeight: 500 }}>Resort Manager</span>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: C.emeraldSoft, border: `1.5px solid ${C.emerald}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 13, color: C.emerald,
          cursor: 'pointer',
        }}>
          M
        </div>
      </div>
      <style>{`.sidebar-hamburger { display: none !important; } @media(max-width:768px){.sidebar-hamburger{display:flex !important;}}`}</style>
    </header>
  );
}

/* ─── Dashboard Header ─── */
function DashboardHeader({ refreshing, onRefresh }) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { weekday: undefined, day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 12, marginBottom: 28,
    }}>
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <span style={{ fontSize: 13, color: C.sub, fontWeight: 500 }}>Today, {dateStr}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: '#B0BAB5' }}>Last updated 2 min ago</span>
          <button
            onClick={onRefresh}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: '5px 12px',
              cursor: 'pointer', fontSize: 12.5, fontWeight: 500, color: C.sub,
              transition: 'all 0.15s',
            }}
          >
            <RefreshCw size={13} style={{ animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

/* ─── KPI Cards ─── */
function KpiCard({ label, value, sub, badge, badgeColor, badgeBg, trendIcon, trendColor, accent, accentBg, onClick }) {
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
        fontSize: 'clamp(26px,2.8vw,34px)', color: accent || C.text,
        lineHeight: 1, marginBottom: 8, letterSpacing: '-0.5px',
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {trendIcon}
          <span style={{ fontSize: 12.5, color: trendColor || C.sub, fontWeight: 500 }}>{sub}</span>
        </div>
      )}
    </div>
  );
}

function KpiGrid() {
  const navigate = useNavigate();
  const up = <TrendingUp size={12} color={C.success} />;
  const warn = <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.critical, display: 'inline-block', flexShrink: 0 }} />;
  const info = <Sparkles size={12} color={C.indigo} />;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill,minmax(170px,1fr))',
      gap: 14, marginBottom: 28,
    }}>
      <KpiCard label="Current Occupancy" value={`${kpiData.occupancy.value}%`} sub={`${kpiData.occupancy.change} ${kpiData.occupancy.changeLabel}`} trendIcon={up} trendColor={C.success} />
      <KpiCard label="Predicted Occupancy" value={`${kpiData.predictedOccupancy.value}%`} sub={kpiData.predictedOccupancy.label} badge="FORECAST" trendIcon={<Sparkles size={12} color={C.indigo} />} trendColor={C.indigo} onClick={() => navigate('/manager/forecast')} />
      <KpiCard label="Upcoming Bookings" value={kpiData.upcomingBookings.value} sub={kpiData.upcomingBookings.change} trendIcon={up} trendColor={C.success} />
      <KpiCard label="Booking Demand" value={kpiData.bookingDemand.value} sub={kpiData.bookingDemand.change} trendIcon={up} trendColor={C.success} accent={C.emerald} />
      <KpiCard label="High Cancellation Risk" value={kpiData.highCancellationRisk.value} sub={kpiData.highCancellationRisk.label} trendIcon={warn} trendColor={C.critical} accent={C.critical} onClick={() => navigate('/manager/recommendations?category=CANCELLATION')} />
      <KpiCard label="AI Recommendations" value={kpiData.aiRecommendations.value} sub={kpiData.aiRecommendations.label} trendIcon={info} trendColor={C.indigo} badge="AI" badgeColor={C.indigo} badgeBg={C.indigoSoft} onClick={() => navigate('/manager/recommendations')} />
    </div>
  );
}

/* ─── Forecast Chart (SVG) ─── */
function ForecastChart() {
  const [tooltip, setTooltip] = useState(null);
  const W = 600, H = 200, PL = 40, PR = 20, PT = 20, PB = 36;
  const chartW = W - PL - PR, chartH = H - PT - PB;
  const n = forecastData.length;
  const xStep = chartW / (n - 1);
  const minV = 55, maxV = 100;
  const yScale = (v) => PT + chartH - ((v - minV) / (maxV - minV)) * chartH;
  const xAt = (i) => PL + i * xStep;

  // Confidence band path
  const confPoints = forecastData.filter(d => d.confidenceLow != null);
  let confPath = '';
  if (confPoints.length > 0) {
    const topPts = confPoints.map((d, i) => {
      const di = forecastData.indexOf(d);
      return `${xAt(di)},${yScale(d.confidenceHigh)}`;
    });
    const botPts = [...confPoints].reverse().map((d) => {
      const di = forecastData.indexOf(d);
      return `${xAt(di)},${yScale(d.confidenceLow)}`;
    });
    confPath = `M ${topPts.join(' L ')} L ${botPts.join(' L ')} Z`;
  }

  // Actual line
  const actualPts = forecastData.filter(d => d.actual != null);
  const actualPath = actualPts.map((d, i) => {
    const di = forecastData.indexOf(d);
    return `${i === 0 ? 'M' : 'L'} ${xAt(di)},${yScale(d.actual)}`;
  }).join(' ');

  // Forecast dashed line — from last actual to all forecast
  const lastActual = [...forecastData].reverse().find(d => d.actual != null);
  const lastActualIdx = forecastData.indexOf(lastActual);
  const forecastPts = forecastData.filter(d => d.forecast != null);
  let forecastPath = '';
  if (forecastPts.length > 0 && lastActual) {
    const start = `M ${xAt(lastActualIdx)},${yScale(lastActual.actual)}`;
    const rest = forecastPts.map(d => `L ${xAt(forecastData.indexOf(d))},${yScale(d.forecast)}`).join(' ');
    forecastPath = `${start} ${rest}`;
  }

  return (
    <div style={{ ...card(), padding: '22px 24px', flex: '1 1 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 15.5, color: C.text, margin: 0 }}>
            Occupancy & Booking Forecast
          </h3>
          <p style={{ margin: '3px 0 0', fontSize: 12.5, color: C.sub }}>
            Actual performance and predicted demand for the next 7 days.
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: C.indigoSoft, border: `1px solid ${C.indigo}30`,
          borderRadius: 20, padding: '4px 12px',
        }}>
          <Sparkles size={11} color={C.indigo} />
          <span style={{ fontSize: 11.5, fontWeight: 600, color: C.indigo }}>AI Forecast · 91% confidence</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
        {[
          { label: 'Actual', color: C.emerald, dash: false },
          { label: 'Forecast', color: C.indigo, dash: true },
          { label: 'Confidence range', color: `${C.indigo}40`, dash: false, isArea: true },
        ].map((l) => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {l.isArea ? (
              <div style={{ width: 16, height: 10, background: `${C.indigo}25`, border: `1px solid ${C.indigo}50`, borderRadius: 2 }} />
            ) : (
              <svg width="20" height="8">
                <line x1="0" y1="4" x2="20" y2="4" stroke={l.color} strokeWidth="2"
                  strokeDasharray={l.dash ? '4,3' : 'none'} />
              </svg>
            )}
            <span style={{ fontSize: 11.5, color: C.sub }}>{l.label}</span>
          </div>
        ))}
      </div>

      {/* SVG chart */}
      <div style={{ position: 'relative' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ width: '100%', height: 'auto', overflow: 'visible' }}
        >
          {/* Y gridlines */}
          {[60, 70, 80, 90, 100].map((v) => (
            <g key={v}>
              <line x1={PL} y1={yScale(v)} x2={W - PR} y2={yScale(v)}
                stroke="#E5EAE7" strokeWidth="1" />
              <text x={PL - 6} y={yScale(v) + 4} fontSize="9" fill={C.sub} textAnchor="end">{v}%</text>
            </g>
          ))}

          {/* Divider: actual vs forecast */}
          <line
            x1={xAt(lastActualIdx)} y1={PT}
            x2={xAt(lastActualIdx)} y2={H - PB}
            stroke={C.border} strokeWidth="1" strokeDasharray="3,3"
          />
          <text x={xAt(lastActualIdx) + 4} y={PT + 10} fontSize="9" fill={C.sub}>Today</text>

          {/* Confidence band */}
          {confPath && (
            <path d={confPath} fill={`${C.indigo}18`} stroke={`${C.indigo}30`} strokeWidth="0.5" />
          )}

          {/* Actual line */}
          <path d={actualPath} fill="none" stroke={C.emerald} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Forecast dashed line */}
          {forecastPath && (
            <path d={forecastPath} fill="none" stroke={C.indigo} strokeWidth="2" strokeDasharray="5,4" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Dots */}
          {forecastData.map((d, i) => {
            const val = d.actual ?? d.forecast;
            if (val == null) return null;
            const isActual = d.actual != null;
            return (
              <circle
                key={i} cx={xAt(i)} cy={yScale(val)} r="4"
                fill="white" stroke={isActual ? C.emerald : C.indigo} strokeWidth="2"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setTooltip({ i, d, x: xAt(i), y: yScale(val) })}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })}

          {/* Tooltip */}
          {tooltip && (() => {
            const { i, d, x, y } = tooltip;
            const val = d.actual ?? d.forecast;
            const isActual = d.actual != null;
            const tx = Math.min(x, W - 90);
            return (
              <g>
                <rect x={tx - 4} y={y - 42} width={88} height={36} rx="6"
                  fill="white" stroke={C.border} strokeWidth="1"
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.08))' }} />
                <text x={tx + 40} y={y - 26} fontSize="11" fill={C.sub} textAnchor="middle">{d.day}</text>
                <text x={tx + 40} y={y - 12} fontSize="13" fontWeight="700" fill={isActual ? C.emerald : C.indigo} textAnchor="middle">
                  {val}%{!isActual && ' (forecast)'}
                </text>
              </g>
            );
          })()}

          {/* X labels */}
          {forecastData.map((d, i) => (
            <text key={i} x={xAt(i)} y={H - PB + 18} fontSize="10.5" fill={C.sub} textAnchor="middle">
              {d.day}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

/* ─── AI Insights ─── */
function InsightCard({ insight }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: `1px solid ${C.border}`,
        padding: '14px 0',
        cursor: 'pointer',
      }}
      onClick={() => setOpen(o => !o)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.07em',
          textTransform: 'uppercase', padding: '2px 8px', borderRadius: 20,
          background: insight.severityBg, color: insight.severityColor,
          flexShrink: 0, marginTop: 1,
        }}>
          {insight.severity}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontWeight: 600, fontSize: 13.5, color: C.text }}>{insight.title}</span>
            <span style={{
              fontSize: 10.5, color: C.indigo, fontWeight: 500,
              background: C.indigoSoft, padding: '1px 7px', borderRadius: 20, flexShrink: 0,
            }}>
              {insight.aiConfidence}%
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 12.5, color: C.sub, lineHeight: 1.5 }}>
            {insight.body}
          </p>
          {open && (
            <div style={{
              marginTop: 8, padding: '8px 12px',
              background: C.emeraldLight, borderRadius: 7,
              borderLeft: `3px solid ${C.emerald}`,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: C.emerald, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Action
              </span>
              <p style={{ margin: '2px 0 0', fontSize: 12.5, color: C.emerald }}>{insight.action}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AiInsightsPanel() {
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
      {insightsData.map(insight => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  );
}

/* ─── Donut Chart ─── */
function DonutChart() {
  const cx = 80, cy = 80, r = 60, stroke = 22;
  const total = cancellationData.reduce((s, d) => s + d.value, 0);
  let offset = 0;
  const slices = cancellationData.map(d => {
    const pct = d.value / total;
    const s = { ...d, pct, offset };
    offset += pct;
    return s;
  });
  const circ = 2 * Math.PI * r;

  return (
    <div style={{ ...card(), padding: '22px 20px' }}>
      <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 15.5, color: C.text, margin: '0 0 4px' }}>
        Cancellation Risk
      </h3>
      <p style={{ margin: '0 0 18px', fontSize: 12.5, color: C.sub }}>Distribution across upcoming bookings.</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
        {/* SVG donut */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <svg width={160} height={160} viewBox="0 0 160 160">
            {slices.map((s, i) => {
              const dashLen = s.pct * circ;
              const dashOffset = circ * (1 - s.offset) - circ / 4;
              return (
                <circle key={i} cx={cx} cy={cy} r={r}
                  fill="none" stroke={s.color} strokeWidth={stroke}
                  strokeDasharray={`${dashLen} ${circ - dashLen}`}
                  strokeDashoffset={-circ * s.offset + circ / 4}
                  strokeLinecap="butt"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '80px 80px', transition: 'all 0.3s' }}
                />
              );
            })}
            <text x={cx} y={cy - 8} textAnchor="middle" fontSize="22" fontWeight="700" fill={C.critical} fontFamily="'Plus Jakarta Sans',sans-serif">
              17
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill={C.sub}>High Risk</text>
          </svg>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cancellationData.map(d => (
            <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{d.label}</span>
              <span style={{ fontSize: 13, color: C.sub, marginLeft: 'auto', paddingLeft: 12 }}>{d.value}%</span>
            </div>
          ))}
          <p style={{ margin: '6px 0 0', fontSize: 12, color: C.sub, lineHeight: 1.5 }}>
            17 bookings require attention.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Room Demand Bars ─── */
function RoomDemandCard() {
  return (
    <div style={{ ...card(), padding: '22px 20px' }}>
      <h3 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 15.5, color: C.text, margin: '0 0 4px' }}>
        Demand by Room Type
      </h3>
      <p style={{ margin: '0 0 20px', fontSize: 12.5, color: C.sub }}>Current demand index across categories.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {roomDemandData.map((room) => {
          const isTop = room.type === 'Deluxe';
          const TrendIco = room.trend === 'up' ? TrendingUp : room.trend === 'down' ? TrendingDown : Minus;
          const trendColor = room.trend === 'up' ? C.success : room.trend === 'down' ? C.critical : C.sub;
          return (
            <div key={room.type}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    fontSize: 13.5, fontWeight: isTop ? 700 : 500,
                    color: isTop ? C.emerald : C.text,
                  }}>
                    {room.type}
                  </span>
                  {isTop && (
                    <span style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: C.emerald, background: C.emeraldSoft, padding: '1px 6px', borderRadius: 20 }}>
                      ↑ Rising
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrendIco size={12} color={trendColor} />
                  <span style={{ fontSize: 12, color: trendColor, fontWeight: 500 }}>{room.trendValue}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: C.text, minWidth: 36, textAlign: 'right' }}>
                    {room.demand}%
                  </span>
                </div>
              </div>
              <div style={{ background: '#F0F4F2', borderRadius: 6, height: 8, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 6,
                  background: isTop ? C.emerald : room.trend === 'down' ? '#D4DDD9' : '#A7C8BE',
                  width: `${room.demand}%`,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Recommendations ─── */
function RecommendationCard({ rec }) {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        ...card(),
        padding: '20px',
        borderTop: `3px solid ${rec.priorityColor}`,
        transition: 'transform 0.15s, box-shadow 0.15s',
        transform: hover ? 'translateY(-2px)' : 'none',
        boxShadow: hover ? '0 8px 24px rgba(23,32,28,0.09)' : '0 1px 4px rgba(23,32,28,0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', padding: '2px 8px', borderRadius: 20,
          background: rec.priorityBg, color: rec.priorityColor,
        }}>
          {rec.priority}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Sparkles size={10} color={C.indigo} />
          <span style={{ fontSize: 11, color: C.indigo, fontWeight: 600 }}>{rec.confidence}% confidence</span>
        </div>
      </div>

      <h4 style={{
        fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700,
        fontSize: 14.5, color: C.text, margin: '0 0 6px', letterSpacing: '-0.1px',
      }}>
        {rec.title}
      </h4>
      <p style={{ margin: '0 0 10px', fontSize: 13, color: C.sub, lineHeight: 1.55 }}>
        {rec.body}
      </p>

      <div style={{
        padding: '8px 12px', background: '#F7F8F6',
        borderRadius: 7, marginBottom: 14,
        borderLeft: `3px solid ${rec.priorityColor}`,
      }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: rec.priorityColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Suggested action
        </span>
        <p style={{ margin: '2px 0 0', fontSize: 12.5, color: C.text }}>{rec.action}</p>
      </div>

      <button style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'none', border: `1.5px solid ${C.border}`,
        borderRadius: 8, padding: '7px 14px',
        cursor: 'pointer', fontSize: 13, fontWeight: 600, color: C.text,
        transition: 'all 0.15s',
        ...(hover ? { borderColor: C.emerald, color: C.emerald, background: C.emeraldLight } : {}),
      }}>
        Review →
      </button>
    </div>
  );
}

function RecommendationsSection() {
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))',
        gap: 16,
      }}>
        {recommendationsData.map(rec => <RecommendationCard key={rec.id} rec={rec} />)}
      </div>
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: C.bg, fontFamily: "'Inter',sans-serif" }}>
      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

      {/* Main column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar onMenuClick={() => setMobileMenuOpen(true)} />

        {/* Scrollable content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 40px' }}>
          <DashboardHeader refreshing={refreshing} onRefresh={handleRefresh} />
          <KpiGrid />

          {/* Forecast + Insights row */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <ForecastChart />
            <AiInsightsPanel />
          </div>

          {/* Cancellation + Room Demand row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))',
            gap: 16, marginBottom: 28,
          }}>
            <DonutChart />
            <RoomDemandCard />
          </div>

          <RecommendationsSection />
        </main>
      </div>

      {/* Responsive sidebar toggle */}
      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          main { padding: 20px 16px 32px !important; }
        }
      `}</style>
    </div>
  );
}
