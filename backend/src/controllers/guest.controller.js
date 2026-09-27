/**
 * Guest Controller.
 */
const asyncHandler = require('../utils/asyncHandler');
const respond = require('../utils/respond');

function createGuestController({
  guestSelfService,
  resortInfoService,
  conciergeService,
  feedbackService,
}) {
  const getProfile = asyncHandler(async (req, res) => {
    const result = await guestSelfService.getProfile(req.auth.guestId);
    return respond.ok(res, result);
  });

  const getPreferences = asyncHandler(async (req, res) => {
    const result = await guestSelfService.getPreferences(req.auth.guestId);
    return respond.ok(res, { preferences: result });
  });

  const getBookings = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page || 1, 10);
    const limit = parseInt(req.query.limit || 20, 10);
    const offset = (page - 1) * limit;

    const { items, total } = await guestSelfService.getBookings(req.auth.guestId, { limit, offset });
    return respond.paginated(res, items, { page, limit, total });
  });

  const listResortInfo = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page || 1, 10);
    const limit = parseInt(req.query.limit || 50, 10);
    const offset = (page - 1) * limit;
    const { category, search } = req.query;

    const { items, total } = await resortInfoService.list({ category, search, limit, offset });
    return respond.paginated(res, items, { page, limit, total });
  });

  const postChat = asyncHandler(async (req, res) => {
    const { conversationId, message } = req.body;
    const result = await conciergeService.processMessage({
      guestId: req.auth.guestId,
      conversationId,
      message,
    });
    return respond.ok(res, result);
  });

  const getPendingFeedback = asyncHandler(async (req, res) => {
    const result = await feedbackService.listPendingForGuest(req.auth.guestId);
    return respond.ok(res, result);
  });

  const submitFeedback = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const { rating, comment } = req.body;
    const result = await feedbackService.submitAsGuest(bookingId, req.auth.guestId, { rating, comment });
    return respond.ok(res, result);
  });

  return {
    getProfile,
    getPreferences,
    getBookings,
    listResortInfo,
    postChat,
    getPendingFeedback,
    submitFeedback,
  };
}

module.exports = createGuestController;
