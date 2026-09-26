/**
 * Prediction Service (Gateway & Cache Layer).
 * Responsible for caching ML inference results, managing predictionStatus,
 * enforcing date-freshness constraints, and bounded concurrency scoring.
 */
const { PredictionStatus } = require('../models/enums');
const { classifyRisk } = require('../decision-engine/classify');
const { getTodayString, addDays } = require('../utils/dates');
const appConfig = require('../config/app');
const logger = require('../utils/logger');

class PredictionService {
  constructor(mlService, predictionRepository) {
    this.mlService = mlService;
    this.predictionRepository = predictionRepository;
  }

  async getOccupancyForecast(days = 7) {
    const today = getTodayString();
    const expectedFirstDate = addDays(today, 1);

    // 1. Try fresh ML call
    if (this.mlService) {
      try {
        const mlResult = await this.mlService.forecastOccupancy(days);
        const firstPred = mlResult.predictions && mlResult.predictions[0];

        // Validate that forecast starts tomorrow (C-04 enforcement)
        if (firstPred && firstPred.date === expectedFirstDate) {
          const versions = await this.mlService.getModelVersions();
          // Save to cache
          if (this.predictionRepository) {
            await this.predictionRepository.save({
              predictionType: 'OCCUPANCY_FORECAST',
              payload: mlResult,
              modelVersion: versions ? versions.occupancy : null,
              predictedFor: firstPred.date,
            });
          }

          return {
            status: PredictionStatus.AVAILABLE,
            forecast: mlResult,
            modelVersion: versions ? versions.occupancy : null,
          };
        } else {
          logger.warn(
            { expectedFirstDate, receivedFirstDate: firstPred ? firstPred.date : null },
            'ML forecast dates do not match expected tomorrow date. Marking UNAVAILABLE.'
          );
        }
      } catch (err) {
        logger.warn({ error: err.message }, 'Fresh ML occupancy forecast failed, checking cache');
      }
    }

    // 2. Fallback to cache
    if (this.predictionRepository) {
      const cached = await this.predictionRepository.findLatest('OCCUPANCY_FORECAST');
      if (cached && cached.payload) {
        const cacheAgeHours = (Date.now() - new Date(cached.createdAt).getTime()) / (1000 * 60 * 60);
        const status = cacheAgeHours < 24 ? PredictionStatus.AVAILABLE : PredictionStatus.STALE;
        return {
          status,
          forecast: cached.payload,
          modelVersion: cached.modelVersion,
        };
      }
    }

    return {
      status: PredictionStatus.UNAVAILABLE,
      forecast: null,
      modelVersion: null,
    };
  }

  async scoreBookings(bookings = []) {
    if (!bookings || bookings.length === 0) {
      return [];
    }

    const versions = this.mlService ? await this.mlService.getModelVersions() : null;
    const modelVersion = versions ? versions.cancellation : 'cancellation@1.0.0';

    const results = [];
    const concurrency = appConfig.ML.CANCELLATION_CONCURRENCY;

    // Process in chunks of bounded concurrency
    for (let i = 0; i < bookings.length; i += concurrency) {
      const chunk = bookings.slice(i, i + concurrency);
      const chunkPromises = chunk.map(async (booking) => {
        // 1. Check cached prediction for booking
        if (this.predictionRepository) {
          const cached = await this.predictionRepository.findLatest('CANCELLATION', booking.id);
          if (cached && cached.predictionValue !== null) {
            return {
              bookingId: booking.id,
              cancellationProbability: cached.predictionValue,
              riskLevel: cached.riskLevel || classifyRisk(cached.predictionValue),
              modelVersion: cached.modelVersion || modelVersion,
              factors: cached.payload ? cached.payload.factors || [] : [],
              status: PredictionStatus.AVAILABLE,
            };
          }
        }

        // 2. Live ML scoring
        if (this.mlService) {
          try {
            const scoreRes = await this.mlService.scoreCancellation(booking);
            const probability = Math.round(scoreRes.probability * 100) / 100;
            const riskLevel = classifyRisk(probability);

            // Format readable factors
            const readableFactors = this._formatReadableFactors(booking);

            // Cache result
            if (this.predictionRepository) {
              await this.predictionRepository.save({
                predictionType: 'CANCELLATION',
                entityId: booking.id,
                predictionValue: probability,
                riskLevel,
                modelVersion,
                payload: { factors: readableFactors },
              });
            }

            return {
              bookingId: booking.id,
              cancellationProbability: probability,
              riskLevel,
              modelVersion,
              factors: readableFactors,
              status: PredictionStatus.AVAILABLE,
            };
          } catch (err) {
            logger.warn({ bookingId: booking.id, error: err.message }, 'Failed to score cancellation via ML');
          }
        }

        return {
          bookingId: booking.id,
          cancellationProbability: null,
          riskLevel: null,
          modelVersion: null,
          factors: [],
          status: PredictionStatus.UNAVAILABLE,
        };
      });

      const chunkResults = await Promise.all(chunkPromises);
      results.push(...chunkResults);
    }

    return results;
  }

  _formatReadableFactors(booking) {
    const factors = [];
    const leadTime = Math.max(0, Math.round((new Date(booking.arrivalDate) - new Date(booking.bookingDate)) / (1000 * 60 * 60 * 24)));

    factors.push(`Lead time: ${leadTime} days`);
    if (booking.previousCancellations > 0) {
      factors.push(`Previous cancellations: ${booking.previousCancellations}`);
    }
    factors.push(`Booking channel: ${booking.bookingChannel || 'Direct'}`);
    factors.push(`Deposit type: ${booking.depositType || 'No Deposit'}`);

    return factors;
  }
}

module.exports = PredictionService;
