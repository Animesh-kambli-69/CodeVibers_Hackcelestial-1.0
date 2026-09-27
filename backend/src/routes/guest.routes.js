const express = require('express');
const validate = require('../middleware/validate');
const { chatLimiter } = require('../middleware/rateLimit');
const {
  chatBodySchema,
  resortInfoQuerySchema,
  submitFeedbackSchema,
} = require('../validators/guest.validators');

function createGuestRoutes(guestController) {
  const router = express.Router();

  router.get('/profile', guestController.getProfile);
  router.get('/preferences', guestController.getPreferences);
  router.get('/bookings', guestController.getBookings);
  router.get('/resort-info', validate(resortInfoQuerySchema), guestController.listResortInfo);
  router.post('/chat', chatLimiter, validate(chatBodySchema), guestController.postChat);

  router.get('/feedback/pending', guestController.getPendingFeedback);
  router.post('/feedback/:bookingId', validate(submitFeedbackSchema), guestController.submitFeedback);

  return router;
}

module.exports = createGuestRoutes;
