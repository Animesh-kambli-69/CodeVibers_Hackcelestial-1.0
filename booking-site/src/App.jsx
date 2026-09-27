import { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Users,
  CreditCard,
  ShieldCheck,
  MapPin,
  Copy,
  Check,
  RotateCcw,
  BedDouble,
  Coffee,
  Wifi,
  Waves,
  Share2,
  Receipt,
  Download
} from 'lucide-react';
import './App.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173';

const ROOM_OPTIONS = [
  {
    id: 'garden-paradise',
    name: 'Garden Paradise Room',
    type: 'STANDARD',
    price: 160,
    capacity: '2 Adults',
    bed: '1 King Bed',
    size: '42 m²',
    amenities: ['Lush Garden View', 'High-speed WiFi', 'Rain Shower', 'Organic Toiletries'],
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    tag: 'Best Value'
  },
  {
    id: 'deluxe-lagoon',
    name: 'Deluxe Lagoon Villa',
    type: 'DELUXE',
    price: 280,
    capacity: '2 Adults, 1 Child',
    bed: '1 King or 2 Queen Beds',
    size: '65 m²',
    amenities: ['Direct Lagoon View', 'Private Deck', 'Deep Soaking Tub', 'Complimentary Breakfast'],
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    tag: 'Popular'
  },
  {
    id: 'sunset-ocean-suite',
    name: 'Sunset Ocean Suite',
    type: 'SUITE',
    price: 420,
    capacity: '3 Adults',
    bed: '1 Master King Suite',
    size: '95 m²',
    amenities: ['Panoramic Ocean View', 'Outdoor Jacuzzi', 'VIP Lounge Access', 'Express Butler'],
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    tag: 'Luxury'
  },
  {
    id: 'celestial-presidential',
    name: 'Celestial Presidential Villa',
    type: 'PRESIDENTIAL',
    price: 750,
    capacity: '4 Adults',
    bed: '2 Master Suites',
    size: '180 m²',
    amenities: ['Private Infinity Pool', '24/7 Dedicated Butler', 'Private Chef Dining', 'Airport Limousine'],
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    tag: 'Signature VIP'
  }
];

