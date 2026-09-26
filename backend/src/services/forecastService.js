/**
 * Forecast Service for Manager Occupancy and Booking Predictions.
 */
const { getTodayString, addDays } = require('../utils/dates');
const RULE_CONFIG = require('../decision-engine/config/thresholds');

class ForecastService {
  constructor(predictionService, bookingRepository, roomRepository) {
    this.predictionService = predictionService;
    this.bookingRepository = bookingRepository;
    this.roomRepository = roomRepository;
  }

  async getBookingForecast(days = 7) {
    const today = getTodayString();
    const historyStart = addDays(today, -7);

    // 1. Fetch historical arrivals
    const history = await this.bookingRepository.getHistoricalDailyArrivals(historyStart, today);

    // 2. Fetch today's confirmed arrivals
    const currentBookings = await this.bookingRepository.getConfirmedArrivalsCount(today);

    // 3. Get ML Predictions
    const predResult = await this.predictionService.getOccupancyForecast(days);
    const predictions = predResult.forecast ? predResult.forecast.predictions || [] : [];

    const forecast = predictions.map((p) => ({
      date: p.date,
      predictedBookings: p.predictedBookings,
      confidence: null, // ML v1 does not provide confidence bounds
    }));

    return {
      currentBookings,
      history,
      forecast,
      predictionStatus: predResult.status,
      modelVersion: predResult.modelVersion,
    };
  }

  async getOccupancyForecast(days = 7) {
    const today = getTodayString();

    // 1. Total Rooms
    const totalRooms = await this.roomRepository.countTotalRooms();

    // 2. Current Occupancy
    const currentlyOccupied = await this.bookingRepository.countCurrentlyOccupiedRooms(today);
    const currentOccupancy = totalRooms > 0 ? Math.round((currentlyOccupied / totalRooms) * 1000) / 10 : 0;

    // 3. ML Predictions
    const predResult = await this.predictionService.getOccupancyForecast(days);
    const predictions = predResult.forecast ? predResult.forecast.predictions || [] : [];

    // 4. Calculate Peak Occupancy
    let peakDate = null;
    let peakOccupancy = 0;
    for (const p of predictions) {
      if (p.predictedOccupancy > peakOccupancy) {
        peakOccupancy = p.predictedOccupancy;
        peakDate = p.date;
      }
    }

    const forecast = predictions.map((p) => ({
      date: p.date,
      predictedOccupancy: p.predictedOccupancy,
      dayOfWeek: p.dayOfWeek,
      demandLevel: p.demandLevel,
    }));

    return {
      totalRooms,
      currentOccupancy,
      highOccupancyThreshold: RULE_CONFIG.highOccupancyThreshold,
      peak: peakDate ? { date: peakDate, occupancy: peakOccupancy } : null,
      forecast,
      predictionStatus: predResult.status,
      modelVersion: predResult.modelVersion,
    };
  }
}

module.exports = ForecastService;
