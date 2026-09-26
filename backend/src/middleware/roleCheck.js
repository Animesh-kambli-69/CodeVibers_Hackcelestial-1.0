const { ForbiddenError, UnauthorizedError } = require('../utils/errors');

function requireRole(role) {
  return (req, res, next) => {
    if (!req.auth) {
      return next(new UnauthorizedError('Authentication required'));
    }

    if (req.auth.role !== role) {
      return next(
        new ForbiddenError(`Access denied: requires ${role} role, but user has ${req.auth.role}`)
      );
    }

    next();
  };
}

module.exports = requireRole;
