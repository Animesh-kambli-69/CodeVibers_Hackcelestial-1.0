import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { formatProbability, formatDate } from '../../lib/utils';
import { RiskBadge } from '../ui/RiskBadge';

export function CancellationRiskTable({ cohort = [] }) {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);

  if (!cohort || cohort.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7', color: '#66716C' }}>
        No high-risk bookings found matching the criteria.
      </div>
    );
  }

  const toggleExpand = (id, e) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
          <thead>
            <tr style={{ backgroundColor: '#F7F8F6', borderBottom: '1px solid #E5EAE7', color: '#66716C', fontSize: 12 }}>
              <th style={{ padding: '12px 16px' }}>Guest Name</th>
              <th style={{ padding: '12px 16px' }}>Room</th>
              <th style={{ padding: '12px 16px' }}>Arrival Date</th>
              <th style={{ padding: '12px 16px' }}>Lead Time</th>
              <th style={{ padding: '12px 16px' }}>Channel</th>
              <th style={{ padding: '12px 16px' }}>Deposit</th>
              <th style={{ padding: '12px 16px' }}>Probability</th>
              <th style={{ padding: '12px 16px' }}>Factors</th>
            </tr>
          </thead>
          <tbody>
            {cohort.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <g key={item.id}>
                  <tr
                    onClick={() => navigate(`/operations/guests/${item.guestId}`)}
                    style={{ borderBottom: isExpanded ? 'none' : '1px solid #F0F2F1', cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0F7F4')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#167A65' }}>
                      {item.guestName}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#17201C' }}>{item.roomType}</td>
                    <td style={{ padding: '14px 16px', color: '#17201C' }}>{formatDate(item.arrivalDate)}</td>
                    <td style={{ padding: '14px 16px', color: '#66716C' }}>{item.leadTimeDays} days</td>
                    <td style={{ padding: '14px 16px', color: '#66716C' }}>{item.channel}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: 11.5,
                        fontWeight: 600,
                        color: item.depositPaid ? '#3F8F70' : '#C95C5C'
                      }}>
                        {item.depositPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <RiskBadge riskLevel={item.riskLevel} probability={item.probability} />
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <button
                        onClick={(e) => toggleExpand(item.id, e)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: '#5B63C7',
                          cursor: 'pointer'
                        }}
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {isExpanded ? 'Hide' : 'Factors'}
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr style={{ borderBottom: '1px solid #F0F2F1', backgroundColor: '#F7F8F6' }}>
                      <td colSpan="8" style={{ padding: '12px 20px' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#C95C5C', marginBottom: 4 }}>
                          ● CANCELLATION RISK FACTORS (ESTIMATED):
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#66716C' }}>
                          {item.factors?.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </g>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CancellationRiskTable;
