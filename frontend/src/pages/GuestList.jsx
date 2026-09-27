import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';

import AppShell from '../components/layout/AppShell';
import GuestTable from '../components/guests/GuestTable';
import GuestFilters from '../components/guests/GuestFilters';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import { apiRequest } from '../lib/api';

export default function GuestList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('search') || '';
  const riskQuery = searchParams.get('risk') || 'ALL';
  const roomTypeQuery = searchParams.get('roomType') || 'ALL';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [allGuests, setAllGuests] = useState([]);

  const fetchGuests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/operations/guests');
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : (raw?.items || raw?.guests || []);
      setAllGuests(list);
    } catch (err) {
      console.error('Failed to load guest list:', err);
      setError('Unable to retrieve guest directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const handleSearchChange = (val) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (val) p.set('search', val);
      else p.delete('search');
      return p;
    });
  };

  const handleRiskChange = (val) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (val !== 'ALL') p.set('risk', val);
      else p.delete('risk');
      return p;
    });
  };

  const handleRoomTypeChange = (val) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (val !== 'ALL') p.set('roomType', val);
      else p.delete('roomType');
      return p;
    });
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  // Client-side filtering for search and dropdowns
  const filteredGuests = allGuests.filter((g) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const nameMatch = g.name?.toLowerCase().includes(q);
      const emailMatch = g.email?.toLowerCase().includes(q);
      const roomMatch = g.roomNumber?.toLowerCase().includes(q);
      if (!nameMatch && !emailMatch && !roomMatch) return false;
    }
    if (riskQuery !== 'ALL' && g.riskLevel !== riskQuery) return false;
    if (roomTypeQuery !== 'ALL' && g.roomType !== roomTypeQuery) return false;
    return true;
  });

  return (
    <AppShell role="data_entry" title="Guest Intelligence Directory">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: '#17201C', margin: '0 0 2px' }}>
            Guest Roster & Cancellation Intelligence
          </h2>
          <p style={{ fontSize: 13, color: '#66716C', margin: 0 }}>
            Search, filter, and inspect guest preference & risk profiles.
          </p>
        </div>

        <button
          onClick={fetchGuests}
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
          Refresh Directory
        </button>
      </div>

      {/* Filter Bar */}
      <GuestFilters
        search={searchQuery}
        risk={riskQuery}
        roomType={roomTypeQuery}
        onSearchChange={handleSearchChange}
        onRiskChange={handleRiskChange}
        onRoomTypeChange={handleRoomTypeChange}
        onClear={handleClearFilters}
      />

      {/* Content */}
      {error ? (
        <ErrorState section="Guest Directory" onRetry={fetchGuests} />
      ) : loading ? (
        <Skeleton height="350px" />
      ) : (
        <GuestTable guests={filteredGuests} />
      )}
    </AppShell>
  );
}
