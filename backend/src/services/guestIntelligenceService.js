/**
 * Guest Intelligence Service for Operations Managers.
 */
const { NotFoundError } = require('../utils/errors');
const { getTodayString } = require('../utils/dates');
const { toOperationsGuestListItem } = require('../models/views/guestViews');

class GuestIntelligenceService {
  constructor(
    guestRepository,
    bookingRepository,
    preferenceRepository,
    activityRepository,
    predictionService,
    mlService
  ) {
    this.guestRepository = guestRepository;
    this.bookingRepository = bookingRepository;
    this.preferenceRepository = preferenceRepository;
    this.activityRepository = activityRepository;
    this.predictionService = predictionService;
    this.mlService = mlService;
  }

  async listGuests(params = {}) {
    const today = getTodayString();
    const { items: guests, total } = await this.guestRepository.listGuests(params);

    const enriched = await Promise.all(
      guests.map(async (guest) => {
        const [currentStay, topPref] = await Promise.all([
          this.bookingRepository.findCurrentStay(guest.id, today),
          this.preferenceRepository.findTopNonRoomPreference(guest.id),
        ]);

        let cancellationProb = null;
        if (currentStay) {
          const scored = await this.predictionService.scoreBookings([currentStay]);
          if (scored.length > 0 && scored[0].cancellationProbability !== null) {
            cancellationProb = scored[0].cancellationProbability;
          }
        }

        return toOperationsGuestListItem(guest, currentStay, topPref, cancellationProb);
      })
    );

    return { items: enriched, total };
  }

  async getGuestDetail(guestId) {
    const guest = await this.guestRepository.findById(guestId);
    if (!guest) {
      throw new NotFoundError(`Guest with id ${guestId} not found`);
    }

    const today = getTodayString();

    const [bookingsRes, preferences, activities, currentStay] = await Promise.all([
      this.bookingRepository.listGuestBookings(guestId, { limit: 100 }),
      this.preferenceRepository.findByGuestId(guestId),
      this.activityRepository.listByGuestId(guestId),
      this.bookingRepository.findCurrentStay(guestId, today),
    ]);

    const bookings = bookingsRes.items;
    const previousVisits = bookings.filter((b) => b.status === 'CHECKED_OUT').length;
    const previousCancellations = bookings.filter((b) => b.status === 'CANCELLED').length;

    let stayDurationAvg = 0;
    if (bookings.length > 0) {
      const totalNights = bookings.reduce((sum, b) => {
        const diff = Math.max(1, Math.round((new Date(b.departureDate) - new Date(b.arrivalDate)) / (1000 * 60 * 60 * 24)));
        return sum + diff;
      }, 0);
      stayDurationAvg = Math.round((totalNights / bookings.length) * 10) / 10;
    }

    return {
      profile: {
        id: guest.id,
        name: guest.name,
        email: guest.email,
        phone: guest.phone,
        loyaltyTier: guest.loyaltyTier,
        totalStays: guest.totalStays,
        specialRequirements: guest.specialRequirements,
        previousVisits,
        previousCancellations,
        averageStayNights: stayDurationAvg,
        createdAt: guest.createdAt,
      },
      currentStay,
      preferences,
      activities,
      bookingHistory: bookings,
    };
  }

  async getGuestPredictions(guestId) {
    const guest = await this.guestRepository.findById(guestId);
    if (!guest) {
      throw new NotFoundError(`Guest with id ${guestId} not found`);
    }

    const today = getTodayString();
    const currentStay = await this.bookingRepository.findCurrentStay(guestId, today);

    let cancellationScore = null;
    let predictedPreferences = [];

    if (currentStay) {
      // 1. Score cancellation
      const scored = await this.predictionService.scoreBookings([currentStay]);
      if (scored.length > 0) {
        cancellationScore = scored[0];
      }

      // 2. Predict preferences from current stay context
      if (this.mlService) {
        try {
          predictedPreferences = await this.mlService.predictGuestPreferences({
            adults: currentStay.adults,
            children: currentStay.children,
            babies: currentStay.babies,
            totalStays: guest.totalStays,
            weekendNights: currentStay.weekendNights,
            weekNights: currentStay.weekNights,
            adr: currentStay.adr,
            specialRequests: currentStay.specialRequests,
            requiredCarParkingSpaces: currentStay.requiredCarParkingSpaces,
            country: currentStay.country,
            bookingChannel: currentStay.bookingChannel,
            customerType: currentStay.customerType,
          });
        } catch (err) {
          // Degrades gracefully
        }
      }
    }

    return {
      guestId,
      cancellationRisk: cancellationScore,
      predictedPreferences,
      summary: null, // LLM summary optional
    };
  }
}

module.exports = GuestIntelligenceService;
