import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Info, RefreshCw } from 'lucide-react';

import AppShell from '../components/layout/AppShell';
import OccupancyAreaChart from '../components/charts/OccupancyAreaChart';
import BookingLineChart from '../components/charts/BookingLineChart';
import RoomDemandBarChart from '../components/charts/RoomDemandBarChart';
import Skeleton from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import { apiRequest } from '../lib/api';
import { formatPercent } from '../lib/utils';

export default function ManagerForecast() {
  const [searchParams, setSearchParams] = useSearchParams();
  const days = searchParams.get('days') || '7';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [occupancyData, setOccupancyData] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [demandData, setDemandData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [occRes, bookRes, demandRes] = await Promise.all([
        apiRequest(`/manager/occupancy-forecast?days=${days}`),
        apiRequest(`/manager/booking-forecast?days=${days}`),
        apiRequest('/manager/room-demand')
      ]);

      setOccupancyData(occRes.data);
      setBookingData(bookRes.data);
      setDemandData(demandRes.data);
    } catch (err) {
      console.error('Failed to load forecast data:', err);
      setError('Unable to retrieve latest forecast data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [days]);

  const handleHorizonChange = (newDays) => {
    setSearchParams({ days: newDays });
  };

  return (
    <AppShell role="manager" title="Occupancy & Demand Forecast">
      {/* Header Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16
      }}>
        {/* Horizon Select Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#66716C' }}>Forecast Horizon:</span>
          {['7', '14', '30'].map((d) => (
            <button
              key={d}
              onClick={() => handleHorizonChange(d)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                border: 'none',
                backgroundColor: days === d ? '#167A65' : '#FFFFFF',
                color: days === d ? '#FFFFFF' : '#66716C',
                boxShadow: days === d ? '0 2px 6px rgba(22,122,101,0.2)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {d} Days
            </button>
          ))}
        </div>

        {/* Room Type Selector (Disabled in ML v1) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <select
              disabled
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid #E5EAE7',
                backgroundColor: '#F0F2F1',
                color: '#66716C',
                fontSize: 13,
                cursor: 'not-allowed'
              }}
            >
              <option>All Room Types</option>
            </select>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: '#66716C' }}>
              <Info size={14} color="#5B63C7" />
              <span>Room-type filtering available in ML v2</span>
            </div>
          </div>

          <button
            onClick={fetchData}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
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
      </div>

      {error ? (
        <ErrorState section="Forecast Intelligence" onRetry={fetchData} />
      ) : loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Skeleton height="280px" />
          <Skeleton height="220px" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Section 1: Main Occupancy Area Chart */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7', padding: 24 }}>
            <OccupancyAreaChart
              points={occupancyData?.points}
              highOccupancyThreshold={occupancyData?.highOccupancyThreshold || 90}
              peakDay={occupancyData?.peakDay}
            />
          </div>

          {/* Section 2: Bookings Volume Line Chart */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7', padding: 24 }}>
            <BookingLineChart
              history={bookingData?.history}
              points={bookingData?.points}
            />
          </div>

          {/* Section 3: Daily Forecast Detail Table */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 12, border: '1px solid #E5EAE7', padding: 20 }}>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 15,
              fontWeight: 700,
              color: '#17201C',
              margin: '0 0 16px'
            }}>
              Daily Forecast Detail Breakdown
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5EAE7', color: '#66716C', fontSize: 12 }}>
                    <th style={{ padding: '10px 12px' }}>Date</th>
                    <th style={{ padding: '10px 12px' }}>Day</th>
                    <th style={{ padding: '10px 12px' }}>Predicted Bookings</th>
                    <th style={{ padding: '10px 12px' }}>Predicted Occupancy</th>
                    <th style={{ padding: '10px 12px' }}>vs 90% Target</th>
                  </tr>
                </thead>
                <tbody>
                  {occupancyData?.points?.map((p, idx) => {
                    const isHigh = p.occupancy >= 90;
                    const bPoint = bookingData?.points?.find(b => b.date === p.date);
                    return (
                      <tr key={p.date} style={{ borderBottom: idx < occupancyData.points.length - 1 ? '1px solid #F0F2F1' : 'none' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#17201C' }}>{p.date}</td>
                        <td style={{ padding: '12px', color: '#66716C' }}>{p.day}</td>
                        <td style={{ padding: '12px', fontWeight: 600, color: '#17201C' }}>{bPoint?.predictedBookings || '—'}</td>
                        <td style={{ padding: '12px', fontWeight: 700, color: isHigh ? '#C95C5C' : '#167A65' }}>
                          {formatPercent(p.occupancy)}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            fontSize: 11.5,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: 4,
                            backgroundColor: isHigh ? '#FEF2F2' : '#F0F7F4',
                            color: isHigh ? '#C95C5C' : '#3F8F70'
                          }}>
                            {isHigh ? `+${(p.occupancy - 90).toFixed(1)}% OVER` : `${(90 - p.occupancy).toFixed(1)}% UNDER`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: Room Demand Breakdown */}
          <RoomDemandBarChart data={demandData} />

          {/* Model Footer Metadata */}
          {bookingData?.modelVersion && (
            <div style={{
              textAlign: 'center',
              fontSize: 12,
              color: '#66716C',
              padding: '12px 0',
              borderTop: '1px solid #E5EAE7'
            }}>
              Model Version: <strong>{bookingData.modelVersion}</strong> · Model Confidence Score: <strong>{Math.round((bookingData.confidenceScore || 0) * 100)}%</strong>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
