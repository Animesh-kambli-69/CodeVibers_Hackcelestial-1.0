import { useState, useEffect } from 'react';
import { User, Mail, Phone, Award, Calendar, Heart, CheckCircle2 } from 'lucide-react';

import GuestLayout from '../components/layout/GuestLayout';
import Skeleton from '../components/ui/Skeleton';
import { apiRequest } from '../lib/api';

export default function GuestProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState([]);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profRes, prefRes, bookRes] = await Promise.all([
          apiRequest('/guest/profile'),
          apiRequest('/guest/preferences'),
          apiRequest('/guest/bookings')
        ]);
        setProfile(profRes.data);
        const rawPrefs = prefRes.data;
        const prefList = Array.isArray(rawPrefs) ? rawPrefs : (rawPrefs?.preferences || []);
        setPreferences(prefList);

        const rawBooks = bookRes.data;
        const bookList = Array.isArray(rawBooks) ? rawBooks : (rawBooks?.items || rawBooks?.bookings || []);
        setBookings(bookList);
      } catch (err) {
        console.error('Failed to load guest profile data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <GuestLayout title="My Guest Profile">
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Skeleton height="140px" />
          <Skeleton height="180px" />
          <Skeleton height="200px" />
        </div>
      ) : (
        <div>
          {/* Guest Identity Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #E5EAE7',
            padding: 24,
            marginBottom: 20,
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(23,32,28,0.03)'
          }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#167A65',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}>
              {profile?.name ? profile.name.charAt(0) : 'G'}
            </div>

            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 20, fontWeight: 700, color: '#17201C', margin: '0 0 4px' }}>
              {profile?.name}
            </h2>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 10px',
              borderRadius: 12,
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              color: '#D89A32',
              fontSize: 12,
              fontWeight: 700,
              marginBottom: 16
            }}>
              <Award size={14} />
              {profile?.loyaltyTier || 'Resort Guest'}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, fontSize: 13, color: '#66716C', flexWrap: 'wrap' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Mail size={14} /> {profile?.email}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Phone size={14} /> {profile?.phone}
              </span>
            </div>
          </div>

          {/* Personalized Preferences */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #E5EAE7',
            padding: 20,
            marginBottom: 20,
            boxShadow: '0 2px 8px rgba(23,32,28,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#167A65', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
              <Heart size={18} />
              <span>My Preferences</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {preferences.map((p, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 10,
                  backgroundColor: '#F7F8F6',
                  border: '1px solid #E5EAE7'
                }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#66716C', textTransform: 'uppercase' }}>
                      {p.type}:{' '}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#17201C' }}>
                      {p.value}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 11.5,
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 6,
                    backgroundColor: '#DDEBE5',
                    color: '#167A65'
                  }}>
                    {p.sourceLabel || 'Saved Preference'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stay History */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            border: '1px solid #E5EAE7',
            padding: 20,
            boxShadow: '0 2px 8px rgba(23,32,28,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#17201C', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>
              <Calendar size={18} color="#5B63C7" />
              <span>My Stays</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {bookings.map((b) => (
                <div key={b.id} style={{
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: b.status === 'UPCOMING' ? '#F0F7F4' : '#F7F8F6',
                  border: `1px solid ${b.status === 'UPCOMING' ? '#DDEBE5' : '#E5EAE7'}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#17201C' }}>
                      {b.roomType}
                    </span>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 4,
                      backgroundColor: b.status === 'UPCOMING' ? '#DDEBE5' : '#E5EAE7',
                      color: b.status === 'UPCOMING' ? '#167A65' : '#66716C'
                    }}>
                      {b.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#66716C' }}>{b.resortName}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#17201C', marginTop: 6 }}>
                    {b.dates} · {b.guests}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </GuestLayout>
  );
}
