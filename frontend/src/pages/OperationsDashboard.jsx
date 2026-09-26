import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut, Home, Calendar, AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';

import AppShell from '../components/layout/AppShell';
import RiskDistributionBar from '../components/charts/RiskDistributionBar';
import GuestTable from '../components/guests/GuestTable';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import { apiRequest } from '../lib/api';

export default function OperationsDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashData, setDashData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/operations/dashboard');
      setDashData(res.data);
    } catch (err) {
      console.error('Failed to load operations dashboard:', err);
      setError('Unable to load operations overview.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRiskSegmentClick = (level) => {
    navigate(`/operations/cancellations?risk=${level}`);
  };

  const kpis = dashData?.kpis || {};

  return (
    <AppShell role="data_entry" title="Operations Management Overview">
      {/* Top Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 700, color: '#17201C', margin: '0 0 2px' }}>
            Daily Arrival & Risk Dashboard
          </h2>
          <p style={{ fontSize: 13, color: '#66716C', margin: 0 }}>
            Who is arriving today and which bookings require staff attention.
          </p>
        </div>

        <button
          onClick={fetchData}
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
          Refresh
        </button>
      </div>

      {error ? (
        <ErrorState section="Operations Overview" onRetry={fetchData} />
      ) : loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Skeleton height="100px" />
          <Skeleton height="180px" />
          <Skeleton height="300px" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* KPI Cards Row (5 Cards) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 16
          }}>
            <div style={kpiCardStyle('#167A65')}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#66716C' }}>Arrivals Today</div>
              <div style={kpiValStyle('#167A65')}>{kpis.arrivalsToday || 0}</div>
              <div style={{ fontSize: 11.5, color: '#66716C' }}>Check-ins scheduled</div>
            </div>

            <div style={kpiCardStyle()}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#66716C' }}>Departures Today</div>
              <div style={kpiValStyle('#17201C')}>{kpis.departuresToday || 0}</div>
              <div style={{ fontSize: 11.5, color: '#66716C' }}>Check-outs pending</div>
            </div>

            <div style={kpiCardStyle()}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#66716C' }}>In-House Guests</div>
              <div style={kpiValStyle('#17201C')}>{kpis.inHouseGuests || 0}</div>
              <div style={{ fontSize: 11.5, color: '#66716C' }}>Current occupied rooms</div>
            </div>

            <div style={kpiCardStyle()}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#66716C' }}>Arrivals Next 7d</div>
              <div style={kpiValStyle('#5B63C7')}>{kpis.arrivalsNext7Days || 0}</div>
              <div style={{ fontSize: 11.5, color: '#66716C' }}>7-day pipeline</div>
            </div>

            <div style={kpiCardStyle('#D89A32')}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#66716C' }}>Special Requests</div>
              <div style={kpiValStyle('#D89A32')}>{kpis.specialRequestsToday || 0}</div>
              <div style={{ fontSize: 11.5, color: '#D89A32', fontWeight: 600 }}>Action needed</div>
            </div>
          </div>

          {/* Lower Grid: Risk Distribution + Today Arrivals Table */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
            {/* Risk Cohort Bar */}
            <RiskDistributionBar
              distribution={dashData?.riskDistribution}
              onSegmentClick={handleRiskSegmentClick}
            />

            {/* Today Arrivals Preview Table */}
            <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7', padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 16, fontWeight: 700, color: '#17201C', margin: '0 0 2px' }}>
                    Today's Priority Arrivals
                  </h3>
                  <p style={{ fontSize: 12.5, color: '#66716C', margin: 0 }}>
                    Sorted by cancellation risk. Click any guest to open full profile intelligence.
                  </p>
                </div>

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
                    cursor: 'pointer'
                  }}
                >
                  View All Guests
                  <ArrowRight size={14} />
                </button>
              </div>

              <GuestTable guests={dashData?.todayArrivals} />
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function kpiCardStyle(borderColor = '#E5EAE7') {
  return {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    border: `1px solid ${borderColor}`,
    padding: '16px 18px',
    boxShadow: '0 1px 4px rgba(23,32,28,0.04)'
  };
}

function kpiValStyle(color = '#17201C') {
  return {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 800,
    fontSize: 28,
    color,
    margin: '4px 0',
    lineHeight: 1
  };
}
