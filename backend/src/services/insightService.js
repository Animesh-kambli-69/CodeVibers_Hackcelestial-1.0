/**
 * Insight Service for generating manager dashboard executive insights.
 * Pure deterministic templates keyed to KPIs and recommendations (Decision U-04).
 */

class InsightService {
  generateInsights({ kpis, recommendations = [] }) {
    const insights = [];

    // 1. Occupancy insight
    if (kpis.currentOccupancy >= 80) {
      insights.push(`High occupancy today at ${kpis.currentOccupancy}%. Ensure all front-line operations are operating at peak readiness.`);
    } else if (kpis.currentOccupancy < 45) {
      insights.push(`Occupancy is currently low (${kpis.currentOccupancy}%). Great opportunity for routine room maintenance and staff training.`);
    } else {
      insights.push(`Steady resort occupancy at ${kpis.currentOccupancy}% across ${kpis.totalRooms} total rooms.`);
    }

    // 2. Cancellation risk insight
    if (kpis.highRiskCancellationCount > 0) {
      insights.push(`${kpis.highRiskCancellationCount} upcoming bookings flagged with elevated cancellation risk. Check recommendations for proactive retention actions.`);
    }

    // 3. Demand insight
    if (kpis.bookingDemand === 'HIGH') {
      insights.push(`Upcoming 7-day demand is strong with high forecasted guest arrivals.`);
    }

    // 4. Recommendation highlights
    const criticalRec = recommendations.find((r) => r.priority === 'CRITICAL' || r.priority === 'HIGH');
    if (criticalRec) {
      insights.push(`Priority action recommended: "${criticalRec.title}"`);
    }

    return insights;
  }
}

module.exports = InsightService;
