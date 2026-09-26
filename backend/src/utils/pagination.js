/**
 * Pagination helper for SQL queries and limits.
 */
const appConfig = require('../config/app');

function getPaginationParams(query = {}) {
  const page = Math.max(1, parseInt(query.page || appConfig.PAGINATION.DEFAULT_PAGE, 10));
  const limit = Math.min(
    appConfig.PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(query.limit || appConfig.PAGINATION.DEFAULT_LIMIT, 10))
  );
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

module.exports = {
  getPaginationParams,
};
