const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

function errorHandler(err, req, res, next) {
  // Syntax error from JSON body parser
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid JSON payload in request body',
        details: [{ field: 'body', issue: 'invalid_json' }],
      },
    });
  }

  // Application structured errors
  if (err instanceof AppError) {
    const errorBody = {
      code: err.code,
      message: err.message,
    };
    if (err.details !== undefined) {
      errorBody.details = err.details;
    }
    return res.status(err.httpStatus).json({ error: errorBody });
  }

  // Rate limiter error
  if (err.status === 429) {
    return res.status(429).json({
      error: {
        code: 'RATE_LIMITED',
        message: err.message || 'Too many requests, please try again later',
      },
    });
  }

  // Unhandled / 500 errors
  logger.error(
    {
      requestId: req.id,
      error: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    },
    'Unhandled Server Exception'
  );

  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An internal error occurred while processing the request',
    },
  });
}

module.exports = errorHandler;
