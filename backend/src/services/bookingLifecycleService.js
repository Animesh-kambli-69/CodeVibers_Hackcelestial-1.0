/**
 * Booking Lifecycle Service.
 * Orchestrates the guest stay + room turnover cycle:
 *
 *   booking: CONFIRMED --check-in--> CHECKED_IN --check-out--> CHECKED_OUT
 *                |cancel (blocked once CHECKED_IN)
 *                v
 *            CANCELLED
 *
 *   room:    AVAILABLE --check-in--> OCCUPIED --check-out--> MAINTENANCE --complete--> AVAILABLE
 *
 * Each write goes through bookingRepository/roomRepository methods that bake
 * the expected "from" status into their WHERE clause, so an invalid transition
 * (e.g. checking out a booking that's still CONFIRMED, or cancelling one that's
 * already CHECKED_IN) affects zero rows rather than silently corrupting state.
 * This service turns that zero-row result into a proper 404/409.
 */
const { ConflictError, NotFoundError } = require('../utils/errors');
const { getTodayString } = require('../utils/dates');

class BookingLifecycleService {
  constructor(bookingRepository, roomRepository, guestAccountService = null, feedbackService = null) {
    this.bookingRepository = bookingRepository;
    this.roomRepository = roomRepository;
    this.guestAccountService = guestAccountService;
    this.feedbackService = feedbackService;
  }

  async checkIn(bookingId, actorUserId = null) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError(`Booking ${bookingId} not found`);
    }
    if (booking.status !== 'CONFIRMED') {
      throw new ConflictError(
        `Cannot check in a booking with status '${booking.status}'. Only CONFIRMED bookings can be checked in.`
      );
    }

    const today = getTodayString();
    const earlyCheckin = today < booking.arrivalDate;

    const updated = await this.bookingRepository.checkIn(bookingId, { earlyCheckin });
    if (!updated) {
      throw new ConflictError('Booking status changed concurrently; please retry.');
    }

    await this.roomRepository.transitionStatus(booking.roomId, 'OCCUPIED', {
      reason: 'GUEST_CHECK_IN',
      bookingId,
      changedBy: actorUserId,
    });

    // Auto-provision a guest self-service login if this guest doesn't have
    // one yet (e.g. booked via the public walk-in flow). Returns credentials
    // exactly once — ops must hand them to the guest now; they're never
    // recoverable after this response (only the bcrypt hash is stored).
    let generatedCredentials = null;
    if (this.guestAccountService) {
      generatedCredentials = await this.guestAccountService.provisionIfMissing(booking.guestId);
    }

    return { ...updated, generatedCredentials };
  }

  async checkOut(bookingId, actorUserId = null) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError(`Booking ${bookingId} not found`);
    }
    if (booking.status !== 'CHECKED_IN') {
      throw new ConflictError(
        `Cannot check out a booking with status '${booking.status}'. Only CHECKED_IN bookings can be checked out.`
      );
    }

    const today = getTodayString();
    const lateCheckout = today > booking.departureDate;

    const updated = await this.bookingRepository.checkOut(bookingId, { lateCheckout });
    if (!updated) {
      throw new ConflictError('Booking status changed concurrently; please retry.');
    }

    // Room goes to housekeeping turnover, not straight back to AVAILABLE —
    // completeMaintenance() below is the only path back to AVAILABLE.
    await this.roomRepository.transitionStatus(booking.roomId, 'MAINTENANCE', {
      reason: 'CHECKOUT_TURNOVER',
      bookingId,
      changedBy: actorUserId,
    });

    // Start the "feedback first, then destroy" clock (feedbackService.js /
    // guestAccountService.js) — the guest's login stays alive until they
    // submit feedback or the grace window lapses, whichever comes first.
    if (this.feedbackService) {
      await this.feedbackService.createPendingForBooking(bookingId, booking.guestId);
    }

    return updated;
  }

  async cancel(bookingId) {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundError(`Booking ${bookingId} not found`);
    }
    // Explicit, readable guard in addition to the repository's WHERE-clause guard:
    // once a guest has checked in, the booking is no longer cancellable.
    if (booking.status !== 'CONFIRMED') {
      throw new ConflictError(
        `Cannot cancel a booking with status '${booking.status}'. Only CONFIRMED bookings can be cancelled.`
      );
    }

    const updated = await this.bookingRepository.cancel(bookingId);
    if (!updated) {
      throw new ConflictError('Booking status changed concurrently; please retry.');
    }
    return updated;
  }

  async completeMaintenance(roomId, actorUserId = null) {
    const room = await this.roomRepository.findById(roomId);
    if (!room) {
      throw new NotFoundError(`Room ${roomId} not found`);
    }
    if (room.status !== 'MAINTENANCE') {
      throw new ConflictError(
        `Cannot complete maintenance on a room with status '${room.status}'. Room must be in MAINTENANCE.`
      );
    }

    return this.roomRepository.transitionStatus(roomId, 'AVAILABLE', {
      reason: 'MAINTENANCE_COMPLETE',
      changedBy: actorUserId,
    });
  }
}

module.exports = BookingLifecycleService;
