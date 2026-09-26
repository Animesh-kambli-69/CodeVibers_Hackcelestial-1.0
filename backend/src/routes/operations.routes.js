const express = require('express');
const validate = require('../middleware/validate');
const {
  listGuestsQuerySchema,
  guestIdParamSchema,
  cancellationRiskQuerySchema,
} = require('../validators/operations.validators');

function createOperationsRoutes(operationsController) {
  const router = express.Router();

  router.get('/dashboard', operationsController.getDashboard);
  router.get('/guests', validate(listGuestsQuerySchema), operationsController.listGuests);
  router.get('/guests/:guestId', validate(guestIdParamSchema), operationsController.getGuestDetail);
  router.get('/guests/:guestId/predictions', validate(guestIdParamSchema), operationsController.getGuestPredictions);
  router.get('/cancellation-risk', validate(cancellationRiskQuerySchema), operationsController.getCancellationRisk);

  return router;
}

module.exports = createOperationsRoutes;
