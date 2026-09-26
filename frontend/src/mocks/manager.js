// ─── Manager Role Mock Data ───
// Matches API response shapes from design.md & api.md

export const managerDashboard = {
  kpis: {
    currentOccupancy: { value: 84, change: 6.2, changeLabel: 'vs last week' },
    predictedOccupancy: { value: 91, label: 'Next 7 days', badge: 'FORECAST' },
    upcomingBookings: { value: 128, change: 14, changeLabel: 'today' },
    bookingDemand: { value: 'HIGH', change: 18, changeLabel: 'this week' },
    highRiskCancellations: { value: 17, label: 'Require attention' },
    activeRecommendations: { value: 6, label: '3 high priority' }
  }
};

export const bookingForecast = {
  horizonDays: 7,
  modelVersion: 'booking-xgb-v1',
  confidenceScore: 0.91,
  history: [
    { date: '2026-09-21', day: 'Mon', actualBookings: 82 },
    { date: '2026-09-22', day: 'Tue', actualBookings: 85 },
    { date: '2026-09-23', day: 'Wed', actualBookings: 87 },
    { date: '2026-09-24', day: 'Thu', actualBookings: 89 }
  ],
  points: [
    { date: '2026-09-24', day: 'Thu', predictedBookings: 89, confidenceLow: 86, confidenceHigh: 92 },
    { date: '2026-09-25', day: 'Fri', predictedBookings: 92, confidenceLow: 88, confidenceHigh: 95 },
    { date: '2026-09-26', day: 'Sat', predictedBookings: 95, confidenceLow: 91, confidenceHigh: 98 },
    { date: '2026-09-27', day: 'Sun', predictedBookings: 91, confidenceLow: 87, confidenceHigh: 95 },
    { date: '2026-09-28', day: 'Mon', predictedBookings: 86, confidenceLow: 82, confidenceHigh: 90 },
    { date: '2026-09-29', day: 'Tue', predictedBookings: 94, confidenceLow: 90, confidenceHigh: 97 },
    { date: '2026-09-30', day: 'Wed', predictedBookings: 88, confidenceLow: 84, confidenceHigh: 92 }
  ]
};

export const occupancyForecast = {
  highOccupancyThreshold: 90,
  peakDay: { date: '2026-09-29', day: 'Tue', occupancy: 94.0 },
  points: [
    { date: '2026-09-24', day: 'Thu', occupancy: 89.0, confidenceLow: 86.0, confidenceHigh: 92.0 },
    { date: '2026-09-25', day: 'Fri', occupancy: 92.0, confidenceLow: 88.0, confidenceHigh: 95.0 },
    { date: '2026-09-26', day: 'Sat', occupancy: 95.0, confidenceLow: 91.0, confidenceHigh: 98.0 },
    { date: '2026-09-27', day: 'Sun', occupancy: 91.0, confidenceLow: 87.0, confidenceHigh: 95.0 },
    { date: '2026-09-28', day: 'Mon', occupancy: 86.0, confidenceLow: 82.0, confidenceHigh: 90.0 },
    { date: '2026-09-29', day: 'Tue', occupancy: 94.0, confidenceLow: 90.0, confidenceHigh: 97.0 },
    { date: '2026-09-30', day: 'Wed', occupancy: 88.0, confidenceLow: 84.0, confidenceHigh: 92.0 }
  ]
};

export const cancellationSummary = {
  lowRiskCount: 72,
  mediumRiskCount: 14,
  highRiskCount: 17,
  expectedCancellations: 5.4,
  totalBookingsEvaluated: 103
};

export const roomDemand = [
  { roomType: 'Deluxe', demandLevel: 'HIGH', occupancyPct: 92, availableRooms: 4, trendDeltaPct: 18 },
  { roomType: 'Suite', demandLevel: 'MEDIUM', occupancyPct: 81, availableRooms: 8, trendDeltaPct: 7 },
  { roomType: 'Villa', demandLevel: 'MEDIUM', occupancyPct: 74, availableRooms: 6, trendDeltaPct: 0 },
  { roomType: 'Standard', demandLevel: 'LOW', occupancyPct: 61, availableRooms: 15, trendDeltaPct: -3 }
];

export const recommendations = [
  {
    id: 'rec-101',
    status: 'NEW',
    priority: 'HIGH',
    category: 'OPERATIONS',
    title: 'Prepare for high occupancy weekend',
    whyText: 'Predicted occupancy is 95% on Sat, 26 Sep.',
    suggestedAction: 'Review housekeeping, front-desk capacity and early morning shift coverage.',
    confidence: 0.89,
    sourceData: {
      predictedOccupancy: '95%',
      historicalPeak: '87%',
      impactedDepartments: ['Housekeeping', 'Front Desk', 'Kitchen']
    }
  },
  {
    id: 'rec-102',
    status: 'NEW',
    priority: 'HIGH',
    category: 'CANCELLATION',
    title: 'High cancellation risk cluster detected',
    whyText: '17 upcoming bookings show high cancellation probability around Thu-Fri window.',
    suggestedAction: 'Send proactive confirmation messages or courtesy calls.',
    confidence: 0.92,
    sourceData: {
      highRiskBookings: 17,
      leadTimeAvgDays: 68,
      channelBreakdown: '80% Online TA'
    }
  },
  {
    id: 'rec-103',
    status: 'NEW',
    priority: 'MEDIUM',
    category: 'REVENUE',
    title: 'Deluxe Room demand surge (+18%)',
    whyText: 'Demand for Deluxe rooms grew 18% in 7 days while ADR remained flat.',
    suggestedAction: 'Adjust Deluxe rate tiers or optimize availability constraints.',
    confidence: 0.84,
    sourceData: {
      category: 'Deluxe',
      occupancy: '92%',
      currentADR: '₹8,500',
      suggestedADR: '₹9,800'
    }
  }
];

export const pricingRecommendations = [
  { roomType: 'Deluxe', currentADR: 8500, suggestedADR: 9800, changePct: 15.3, predictedOccupancy: 92, demandLevel: 'HIGH', reason: 'High demand surge (+18% searches)' },
  { roomType: 'Suite', currentADR: 16000, suggestedADR: 17500, changePct: 9.3, predictedOccupancy: 81, demandLevel: 'MEDIUM', reason: 'Weekend premium alignment' },
  { roomType: 'Villa', currentADR: 28000, suggestedADR: 28000, changePct: 0, predictedOccupancy: 74, demandLevel: 'MEDIUM', reason: 'Balanced market pricing' },
  { roomType: 'Standard', currentADR: 5500, suggestedADR: 5200, changePct: -5.4, predictedOccupancy: 61, demandLevel: 'LOW', reason: 'Fill remaining mid-week capacity' }
];

export const sentiment = {
  averageRating: 4.6,
  breakdown: { positive: 78, neutral: 14, negative: 8 },
  topics: [
    { topic: 'Room Cleanliness', negativeSharePct: 3, change: -1.2, trend: 'up' },
    { topic: 'Check-in Speed', negativeSharePct: 12, change: 4.1, trend: 'down' },
    { topic: 'Dining Quality', negativeSharePct: 6, change: -0.5, trend: 'up' },
    { topic: 'Spa Services', negativeSharePct: 2, change: 0, trend: 'stable' }
  ]
};
