const request = require('supertest');
const createApp = require('../../src/app');

describe('GET /api/health', () => {
  test('returns 200 with standard health status envelope', async () => {
    const fakePool = {
      query: jest.fn().mockResolvedValue({ rows: [{ '?column?': 1 }] }),
    };
    const fakeMl = {
      health: jest.fn().mockResolvedValue({ ok: true, modelsLoaded: true }),
    };
    const fakeAi = {
      isConfigured: jest.fn().mockReturnValue(true),
    };

    const app = createApp({ pool: fakePool, mlService: fakeMl, aiService: fakeAi });

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.status).toBe('ok');
    expect(res.body.data.database).toBe('ok');
    expect(res.body.data.ml).toEqual({ status: 'ok', modelsLoaded: true });
    expect(res.body.data.llm).toBe('ok');
  });

  test('returns degraded status when ML is down', async () => {
    const fakePool = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
    };
    const fakeMl = {
      health: jest.fn().mockRejectedValue(new Error('ML connection refused')),
    };

    const app = createApp({ pool: fakePool, mlService: fakeMl });

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('degraded');
    expect(res.body.data.ml.status).toBe('down');
  });
});
