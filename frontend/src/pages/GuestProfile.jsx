import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, RefreshCw } from 'lucide-react';

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

export default function GuestProfile() {
  const { guestId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [guestData, setGuestData] = useState(null);

  const fetchProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest(`/operations/guests/${guestId || 'g-101'}`);
      setGuestData(res.data);
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

  const { profile, currentBooking, storedPreferences, predictions, bookingsHistory } = guestData || {};

  return (
    <AppShell role="data_entry" title={`Guest Intelligence: ${profile?.name || 'Rahul Sharma'}`}>
      {/* Header Info Banner */}
      <GuestHeader
        profile={profile}
        cancellationRisk={predictions?.cancellation}
      />

      {/* Grid Row 1: Current Booking vs Cancellation Risk */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>
        <CurrentBookingCard booking={currentBooking} />
        <CancellationRiskCard cancellation={predictions?.cancellation} />
      </div>

      {/* Grid Row 2: Stored Preferences vs Predicted Preferences */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 20 }}>
        <PreferenceList preferences={storedPreferences} />
        <PredictedPreferences
          predictions={predictions?.preferences}
          status={predictions?.predictionStatus}
        />
      </div>

      {/* AI Intelligence Summary Banner */}
      {predictions?.aiSummary && (
        <div style={{
          backgroundColor: '#EEF0FB',
          border: '1px solid rgba(91,99,199,0.3)',
          borderRadius: 12,
          padding: 20,
          marginBottom: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#5B63C7', fontWeight: 700, fontSize: 13.5, marginBottom: 6 }}>
            <Sparkles size={16} />
            <span>AI Guest Intelligence Summary</span>
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: '#17201C', lineHeight: 1.6 }}>
            {predictions.aiSummary}
          </p>
        </div>
      )}

      {/* Guest Loyalty & Visit Statistics Bar */}
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
        <div>Total Visits: <strong style={{ color: '#167A65' }}>{profile?.totalVisits || 1} stays</strong></div>
        <div style={{ color: '#E5EAE7' }}>|</div>
        <div>Avg Stay Length: <strong style={{ color: '#17201C' }}>{profile?.avgStayNights || 3} nights</strong></div>
        <div style={{ color: '#E5EAE7' }}>|</div>
        <div>Avg Historical Spend: <strong style={{ color: '#167A65' }}>₹{(profile?.avgSpendINR || 12500).toLocaleString('en-IN')}</strong></div>
      </div>

      {/* Stay History Table */}
      <BookingHistoryTable history={bookingsHistory} />
    </AppShell>
  );
}
