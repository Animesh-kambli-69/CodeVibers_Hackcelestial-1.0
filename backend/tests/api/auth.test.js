const request = require('supertest');
const createApp = require('../../src/app');
const { hashPassword } = require('../../src/utils/password');

describe('Auth Endpoints (/api/auth)', () => {
  let app;
  let fakeUserRepo;
  let fakeGuestRepo;

  beforeEach(async () => {
    const passwordHash = await hashPassword('TestPass@123');

    fakeUserRepo = {
      findByEmail: jest.fn(async (email) => {
        if (email.toLowerCase() === 'manager@test.com') {
          return {
            id: '11111111-1111-1111-1111-111111111111',
            email: 'manager@test.com',
            passwordHash,
            role: 'RESORT_MANAGER',
          };
        }
        if (email.toLowerCase() === 'guest@test.com') {
          return {
            id: '22222222-2222-2222-2222-222222222222',
            email: 'guest@test.com',
            passwordHash,
            role: 'GUEST',
          };
        }
        return null;
      }),
      findById: jest.fn(async (id) => {
        if (id === '11111111-1111-1111-1111-111111111111') {
          return {
            id,
            email: 'manager@test.com',
            role: 'RESORT_MANAGER',
          };
        }
        return null;
      }),
    };

    fakeGuestRepo = {
      findByUserId: jest.fn(async (userId) => {
        if (userId === '22222222-2222-2222-2222-222222222222') {
          return {
            id: '33333333-3333-3333-3333-333333333333',
            name: 'Test Guest',
            email: 'guest@test.com',
          };
        }
        return null;
      }),
      findById: jest.fn(async (id) => null),
    };

    app = createApp({
      userRepository: fakeUserRepo,
      guestRepository: fakeGuestRepo,
    });
  });

  test('POST /api/auth/login succeeds with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@test.com', password: 'TestPass@123' });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe('manager@test.com');
    expect(res.body.data.user.role).toBe('RESORT_MANAGER');
  });

  test('POST /api/auth/login fails with 401 on wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@test.com', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  test('GET /api/auth/me returns current user info when token provided', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'manager@test.com', password: 'TestPass@123' });

    const token = loginRes.body.data.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('manager@test.com');
    expect(res.body.data.role).toBe('RESORT_MANAGER');
  });
});
