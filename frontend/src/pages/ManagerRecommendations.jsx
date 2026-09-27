import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, ShieldCheck, RefreshCw } from 'lucide-react';

import AppShell from '../components/layout/AppShell';
import RecommendationCard from '../components/insights/RecommendationCard';
import RecommendationFilters from '../components/insights/RecommendationFilters';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { apiRequest } from '../lib/api';

export default function ManagerRecommendations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const priorityParam = searchParams.get('priority') || 'ALL';
  const categoryParam = searchParams.get('category') || 'ALL';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/manager/recommendations');
      const items = Array.isArray(res.data) ? res.data : (res.data?.items || res.items || []);
      setRecommendations(items);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      setError('Unable to load AI recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handlePriorityChange = (val) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (val === 'ALL') p.delete('priority');
      else p.set('priority', val);
      return p;
    });
  };

  const handleCategoryChange = (val) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (val === 'ALL') p.delete('category');
      else p.set('category', val);
      return p;
    });
  };

  const handleStatusChange = (id, newStatus) => {
    setRecommendations((prev) =>
      prev.map((rec) => (rec.id === id ? { ...rec, status: newStatus } : rec))
    );
  };

  // Filter recommendations
  const filteredList = recommendations.filter((rec) => {
    if (priorityParam !== 'ALL' && rec.priority !== priorityParam) return false;
    if (categoryParam !== 'ALL' && rec.category !== categoryParam) return false;
    return true;
  });

  return (
    <AppShell role="manager" title="AI Action Recommendations">
      {/* Header Banner */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E5EAE7',
        padding: 20,
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            backgroundColor: '#EEF0FB',
            color: '#5B63C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: '#17201C',
              margin: '0 0 2px'
            }}>
              Decision Intelligence Engine
            </h2>
            <p style={{ fontSize: 13, color: '#66716C', margin: 0 }}>
              AI-generated operational actions ranked by priority and confidence.
            </p>
          </div>
        </div>

        <button
          onClick={fetchRecommendations}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid #E5EAE7',
            backgroundColor: '#FFFFFF',
            color: '#17201C',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh Insights
        </button>
      </div>

      {/* Filters */}
      <RecommendationFilters
        priority={priorityParam}
        category={categoryParam}
        onPriorityChange={handlePriorityChange}
        onCategoryChange={handleCategoryChange}
      />

      {/* Content List */}
      {error ? (
        <ErrorState section="Recommendations" onRetry={fetchRecommendations} />
      ) : loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Skeleton height="160px" />
          <Skeleton height="160px" />
          <Skeleton height="160px" />
        </div>
      ) : filteredList.length === 0 ? (
        <EmptyState message="No recommendations match the selected filters." />
      ) : (
        <div>
          {filteredList.map((rec) => (
            <RecommendationCard
              key={rec.id}
              recommendation={rec}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Human-in-the-Loop Safeguard Notice */}
      <div style={{
        marginTop: 24,
        padding: '12px 16px',
        backgroundColor: '#F7F8F6',
        borderRadius: 8,
        border: '1px solid #E5EAE7',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 12.5,
        color: '#66716C'
      }}>
        <ShieldCheck size={18} color="#167A65" style={{ flexShrink: 0 }} />
        <span>
          <strong>Human-in-the-Loop Safeguard:</strong> Accepting marks a recommendation for action. The system never modifies prices, room allocations, or bookings automatically.
        </span>
      </div>
    </AppShell>
  );
}
