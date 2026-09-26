import { ForecastTag } from '../ui/ForecastTag';
import { formatPercent } from '../../lib/utils';

export function OccupancyAreaChart({ points = [], highOccupancyThreshold = 90, peakDay = null }) {
  if (!points || points.length === 0) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#66716C' }}>No occupancy data available</div>;
  }

  // Chart dimensions
  const svgWidth = 800;
  const svgHeight = 240;
  const margin = { top: 30, right: 30, bottom: 40, left: 45 };
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  // Scales
  const minVal = 60;
  const maxVal = 100;

  const getX = (index) => margin.left + (index / Math.max(1, points.length - 1)) * width;
  const getY = (val) => margin.top + height - ((val - minVal) / (maxVal - minVal)) * height;

  // Construct SVG paths
  // Confidence band (upper to lower)
  const upperPoints = points.map((p, i) => `${getX(i)},${getY(p.confidenceHigh || p.occupancy)}`);
  const lowerPoints = points.map((p, i) => `${getX(i)},${getY(p.confidenceLow || p.occupancy)}`).reverse();
  const bandPath = `M ${upperPoints.join(' L ')} L ${lowerPoints.join(' L ')} Z`;

  // Occupancy forecast line
  const linePoints = points.map((p, i) => `${getX(i)},${getY(p.occupancy)}`);
  const linePath = `M ${linePoints.join(' L ')}`;

  // Threshold 90% line Y
  const thresholdY = getY(highOccupancyThreshold);

  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#17201C', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Occupancy Forecast & Confidence Interval
          </span>
          <ForecastTag />
        </div>
        {peakDay && (
          <div style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: '#167A65',
            backgroundColor: '#DDEBE5',
            padding: '4px 10px',
            borderRadius: 6
          }}>
            Peak: {formatPercent(peakDay.occupancy)} on {peakDay.day}, {peakDay.date}
          </div>
        )}
      </div>

      {/* SVG Chart */}
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
        aria-label="Occupancy Forecast Area Chart"
      >
        {/* Background Grid Lines */}
        {[60, 70, 80, 90, 100].map((val) => (
          <g key={val}>
            <line
              x1={margin.left}
              y1={getY(val)}
              x2={svgWidth - margin.right}
              y2={getY(val)}
              stroke="#E5EAE7"
              strokeDasharray={val === 90 ? '0' : '3 3'}
              strokeWidth={val === 90 ? '1' : '1'}
            />
            <text
              x={margin.left - 8}
              y={getY(val) + 4}
              fill="#66716C"
              fontSize="11"
              textAnchor="end"
              fontFamily="Inter, sans-serif"
            >
              {val}%
            </text>
          </g>
        ))}

        {/* 90% Target / Threshold Line */}
        <line
          x1={margin.left}
          y1={thresholdY}
          x2={svgWidth - margin.right}
          y2={thresholdY}
          stroke="#C95C5C"
          strokeDasharray="4 4"
          strokeWidth="1.5"
        />
        <text
          x={svgWidth - margin.right}
          y={thresholdY - 6}
          fill="#C95C5C"
          fontSize="10.5"
          fontWeight="600"
          textAnchor="end"
          fontFamily="Inter, sans-serif"
        >
          90% High Occupancy Threshold
        </text>

        {/* Confidence Band Area */}
        <path d={bandPath} fill="rgba(91, 99, 199, 0.12)" />

        {/* Forecast Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#5B63C7"
          strokeWidth="2.5"
          strokeDasharray="5 5"
        />

        {/* Points & Labels */}
        {points.map((p, i) => {
          const cx = getX(i);
          const cy = getY(p.occupancy);
          const isHigh = p.occupancy >= highOccupancyThreshold;

          return (
            <g key={i}>
              {/* Point circle */}
              <circle
                cx={cx}
                cy={cy}
                r="4.5"
                fill={isHigh ? '#C95C5C' : '#5B63C7'}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              {/* Value text */}
              <text
                x={cx}
                y={cy - 10}
                fill={isHigh ? '#C95C5C' : '#17201C'}
                fontSize="11"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
              >
                {formatPercent(p.occupancy)}
              </text>
              {/* X Axis Label */}
              <text
                x={cx}
                y={svgHeight - 12}
                fill="#66716C"
                fontSize="11"
                fontWeight="500"
                textAnchor="middle"
                fontFamily="Inter, sans-serif"
              >
                {p.day} ({p.date.slice(-5)})
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default OccupancyAreaChart;
