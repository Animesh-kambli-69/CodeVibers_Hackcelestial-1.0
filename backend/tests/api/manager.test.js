const request = require('supertest');
const createApp = require('../../src/app');
const { signToken } = require('../../src/utils/jwt');
const { getTodayString, addDays } = require('../../src/utils/dates');

describe('Manager Analytics & Decisions (/api/manager)', () => {
  let app;
  let managerToken;
  let fakeRecs;

  beforeEach(() => {
    managerToken = signToken({
      userId: '11111111-1111-1111-1111-111111111111',
      role: 'RESORT_MANAGER',
    });

    const today = getTodayString();
    const tomorrow = addDays(today, 1);

    const fakeRoomRepo = {
      countTotalRooms: jest.fn(async () => 220),
      getRoomCountsByType: jest.fn(async () => ({ STANDARD: 100, DELUXE: 80, SUITE: 40 })),
    };

    const fakeBookingRepo = {
      countCurrentlyOccupiedRooms: jest.fn(async () => 165),
      getConfirmedArrivalsCount: jest.fn(async () => 45),
      getUpcomingArrivalsCount: jest.fn(async () => 210),
      getHistoricalDailyArrivals: jest.fn(async () => [
        { date: addDays(today, -2), actualBookings: 40 },
        { date: addDays(today, -1), actualBookings: 42 },
      ]),
      getBookingsForScoring: jest.fn(async () => []),
      getRoomDemandCounts: jest.fn(async () => ({ STANDARD: 85, DELUXE: 65, SUITE: 25 })),
    };

    fakeRecs = [
      {
        id: '99999999-9999-9999-9999-999999999999',
        category: 'OCCUPANCY',
        title: 'High Occupancy Alert',
        reason: 'Predicted 90% occupancy',
        suggestedAction: 'Prepare staff',
        priority: 'HIGH',
        confidence: 0.9,
        sourceData: {},
        status: 'NEW',
        note: null,
        dedupKey: `R1:${tomorrow}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const fakeRecRepo = {
      getLatestRecommendationCreatedAt: jest.fn(async () => new Date()),
      listRecommendations: jest.fn(async () => ({ items: fakeRecs, total: fakeRecs.length })),
      findById: jest.fn(async (id) => fakeRecs.find((r) => r.id === id) || null),
      insertDrafts: jest.fn(async () => 0),
      updateStatus: jest.fn(async (id, status, note) => {
        const item = fakeRecs.find((r) => r.id === id);
        if (item) {
          item.status = status;
          item.note = note;
          item.updatedAt = new Date().toISOString();
        }
        return item;
      }),
    };

    const fakePredictionRepo = {
      findLatest: jest.fn(async () => null),
      save: jest.fn(async () => ({})),
    };

    const fakeMl = {
      forecastOccupancy: jest.fn(async () => ({
        forecastDays: 7,
        predictions: [
          { date: tomorrow, predictedBookings: 48, predictedOccupancy: 88.5, demandLevel: 'HIGH', dayOfWeek: 'Sunday' },
        ],
      })),
      getModelVersions: jest.fn(async () => ({ occupancy: 'occupancy@1.0.0', cancellation: 'cancellation@1.0.0' })),
    };

    app = createApp({
      roomRepository: fakeRoomRepo,
      bookingRepository: fakeBookingRepo,
      recommendationRepository: fakeRecRepo,
      predictionRepository: fakePredictionRepo,
      mlService: fakeMl,
    });
  });

  test('GET /api/manager/dashboard returns KPIs, insights, and recommendations', async () => {
    const res = await request(app)
      .get('/api/manager/dashboard')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('kpis');
    expect(res.body.data.kpis.totalRooms).toBe(220);
    expect(res.body.data.kpis.currentOccupancy).toBe(75);
    expect(res.body.data).toHaveProperty('insights');
    expect(res.body.data).toHaveProperty('topRecommendations');
  });

  test('GET /api/manager/occupancy-forecast returns occupancy breakdown and peak date', async () => {
    const res = await request(app)
      .get('/api/manager/occupancy-forecast?days=7')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalRooms).toBe(220);
    expect(res.body.data.highOccupancyThreshold).toBe(85);
  });

  test('PATCH /api/manager/recommendations/:id updates status to ACCEPTED', async () => {
    const res = await request(app)
      .patch('/api/manager/recommendations/99999999-9999-9999-9999-999999999999')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ status: 'ACCEPTED', note: 'Staffing rota updated accordingly' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACCEPTED');
    expect(res.body.data.note).toBe('Staffing rota updated accordingly');
  });

  test('PATCH /api/manager/recommendations/:id rejects illegal status transition from terminal state with 409 CONFLICT', async () => {
    // Set status to terminal state first
    fakeRecs[0].status = 'ACCEPTED';

    const res = await request(app)
      .patch('/api/manager/recommendations/99999999-9999-9999-9999-999999999999')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ status: 'VIEWED' });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('CONFLICT');
  });
});
