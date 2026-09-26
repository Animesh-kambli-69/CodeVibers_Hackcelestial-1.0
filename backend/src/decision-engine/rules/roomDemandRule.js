/**
 * Rule R4: High Demand + Low Availability.
 * Triggered when a room type experiences high demand and remaining available inventory is critically low.
 */
const RULE_CONFIG = require('../config/thresholds');
const { RecommendationCategory, RecommendationPriority } = require('../../models/enums');

function evaluateRoomDemandRule(state, config = RULE_CONFIG) {
  const recommendations = [];
  const roomDemands = state.roomDemands;

  if (!roomDemands || !Array.isArray(roomDemands)) {
    return recommendations;
  }

  for (const item of roomDemands) {
    const { roomType, demandLevel, availableRooms = 0, totalRooms = 0 } = item;
    if (demandLevel === 'HIGH' && availableRooms <= config.lowAvailableRoomCount) {
      recommendations.push({
        ruleId: 'R4',
        category: RecommendationCategory.OCCUPANCY,
        title: `Low Inventory Alert for ${roomType} Rooms`,
        reason: `${roomType} rooms are seeing HIGH demand with only ${availableRooms} of ${totalRooms} rooms remaining available.`,
        suggestedAction: `Consider releasing reserved blocks, holding remaining inventory for premium bookings, or adjusting rate tiers.`,
        priority: RecommendationPriority.HIGH,
        confidence: 0.95,
        sourceData: {
          roomType,
          availableRooms,
          totalRooms,
          demandLevel,
        },
        dedupKey: `R4:${roomType}`,
      });
    }
  }

  return recommendations;
}

module.exports = evaluateRoomDemandRule;
