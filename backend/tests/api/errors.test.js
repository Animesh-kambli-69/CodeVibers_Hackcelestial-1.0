const request = require('supertest');
const express = require('express');
const createApp = require('../../src/app');
const { ValidationError, ForbiddenError } = require('../../src/utils/errors');
const asyncHandler = require('../../src/utils/asyncHandler');

describe('API Error Handling & Envelopes', () => {
  test('unmatched route returns 404 with NOT_FOUND code', async () => {
    const app = createApp();
    const res = await request(app).get('/api/non-existent-route');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  test('handles bad JSON payload with 400 VALIDATION_ERROR', async () => {
    const app = createApp();
    const res = await request(app)
      .post('/api/health')
      .set('Content-Type', 'application/json')
      .send('{ "invalid": json }');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual([{ field: 'body', issue: 'invalid_json' }]);
  });
});