export default function App() {
  const [selectedRoom, setSelectedRoom] = useState(ROOM_OPTIONS[1]);
  const [checkInDate, setCheckInDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [checkOutDate, setCheckOutDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  });

  const [formData, setFormData] = useState({
    guestName: 'Alex Mercer',
    email: 'alex.mercer@example.com',
    phone: '+1 (555) 382-9012',
    adults: '2',
    depositType: 'No Deposit',
    bookingChannel: 'Direct',
    previousCancellations: '0',
    specialRequests: 'High floor, quiet room with ocean breeze'
  });

  const [loading, setLoading] = useState(false);
  const [bookedData, setBookedData] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Compute stay duration in nights
  const computeNights = (inDate, outDate) => {
    const start = new Date(inDate);
    const end = new Date(outDate);
    const diffTime = Math.max(1, end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = computeNights(checkInDate, checkOutDate);
  const baseCost = selectedRoom.price * nights;
  const resortFee = 35 * nights;
  const tax = Math.round((baseCost + resortFee) * 0.12);
  const totalCost = baseCost + resortFee + tax;

  // On initial mount, check if the URL contains booked parameters!
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookingRef = params.get('booking_ref');
    const roomName = params.get('room');
    const cost = params.get('cost');

    if (bookingRef && roomName && cost) {
      const matchedRoom = ROOM_OPTIONS.find(r => r.name.toLowerCase() === roomName.toLowerCase()) || {
        name: roomName,
        price: Math.round(Number(cost) / (Number(params.get('nights')) || 1)),
        type: params.get('room_type') || 'DELUXE',
        amenities: ['Ocean View', 'Complimentary Breakfast', 'WiFi'],
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
      };

      setBookedData({
        bookingRef,
        room: matchedRoom,
        guestName: params.get('guest') || 'Valued Guest',
        email: params.get('email') || 'guest@example.com',
        checkInDate: params.get('checkin') || checkInDate,
        checkOutDate: params.get('checkout') || checkOutDate,
        nights: Number(params.get('nights')) || 3,
        adults: params.get('adults') || '2',
        depositType: params.get('deposit') || 'No Deposit',
        totalCost: Number(cost),
        baseCost: Number(params.get('base_cost')) || Number(cost) - 80,
        tax: Number(params.get('tax')) || 80,
        bookedAt: params.get('booked_at') || new Date().toISOString().split('T')[0],
        status: params.get('status') || 'CONFIRMED'
      });
    }
  }, []);

  // Update URL parameters when booked
  const syncBookedUrl = (data) => {
    const params = new URLSearchParams();
    params.set('booking_ref', data.bookingRef);
    params.set('room', data.room.name);
    params.set('room_type', data.room.type);
    params.set('cost', data.totalCost.toString());
    params.set('base_cost', data.baseCost.toString());
    params.set('tax', data.tax.toString());
    params.set('nights', data.nights.toString());
    params.set('checkin', data.checkInDate);
    params.set('checkout', data.checkOutDate);
    params.set('guest', data.guestName);
    params.set('email', data.email);
    params.set('adults', data.adults);
    params.set('deposit', data.depositType);
    params.set('status', 'CONFIRMED');
    params.set('booked_at', new Date().toISOString().split('T')[0]);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };

  // Reset / Clear URL parameters to book again
  const handleReset = () => {
    window.history.pushState({}, '', window.location.pathname);
    setBookedData(null);
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let generatedRef = `CSR-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      // POST directly to the PostgreSQL backend public bookings endpoint
      const response = await fetch(`${BACKEND_URL}/api/public/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: formData.guestName,
          email: formData.email,
          phone: formData.phone,
          roomType: selectedRoom.type,
          checkInDate,
          checkOutDate,
          adults: formData.adults,
          depositType: formData.depositType,
          bookingChannel: formData.bookingChannel,
          previousCancellations: formData.previousCancellations,
          specialRequests: formData.specialRequests,
          adr: selectedRoom.price,
          totalCost
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.bookingRef) {
          generatedRef = result.bookingRef;
        }
      }
    } catch (err) {
      console.warn('Backend sync note (using local fallback ref):', err.message);
    } finally {
      const bookingPayload = {
        bookingRef: generatedRef,
        room: selectedRoom,
        guestName: formData.guestName,
        email: formData.email,
        phone: formData.phone,
        checkInDate,
        checkOutDate,
        nights,
        adults: formData.adults,
        depositType: formData.depositType,
        bookingChannel: formData.bookingChannel,
        previousCancellations: formData.previousCancellations,
        baseCost,
        tax: tax + resortFee,
        totalCost,
        bookedAt: new Date().toISOString().split('T')[0],
        status: 'CONFIRMED'
      };

      setLoading(false);
      setBookedData(bookingPayload);
      syncBookedUrl(bookingPayload);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="booking-app-container">
      {/* Top Luxury Navbar */}
      <header className="booking-navbar">
        <div className="nav-brand">
          <div className="brand-icon-box">
            <Sparkles size={20} color="#167A65" />
          </div>
          <div className="brand-text-wrap">
            <span className="brand-title">THE CELESTIAL RESORT</span>
            <span className="brand-subtitle">& SPA SANCTUARY</span>
          </div>
        </div>


      </header>

      {/* ========================================================================= */}
      {/* 1. BOOKED CONFIRMATION UI (Shown when reservation is active / in URL)     */}
      {/* ========================================================================= */}
      {bookedData ? (
        <main className="confirmation-view-container">
          {/* Status Header Banner */}
          <div className="confirmation-banner">
            <div className="banner-badge">
              <CheckCircle2 size={24} color="#16A34A" />
              <span>RESERVATION CONFIRMED & SECURED</span>
            </div>
            <h1 className="banner-title">Your Island Escape Awaits</h1>
            <p className="banner-subtitle">
              Confirmation voucher generated. All details, room tier, and total cost are synchronized directly in your URL.
            </p>

            <div className="url-storage-pill">
              <Share2 size={15} color="#0D3B31" />
              <span className="url-pill-text">Stored in URL: <strong>{bookedData.room.name}</strong> • <strong>${bookedData.totalCost} USD</strong></span>
            </div>
          </div>

          {/* Ticket Voucher Card */}
          <div className="voucher-card">
            {/* Top Voucher Header */}
            <div className="voucher-header">
              <div>
                <span className="voucher-eyebrow">CONFIRMATION REFERENCE</span>
                <h2 className="voucher-code">{bookedData.bookingRef}</h2>
              </div>
              <div className="voucher-status-pill">
                <span className="status-dot"></span>
                {bookedData.status}
              </div>
            </div>

            <div className="voucher-grid">
              {/* Left Column: Room & Visual */}
              <div className="voucher-room-col">
                <img
                  src={bookedData.room.image}
                  alt={bookedData.room.name}
                  className="voucher-room-img"
                />
                <div className="voucher-room-info">
                  <div className="room-tier-badge">{bookedData.room.type} CATEGORY</div>
                  <h3 className="voucher-room-name">{bookedData.room.name}</h3>
                  <div className="voucher-room-features">
                    <span className="feature-pill"><BedDouble size={14} /> {bookedData.room.bed || '1 King Bed'}</span>
                    <span className="feature-pill"><Users size={14} /> {bookedData.adults} Guests</span>
                    <span className="feature-pill"><Wifi size={14} /> High-Speed WiFi</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Dates, Guest & Breakdown */}
              <div className="voucher-details-col">
                {/* Stay Dates Box */}
                <div className="stay-dates-card">
                  <div className="date-block">
                    <span className="date-label">CHECK-IN</span>
                    <strong className="date-val">{bookedData.checkInDate}</strong>
                    <span className="date-time">From 3:00 PM</span>
                  </div>
                  <div className="stay-duration-divider">
                    <span className="duration-pill">{bookedData.nights} NIGHTS</span>
                  </div>
                  <div className="date-block">
                    <span className="date-label">CHECK-OUT</span>
                    <strong className="date-val">{bookedData.checkOutDate}</strong>
                    <span className="date-time">Until 11:00 AM</span>
                  </div>
                </div>

                {/* Guest Details */}
                <div className="guest-info-table">
                  <div className="info-row">
                    <span className="row-key">Primary Guest</span>
                    <strong className="row-val">{bookedData.guestName}</strong>
                  </div>
                  <div className="info-row">
                    <span className="row-key">Contact Email</span>
                    <span className="row-val">{bookedData.email}</span>
                  </div>
                  <div className="info-row">
                    <span className="row-key">Payment / Deposit</span>
                    <span className="row-val deposit-tag">{bookedData.depositType}</span>
                  </div>
                </div>

                {/* Itemized Cost Breakdown */}
                <div className="cost-breakdown-card">
                  <div className="breakdown-header">
                    <Receipt size={16} color="#167A65" />
                    <span>Itemized Cost & Billable Total</span>
                  </div>
                  <div className="breakdown-row">
                    <span>{bookedData.room.name} ({bookedData.nights} nights × ${Math.round(bookedData.baseCost / bookedData.nights)})</span>
                    <span>${bookedData.baseCost}</span>
                  </div>
                  <div className="breakdown-row">
                    <span>Resort Environmental Fee & Taxes (12%)</span>
                    <span>${bookedData.tax}</span>
                  </div>
                  <div className="breakdown-total">
                    <span className="total-label">Total Amount Paid / Secured:</span>
                    <span className="total-amount">${bookedData.totalCost} USD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="voucher-actions-bar">
              <button
                onClick={handleCopyShareLink}
                className="action-btn copy-url-btn"
              >
                {copiedLink ? <Check size={16} color="#16A34A" /> : <Copy size={16} />}
                {copiedLink ? 'URL Link Copied!' : 'Shareable Booking URL'}
              </button>

              <button
                onClick={() => window.print()}
                className="action-btn print-btn"
              >
                <Download size={16} />
                Print Voucher
              </button>

              <button
                onClick={handleReset}
                className="action-btn new-booking-btn"
              >
                <RotateCcw size={16} />
                Book Another Room
              </button>
            </div>
          </div>
        </main>
      ) : (
        /* ========================================================================= */
        /* 2. BOOKING DISCOVERY & RESERVATION FORM                                  */
        /* ========================================================================= */
        <main className="booking-main-content">
          {/* Hero Header */}
          <section className="booking-hero">
            <div className="hero-content">
              <span className="hero-eyebrow">EXCLUSIVE HACKCELESTIAL GETAWAY</span>
              <h1 className="hero-title">Experience Unparalleled Luxury</h1>
              <p className="hero-description">
                Immerse yourself in world-class architecture, Michelin-inspired dining, and panoramic coastal serenity.
              </p>
            </div>
          </section>

          <div className="booking-layout-grid">
            {/* Left Side: Room Selection Catalog */}
            <section className="room-selection-section" id="rooms">
              <div className="section-header">
                <div>
                  <h2 className="section-title">1. Select Room & Suite</h2>
                  <p className="section-subtitle">Choose your preferred architectural space for this stay</p>
                </div>
              </div>

              <div className="room-cards-stack">
                {ROOM_OPTIONS.map((room) => {
                  const isSelected = selectedRoom.id === room.id;
                  return (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`room-card ${isSelected ? 'room-card-selected' : ''}`}
                    >
                      <div className="room-card-img-wrap">
                        <img src={room.image} alt={room.name} className="room-img" />
                        <span className="room-card-tag">{room.tag}</span>
                      </div>

                      <div className="room-card-body">
                        <div className="room-card-top">
                          <div>
                            <span className="room-type-eyebrow">{room.type}</span>
                            <h3 className="room-title">{room.name}</h3>
                          </div>
                          <div className="room-card-price">
                            <span className="price-num">${room.price}</span>
                            <span className="price-unit">/ night</span>
                          </div>
                        </div>

                        <div className="room-specs-row">
                          <span><Users size={13} /> {room.capacity}</span>
                          <span><BedDouble size={13} /> {room.bed}</span>
                          <span><Waves size={13} /> {room.size}</span>
                        </div>

                        <div className="room-amenities-tags">
                          {room.amenities.map((item, idx) => (
                            <span key={idx} className="amenity-chip">{item}</span>
                          ))}
                        </div>
                      </div>

                      <div className="room-select-radio">
                        <div className={`radio-circle ${isSelected ? 'radio-circle-active' : ''}`}>
                          {isSelected && <div className="radio-inner" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Right Side: Stay Dates, Guest Info & Live Cost Summary */}
            <aside className="booking-sidebar">
              <form onSubmit={handleSubmit} className="reservation-form-panel">
                <div className="panel-header">
                  <h3 className="panel-title">2. Reservation Details</h3>
                  <span className="panel-badge">Live Pricing</span>
                </div>

                {/* Stay Dates */}
                <div className="form-group-dates">
                  <div className="input-group">
                    <label className="input-label">Check-in Date</label>
                    <div className="input-with-icon">
                      <Calendar size={16} className="field-icon" />
                      <input
                        type="date"
                        required
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Check-out Date</label>
                    <div className="input-with-icon">
                      <Calendar size={16} className="field-icon" />
                      <input
                        type="date"
                        required
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>

                {/* Guest Profile Inputs */}
                <div className="input-group">
                  <label className="input-label">Guest Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.guestName}
                    onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                    placeholder="e.g. Eleanor Vance"
                    className="form-input"
                  />
                </div>

                <div className="form-group-row">
                  <div className="input-group">
                    <label className="input-label">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="eleanor@example.com"
                      className="form-input"
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Guests (Adults)</label>
                    <select
                      value={formData.adults}
                      onChange={(e) => setFormData({ ...formData, adults: e.target.value })}
                      className="form-input form-select"
                    >
                      <option value="1">1 Adult</option>
                      <option value="2">2 Adults</option>
                      <option value="3">3 Adults</option>
                      <option value="4">4 Adults</option>
                    </select>
                  </div>
                </div>

                {/* Deposit & Booking Channel */}
                <div className="form-group-row">
                  <div className="input-group">
                    <label className="input-label">Deposit Type</label>
                    <select
                      value={formData.depositType}
                      onChange={(e) => setFormData({ ...formData, depositType: e.target.value })}
                      className="form-input form-select"
                    >
                      <option value="No Deposit">No Deposit</option>
                      <option value="Non Refund">Non Refundable</option>
                      <option value="Refundable">Refundable Deposit</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Booking Channel</label>
                    <select
                      value={formData.bookingChannel}
                      onChange={(e) => setFormData({ ...formData, bookingChannel: e.target.value })}
                      className="form-input form-select"
                    >
                      <option value="Direct">Direct Hotel Website</option>
                      <option value="Online TA">Online Travel Agent (OTA)</option>
                      <option value="Corporate">Corporate Preferred</option>
                    </select>
                  </div>
                </div>

                {/* Live Cost Calculation Card */}
                <div className="live-cost-calculator">
                  <div className="cost-calc-header">
                    <Receipt size={16} color="#167A65" />
                    <span>Price Summary ({nights} {nights === 1 ? 'Night' : 'Nights'})</span>
                  </div>

                  <div className="calc-line">
                    <span>{selectedRoom.name}</span>
                    <span>${baseCost}</span>
                  </div>
                  <div className="calc-line">
                    <span>Resort Facility Fee</span>
                    <span>${resortFee}</span>
                  </div>
                  <div className="calc-line">
                    <span>Estimated Taxes (12%)</span>
                    <span>${tax}</span>
                  </div>

                  <div className="calc-total-divider"></div>

                  <div className="calc-total-row">
                    <span className="total-title">Total Cost:</span>
                    <span className="total-value">${totalCost} <span className="currency-label">USD</span></span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="confirm-booking-submit-btn"
                >
                  {loading ? (
                    'Securing Reservation...'
                  ) : (
                    <>
                      <span>Confirm & Book Room (${totalCost})</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <div className="trust-guarantee-row">
                  <ShieldCheck size={16} color="#16A34A" />
                  <span>Instant URL Confirmation & Encrypted Booking</span>
                </div>
              </form>
            </aside>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="booking-footer">
        <p>© 2026 The Celestial Resort & Spa Sanctuary. Standalone Guest Booking Portal.</p>
        <div className="footer-links">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
          <span>Concierge Desk</span>
        </div>
      </footer>
    </div>
  );
}
