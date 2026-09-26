import { Calendar, DoorOpen, Users, Tag, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

export function CurrentBookingCard({ booking }) {
  if (!booking) return null;

  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7', padding: 20 }}>
      <h3 style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 15,
        fontWeight: 700,
        color: '#17201C',
        margin: '0 0 14px'
      }}>
        Current Booking Details
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11.5, color: '#66716C' }}>Room Assignment</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#17201C', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <DoorOpen size={16} color="#167A65" />
            {booking.roomType} ({booking.roomNumber || 'TBD'})
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11.5, color: '#66716C' }}>Stay Dates</div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#17201C', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Calendar size={15} color="#5B63C7" />
            {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11.5, color: '#66716C' }}>Party Size & Channel</div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#17201C', display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <Users size={15} color="#66716C" />
            {booking.adults} Adults · {booking.channel}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11.5, color: '#66716C' }}>Nightly ADR</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#167A65', marginTop: 2 }}>
            {formatCurrency(booking.adrINR)}
          </div>
        </div>
      </div>

      {booking.specialRequest && (
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: 8,
          padding: '10px 12px',
          fontSize: 13,
          color: '#D89A32',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span><strong>Special Request:</strong> {booking.specialRequest}</span>
        </div>
      )}
    </div>
  );
}

export default CurrentBookingCard;
