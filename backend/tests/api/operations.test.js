const request = require('supertest');
const createApp = require('../../src/app');
const { signToken } = require('../../src/utils/jwt');

describe('Operations Workflows (/api/operations)', () => {
  let app;
  let opsToken;
  const guestId = '44444444-4444-4444-4444-444444444444';

  beforeEach(() => {
    opsToken = signToken({
      userId: '22222222-2222-2222-2222-222222222222',
      role: 'OPERATIONS_MANAGER',
    });

    const fakeBookingRepo = {
      getConfirmedArrivalsCount: jest.fn(async () => 18),
      countCurrentlyOccupiedRooms: jest.fn(async () => 140),
      getSpecialRequirementsCountToday: jest.fn(async () => 5),
      findCurrentStay: jest.fn(async () => ({
        id: '55555555-5555-5555-5555-555555555555',
        guestId,
        roomType: 'DELUXE',
        arrivalDate: '2026-09-25',
        departureDate: '2026-09-28',
        status: 'CHECKED_IN',
        adr: 7500,
        bookingDate: '2026-09-10',
      })),
      listGuestBookings: jest.fn(async () => ({
        items: [
          {
            id: '55555555-5555-5555-5555-555555555555',
            status: 'CHECKED_IN',
            arrivalDate: '2026-09-25',
            departureDate: '2026-09-28',
          },
        ],
        total: 1,
      })),
      getBookingsForScoring: jest.fn(async () => [
        {
          id: '55555555-5555-5555-5555-555555555555',
          guestId,
          guestName: 'Rahul Sharma',
          guestEmail: 'rahul.sharma@example.com',
          roomType: 'DELUXE',
          arrivalDate: '2026-09-25',
          departureDate: '2026-09-28',
          bookingDate: '2026-08-01',
          adr: 7500,
        },
      ]),
    };

    const fakeGuestRepo = {
      listGuests: jest.fn(async () => ({
        items: [
          {
            id: guestId,
            name: 'Rahul Sharma',
            email: 'rahul.sharma@example.com',
            loyaltyTier: 'SILVER',
          },
        ],
        total: 1,
      })),
      findById: jest.fn(async (id) => ({
        id,
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '+91 98765 43210',
        loyaltyTier: 'SILVER',
        totalStays: 3,
        specialRequirements: 'Quiet room',
        createdAt: '2026-01-01',
      })),
    };

    const fakePrefRepo = {
      findByGuestId: jest.fn(async () => []),
      findTopNonRoomPreference: jest.fn(async () => ({ preferenceValue: 'Vegetarian' })),
    };

    const fakeActivityRepo = {
      listByGuestId: jest.fn(async () => []),
    };

    const fakePredictionRepo = {
      findLatest: jest.fn(async () => null),
      save: jest.fn(async () => ({})),
    };

    const fakeMl = {
      scoreCancellation: jest.fn(async () => ({
        probability: 0.84,
        riskScorePct: 84.0,
        topRiskFactors: [],
      })),
      getModelVersions: jest.fn(async () => ({ cancellation: 'cancellation@1.0.0' })),
    };

    app = createApp({
      bookingRepository: fakeBookingRepo,
      guestRepository: fakeGuestRepo,
      preferenceRepository: fakePrefRepo,
      activityRepository: fakeActivityRepo,
      predictionRepository: fakePredictionRepo,
      mlService: fakeMl,
    });
  });

  test('GET /api/operations/dashboard returns operational counts', async () => {
    const res = await request(app)
      .get('/api/operations/dashboard')
      .set('Authorization', `Bearer ${opsToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.kpis.arrivalsToday).toBe(18);
    expect(res.body.data.kpis.inHouseGuests).toBe(140);
    expect(res.body.data.kpis.specialRequirementsToday).toBe(5);
  });

  test('GET /api/operations/guests returns paginated guest list with top preference', async () => {
    const res = await request(app)
      .get('/api/operations/guests?page=1&limit=20')
      .set('Authorization', `Bearer ${opsToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].name).toBe('Rahul Sharma');
    expect(res.body.data[0].topPreference).toBe('Vegetarian');
  });

  test('GET /api/operations/cancellation-risk returns scored bookings', async () => {
    const res = await request(app)
      .get('/api/operations/cancellation-risk?window=30')
      .set('Authorization', `Bearer ${opsToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.bookings.length).toBe(1);
    expect(res.body.data.bookings[0].cancellationProbability).toBe(0.84);
    expect(res.body.data.bookings[0].riskLevel).toBe('HIGH');
  });
});
