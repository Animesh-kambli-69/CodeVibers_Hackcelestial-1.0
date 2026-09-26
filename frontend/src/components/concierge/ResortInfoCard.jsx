import { Clock, MapPin, Sparkles } from 'lucide-react';

export function ResortInfoCard({ info, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E5EAE7',
        padding: 16,
        marginBottom: 12,
        boxShadow: '0 2px 6px rgba(23,32,28,0.03)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, border-color 0.15s ease'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: 4,
          backgroundColor: '#DDEBE5',
          color: '#167A65',
          textTransform: 'uppercase'
        }}>
          {info.category}
        </span>
        {info.timings && (
          <span style={{ fontSize: 11.5, color: '#66716C', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={12} />
            {info.timings}
          </span>
        )}
      </div>

      <h4 style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 15,
        fontWeight: 700,
        color: '#17201C',
        margin: '0 0 4px'
      }}>
        {info.title}
      </h4>

      <p style={{ fontSize: 13, color: '#66716C', margin: '0 0 10px', lineHeight: 1.4 }}>
        {info.summary}
      </p>

      {info.location && (
        <div style={{ fontSize: 12, color: '#167A65', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          <MapPin size={13} />
          {info.location}
        </div>
      )}
    </div>
  );
}

export default ResortInfoCard;
