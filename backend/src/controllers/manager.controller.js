/**
 * Manager Controller.
 */
const asyncHandler = require('../utils/asyncHandler');
const respond = require('../utils/respond');
const { hashPassword } = require('../utils/password');

function createManagerController({
  kpiService,
  forecastService,
  cancellationService,
  roomDemandService,
  recommendationService,
  insightService,
  userRepository,
}) {
  const getDashboard = asyncHandler(async (req, res) => {
    const [kpis, recsRes] = await Promise.all([
      kpiService.getManagerKpis(),
      recommendationService.list({ limit: 5 }),
    ]);

    const insights = insightService.generateInsights({
      kpis,
      recommendations: recsRes.items,
    });

    return respond.ok(res, {
      kpis,
      insights,
      topRecommendations: recsRes.items,
    });
  });

  const getBookingForecast = asyncHandler(async (req, res) => {
    const days = req.query.days || 7;
    const result = await forecastService.getBookingForecast(days);
    return respond.ok(res, result);
  });

  const getOccupancyForecast = asyncHandler(async (req, res) => {
    const days = req.query.days || 7;
    const result = await forecastService.getOccupancyForecast(days);
    return respond.ok(res, result);
  });

  const getCancellationSummary = asyncHandler(async (req, res) => {
    const windowDays = req.query.window || 30;
    const result = await cancellationService.getManagerSummary(windowDays);
    return respond.ok(res, result);
  });

  const getRoomDemand = asyncHandler(async (req, res) => {
    const windowDays = req.query.window || 30;
    const result = await roomDemandService.getRoomDemands(windowDays);
    return respond.ok(res, { roomDemands: result });
  });

  const listRecommendations = asyncHandler(async (req, res) => {
    const { page, limit, status, priority, category } = req.query;
    const offset = (page - 1) * limit;

    const { items, total } = await recommendationService.list({
      status,
      priority,
      category,
      limit,
      offset,
    });

    return respond.paginated(res, items, { page, limit, total });
  });

  const patchRecommendation = asyncHandler(async (req, res) => {
    const { recommendationId } = req.params;
    const { status, note } = req.body;

    const updated = await recommendationService.updateStatus(recommendationId, status, note);
    return respond.ok(res, updated);
  });

  const getOperationsManagers = asyncHandler(async (req, res) => {
    const managers = await userRepository.findByRole('OPERATIONS_MANAGER');
    return respond.ok(res, { users: managers });
  });

  const resetUserPassword = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: { message: 'Password must be at least 6 characters' } });
    }
    
    const newHash = await hashPassword(newPassword);
    await userRepository.updatePassword(userId, newHash);
    
    return respond.ok(res, { message: 'Password updated successfully' });
  });

  return {
    getDashboard,
    getBookingForecast,
    getOccupancyForecast,
    getCancellationSummary,
    getRoomDemand,
    listRecommendations,
    patchRecommendation,
    getOperationsManagers,
    resetUserPassword,
  };
}

module.exports = createManagerController;
