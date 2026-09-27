/**
 * Guest Account Service.
 * Owns the full lifecycle of a guest's self-service login account:
 * auto-provisioned at check-in, destroyed once its purpose (post-stay
 * feedback) is served or its grace window lapses. See
 * bookingLifecycleService.checkIn() (provisioning) and feedbackService.js /
 * db/scripts/cleanup-expired-guest-accounts.js (destruction).
 */
const { hashPassword } = require('../utils/password');
const { generateSimplePassword, generateUsername } = require('../utils/credentials');
const logger = require('../utils/logger');

class GuestAccountService {
  constructor(userRepository, guestRepository) {
    this.userRepository = userRepository;
    this.guestRepository = guestRepository;
  }

  /**
   * Creates a login account for a guest who doesn't have one yet. Idempotent —
   * returns null (no credentials) if the guest is already linked, so a
   * repeat check-in never silently resets a guest's existing password.
   */
  async provisionIfMissing(guestId) {
    const guest = await this.guestRepository.findById(guestId);
    if (!guest) return null;
    if (guest.userId) return null; // already has an account — do not touch it

    // Retry on the rare username collision (findByEmail keyed on the same column).
    for (let attempt = 0; attempt < 5; attempt++) {
      const username = generateUsername(guest.name);
      const existing = await this.userRepository.findByEmail(username);
      if (existing) continue;

      const password = generateSimplePassword();
      const passwordHash = await hashPassword(password);
      const user = await this.userRepository.create({ name: guest.name, email: username, passwordHash, role: 'GUEST' });
      await this.guestRepository.linkUser(guestId, user.id);

      logger.info({ guestId, userId: user.id }, 'Auto-provisioned guest login account at check-in');
      return { username, password };
    }

    logger.warn({ guestId }, 'Failed to generate a unique guest username after 5 attempts');
    return null;
  }

  /**
   * Genuinely destroys a guest's login account: unlinks it from the guest
   * profile first (so the FK cascade never touches the profile/history),
   * then hard-deletes the users row. The guest's booking history, feedback,
   * and profile all remain intact — only the ability to log in is removed.
   */
  async destroy(guestId) {
    const guest = await this.guestRepository.findById(guestId);
    if (!guest || !guest.userId) return false;

    const userId = guest.userId;
    await this.guestRepository.unlinkUser(guestId);
    await this.userRepository.delete(userId);

    logger.info({ guestId, userId }, 'Destroyed guest login account');
    return true;
  }
}

module.exports = GuestAccountService;
