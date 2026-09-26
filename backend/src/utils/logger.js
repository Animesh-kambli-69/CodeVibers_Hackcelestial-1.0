/**
 * Structured logger using Pino.
 * Redacts sensitive credentials, tokens, and passwords.
 */
const pino = require('pino');
const env = require('../config/env');

const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      'req.headers.authorization',
      'authorization',
      'password',
      'passwordHash',
      'token',
      'jwt',
      'LLM_API_KEY',
    ],
    remove: true,
  },
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

module.exports = logger;
