import { Badge } from '../ui/Badge';

export function BookingHistoryTable({ history = [] }) {
  if (!history || history.length === 0) return null;

  return (
    <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7', padding: 20 }}>
      <h3 style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 15,
        fontWeight: 700,
        color: '#17201C',
        margin: '0 0 14px'
      }}>
        Booking History
      </h3>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E5EAE7', color: '#66716C', fontSize: 11.5 }}>
              <th style={{ padding: '8px 10px' }}>Booking ID</th>
              <th style={{ padding: '8px 10px' }}>Dates</th>
              <th style={{ padding: '8px 10px' }}>Room</th>
              <th style={{ padding: '8px 10px' }}>Status</th>
              <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row) => (
              <tr key={row.bookingId} style={{ borderBottom: '1px solid #F0F2F1' }}>
                <td style={{ padding: '10px', fontWeight: 600, color: '#17201C' }}>{row.bookingId}</td>
                <td style={{ padding: '10px', color: '#66716C' }}>{row.dates}</td>
                <td style={{ padding: '10px', color: '#17201C' }}>{row.room}</td>
                <td style={{ padding: '10px' }}>
                  <Badge variant={row.status === 'COMPLETED' ? 'brand' : row.status === 'CANCELLED' ? 'risk-high' : 'muted'}>
                    {row.status}
                  </Badge>
                </td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 600, color: '#17201C' }}>
                  {row.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default BookingHistoryTable;
