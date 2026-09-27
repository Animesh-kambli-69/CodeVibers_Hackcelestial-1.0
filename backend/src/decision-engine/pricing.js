/**
 * Rule R5: Demand-Based Dynamic Pricing Suggestion.
 * Pure, deterministic ADR suggestion per room type — mirrors the style of
 * the recommendation rules (zero I/O), but returns a per-room-type table
 * rather than recommendation-lifecycle drafts, since pricing is a live
 * read-only "suggestions only" view (never auto-applied — see api.md).
 */
const RULE_CONFIG = require('./config/thresholds');

function computePricingSuggestions(roomDemands, currentADRByType, config = RULE_CONFIG) {
  if (!roomDemands || !Array.isArray(roomDemands)) {
    return [];
  }

  return roomDemands.map((item) => {
    const { roomType, demandLevel, occupancyRatePct } = item;
    const currentADR = currentADRByType[roomType] || 0;
    const changePct = config.pricingAdjustmentPct[demandLevel] ?? 0;
    const suggestedADR = Math.round(currentADR * (1 + changePct / 100));

    let reason;
    if (changePct > 0) {
      reason = `Demand is HIGH (${occupancyRatePct}% occupancy) — raising rate to capture premium demand.`;
    } else if (changePct < 0) {
      reason = `Demand is LOW (${occupancyRatePct}% occupancy) — lowering rate to stimulate bookings.`;
    } else {
      reason = `Demand is stable (${occupancyRatePct}% occupancy) — holding current rate.`;
    }

    return {
      roomType,
      currentADR,
      suggestedADR,
      changePct,
      predictedOccupancy: occupancyRatePct,
      demandLevel,
      reason,
    };
  });
}

module.exports = { computePricingSuggestions };
