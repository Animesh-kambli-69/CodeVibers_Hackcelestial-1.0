const { NotFoundError } = require('../utils/errors');

function notFound(req, res, next) {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
}

module.exports = notFound;
