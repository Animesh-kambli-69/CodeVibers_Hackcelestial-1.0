import { useState } from 'react';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import './App.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    guestName: 'John Doe',
    leadTimeDays: '60',
    depositType: 'No Deposit',
    bookingChannel: 'Online TA',
    previousCancellations: '2',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // POST directly to the Node.js backend public endpoint!
      const response = await fetch(`${BACKEND_URL}/api/public/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F7F8F6', fontFamily: "'Inter', sans-serif" }}>
      {/* Navbar */}
      <nav style={{ backgroundColor: '#167A65', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} color="#167A65" />
          </div>
          <span style={{ color: '#FFFFFF', fontWeight: 700, fontSize: 18, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            The Celestial Resort
          </span>
        </div>
        <div style={{ display: 'flex', gap: 24, color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: 500 }}>
          <span style={{ cursor: 'pointer' }}>Rooms</span>
          <span style={{ cursor: 'pointer' }}>Dining</span>
          <span style={{ cursor: 'pointer' }}>Spa</span>
          <a href={`${FRONTEND_URL}/login`} target="_blank" rel="noreferrer" style={{ color: '#FFFFFF', textDecoration: 'none', fontWeight: 700 }}>Staff Login</a>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{
        height: '400px',
        backgroundColor: '#0F1C18',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 10%',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        <h1 style={{ color: '#FFFFFF', fontSize: 48, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", margin: '0 0 16px' }}>
          Escape to Paradise.
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, maxWidth: 500, lineHeight: 1.6, margin: 0 }}>
          Experience the ultimate luxury getaway. Book your stay with us today!
        </p>
      </div>

      {/* Booking Form */}
      <div style={{ maxWidth: 800, margin: '-60px auto 40px', padding: 32, backgroundColor: '#FFFFFF', borderRadius: 16, boxShadow: '0 10px 40px rgba(0,0,0,0.08)', position: 'relative', zIndex: 10 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#17201C', marginBottom: 24, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Reserve Your Stay
        </h2>

        {success ? (
          <div style={{ padding: 24, backgroundColor: '#F0FDF4', border: '1px solid #DCFCE7', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
            <CheckCircle2 color="#16A34A" size={24} />
            <div>
              <h3 style={{ margin: '0 0 4px', color: '#166534', fontSize: 16, fontWeight: 600 }}>Booking Confirmed!</h3>
              <p style={{ margin: 0, color: '#15803D', fontSize: 14 }}>Your reservation has been sent to our system.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#66716C', marginBottom: 8 }}>Guest Name</label>
              <input 
                type="text" 
                value={formData.guestName}
                onChange={e => setFormData({...formData, guestName: e.target.value})}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #E5EAE7', fontSize: 14 }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#66716C', marginBottom: 8 }}>Days until Arrival (Lead Time)</label>
              <input 
                type="number" 
                value={formData.leadTimeDays}
                onChange={e => setFormData({...formData, leadTimeDays: e.target.value})}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #E5EAE7', fontSize: 14 }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#66716C', marginBottom: 8 }}>Deposit Type</label>
              <select 
                value={formData.depositType}
                onChange={e => setFormData({...formData, depositType: e.target.value})}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #E5EAE7', fontSize: 14, backgroundColor: '#FFFFFF' }}
              >
                <option value="No Deposit">No Deposit</option>
                <option value="Non Refund">Non Refundable</option>
                <option value="Refundable">Refundable</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#66716C', marginBottom: 8 }}>Booking Channel</label>
              <select 
                value={formData.bookingChannel}
                onChange={e => setFormData({...formData, bookingChannel: e.target.value})}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #E5EAE7', fontSize: 14, backgroundColor: '#FFFFFF' }}
              >
                <option value="Online TA">Online Travel Agent (OTA)</option>
                <option value="Direct">Direct Website</option>
                <option value="Corporate">Corporate</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#66716C', marginBottom: 8 }}>Previous Cancellations (Demo factor)</label>
              <input 
                type="number" 
                value={formData.previousCancellations}
                onChange={e => setFormData({...formData, previousCancellations: e.target.value})}
                style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid #E5EAE7', fontSize: 14 }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: 16 }}>
              <button 
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: 16,
                  backgroundColor: '#167A65',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8
                }}
              >
                {loading ? 'Processing...' : 'Confirm Booking'}
                {!loading && <ArrowRight size={18} />}
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: '#888', marginTop: 12 }}>
                *Note for Demo: Setting high lead time (60+ days) and No Deposit triggers the ML cancellation risk score!
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
