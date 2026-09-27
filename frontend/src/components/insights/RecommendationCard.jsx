import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Sparkles } from 'lucide-react';
import { formatProbability } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { apiRequest } from '../../lib/api';

export function RecommendationCard({ recommendation, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState(recommendation.status || 'NEW'); // NEW | VIEWED | ACCEPTED | DISMISSED
  const [loading, setLoading] = useState(false);

  const priorityVariant = recommendation.priority === 'HIGH' ? 'risk-high' : recommendation.priority === 'MEDIUM' ? 'risk-medium' : 'brand';

  const handleAction = async (newStatus) => {
    setLoading(true);
    try {
      await apiRequest(`/manager/recommendations/${recommendation.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setStatus(newStatus);
      if (onStatusChange) {
        onStatusChange(recommendation.id, newStatus);
      }
    } catch (err) {
      console.error('Failed to update recommendation status:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      border: '1px solid #E5EAE7',
      padding: 20,
      marginBottom: 16,
      boxShadow: '0 2px 6px rgba(23,32,28,0.03)',
      transition: 'all 0.15s ease'
    }}>
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Badge variant={priorityVariant}>
            {recommendation.priority} PRIORITY
          </Badge>
          <Badge variant="muted">
            {recommendation.category}
          </Badge>
        </div>

        {recommendation.confidence && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 12,
            fontWeight: 600,
            color: '#5B63C7',
            backgroundColor: '#EEF0FB',
            padding: '3px 8px',
            borderRadius: 6
          }}>
            <Sparkles size={12} />
            <span>Conf. {formatProbability(recommendation.confidence)}</span>
          </div>
        )}
      </div>

      {/* Recommendation Title */}
      <h3 style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: 16,
        fontWeight: 700,
        color: '#17201C',
        margin: '0 0 8px'
      }}>
        {recommendation.title}
      </h3>

      {/* Why Explanation */}
      <p style={{ fontSize: 13.5, color: '#66716C', margin: '0 0 10px', lineHeight: 1.5 }}>
        <strong style={{ color: '#17201C', fontWeight: 600 }}>Why: </strong>
        {recommendation.reason}
      </p>

      {/* Suggested Action */}
      <div style={{
        backgroundColor: '#F0F7F4',
        borderLeft: '3px solid #167A65',
        padding: '10px 12px',
        borderRadius: '0 6px 6px 0',
        marginBottom: 14,
        fontSize: 13,
        color: '#17201C'
      }}>
        <strong style={{ color: '#167A65', fontWeight: 600 }}>Suggested Action: </strong>
        {recommendation.suggestedAction}
      </div>

      {/* Supporting Data Drawer */}
      {recommendation.sourceData && (
        <div style={{ marginBottom: 14 }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12.5,
              fontWeight: 600,
              color: '#167A65',
              cursor: 'pointer'
            }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Hide Supporting Data' : 'View Supporting Data'}
          </button>

          {expanded && (
            <div style={{
              marginTop: 10,
              padding: 12,
              backgroundColor: '#F7F8F6',
              borderRadius: 8,
              border: '1px solid #E5EAE7',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 10
            }}>
              {Object.entries(recommendation.sourceData).map(([key, val]) => (
                <div key={key}>
                  <div style={{ fontSize: 11, color: '#66716C', textTransform: 'capitalize' }}>
                    {key.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#17201C' }}>
                    {Array.isArray(val) ? val.join(', ') : String(val)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Actions / Status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: 10, borderTop: '1px solid #F0F2F1' }}>
        {status === 'ACCEPTED' ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#167A65', fontWeight: 600, fontSize: 13 }}>
            <CheckCircle size={16} />
            <span>Accepted for Action</span>
          </div>
        ) : status === 'DISMISSED' ? (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#66716C', fontWeight: 600, fontSize: 13 }}>
            <XCircle size={16} />
            <span>Dismissed</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => handleAction('DISMISSED')}
              disabled={loading}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: '1px solid #E5EAE7',
                backgroundColor: '#FFFFFF',
                color: '#66716C',
                fontWeight: 600,
                fontSize: 13,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              Dismiss
            </button>
            <button
              onClick={() => handleAction('ACCEPTED')}
              disabled={loading}
              style={{
                padding: '6px 16px',
                borderRadius: 6,
                border: 'none',
                backgroundColor: '#167A65',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: 13,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              Accept Recommendation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default RecommendationCard;
