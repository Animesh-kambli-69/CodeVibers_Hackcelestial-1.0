// ─── Operations Role Mock Data ───
// Featuring PRD §63 demo scenario: Rahul Sharma (84% cancellation probability)

export const operationsDashboard = {
  kpis: {
    arrivalsToday: 24,
    departuresToday: 18,
    inHouseGuests: 112,
    arrivalsNext7Days: 142,
    specialRequestsToday: 9
  },
  riskDistribution: {
    high: 17,
    medium: 28,
    low: 97
  },
  todayArrivals: [
    {
      id: 'g-101',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+91 98765 43210',
      roomType: 'Deluxe',
      roomNumber: '214',
      arrivalDate: '2026-09-28',
      departureDate: '2026-10-01',
      riskLevel: 'HIGH',
      cancellationProbability: 0.84,
      specialRequest: 'Late check-in (9:00 PM)'
    },
    {
      id: 'g-102',
      name: 'Priya Ananth',
      email: 'priya.a@example.com',
      phone: '+91 98123 45678',
      roomType: 'Suite',
      roomNumber: '302',
      arrivalDate: '2026-09-28',
      departureDate: '2026-09-30',
      riskLevel: 'MEDIUM',
      cancellationProbability: 0.42,
      specialRequest: 'Honeymoon arrangement'
    },
    {
      id: 'g-103',
      name: 'Vikram Sethi',
      email: 'vsethi@example.com',
      phone: '+91 97654 32109',
      roomType: 'Villa',
      roomNumber: 'V-04',
      arrivalDate: '2026-09-28',
      departureDate: '2026-10-03',
      riskLevel: 'LOW',
      cancellationProbability: 0.11,
      specialRequest: 'Airport transfer'
    }
  ]
};

export const guestList = [
  {
    id: 'g-101',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    phone: '+91 98765 43210',
    roomType: 'Deluxe',
    roomNumber: '214',
    arrivalDate: '2026-09-28',
    departureDate: '2026-10-01',
    riskLevel: 'HIGH',
    cancellationProbability: 0.84,
    topPreference: 'Vegetarian Food'
  },
  {
    id: 'g-102',
    name: 'Priya Ananth',
    email: 'priya.a@example.com',
    phone: '+91 98123 45678',
    roomType: 'Suite',
    roomNumber: '302',
    arrivalDate: '2026-09-28',
    departureDate: '2026-09-30',
    riskLevel: 'MEDIUM',
    cancellationProbability: 0.42,
    topPreference: 'Sea View'
  },
  {
    id: 'g-103',
    name: 'Vikram Sethi',
    email: 'vsethi@example.com',
    phone: '+91 97654 32109',
    roomType: 'Villa',
    roomNumber: 'V-04',
    arrivalDate: '2026-09-28',
    departureDate: '2026-10-03',
    riskLevel: 'LOW',
    cancellationProbability: 0.11,
    topPreference: 'Private Pool'
  },
  {
    id: 'g-104',
    name: 'Ananya Roy',
    email: 'ananya.roy@example.com',
    phone: '+91 99887 76655',
    roomType: 'Deluxe',
    roomNumber: '218',
    arrivalDate: '2026-09-29',
    departureDate: '2026-10-02',
    riskLevel: 'HIGH',
    cancellationProbability: 0.79,
    topPreference: 'Spa Package'
  }
];

export const guestProfiles = {
  'g-101': {
    profile: {
      id: 'g-101',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+91 98765 43210',
      loyaltyTier: 'Gold',
      totalVisits: 3,
      avgStayNights: 3,
      avgSpendINR: 12500
    },
    currentBooking: {
      bookingId: 'bk-9041',
      roomType: 'Deluxe',
      roomNumber: '214',
      checkIn: '2026-09-28',
      checkOut: '2026-10-01',
      adults: 2,
      children: 0,
      channel: 'Online TA',
      adrINR: 8500,
      specialRequest: 'Late check-in (9:00 PM expected arrival)'
    },
    storedPreferences: [
      { type: 'FOOD', value: 'Vegetarian', source: 'EXPLICIT' },
      { type: 'ROOM', value: 'Deluxe', source: 'HISTORY' },
      { type: 'ACTIVITY', value: 'Spa Session', source: 'EXPLICIT' }
    ],
    predictions: {
      predictionStatus: 'AVAILABLE',
      cancellation: {
        riskLevel: 'HIGH',
        probability: 0.84,
        factors: [
          'Long booking lead time (72 days prior to check-in)',
          'Previous cancellation history (2 recorded in past 12 months)',
          'Booking channel: Online TA (historically higher volatility)'
        ]
      },
      preferences: [
        { type: 'ROOM', value: 'Deluxe', probability: 0.91 },
        { type: 'FOOD', value: 'Vegetarian', probability: 0.95 }
        // ML v1: No activity predictions provided
      ],
      aiSummary: 'Rahul is a returning Gold guest who prefers Deluxe rooms and vegetarian dining. High cancellation probability (84% est.) driven by long lead time and OTA channel. Recommended action: personal welcome message & re-confirmation.'
    },
    bookingsHistory: [
      { bookingId: 'bk-8102', dates: '12 Jan 2026 - 15 Jan 2026', room: 'Deluxe', status: 'COMPLETED', amount: '₹25,500' },
      { bookingId: 'bk-7421', dates: '14 Oct 2025 - 16 Oct 2025', room: 'Deluxe', status: 'CANCELLED', amount: '₹17,000' },
      { bookingId: 'bk-6091', dates: '05 May 2025 - 08 May 2025', room: 'Standard', status: 'COMPLETED', amount: '₹16,500' }
    ]
  }
};

export const cancellationRiskList = [
  {
    id: 'c-01',
    guestId: 'g-101',
    guestName: 'Rahul Sharma',
    email: 'rahul.sharma@example.com',
    roomType: 'Deluxe',
    arrivalDate: '2026-09-28',
    leadTimeDays: 72,
    channel: 'Online TA',
    depositPaid: false,
    riskLevel: 'HIGH',
    probability: 0.84,
    factors: ['Long lead time (72d)', '2 past cancellations', 'OTA Channel']
  },
  {
    id: 'c-02',
    guestId: 'g-104',
    guestName: 'Ananya Roy',
    email: 'ananya.roy@example.com',
    roomType: 'Deluxe',
    arrivalDate: '2026-09-29',
    leadTimeDays: 85,
    channel: 'Online TA',
    depositPaid: false,
    riskLevel: 'HIGH',
    probability: 0.79,
    factors: ['Zero deposit paid', 'Long lead time (85d)', 'No special requests']
  }
];

export const staffingData = [
  { department: 'Front Desk', required: 8, available: 6, shortage: 2, status: 'CRITICAL' },
  { department: 'Housekeeping', required: 22, available: 18, shortage: 4, status: 'WARNING' },
  { department: 'Food & Beverage', required: 15, available: 15, shortage: 0, status: 'OK' },
  { department: 'Spa & Wellness', required: 6, available: 6, shortage: 0, status: 'OK' }
];

export const serviceRequestsData = [
  { id: 'req-1', guestName: 'Rahul Sharma', roomNumber: '214', type: 'Late Check-in', status: 'PENDING', requestedAt: '10 mins ago' },
  { id: 'req-2', guestName: 'Priya Ananth', roomNumber: '302', type: 'Extra Towels', status: 'IN_PROGRESS', requestedAt: '25 mins ago' }
];
