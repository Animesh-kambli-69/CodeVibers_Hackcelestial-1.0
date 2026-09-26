/**
 * JWT utilities for signing and verifying tokens.
 */
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { UnauthorizedError } = require('./errors');

function signToken(payload, expiresIn = env.JWT_EXPIRES_IN) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: typeof expiresIn === 'string' && !isNaN(expiresIn) ? parseInt(expiresIn, 10) : expiresIn,
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (err) {
    throw new UnauthorizedError('Invalid or expired authentication token');
  }
}

module.exports = {
  signToken,
  verifyToken,
};
