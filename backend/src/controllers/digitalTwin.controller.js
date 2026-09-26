/**
 * Digital Twin Controller.
 * Manager-only (mounted under /api/manager/digital-twin, see routes/manager.routes.js).
 */
const asyncHandler = require('../utils/asyncHandler');
const respond = require('../utils/respond');

function createDigitalTwinController(digitalTwinService) {
  const getWeather = asyncHandler(async (req, res) => {
    const days = req.query.days || 7;
    const result = await digitalTwinService.getWeather(days);
    return respond.ok(res, result);
  });

  const getSocialSignals = asyncHandler(async (req, res) => {
    const { query, limit } = req.query;
    const result = await digitalTwinService.getSocialSignals(query, limit || 15);
    return respond.ok(res, result);
  });

  const getState = asyncHandler(async (req, res) => {
    const result = await digitalTwinService.getCurrentState();
    return respond.ok(res, result);
  });

  const simulate = asyncHandler(async (req, res) => {
    const params = {
      precipitationMm: req.body.precipitationMm,
      windSpeedKmh: req.body.windSpeedKmh,
      temperatureC: req.body.temperatureC,
      stormDurationHrs: req.body.stormDurationHrs,
      flooding: req.body.flooding,
    };
    const result = await digitalTwinService.simulateWhatIf(params, {
      userId: req.auth ? req.auth.userId : null,
      label: req.body.label || null,
    });
    return respond.ok(res, result);
  });

  return {
    getWeather,
    getSocialSignals,
    getState,
    simulate,
  };
}

module.exports = createDigitalTwinController;
