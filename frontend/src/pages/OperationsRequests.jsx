import { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle2, Clock, RefreshCw } from 'lucide-react';

import AppShell from '../components/layout/AppShell';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import { Badge } from '../components/ui/Badge';
import { apiRequest } from '../lib/api';

export default function OperationsRequests() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/operations/service-requests');
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : (raw?.requests || raw?.items || []);
      setRequests(list);
    } catch (err) {
      console.error('Failed to load service requests:', err);
      setError('Unable to load service requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setRequests((prev) =>
      (Array.isArray(prev) ? prev : []).map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  return (
    <AppShell role="data_entry" title="Guest Service Requests">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: '#17201C', margin: '0 0 2px' }}>
            Guest Service & Special Arrangement Requests
          </h2>
          <p style={{ fontSize: 13, color: '#66716C', margin: 0 }}>
            Live status dispatch for guest requests across Housekeeping and Front Desk.
          </p>
        </div>

        <button
          onClick={fetchRequests}
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
          Refresh Requests
        </button>
      </div>

      {error ? (
        <ErrorState section="Service Requests" onRetry={fetchRequests} />
      ) : loading ? (
        <Skeleton height="300px" />
      ) : (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ backgroundColor: '#F7F8F6', borderBottom: '1px solid #E5EAE7', color: '#66716C', fontSize: 12 }}>
                  <th style={{ padding: '14px 16px' }}>Request ID</th>
                  <th style={{ padding: '14px 16px' }}>Guest</th>
                  <th style={{ padding: '14px 16px' }}>Room</th>
                  <th style={{ padding: '14px 16px' }}>Request Type</th>
                  <th style={{ padding: '14px 16px' }}>Requested At</th>
                  <th style={{ padding: '14px 16px' }}>Current Status</th>
                  <th style={{ padding: '14px 16px' }}>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #F0F2F1' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#17201C' }}>{r.id}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#167A65' }}>{r.guestName}</td>
                    <td style={{ padding: '14px 16px', color: '#17201C' }}>Room {r.roomNumber}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: '#17201C' }}>{r.type}</td>
                    <td style={{ padding: '14px 16px', color: '#66716C' }}>{r.requestedAt}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <Badge variant={r.status === 'COMPLETED' ? 'brand' : r.status === 'IN_PROGRESS' ? 'ai' : 'risk-medium'}>
                        {r.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusChange(r.id, e.target.value)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 6,
                          border: '1px solid #E5EAE7',
                          fontSize: 12.5,
                          fontWeight: 600,
                          backgroundColor: '#FFFFFF',
                          color: '#17201C',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AppShell>
  );
}
