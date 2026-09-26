import { useNavigate } from 'react-router-dom';
import { formatDate } from '../../lib/utils';
import { RiskBadge } from '../ui/RiskBadge';
import { DoorOpen } from 'lucide-react';

export function GuestTable({ guests = [] }) {
  const navigate = useNavigate();

  if (!guests || guests.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7', color: '#66716C' }}>
        No guests found matching the selected criteria.
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
          <thead>
            <tr style={{ backgroundColor: '#F7F8F6', borderBottom: '1px solid #E5EAE7', color: '#66716C', fontSize: 12 }}>
              <th style={{ padding: '12px 16px' }}>Guest Name</th>
              <th style={{ padding: '12px 16px' }}>Room</th>
              <th style={{ padding: '12px 16px' }}>Arrival Date</th>
              <th style={{ padding: '12px 16px' }}>Top Preference</th>
              <th style={{ padding: '12px 16px' }}>Cancellation Risk</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((g) => (
              <tr
                key={g.id}
                onClick={() => navigate(`/operations/guests/${g.id}`)}
                style={{
                  borderBottom: '1px solid #F0F2F1',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0F7F4')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
              >
                {/* Guest Info */}
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, color: '#17201C' }}>{g.name}</div>
                  <div style={{ fontSize: 12, color: '#66716C' }}>{g.email}</div>
                </td>

                {/* Room */}
                <td style={{ padding: '14px 16px', color: '#17201C', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <DoorOpen size={15} color="#167A65" />
                    <span>{g.roomType} {g.roomNumber ? `(${g.roomNumber})` : ''}</span>
                  </div>
                </td>

                {/* Arrival */}
                <td style={{ padding: '14px 16px', color: '#17201C', fontWeight: 500 }}>
                  {formatDate(g.arrivalDate)}
                </td>

                {/* Top Preference */}
                <td style={{ padding: '14px 16px', color: '#66716C' }}>
                  {g.topPreference || '—'}
                </td>

                {/* Risk */}
                <td style={{ padding: '14px 16px' }}>
                  <RiskBadge
                    riskLevel={g.riskLevel}
                    probability={g.cancellationProbability}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GuestTable;
