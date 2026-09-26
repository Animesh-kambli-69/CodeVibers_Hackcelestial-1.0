/**
 * Standard Application Error Hierarchy.
 * Maps directly to api.md §1.9 error codes and HTTP statuses.
 */
class AppError extends Error {
  constructor(code, httpStatus, message, details = undefined) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.httpStatus = httpStatus;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = []) {
    super('VALIDATION_ERROR', 400, message, details);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required', code = 'UNAUTHORIZED') {
    super(code, 401, message);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to access this resource') {
    super('FORBIDDEN', 403, message);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super('NOT_FOUND', 404, message);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource state conflict') {
    super('CONFLICT', 409, message);
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Too many requests, please try again later') {
    super('RATE_LIMITED', 429, message);
  }
}

class MlUnavailableError extends AppError {
  constructor(message = 'Machine learning service is currently unavailable') {
    super('ML_SERVICE_UNAVAILABLE', 503, message);
  }
}

class AiUnavailableError extends AppError {
  constructor(message = 'AI Concierge service is currently unavailable') {
    super('AI_SERVICE_UNAVAILABLE', 503, message);
  }
}

class InternalError extends AppError {
  constructor(message = 'Internal server error') {
    super('INTERNAL_ERROR', 500, message);
  }
}

module.exports = {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  MlUnavailableError,
  AiUnavailableError,
  InternalError,
};
