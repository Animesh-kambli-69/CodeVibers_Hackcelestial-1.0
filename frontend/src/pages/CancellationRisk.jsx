import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertTriangle, RefreshCw } from 'lucide-react';

import AppShell from '../components/layout/AppShell';
import CancellationRiskTable from '../components/guests/CancellationRiskTable';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import { apiRequest } from '../lib/api';

export default function CancellationRisk() {
  const [searchParams, setSearchParams] = useSearchParams();
  const riskParam = searchParams.get('risk') || 'ALL';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [riskList, setRiskList] = useState([]);

  const fetchRiskData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/operations/cancellation-risk');
      setRiskList(res.data || []);
    } catch (err) {
      console.error('Failed to load cancellation risk list:', err);
      setError('Unable to load cancellation risk cohort.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiskData();
  }, []);

  const handleRiskFilterChange = (val) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (val !== 'ALL') p.set('risk', val);
      else p.delete('risk');
      return p;
    });
  };

  const filteredCohort = riskList.filter((item) => {
    if (riskParam !== 'ALL' && item.riskLevel !== riskParam) return false;
    return true;
  });

  return (
    <AppShell role="data_entry" title="Cancellation Risk Cohort">
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
            backgroundColor: '#FEF2F2',
            color: '#C95C5C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertTriangle size={20} />
          </div>
          <div>
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: '#17201C',
              margin: '0 0 2px'
            }}>
              Cancellation Risk Management
            </h2>
            <p style={{ fontSize: 13, color: '#66716C', margin: 0 }}>
              Bookings flagged with elevated cancellation probability by ML model.
            </p>
          </div>
        </div>

        <button
          onClick={fetchRiskData}
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
          Refresh Cohort
        </button>
      </div>

      {/* Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E5EAE7',
        padding: 16
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#66716C' }}>Filter Risk Cohort:</span>
        {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
          <button
            key={lvl}
            onClick={() => handleRiskFilterChange(lvl)}
            style={{
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              backgroundColor: riskParam === lvl ? '#167A65' : '#F7F8F6',
              color: riskParam === lvl ? '#FFFFFF' : '#66716C',
              cursor: 'pointer'
            }}
          >
            {lvl === 'ALL' ? 'All Cohorts' : `${lvl} RISK ONLY`}
          </button>
        ))}
      </div>

      {/* Table Content */}
      {error ? (
        <ErrorState section="Cancellation Cohorts" onRetry={fetchRiskData} />
      ) : loading ? (
        <Skeleton height="300px" />
      ) : (
        <CancellationRiskTable cohort={filteredCohort} />
      )}
    </AppShell>
  );
}
