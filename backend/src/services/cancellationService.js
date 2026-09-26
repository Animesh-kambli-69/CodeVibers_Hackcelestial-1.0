/**
 * Cancellation Service.
 * Provides aggregate summary for managers and detailed risk ranking for operations.
 */
const { getTodayString, addDays } = require('../utils/dates');
const { RiskLevel, PredictionStatus } = require('../models/enums');

class CancellationService {
  constructor(predictionService, bookingRepository) {
    this.predictionService = predictionService;
    this.bookingRepository = bookingRepository;
  }

  async getManagerSummary(windowDays = 30) {
    const today = getTodayString();
    const endDate = addDays(today, windowDays);

    const bookings = await this.bookingRepository.getBookingsForScoring(today, endDate);
    const scored = await this.predictionService.scoreBookings(bookings);

    let highRiskCount = 0;
    let mediumRiskCount = 0;
    let lowRiskCount = 0;
    let totalProbability = 0;
    let validCount = 0;

    for (const item of scored) {
      if (item.cancellationProbability !== null) {
        validCount++;
        totalProbability += item.cancellationProbability;
        if (item.riskLevel === RiskLevel.HIGH) highRiskCount++;
        else if (item.riskLevel === RiskLevel.MEDIUM) mediumRiskCount++;
        else lowRiskCount++;
      }
    }

    const averageProbability = validCount > 0 ? Math.round((totalProbability / validCount) * 100) / 100 : 0;
    const overallStatus = validCount > 0 ? PredictionStatus.AVAILABLE : PredictionStatus.UNAVAILABLE;

    return {
      windowDays,
      totalEvaluated: bookings.length,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      averageProbability,
      predictionStatus: overallStatus,
    };
  }

  async getOperationsRiskList(windowDays = 30) {
    const today = getTodayString();
    const endDate = addDays(today, windowDays);

    const bookings = await this.bookingRepository.getBookingsForScoring(today, endDate);
    const scored = await this.predictionService.scoreBookings(bookings);

    const scoredMap = new Map(scored.map((s) => [s.bookingId, s]));

    const riskItems = bookings.map((b) => {
      const scoreData = scoredMap.get(b.id) || {};
      return {
        bookingId: b.id,
        guestId: b.guestId,
        guestName: b.guestName,
        guestEmail: b.guestEmail,
        roomType: b.roomType,
        arrivalDate: b.arrivalDate,
        departureDate: b.departureDate,
        cancellationProbability: scoreData.cancellationProbability || null,
        riskLevel: scoreData.riskLevel || null,
        factors: scoreData.factors || [],
        predictionStatus: scoreData.status || PredictionStatus.UNAVAILABLE,
      };
    });

    // Sort by cancellationProbability DESC (nulls last)
    riskItems.sort((a, b) => {
      if (a.cancellationProbability === null && b.cancellationProbability === null) return 0;
      if (a.cancellationProbability === null) return 1;
      if (b.cancellationProbability === null) return -1;
      return b.cancellationProbability - a.cancellationProbability;
    });

    return riskItems;
  }
}

module.exports = CancellationService;
