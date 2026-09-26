/**
 * Recommendation Service.
 * Coordinates Decision Engine execution on demand, manages fresh runs,
 * enforces recommendation lifecycle transitions, and handles persistence.
 */
const { generateRecommendations } = require('../decision-engine');
const RULE_CONFIG = require('../decision-engine/config/thresholds');
const { ConflictError, NotFoundError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

class RecommendationService {
  constructor(
    recommendationRepository,
    forecastService,
    cancellationService,
    roomDemandService
  ) {
    this.recommendationRepository = recommendationRepository;
    this.forecastService = forecastService;
    this.cancellationService = cancellationService;
    this.roomDemandService = roomDemandService;
    this.inFlightRun = null;
  }

  async ensureFresh() {
    if (this.inFlightRun) {
      return this.inFlightRun;
    }

    this.inFlightRun = (async () => {
      try {
        const latestCreatedAt = await this.recommendationRepository.getLatestRecommendationCreatedAt();
        const refreshMs = (RULE_CONFIG.recommendationRefreshMinutes || 15) * 60 * 1000;

        if (latestCreatedAt && Date.now() - latestCreatedAt.getTime() < refreshMs) {
          logger.debug('Recommendations are fresh, skipping Decision Engine run');
          return;
        }

        logger.info('Recalculating Decision Engine recommendations...');

        // 1. Build resort state
        const [occupancyForecast, cancellationSummary, roomDemands] = await Promise.all([
          this.forecastService.getOccupancyForecast(7),
          this.cancellationService.getManagerSummary(30),
          this.roomDemandService.getRoomDemands(30),
        ]);

        const state = {
          occupancyForecast: {
            predictions: occupancyForecast.forecast,
          },
          cancellationSummary,
          roomDemands,
        };

        // 2. Pure Decision Engine generation
        const drafts = generateRecommendations(state);

        // 3. Persist new drafts with dedup_key
        const insertedCount = await this.recommendationRepository.insertDrafts(drafts);
        logger.info({ insertedCount, totalDrafts: drafts.length }, 'Decision Engine run complete');
      } catch (err) {
        logger.error({ error: err.message }, 'Failed during Decision Engine recalculation');
      } finally {
        this.inFlightRun = null;
      }
    })();

    return this.inFlightRun;
  }

  async list(filters = {}) {
    await this.ensureFresh();
    return this.recommendationRepository.listRecommendations(filters);
  }

  async updateStatus(id, newStatus, note = null) {
    const rec = await this.recommendationRepository.findById(id);
    if (!rec) {
      throw new NotFoundError(`Recommendation with id ${id} not found`);
    }

    const currentStatus = rec.status;

    // Transition validation
    const validTransitions = {
      NEW: ['VIEWED', 'ACCEPTED', 'DISMISSED'],
      VIEWED: ['ACCEPTED', 'DISMISSED'],
      ACCEPTED: [], // Final / Immutable
      DISMISSED: [], // Final / Immutable
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new ConflictError(
        `Cannot transition recommendation from status '${currentStatus}' to '${newStatus}'`
      );
    }

    return this.recommendationRepository.updateStatus(id, newStatus, note);
  }
}

module.exports = RecommendationService;
