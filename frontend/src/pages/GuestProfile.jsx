import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogIn, LogOut, Copy, Check } from 'lucide-react';

import AppShell from '../components/layout/AppShell';
import GuestHeader from '../components/guests/GuestHeader';
import CurrentBookingCard from '../components/guests/CurrentBookingCard';
import CancellationRiskCard from '../components/guests/CancellationRiskCard';
import PreferenceList from '../components/guests/PreferenceList';
import PredictedPreferences from '../components/guests/PredictedPreferences';
import BookingHistoryTable from '../components/guests/BookingHistoryTable';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import { apiRequest } from '../lib/api';
import { formatDate, formatCurrency } from '../lib/utils';

/* Generated guest login credentials are returned exactly once by check-in —
 * this modal is the only place an ops manager can see/copy them. */
function CredentialsModal({ credentials, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!credentials) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`Username: ${credentials.username}\nPassword: ${credentials.password}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      backgroundColor: 'rgba(23,32,28,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div style={{ width: '100%', maxWidth: 420, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
        <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: '#17201C', margin: '0 0 6px' }}>
          Guest Checked In
        </h3>
        <p style={{ fontSize: 13, color: '#66716C', margin: '0 0 16px' }}>
          Share these login details with the guest — this is the only time they will be shown.
        </p>

        <div style={{ backgroundColor: '#F7F8F6', border: '1px solid #E5EAE7', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11.5, color: '#66716C', marginBottom: 2 }}>Username</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#17201C', fontFamily: 'monospace' }}>{credentials.username}</div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: '#66716C', marginBottom: 2 }}>Password</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#17201C', fontFamily: 'monospace' }}>{credentials.password}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={handleCopy}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8, border: '1px solid #E5EAE7',
              backgroundColor: '#FFFFFF', color: '#17201C', fontWeight: 600, cursor: 'pointer'
            }}
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={onClose}
            style={{ padding: '8px 18px', borderRadius: 8, border: 'none', backgroundColor: '#167A65', color: '#FFFFFF', fontWeight: 600, cursor: 'pointer' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function BookingActions({ booking, onCheckIn, onCheckOut, actionLoading }) {
  if (!booking) return null;

  if (booking.status === 'CONFIRMED') {
    return (
      <button
        onClick={onCheckIn}
        disabled={actionLoading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 8, border: 'none',
          backgroundColor: '#167A65', color: '#FFFFFF', fontWeight: 600, fontSize: 13,
          cursor: actionLoading ? 'not-allowed' : 'pointer', opacity: actionLoading ? 0.6 : 1
        }}
      >
        <LogIn size={15} /> Check In Guest
      </button>
    );
  }

  if (booking.status === 'CHECKED_IN') {
    return (
      <button
        onClick={onCheckOut}
        disabled={actionLoading}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 16px', borderRadius: 8, border: '1px solid #E5EAE7',
          backgroundColor: '#FFFFFF', color: '#17201C', fontWeight: 600, fontSize: 13,
          cursor: actionLoading ? 'not-allowed' : 'pointer', opacity: actionLoading ? 0.6 : 1
        }}
      >
        <LogOut size={15} /> Check Out Guest
      </button>
    );
  }

  return null;
}

export default function GuestProfile() {
  const { guestId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guestData, setGuestData] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [credentials, setCredentials] = useState(null);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [detailRes, predRes] = await Promise.all([
        apiRequest(`/operations/guests/${guestId}`),
        apiRequest(`/operations/guests/${guestId}/predictions`),
      ]);
      setGuestData(detailRes.data);
      setPredictions(predRes.data);
    } catch (err) {
      console.error('Failed to load guest profile:', err);
      setError('Guest profile not found or unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [guestId]);

  const handleCheckIn = async () => {
    if (!guestData?.currentStay) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const res = await apiRequest(`/operations/bookings/${guestData.currentStay.id}/check-in`, { method: 'PATCH' });
      if (res.data?.generatedCredentials) {
        setCredentials(res.data.generatedCredentials);
      }
      await fetchProfileData();
    } catch (err) {
      console.error('Check-in failed:', err);
      setActionError('Check-in failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!guestData?.currentStay) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await apiRequest(`/operations/bookings/${guestData.currentStay.id}/check-out`, { method: 'PATCH' });
      await fetchProfileData();
    } catch (err) {
      console.error('Check-out failed:', err);
      setActionError('Check-out failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (error) {
    return (
      <AppShell role="data_entry" title="Guest Profile">
        <div style={{ padding: 32, textAlign: 'center' }}>
          <ErrorState section="Guest Profile" onRetry={fetchProfileData} />
          <button
            onClick={() => navigate('/operations/guests')}
            style={{
              marginTop: 16,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 8,
              backgroundColor: '#167A65',
              color: '#FFFFFF',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} /> Return to Guest List
          </button>
        </div>
      </AppShell>
    );
  }

  if (loading) {
    return (
      <AppShell role="data_entry" title="Guest Profile Loading...">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Skeleton height="100px" />
          <Skeleton height="200px" />
          <Skeleton height="200px" />
        </div>
      </AppShell>
    );
  }

  const { profile, currentStay, preferences, bookingHistory } = guestData || {};

  // Normalize field names: backend returns arrivalDate/departureDate/bookingChannel/adr/status,
  // CurrentBookingCard expects checkIn/checkOut/channel/adrINR/specialRequest.
  const bookingView = currentStay ? {
    ...currentStay,
    checkIn: currentStay.arrivalDate,
    checkOut: currentStay.departureDate,
    channel: currentStay.bookingChannel,
    adrINR: currentStay.adr,
    specialRequest: currentStay.specialRequests > 0 ? profile?.specialRequirements : null,
  } : null;

  const cancellationView = predictions?.cancellationRisk ? {
    riskLevel: predictions.cancellationRisk.riskLevel,
    probability: predictions.cancellationRisk.cancellationProbability,
    factors: predictions.cancellationRisk.factors || [],
  } : null;

  const storedPreferencesView = (preferences || []).map(p => ({
    type: p.preferenceType,
    value: p.preferenceValue,
    source: p.source,
  }));

  const predictedPreferencesView = (predictions?.predictedPreferences || []).map(p => ({
    type: p.preferenceType,
    value: p.preferenceValue,
    probability: p.confidence,
  }));

  const historyView = (bookingHistory || []).map(b => ({
    bookingId: b.id,
    dates: `${formatDate(b.arrivalDate)} - ${formatDate(b.departureDate)}`,
    room: `${b.roomType}${b.roomNumber ? ` (${b.roomNumber})` : ''}`,
    status: b.status,
    amount: formatCurrency(b.adr),
  }));

  return (
    <AppShell role="data_entry" title={`Guest Intelligence: ${profile?.name || ''}`}>
      <GuestHeader
        profile={profile}
        cancellationRisk={cancellationView}
      />

      {currentStay && (
        <div style={{
          backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7',
          padding: 16, marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
        }}>
          <div style={{ fontSize: 13, color: '#66716C' }}>
            Booking status: <strong style={{ color: '#17201C' }}>{currentStay.status}</strong>
            {actionError && <span style={{ color: '#C95C5C', marginLeft: 12 }}>{actionError}</span>}
          </div>
          <BookingActions
            booking={currentStay}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
            actionLoading={actionLoading}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>
        <CurrentBookingCard booking={bookingView} />
        <CancellationRiskCard cancellation={cancellationView} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>
        <PreferenceList preferences={storedPreferencesView} />
        <PredictedPreferences
          predictions={predictedPreferencesView}
          status={predictedPreferencesView.length > 0 ? 'AVAILABLE' : 'UNAVAILABLE'}
        />
      </div>

      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E5EAE7',
        padding: '14px 20px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        fontSize: 13,
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div>Previous Visits: <strong style={{ color: '#167A65' }}>{profile?.previousVisits ?? 0} stays</strong></div>
        <div style={{ color: '#E5EAE7' }}>|</div>
        <div>Avg Stay Length: <strong style={{ color: '#17201C' }}>{profile?.averageStayNights ?? '—'} nights</strong></div>
        <div style={{ color: '#E5EAE7' }}>|</div>
        <div>Total Stays: <strong style={{ color: '#167A65' }}>{profile?.totalStays ?? 0}</strong></div>
      </div>

      <BookingHistoryTable history={historyView} />

      <CredentialsModal credentials={credentials} onClose={() => setCredentials(null)} />
    </AppShell>
  );
}
