import { ArrowLeft, Mail, Phone, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RiskBadge } from '../ui/RiskBadge';

export function GuestHeader({ profile, cancellationRisk }) {
  const navigate = useNavigate();

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Back button */}
      <button
        onClick={() => navigate('/operations/guests')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          color: '#167A65',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          padding: 0,
          marginBottom: 12
        }}
      >
        <ArrowLeft size={16} />
        Back to Guests
      </button>

      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E5EAE7',
        padding: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Avatar */}
          <div style={{
            width: 54,
            height: 54,
            borderRadius: 27,
            backgroundColor: '#167A65',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>
            {profile?.name ? profile.name.charAt(0) : 'G'}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 22,
                fontWeight: 700,
                color: '#17201C',
                margin: 0
              }}>
                {profile?.name}
              </h1>

              {profile?.loyaltyTier && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  borderRadius: 6,
                  backgroundColor: '#FFFBEB',
                  border: '1px solid #FDE68A',
                  color: '#D89A32',
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  <Award size={13} />
                  {profile.loyaltyTier}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 6, fontSize: 13, color: '#66716C' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Mail size={14} />
                {profile?.email}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Phone size={14} />
                {profile?.phone}
              </span>
            </div>
          </div>
        </div>

        {cancellationRisk && (
          <div>
            <RiskBadge
              riskLevel={cancellationRisk.riskLevel}
              probability={cancellationRisk.probability}
              style={{ fontSize: 13, padding: '6px 12px' }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default GuestHeader;
