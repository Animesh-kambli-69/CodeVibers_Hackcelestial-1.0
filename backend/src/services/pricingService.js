/**
 * Dynamic Pricing Service.
 * Computes suggested ADR per room type from real occupancy/demand signals.
 * Read-only: suggestions are never written back to `rooms.base_price`
 * automatically (human-in-the-loop principle, api.md).
 */
const { computePricingSuggestions } = require('../decision-engine/pricing');

class PricingService {
  constructor(roomDemandService, roomRepository) {
    this.roomDemandService = roomDemandService;
    this.roomRepository = roomRepository;
  }

  async getPricingRecommendations(windowDays = 30) {
    const [roomDemands, currentADRByType] = await Promise.all([
      this.roomDemandService.getRoomDemands(windowDays),
      this.roomRepository.getAverageBasePriceByType(),
    ]);

    return computePricingSuggestions(roomDemands, currentADRByType);
  }
}

module.exports = PricingService;
