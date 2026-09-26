import { useState, useEffect } from 'react';
import { ClipboardList, Plus, CheckCircle, Clock } from 'lucide-react';

import GuestLayout from '../components/layout/GuestLayout';
import Skeleton from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { apiRequest } from '../lib/api';

export default function GuestRequests() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [requestType, setRequestType] = useState('Extra Towels & Amenities');
  const [description, setDescription] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/guest/service-requests');
      // Map the backend/mock data to the expected frontend format
      const mappedReqs = res.data.map(r => ({
        id: r.id,
        type: r.type,
        status: r.status,
        time: r.requestedAt || 'Recently',
        description: r.description || 'Service request'
      }));
      setRequests(mappedReqs);
    } catch (err) {
      console.error('Failed to load guest requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    try {
      const res = await apiRequest('/guest/service-requests', {
        method: 'POST',
        body: JSON.stringify({
          type: requestType,
          description: description.trim()
        })
      });
      
      const r = res.data;
      const newReq = {
        id: r.id,
        type: r.type,
        status: r.status,
        time: r.requestedAt,
        description: r.description
      };
      
      setRequests((prev) => [newReq, ...prev]);
      setDescription('');
      setShowModal(false);
    } catch (err) {
      console.error('Failed to submit request', err);
    }
  };

  return (
    <GuestLayout title="My Service Requests">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: '#17201C', margin: 0 }}>
          Service & In-Room Requests
        </h2>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 20,
            border: 'none',
            backgroundColor: '#167A65',
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Plus size={16} /> New Request
        </button>
      </div>

      {loading ? (
        <Skeleton height="200px" />
      ) : requests.length === 0 ? (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7', padding: 32, textAlign: 'center', color: '#66716C' }}>
          You have no active service requests.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {requests.map((r) => (
            <div key={r.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7', padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#17201C' }}>{r.type}</span>
                <Badge variant={r.status === 'COMPLETED' ? 'brand' : 'risk-medium'}>{r.status}</Badge>
              </div>
              <p style={{ fontSize: 13, color: '#66716C', margin: '0 0 8px' }}>{r.description}</p>
              <div style={{ fontSize: 11.5, color: '#66716C', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={12} /> {r.time}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Request Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100,
          backgroundColor: 'rgba(23,32,28,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            width: '100%',
            maxWidth: 440,
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: '#17201C', margin: '0 0 16px' }}>
              Submit Service Request
            </h3>

            <form onSubmit={handleCreateRequest}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#66716C', display: 'block', marginBottom: 6 }}>Request Category</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  style={{ width: '100%', height: 40, padding: '0 12px', borderRadius: 8, border: '1px solid #E5EAE7', fontSize: 13.5, outline: 'none' }}
                >
                  <option value="Extra Towels & Amenities">Extra Towels & Amenities</option>
                  <option value="Late Check-in Note">Late Check-in Note</option>
                  <option value="Housekeeping Service">Housekeeping Service</option>
                  <option value="Dining & In-Room Order">Dining & In-Room Order</option>
                </select>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: '#66716C', display: 'block', marginBottom: 6 }}>Details / Special Instructions</label>
                <textarea
                  rows="3"
                  placeholder="Provide additional details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #E5EAE7', fontSize: 13.5, outline: 'none', fontFamily: "'Inter', sans-serif" }}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #E5EAE7', backgroundColor: '#FFFFFF', color: '#66716C', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!description.trim()}
                  style={{ padding: '8px 18px', borderRadius: 8, border: 'none', backgroundColor: '#167A65', color: '#FFFFFF', fontWeight: 600, cursor: description.trim() ? 'pointer' : 'not-allowed' }}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </GuestLayout>
  );
}
