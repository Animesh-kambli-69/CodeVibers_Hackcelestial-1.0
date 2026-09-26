import { useState, useEffect } from 'react';
import { UserCheck, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

import AppShell from '../components/layout/AppShell';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import { Badge } from '../components/ui/Badge';
import { apiRequest } from '../lib/api';

export default function OperationsStaffing() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [staffingList, setStaffingList] = useState([]);

  const fetchStaffing = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/operations/staffing');
      setStaffingList(res.data || []);
    } catch (err) {
      console.error('Failed to load staffing data:', err);
      setError('Unable to load staffing allocation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffing();
  }, []);

  return (
    <AppShell role="data_entry" title="Department Staffing Alignment">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: '#17201C', margin: '0 0 2px' }}>
            Shift Staffing & Capacity Requirements
          </h2>
          <p style={{ fontSize: 13, color: '#66716C', margin: 0 }}>
            Compare actual shift coverage against forecasted guest occupancy demand.
          </p>
        </div>

        <button
          onClick={fetchStaffing}
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
          Refresh Staffing
        </button>
      </div>

      {error ? (
        <ErrorState section="Staffing Allocation" onRetry={fetchStaffing} />
      ) : loading ? (
        <Skeleton height="280px" />
      ) : (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ backgroundColor: '#F7F8F6', borderBottom: '1px solid #E5EAE7', color: '#66716C', fontSize: 12 }}>
                  <th style={{ padding: '14px 16px' }}>Department</th>
                  <th style={{ padding: '14px 16px' }}>Required Staff</th>
                  <th style={{ padding: '14px 16px' }}>Available Roster</th>
                  <th style={{ padding: '14px 16px' }}>Shortage</th>
                  <th style={{ padding: '14px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {staffingList.map((row) => {
                  const hasShortage = row.shortage > 0;
                  const isCritical = row.status === 'CRITICAL';
                  const rowBg = isCritical ? '#FEF2F2' : hasShortage ? '#FFFBEB' : '#FFFFFF';

                  return (
                    <tr key={row.department} style={{ borderBottom: '1px solid #F0F2F1', backgroundColor: rowBg }}>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#17201C' }}>{row.department}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 600, color: '#17201C' }}>{row.required} staff</td>
                      <td style={{ padding: '14px 16px', color: '#66716C' }}>{row.available} staff</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700, color: hasShortage ? '#C95C5C' : '#3F8F70' }}>
                        {hasShortage ? `-${row.shortage} SHORT` : 'Full Coverage'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <Badge variant={isCritical ? 'risk-high' : hasShortage ? 'risk-medium' : 'brand'}>
                          {row.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  );
}
