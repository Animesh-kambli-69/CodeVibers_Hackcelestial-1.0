const { verifyToken } = require('../utils/jwt');
const { UnauthorizedError } = require('../utils/errors');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or malformed Authorization header'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);

    req.auth = Object.freeze({
      userId: decoded.userId,
      role: decoded.role,
      guestId: decoded.guestId || null,
    });

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authenticate;
