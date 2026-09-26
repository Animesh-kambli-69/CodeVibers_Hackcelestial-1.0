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

  // Resort physical location — used by the Weather Digital Twin for live
  // weather lookups and map visualization. Defaults to a Goa coastal resort
  // (matches the seeded demo resort) so the feature works out of the box.
  RESORT_LATITUDE: parseFloat(process.env.RESORT_LATITUDE || '15.2993'),
  RESORT_LONGITUDE: parseFloat(process.env.RESORT_LONGITUDE || '74.1240'),
  RESORT_NAME: process.env.RESORT_NAME || 'Smart Resort 360',

  // Weather API (Open-Meteo — free, no API key required)
  WEATHER_API_BASE_URL: process.env.WEATHER_API_BASE_URL || 'https://api.open-meteo.com/v1/forecast',

  // Social signal source (Reddit public search JSON — free, no API key required)
  SOCIAL_SIGNAL_API_BASE_URL: process.env.SOCIAL_SIGNAL_API_BASE_URL || 'https://www.reddit.com/search.json',
  SOCIAL_SIGNAL_QUERY: process.env.SOCIAL_SIGNAL_QUERY || 'Goa weather travel resort',
});

module.exports = env;
