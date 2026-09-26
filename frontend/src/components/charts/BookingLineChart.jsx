export function BookingLineChart({ history = [], points = [] }) {
  const allDays = [
    ...history.map(h => ({ ...h, isForecast: false })),
    ...points.map(p => ({ ...p, isForecast: true, actualBookings: null }))
  ];

  if (allDays.length === 0) return null;

  const svgWidth = 800;
  const svgHeight = 200;
  const margin = { top: 25, right: 30, bottom: 35, left: 45 };
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  const minVal = 70;
  const maxVal = 105;

  const getX = (index) => margin.left + (index / Math.max(1, allDays.length - 1)) * width;
  const getY = (val) => margin.top + height - ((val - minVal) / (maxVal - minVal)) * height;

  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#17201C', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Daily Bookings Volume (Actual vs Forecast)
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, fontWeight: 500, color: '#66716C' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 3, backgroundColor: '#167A65', borderRadius: 2 }} />
            <span>Actual Bookings</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 12, height: 3, backgroundColor: '#5B63C7', borderTop: '2px dashed #5B63C7' }} />
            <span>Predicted Bookings</span>
          </div>
        </div>
      </div>

      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {[70, 80, 90, 100].map((val) => (
          <g key={val}>
            <line x1={margin.left} y1={getY(val)} x2={svgWidth - margin.right} y2={getY(val)} stroke="#E5EAE7" strokeDasharray="3 3" />
            <text x={margin.left - 8} y={getY(val) + 4} fill="#66716C" fontSize="11" textAnchor="end">{val}</text>
          </g>
        ))}

        {allDays.map((d, i) => {
          const val = d.isForecast ? d.predictedBookings : d.actualBookings;
          if (val === null || val === undefined) return null;
          const cx = getX(i);
          const cy = getY(val);

          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r="4" fill={d.isForecast ? '#5B63C7' : '#167A65'} stroke="#FFFFFF" strokeWidth="2" />
              <text x={cx} y={cy - 8} fill={d.isForecast ? '#5B63C7' : '#167A65'} fontSize="11" fontWeight="700" textAnchor="middle">
                {val}
              </text>
              <text x={cx} y={svgHeight - 10} fill="#66716C" fontSize="11" textAnchor="middle">
                {d.day}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default BookingLineChart;
