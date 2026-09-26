const request = require('supertest');
const createApp = require('../../src/app');
const { signToken } = require('../../src/utils/jwt');

describe('Guest Self-Service & AI Concierge (/api/guest)', () => {
  let app;
  let guestToken;
  const guestId = '44444444-4444-4444-4444-444444444444';

  beforeEach(() => {
    guestToken = signToken({
      userId: '33333333-3333-3333-3333-333333333333',
      role: 'GUEST',
      guestId,
    });

    const fakeGuestRepo = {
      findById: jest.fn(async (id) => ({
        id,
        name: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '+91 98765 43210',
        loyaltyTier: 'SILVER',
        totalStays: 3,
        specialRequirements: 'Quiet room',
      })),
    };

    const fakePreferenceRepo = {
      findByGuestId: jest.fn(async (id) => [
        { preferenceType: 'FOOD', preferenceValue: 'Vegetarian', source: 'HISTORY', confidence: 0.9 },
        { preferenceType: 'ROOM', preferenceValue: 'DELUXE', source: 'EXPLICIT', confidence: 0.95 },
      ]),
    };

    const fakeBookingRepo = {
      listGuestBookings: jest.fn(async (id) => ({
        items: [
          {
            id: '55555555-5555-5555-5555-555555555555',
            roomNumber: 'DLX-201',
            roomType: 'DELUXE',
            arrivalDate: '2026-09-25',
            departureDate: '2026-09-28',
            status: 'CHECKED_IN',
            adults: 2,
            children: 0,
            specialRequests: 1,
            bookingDate: '2026-09-15',
          },
        ],
        total: 1,
      })),
      findCurrentStay: jest.fn(async () => null),
    };

    const fakeResortInfoRepo = {
      list: jest.fn(async () => ({
        items: [{ id: '66666666-6666-6666-6666-666666666666', category: 'SPA', title: 'Spa Timings', content: 'Open 8 AM to 9 PM' }],
        total: 1,
      })),
      searchGroundedSources: jest.fn(async (query) => {
        if (query.toLowerCase().includes('spa')) {
          return [{ id: '66666666-6666-6666-6666-666666666666', category: 'SPA', title: 'Spa Timings', content: 'Spa is open from 8:00 AM to 9:00 PM.' }];
        }
        return [];
      }),
    };

    const fakeChatRepo = {
      createConversation: jest.fn(async (gId) => ({ id: '77777777-7777-7777-7777-777777777777', guestId: gId })),
      findConversation: jest.fn(async (cId, gId) => ({ id: cId, guestId: gId })),
      saveMessage: jest.fn(async (data) => ({
        id: '88888888-8888-8888-8888-888888888888',
        ...data,
        createdAt: new Date().toISOString(),
      })),
    };

    app = createApp({
      guestRepository: fakeGuestRepo,
      preferenceRepository: fakePreferenceRepo,
      bookingRepository: fakeBookingRepo,
      resortInfoRepository: fakeResortInfoRepo,
      chatRepository: fakeChatRepo,
    });
  });

  test('GET /api/guest/profile returns guest profile without internal sensitive fields', async () => {
    const res = await request(app)
      .get('/api/guest/profile')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Rahul Sharma');
    expect(res.body.data.loyaltyTier).toBe('SILVER');
    // Ensure internal metrics are not leaked
    expect(res.body.data).not.toHaveProperty('previousCancellations');
    expect(res.body.data).not.toHaveProperty('averageSpend');
  });

  test('POST /api/guest/chat returns grounded concierge response when sources match', async () => {
    const res = await request(app)
      .post('/api/guest/chat')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ message: 'What are the spa timings?' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('conversationId');
    expect(res.body.data.reply.grounded).toBe(true);
    expect(res.body.data.reply.content).toContain('Spa is open');
  });

  test('POST /api/guest/chat returns ungrounded fallback when no verified sources exist', async () => {
    const res = await request(app)
      .post('/api/guest/chat')
      .set('Authorization', `Bearer ${guestToken}`)
      .send({ message: 'Is there a helipad on the roof?' });

    expect(res.status).toBe(200);
    expect(res.body.data.reply.grounded).toBe(false);
    expect(res.body.data.reply.content).toContain('front desk');
  });
});
