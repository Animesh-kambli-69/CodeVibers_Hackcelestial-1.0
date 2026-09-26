/**
 * Guest Self-Service.
 * Always strictly scoped to authenticated req.auth.guestId.
 * Guarantees that internal manager/ML data is stripped via view mappers.
 */
const { NotFoundError } = require('../utils/errors');
const {
  toGuestProfileSelf,
  toGuestPreferenceSelf,
  toGuestBookingSelf,
} = require('../models/views/guestViews');

class GuestSelfService {
  constructor(guestRepository, preferenceRepository, bookingRepository) {
    this.guestRepository = guestRepository;
    this.preferenceRepository = preferenceRepository;
    this.bookingRepository = bookingRepository;
  }

  async getProfile(guestId) {
    const guest = await this.guestRepository.findById(guestId);
    if (!guest) {
      throw new NotFoundError('Guest profile not found');
    }
    return toGuestProfileSelf(guest);
  }

  async getPreferences(guestId) {
    const preferences = await this.preferenceRepository.findByGuestId(guestId);
    return preferences.map((p) => toGuestPreferenceSelf(p));
  }

  async getBookings(guestId, pagination = {}) {
    const { items, total } = await this.bookingRepository.listGuestBookings(guestId, pagination);
    return {
      items: items.map((b) => toGuestBookingSelf(b)),
      total,
    };
  }
}

module.exports = GuestSelfService;
