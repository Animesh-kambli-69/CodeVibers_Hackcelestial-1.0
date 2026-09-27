const express = require('express');
const validate = require('../middleware/validate');
const {
  forecastQuerySchema,
  cancellationSummaryQuerySchema,
  roomDemandQuerySchema,
  listRecommendationsQuerySchema,
  patchRecommendationSchema,
} = require('../validators/manager.validators');
const {
  weatherQuerySchema,
  socialSignalsQuerySchema,
  simulateBodySchema,
} = require('../validators/digitalTwin.validators');
const {
  listUsersQuerySchema,
  createOperationsManagerSchema,
  setActiveBodySchema,
} = require('../validators/userManagement.validators');

function createManagerRoutes(managerController, digitalTwinController, userManagementController) {
  const router = express.Router();

  router.get('/dashboard', managerController.getDashboard);
  router.get('/booking-forecast', validate(forecastQuerySchema), managerController.getBookingForecast);
  router.get('/occupancy-forecast', validate(forecastQuerySchema), managerController.getOccupancyForecast);
  router.get('/cancellation-summary', validate(cancellationSummaryQuerySchema), managerController.getCancellationSummary);
  router.get('/room-demand', validate(roomDemandQuerySchema), managerController.getRoomDemand);
  router.get('/recommendations', validate(listRecommendationsQuerySchema), managerController.listRecommendations);
  router.patch('/recommendations/:recommendationId', validate(patchRecommendationSchema), managerController.patchRecommendation);
  router.get('/sentiment', managerController.getSentiment);
  router.get('/pricing-recommendations', validate(cancellationSummaryQuerySchema), managerController.getPricingRecommendations);

  // Weather-Driven Digital Twin
  if (digitalTwinController) {
    router.get('/digital-twin/weather', validate(weatherQuerySchema), digitalTwinController.getWeather);
    router.get('/digital-twin/social-signals', validate(socialSignalsQuerySchema), digitalTwinController.getSocialSignals);
    router.get('/digital-twin/state', digitalTwinController.getState);
    router.post('/digital-twin/simulate', validate(simulateBodySchema), digitalTwinController.simulate);
  }

  // User Management (Operations Manager accounts)
  if (userManagementController) {
    router.get('/users', validate(listUsersQuerySchema), userManagementController.listOperationsManagers);
    router.post('/users', validate(createOperationsManagerSchema), userManagementController.createOperationsManager);
    router.patch('/users/:userId/status', validate(setActiveBodySchema), userManagementController.setActive);
  }

  return router;
}

module.exports = createManagerRoutes;
