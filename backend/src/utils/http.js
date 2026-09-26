/**
 * Resilient HTTP client wrapper around native fetch with timeouts and logging.
 */
const logger = require('./logger');

async function request(url, options = {}) {
  const { timeout = 5000, ...fetchOptions } = options;
  const start = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    const durationMs = Date.now() - start;
    logger.debug({ url, status: response.status, durationMs }, 'Outbound HTTP request complete');
    return response;
  } catch (err) {
    const durationMs = Date.now() - start;
    if (err.name === 'AbortError') {
      logger.warn({ url, timeout, durationMs }, 'Outbound HTTP request timed out');
      const timeoutError = new Error(`Request to ${url} timed out after ${timeout}ms`);
      timeoutError.name = 'TimeoutError';
      throw timeoutError;
    }
    logger.error({ url, error: err.message, durationMs }, 'Outbound HTTP request failed');
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

module.exports = {
  request,
};
