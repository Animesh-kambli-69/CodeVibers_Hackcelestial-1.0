import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export function GuestFilters({ search, risk, roomType, onSearchChange, onRiskChange, onRoomTypeChange, onClear }) {
  const [localSearch, setLocalSearch] = useState(search || '');

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 20,
      flexWrap: 'wrap',
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      border: '1px solid #E5EAE7',
      padding: 16
    }}>
      {/* Search Input */}
      <div style={{
        position: 'relative',
        flex: '1 1 240px',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Search size={16} color="#66716C" style={{ position: 'absolute', left: 12 }} />
        <input
          type="text"
          placeholder="Search by name, email, or room..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          style={{
            width: '100%',
            height: 38,
            paddingLeft: 36,
            paddingRight: 12,
            borderRadius: 8,
            border: '1px solid #E5EAE7',
            fontSize: 13.5,
            outline: 'none',
            color: '#17201C',
            backgroundColor: '#F7F8F6'
          }}
        />
      </div>

      {/* Risk Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: '#66716C' }}>Risk:</label>
        <select
          value={risk || 'ALL'}
          onChange={(e) => onRiskChange(e.target.value)}
          style={{
            height: 38,
            padding: '0 12px',
            borderRadius: 8,
            border: '1px solid #E5EAE7',
            backgroundColor: '#F7F8F6',
            fontSize: 13,
            color: '#17201C',
            outline: 'none'
          }}
        >
          <option value="ALL">All Risk Levels</option>
          <option value="HIGH">High Risk Only</option>
          <option value="MEDIUM">Medium Risk</option>
          <option value="LOW">Low Risk</option>
        </select>
      </div>

      {/* Room Type Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: '#66716C' }}>Room Type:</label>
        <select
          value={roomType || 'ALL'}
          onChange={(e) => onRoomTypeChange(e.target.value)}
          style={{
            height: 38,
            padding: '0 12px',
            borderRadius: 8,
            border: '1px solid #E5EAE7',
            backgroundColor: '#F7F8F6',
            fontSize: 13,
            color: '#17201C',
            outline: 'none'
          }}
        >
          <option value="ALL">All Categories</option>
          <option value="STANDARD">Standard</option>
          <option value="DELUXE">Deluxe Room</option>
          <option value="SUITE">Suite</option>
        </select>
      </div>

      {/* Clear Filters Button */}
      {(localSearch || (risk && risk !== 'ALL') || (roomType && roomType !== 'ALL')) && (
        <button
          onClick={() => {
            setLocalSearch('');
            onClear();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            height: 38,
            padding: '0 12px',
            borderRadius: 8,
            border: '1px solid #E5EAE7',
            backgroundColor: '#FFFFFF',
            color: '#C95C5C',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <X size={14} />
          Clear Filters
        </button>
      )}
    </div>
  );
}

export default GuestFilters;
