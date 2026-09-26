const request = require('supertest');
const createApp = require('../../src/app');
const { signToken } = require('../../src/utils/jwt');

describe('RBAC & Role Isolation', () => {
  let app;
  let managerToken;
  let opsToken;
  let guestToken;

  beforeAll(() => {
    managerToken = signToken({
      userId: '11111111-1111-1111-1111-111111111111',
      role: 'RESORT_MANAGER',
    });

    opsToken = signToken({
      userId: '22222222-2222-2222-2222-222222222222',
      role: 'OPERATIONS_MANAGER',
    });

    guestToken = signToken({
      userId: '33333333-3333-3333-3333-333333333333',
      role: 'GUEST',
      guestId: '44444444-4444-4444-4444-444444444444',
    });

    app = createApp({});
  });

  test('Manager cannot access Operations route (403 FORBIDDEN)', async () => {
    const res = await request(app)
      .get('/api/operations/dashboard')
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  test('Guest cannot access Manager route (403 FORBIDDEN)', async () => {
    const res = await request(app)
      .get('/api/manager/dashboard')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  test('Unauthenticated request to protected route returns 401 UNAUTHORIZED', async () => {
    const res = await request(app).get('/api/manager/dashboard');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  test('Guest route rejects injected guestId query parameter with 400 VALIDATION_ERROR', async () => {
    const res = await request(app)
      .get('/api/guest/profile?guestId=99999999-9999-9999-9999-999999999999')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual([{ field: 'guestId', issue: 'not_allowed' }]);
  });
});
