const rateLimit = require('express-rate-limit');
const appConfig = require('../config/app');

const loginLimiter = rateLimit({
  windowMs: appConfig.RATE_LIMITS.LOGIN.WINDOW_MS,
  max: appConfig.RATE_LIMITS.LOGIN.MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many login attempts from this IP, please try again in 15 minutes',
    },
  },
});

const chatLimiter = rateLimit({
  windowMs: appConfig.RATE_LIMITS.CHAT.WINDOW_MS,
  max: appConfig.RATE_LIMITS.CHAT.MAX,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.auth ? req.auth.guestId || req.ip : req.ip),
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Chat rate limit exceeded, maximum 20 messages per minute',
    },
  },
});

module.exports = {
  loginLimiter,
  chatLimiter,
};
