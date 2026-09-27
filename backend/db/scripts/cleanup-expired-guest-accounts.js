/**
 * Destroys guest login accounts whose feedback grace window has lapsed
 * without a submission — the proactive counterpart to the lazy check in
 * authService.login (which only catches expired accounts when the guest
 * actually tries to log in again). Intended to run periodically (e.g. via
 * an external cron / scheduled task); safe to run repeatedly — accounts
 * that are already gone are simply skipped.
 *
 * Usage: node db/scripts/cleanup-expired-guest-accounts.js
 */
const { getPool } = require('../../src/config/database');
const FeedbackRepository = require('../../src/repositories/feedbackRepository');
const UserRepository = require('../../src/repositories/userRepository');
const GuestRepository = require('../../src/repositories/guestRepository');
const GuestAccountService = require('../../src/services/guestAccountService');
const logger = require('../../src/utils/logger');

async function cleanupExpiredGuestAccounts() {
  const pool = getPool();
  const feedbackRepository = new FeedbackRepository(pool);
  const userRepository = new UserRepository(pool);
  const guestRepository = new GuestRepository(pool);
  const guestAccountService = new GuestAccountService(userRepository, guestRepository);

  try {
    const guestIds = await feedbackRepository.findExpiredPendingGuestIds();
    logger.info({ count: guestIds.length }, 'Sweeping expired guest accounts...');

    let destroyed = 0;
    for (const guestId of guestIds) {
      const wasDestroyed = await guestAccountService.destroy(guestId);
      if (wasDestroyed) destroyed += 1;
    }

    logger.info({ candidates: guestIds.length, destroyed }, 'Expired guest account sweep complete.');
    await pool.end();
    process.exit(0);
  } catch (err) {
    logger.error({ error: err.message, stack: err.stack }, 'Expired guest account sweep failed');
    await pool.end();
    process.exit(1);
  }
}

if (require.main === module) {
  cleanupExpiredGuestAccounts();
}

module.exports = cleanupExpiredGuestAccounts;
