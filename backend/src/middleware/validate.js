const { ValidationError } = require('../utils/errors');

/**
 * Middleware factory to validate request params, query, and/or body with Zod schemas.
 * @param {{ params?: import('zod').ZodSchema, query?: import('zod').ZodSchema, body?: import('zod').ZodSchema }} schemas
 */
function validate(schemas = {}) {
  return (req, res, next) => {
    const details = [];

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        result.error.errors.forEach((err) => {
          details.push({
            field: err.path.join('.') || 'params',
            issue: err.message,
          });
        });
      } else {
        req.params = result.data;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        result.error.errors.forEach((err) => {
          details.push({
            field: err.path.join('.') || 'query',
            issue: err.message,
          });
        });
      } else {
        req.query = result.data;
      }
    }

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        result.error.errors.forEach((err) => {
          details.push({
            field: err.path.join('.') || 'body',
            issue: err.message,
          });
        });
      } else {
        req.body = result.data;
      }
    }

    if (details.length > 0) {
      return next(new ValidationError('Request validation failed', details));
    }

    next();
  };
}

module.exports = validate;
