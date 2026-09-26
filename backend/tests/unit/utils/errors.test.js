const {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  MlUnavailableError,
} = require('../../../src/utils/errors');

describe('AppError Hierarchy', () => {
  test('ValidationError sets correct status and code', () => {
    const err = new ValidationError('Bad input', [{ field: 'email', issue: 'invalid_format' }]);
    expect(err.httpStatus).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.details).toEqual([{ field: 'email', issue: 'invalid_format' }]);
  });

  test('UnauthorizedError sets 401', () => {
    const err = new UnauthorizedError();
    expect(err.httpStatus).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  test('ForbiddenError sets 403', () => {
    const err = new ForbiddenError();
    expect(err.httpStatus).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });

  test('NotFoundError sets 404', () => {
    const err = new NotFoundError('Booking not found');
    expect(err.httpStatus).toBe(404);
    expect(err.code).toBe('NOT_FOUND');
  });

  test('MlUnavailableError sets 503', () => {
    const err = new MlUnavailableError();
    expect(err.httpStatus).toBe(503);
    expect(err.code).toBe('ML_SERVICE_UNAVAILABLE');
  });
});
