/**
 * KPI Service for Manager & Operations Dashboards.
 */
const { getTodayString, addDays } = require('../utils/dates');
const { demandLevel } = require('../decision-engine/classify');
const { PredictionStatus } = require('../models/enums');

class KpiService {
  constructor(bookingRepository, roomRepository, predictionService, cancellationService) {
    this.bookingRepository = bookingRepository;
    this.roomRepository = roomRepository;
    this.predictionService = predictionService;
    this.cancellationService = cancellationService;
  }

  async getManagerKpis() {
    const today = getTodayString();
    const thirtyDaysAhead = addDays(today, 30);

    // 1. Current Occupancy
    const totalRooms = await this.roomRepository.countTotalRooms();
    const occupiedCount = await this.bookingRepository.countCurrentlyOccupiedRooms(today);
    const currentOccupancy = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 1000) / 10 : 0;

    // 2. Upcoming Bookings
    const upcomingBookings = await this.bookingRepository.getUpcomingArrivalsCount(today, thirtyDaysAhead);

    // 3. Cancellation Summary
    const cancelSummary = await this.cancellationService.getManagerSummary(30);

    // 4. Booking Demand (7-day forecast average)
    const forecastResult = await this.predictionService.getOccupancyForecast(7);
    let avgPredictedOccupancy = null;
    let bookingDemand = 'LOW';

    if (forecastResult.forecast && forecastResult.forecast.predictions.length > 0) {
      const preds = forecastResult.forecast.predictions;
      const totalPct = preds.reduce((sum, p) => sum + (p.predictedOccupancy || 0), 0);
      avgPredictedOccupancy = Math.round((totalPct / preds.length) * 10) / 10;
      bookingDemand = demandLevel(avgPredictedOccupancy);
    }

    return {
      currentOccupancy,
      totalRooms,
      upcomingBookings,
      highRiskCancellationCount: cancelSummary.highRiskCount,
      bookingDemand,
      avgPredictedOccupancy,
      predictionStatus: forecastResult.status,
    };
  }

  async getOperationsKpis() {
    const today = getTodayString();

    const arrivalsToday = await this.bookingRepository.getConfirmedArrivalsCount(today);
    const inHouseGuests = await this.bookingRepository.countCurrentlyOccupiedRooms(today);
    const specialRequirementsToday = await this.bookingRepository.getSpecialRequirementsCountToday(today);

    return {
      arrivalsToday,
      inHouseGuests,
      specialRequirementsToday,
    };
  }
}

module.exports = KpiService;
