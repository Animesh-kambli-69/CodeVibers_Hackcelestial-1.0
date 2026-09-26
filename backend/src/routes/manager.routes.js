const express = require('express');
const validate = require('../middleware/validate');
const {
  forecastQuerySchema,
  cancellationSummaryQuerySchema,
  roomDemandQuerySchema,
  listRecommendationsQuerySchema,
  patchRecommendationSchema,
} = require('../validators/manager.validators');

function createManagerRoutes(managerController) {
  const router = express.Router();

  router.get('/dashboard', managerController.getDashboard);
  router.get('/booking-forecast', validate(forecastQuerySchema), managerController.getBookingForecast);
  router.get('/occupancy-forecast', validate(forecastQuerySchema), managerController.getOccupancyForecast);
  router.get('/cancellation-summary', validate(cancellationSummaryQuerySchema), managerController.getCancellationSummary);
  router.get('/room-demand', validate(roomDemandQuerySchema), managerController.getRoomDemand);
  router.get('/recommendations', validate(listRecommendationsQuerySchema), managerController.listRecommendations);
  router.patch('/recommendations/:recommendationId', validate(patchRecommendationSchema), managerController.patchRecommendation);

  return router;
}

module.exports = createManagerRoutes;
