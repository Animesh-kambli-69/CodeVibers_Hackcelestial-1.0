import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquareText, Sparkles, Calendar, DoorOpen, ArrowRight } from 'lucide-react';

import GuestLayout from '../components/layout/GuestLayout';
import ResortInfoCard from '../components/concierge/ResortInfoCard';
import CategoryChips from '../components/concierge/CategoryChips';
import Skeleton from '../components/ui/Skeleton';
import { apiRequest } from '../lib/api';
import { formatDate } from '../lib/utils';

export default function GuestHome() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [queryInput, setQueryInput] = useState('');

  // Dynamic greeting calculation
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Good night';
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [profRes, catalogRes] = await Promise.all([
          apiRequest('/guest/profile'),
          apiRequest('/guest/resort-info')
        ]);
        setProfile(profRes.data);
        setCatalog(catalogRes.data || []);
      } catch (err) {
        console.error('Failed to load guest home data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const categories = Array.from(new Set(catalog.map((i) => i.category)));

  const filteredCatalog = selectedCategory === 'ALL'
    ? catalog
    : catalog.filter((i) => i.category === selectedCategory);

  const handleConciergeSubmit = (e) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    navigate(`/guest/concierge?q=${encodeURIComponent(queryInput.trim())}`);
  };

  const stay = profile?.currentStay;

  return (
    <GuestLayout title="Resort Guest Portal">
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Skeleton height="120px" />
          <Skeleton height="100px" />
          <Skeleton height="200px" />
        </div>
      ) : (
        <div>
          {/* Welcome & Greeting Banner */}
          <div style={{
            backgroundColor: '#167A65',
            borderRadius: 16,
            padding: 24,
            color: '#FFFFFF',
            marginBottom: 20,
            boxShadow: '0 4px 14px rgba(22,122,101,0.2)'
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {getGreeting()}, {profile?.name?.split(' ')[0] || 'Guest'}
            </div>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 22,
              fontWeight: 800,
              margin: '4px 0 12px'
            }}>
              Welcome to Your Resort Sanctuary
            </h2>

            {stay && (
              <div style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(4px)',
                borderRadius: 10,
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 13,
                flexWrap: 'wrap',
                gap: 8
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <DoorOpen size={16} />
                  <span>{stay.roomType} (Room {stay.roomNumber})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={15} />
                  <span>{formatDate(stay.checkIn)} → {formatDate(stay.checkOut)} ({stay.nights} nights)</span>
                </div>
              </div>
            )}
          </div>

          {/* Ask AI Concierge Box */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 14,
            border: '1px solid #E5EAE7',
            padding: 18,
            marginBottom: 20,
            boxShadow: '0 2px 8px rgba(23,32,28,0.04)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#5B63C7', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>
              <MessageSquareText size={18} />
              <span>Ask AI Resort Concierge</span>
            </div>

            <form onSubmit={handleConciergeSubmit} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                placeholder="What can I do this evening? Ask anything..."
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                style={{
                  flex: 1,
                  height: 42,
                  padding: '0 14px',
                  borderRadius: 8,
                  border: '1px solid #E5EAE7',
                  backgroundColor: '#F7F8F6',
                  fontSize: 13.5,
                  outline: 'none',
                  color: '#17201C'
                }}
              />
              <button
                type="submit"
                style={{
                  height: 42,
                  padding: '0 16px',
                  borderRadius: 8,
                  border: 'none',
                  backgroundColor: '#5B63C7',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                Ask <ArrowRight size={15} />
              </button>
            </form>
          </div>

          {/* Explore Category Catalog */}
          <div style={{ marginBottom: 12 }}>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: '#17201C',
              margin: '0 0 10px'
            }}>
              Explore Resort Guide & Amenities
            </h3>

            <CategoryChips
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            <div>
              {filteredCatalog.map((info) => (
                <ResortInfoCard
                  key={info.id}
                  info={info}
                  onClick={() => navigate(`/guest/concierge?q=${encodeURIComponent(info.title)}`)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </GuestLayout>
  );
}
