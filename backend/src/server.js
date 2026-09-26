const env = require('./config/env');
const logger = require('./utils/logger');
const createApp = require('./app');

// In Phase 1, DB pool / ML client can be instantiated or injected
const app = createApp({});

const server = app.listen(env.PORT, '0.0.0.0', () => {
  logger.info(`Smart Resort 360 Backend listening on port ${env.PORT} [${env.NODE_ENV}] (bound to 0.0.0.0)`);
});

// Graceful shutdown handling
function gracefulShutdown(signal) {
  logger.info(`Received ${signal}. Gracefully shutting down HTTP server...`);
  server.close(() => {
    logger.info('HTTP server closed. Exiting process.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forced shutdown timeout reached. Exiting.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
