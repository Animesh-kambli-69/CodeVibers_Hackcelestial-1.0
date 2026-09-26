const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const logData = {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs,
      role: req.auth ? req.auth.role : 'ANONYMOUS',
    };

    if (res.statusCode >= 500) {
      logger.error(logData, 'HTTP Server Error');
    } else if (res.statusCode >= 400) {
      logger.warn(logData, 'HTTP Client Error');
    } else {
      logger.info(logData, 'HTTP Request');
    }
  });

  next();
}

module.exports = requestLogger;
