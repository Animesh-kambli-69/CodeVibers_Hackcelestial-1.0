import { formatPercent, formatDelta } from '../../lib/utils';
import { Badge } from '../ui/Badge';

export function RoomDemandBarChart({ data = [] }) {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7', padding: 20 }}>
      <h3 style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 15,
        fontWeight: 700,
        color: '#17201C',
        margin: '0 0 16px'
      }}>
        Category Demand Breakdown
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {data.map((item) => {
          const isHigh = item.demandLevel === 'HIGH';
          const isMed = item.demandLevel === 'MEDIUM';

          const badgeVariant = isHigh ? 'risk-high' : isMed ? 'risk-medium' : 'muted';
          const barColor = isHigh ? '#C95C5C' : isMed ? '#D89A32' : '#167A65';

          return (
            <div key={item.roomType} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 160px', alignItems: 'center', gap: 16 }}>
              {/* Category Name */}
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#17201C' }}>
                  {item.roomType} Room
                </div>
                <div style={{ fontSize: 11.5, color: '#66716C' }}>
                  {item.availableRooms} rooms open
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#17201C', marginBottom: 4 }}>
                  <span>Occupancy {formatPercent(item.occupancyPct)}</span>
                  <span>{formatDelta(item.trendDeltaPct)}</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, backgroundColor: '#F0F2F1', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${item.occupancyPct}%`,
                    backgroundColor: barColor,
                    borderRadius: 4,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Demand Badge */}
              <div style={{ textAlign: 'right' }}>
                <Badge variant={badgeVariant}>
                  {item.demandLevel} DEMAND
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RoomDemandBarChart;
