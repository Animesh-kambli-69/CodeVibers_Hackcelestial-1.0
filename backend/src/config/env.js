/**
 * Environment configuration loader and validator.
 * Validates process.env and exports a frozen configuration object.
 */
require('dotenv').config();

const requiredEnv = [
  'DATABASE_URL',
  'JWT_SECRET',
];

const missing = requiredEnv.filter((key) => !process.env[key] && process.env.NODE_ENV !== 'test');
if (missing.length > 0) {
  console.error(`[FATAL] Missing required environment variables: ${missing.join(', ')}`);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

const env = Object.freeze({
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'test' ? 'silent' : 'info'),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/smart_resort_360',

  JWT_SECRET: process.env.JWT_SECRET || 'test_jwt_secret_must_be_configured_in_env_32_chars',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '86400',

  ML_SERVICE_URL: process.env.ML_SERVICE_URL || 'http://localhost:8000/api/v1/ml',

  LLM_API_KEY: process.env.LLM_API_KEY || '',
  LLM_MODEL: process.env.LLM_MODEL || 'gemini-1.5-flash',

  RESORT_TIMEZONE: process.env.RESORT_TIMEZONE || 'Asia/Kolkata',
});

module.exports = env;
