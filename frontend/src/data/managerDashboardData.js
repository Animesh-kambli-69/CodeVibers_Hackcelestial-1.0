// ─── Smart Resort 360 — Manager Dashboard Mock Data ───
// Replace these with real API calls when backend is ready.

export const kpiData = {
  occupancy: { value: 84, change: '+6.2%', changeLabel: 'vs last week', trend: 'up' },
  predictedOccupancy: { value: 91, label: 'Next 7 days', badge: 'FORECAST' },
  upcomingBookings: { value: 128, change: '+14 today', trend: 'up' },
  bookingDemand: { value: 'HIGH', change: '+18% this week', trend: 'up' },
  highCancellationRisk: { value: 17, label: 'Require attention', trend: 'warning' },
  aiRecommendations: { value: 6, label: '3 high priority', trend: 'info' },
};

export const forecastData = [
  { day: 'Mon', actual: 82, forecast: null, confidenceLow: null, confidenceHigh: null },
  { day: 'Tue', actual: 85, forecast: null, confidenceLow: null, confidenceHigh: null },
  { day: 'Wed', actual: 87, forecast: null, confidenceLow: null, confidenceHigh: null },
  { day: 'Thu', actual: 89, forecast: 89, confidenceLow: 86, confidenceHigh: 92 },
  { day: 'Fri', actual: null, forecast: 92, confidenceLow: 88, confidenceHigh: 95 },
  { day: 'Sat', actual: null, forecast: 95, confidenceLow: 91, confidenceHigh: 98 },
  { day: 'Sun', actual: null, forecast: 91, confidenceLow: 87, confidenceHigh: 95 },
];

export const cancellationData = [
  { label: 'Low Risk',    value: 72, color: '#3F8F70' },
  { label: 'Medium Risk', value: 14, color: '#D89A32' },
  { label: 'High Risk',   value: 14, color: '#C95C5C' },
];

export const roomDemandData = [
  { type: 'Deluxe',   demand: 92, trend: 'up',     trendValue: '+18%' },
  { type: 'Suite',    demand: 81, trend: 'up',     trendValue: '+7%'  },
  { type: 'Villa',    demand: 74, trend: 'stable', trendValue: '—'    },
  { type: 'Standard', demand: 61, trend: 'down',   trendValue: '-3%'  },
];

export const insightsData = [
  {
    id: 1,
    severity: 'HIGH',
    severityColor: '#C95C5C',
    severityBg: '#FEF2F2',
    title: 'High Occupancy Expected',
    body: 'Weekend occupancy is predicted to reach 95%, exceeding recent historical peaks by 8 points.',
    action: 'Prepare additional housekeeping capacity ahead of Friday check-ins.',
    aiConfidence: 91,
  },
  {
    id: 2,
    severity: 'DEMAND',
    severityColor: '#D89A32',
    severityBg: '#FFFBEB',
    title: 'Rising Deluxe Room Demand',
    body: 'Demand for Deluxe rooms has increased 18% over the last 7 days, highest growth across all categories.',
    action: 'Review room allocation and consider dynamic pricing adjustments.',
    aiConfidence: 87,
  },
  {
    id: 3,
    severity: 'RISK',
    severityColor: '#C95C5C',
    severityBg: '#FEF2F2',
    title: 'Cancellation Risk Cluster',
    body: '17 upcoming bookings show high cancellation probability, concentrated around the Thu–Fri arrival window.',
    action: 'Prioritize proactive guest confirmation calls for this cohort.',
    aiConfidence: 92,
  },
  {
    id: 4,
    severity: 'OPPORTUNITY',
    severityColor: '#167A65',
    severityBg: '#DDEBE5',
    title: 'Upsell Opportunity Detected',
    body: 'Guests arriving this weekend have 34% higher upgrade acceptance rates based on booking behaviour patterns.',
    action: 'Brief front desk team on targeted upgrade offers at check-in.',
    aiConfidence: 78,
  },
];

export const recommendationsData = [
  {
    id: 1,
    priority: 'HIGH PRIORITY',
    priorityColor: '#C95C5C',
    priorityBg: '#FEF2F2',
    borderColor: '#FECACA',
    title: 'Contact High-Risk Bookings',
    body: '17 bookings currently have elevated cancellation probability based on booking window, channel, and guest behaviour signals.',
    action: 'Send proactive confirmation messages or personal calls to reduce churn.',
    confidence: 92,
    category: 'Guest Relations',
  },
  {
    id: 2,
    priority: 'OPERATIONS',
    priorityColor: '#D89A32',
    priorityBg: '#FFFBEB',
    borderColor: '#FDE68A',
    title: 'Increase Housekeeping Capacity',
    body: 'Weekend occupancy is expected to reach 95%. Current staffing levels are calibrated for ~80% occupancy.',
    action: 'Add temporary housekeeping coverage for Saturday and Sunday.',
    confidence: 88,
    category: 'Operations',
  },
  {
    id: 3,
    priority: 'REVENUE',
    priorityColor: '#167A65',
    priorityBg: '#DDEBE5',
    borderColor: '#A7D9CC',
    title: 'Review Deluxe Room Pricing',
    body: 'Demand has increased 18% over the last 7 days while current ADR remains flat. Market opportunity exists.',
    action: 'Review current ADR against predicted demand and competitive set.',
    confidence: 84,
    category: 'Revenue Management',
  },
];
