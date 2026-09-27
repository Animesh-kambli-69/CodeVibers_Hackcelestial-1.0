const express = require('express');
const validate = require('../middleware/validate');
const {
  listGuestsQuerySchema,
  guestIdParamSchema,
  cancellationRiskQuerySchema,
  bookingIdParamSchema,
  roomIdParamSchema,
  listServiceRequestsQuerySchema,
  updateServiceRequestStatusSchema,
} = require('../validators/operations.validators');

function createOperationsRoutes(operationsController) {
  const router = express.Router();

  router.get('/dashboard', operationsController.getDashboard);
  router.get('/guests', validate(listGuestsQuerySchema), operationsController.listGuests);
  router.get('/guests/:guestId', validate(guestIdParamSchema), operationsController.getGuestDetail);
  router.get('/guests/:guestId/predictions', validate(guestIdParamSchema), operationsController.getGuestPredictions);
  router.get('/cancellation-risk', validate(cancellationRiskQuerySchema), operationsController.getCancellationRisk);
  router.get('/staffing', operationsController.getStaffing);

  // Check-in / check-out lifecycle
  router.patch('/bookings/:bookingId/check-in', validate(bookingIdParamSchema), operationsController.checkInBooking);
  router.patch('/bookings/:bookingId/check-out', validate(bookingIdParamSchema), operationsController.checkOutBooking);
  router.patch('/bookings/:bookingId/cancel', validate(bookingIdParamSchema), operationsController.cancelBooking);
  router.patch('/rooms/:roomId/complete-maintenance', validate(roomIdParamSchema), operationsController.completeRoomMaintenance);

  // Service Requests
  router.get('/service-requests', validate(listServiceRequestsQuerySchema), operationsController.listServiceRequests);
  router.patch('/service-requests/:requestId/status', validate(updateServiceRequestStatusSchema), operationsController.updateServiceRequestStatus);

  return router;
}

module.exports = createOperationsRoutes;
