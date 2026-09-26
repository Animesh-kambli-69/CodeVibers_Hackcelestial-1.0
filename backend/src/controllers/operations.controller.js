/**
 * Operations Controller.
 */
const asyncHandler = require('../utils/asyncHandler');
const respond = require('../utils/respond');

function createOperationsController({
  kpiService,
  guestIntelligenceService,
  cancellationService,
  staffingService,
  bookingLifecycleService,
}) {
  const getDashboard = asyncHandler(async (req, res) => {
    const [kpis, recentGuestsRes] = await Promise.all([
      kpiService.getOperationsKpis(),
      guestIntelligenceService.listGuests({ limit: 5 }),
    ]);

    return respond.ok(res, {
      kpis,
      recentGuests: recentGuestsRes.items,
    });
  });

  const listGuests = asyncHandler(async (req, res) => {
    const { page, limit, search, loyaltyTier } = req.query;
    const offset = (page - 1) * limit;

    const { items, total } = await guestIntelligenceService.listGuests({
      search,
      loyaltyTier,
      limit,
      offset,
    });

    return respond.paginated(res, items, { page, limit, total });
  });

  const getGuestDetail = asyncHandler(async (req, res) => {
    const { guestId } = req.params;
    const result = await guestIntelligenceService.getGuestDetail(guestId);
    return respond.ok(res, result);
  });

  const getGuestPredictions = asyncHandler(async (req, res) => {
    const { guestId } = req.params;
    const result = await guestIntelligenceService.getGuestPredictions(guestId);
    return respond.ok(res, result);
  });

  const getCancellationRisk = asyncHandler(async (req, res) => {
    const windowDays = req.query.window || 30;
    const result = await cancellationService.getOperationsRiskList(windowDays);
    return respond.ok(res, { bookings: result });
  });

  const getStaffing = asyncHandler(async (req, res) => {
    const result = await staffingService.getDepartmentStaffing();
    return respond.ok(res, result);
  });

  const checkInBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const result = await bookingLifecycleService.checkIn(bookingId, req.auth ? req.auth.userId : null);
    return respond.ok(res, result);
  });

  const checkOutBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const result = await bookingLifecycleService.checkOut(bookingId, req.auth ? req.auth.userId : null);
    return respond.ok(res, result);
  });

  const cancelBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    const result = await bookingLifecycleService.cancel(bookingId);
    return respond.ok(res, result);
  });

  const completeRoomMaintenance = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const result = await bookingLifecycleService.completeMaintenance(roomId, req.auth ? req.auth.userId : null);
    return respond.ok(res, result);
  });

  return {
    getDashboard,
    listGuests,
    getGuestDetail,
    getGuestPredictions,
    getCancellationRisk,
    getStaffing,
    checkInBooking,
    checkOutBooking,
    cancelBooking,
    completeRoomMaintenance,
  };
}

module.exports = createOperationsController;
