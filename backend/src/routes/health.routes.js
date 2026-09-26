const express = require('express');
const asyncHandler = require('../utils/asyncHandler');
const respond = require('../utils/respond');

function createHealthRouter(deps = {}) {
  const router = express.Router();
  const { pool, mlService, aiService } = deps;

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      let databaseStatus = 'ok';
      let mlStatus = 'down';
      let mlModelsLoaded = false;
      let llmStatus = 'ok';

      // 1. Check PostgreSQL Database
      if (pool) {
        try {
          await pool.query('SELECT 1');
          databaseStatus = 'ok';
        } catch (err) {
          databaseStatus = 'down';
        }
      }

      // 2. Check ML Service
      if (mlService && typeof mlService.health === 'function') {
        try {
          const mlHealth = await mlService.health();
          if (mlHealth && mlHealth.ok) {
            mlStatus = 'ok';
            mlModelsLoaded = !!mlHealth.modelsLoaded;
          } else {
            mlStatus = 'down';
          }
        } catch (err) {
          mlStatus = 'down';
        }
      }

      // 3. Check LLM Configuration (no paid call)
      if (aiService && typeof aiService.isConfigured === 'function') {
        llmStatus = aiService.isConfigured() ? 'ok' : 'unconfigured';
      }

      const overallStatus =
        databaseStatus === 'ok' && mlStatus === 'ok' ? 'ok' : 'degraded';

      return respond.ok(res, {
        status: overallStatus,
        service: 'Smart Resort 360 Backend',
        database: databaseStatus,
        ml: {
          status: mlStatus,
          modelsLoaded: mlModelsLoaded,
        },
        llm: llmStatus,
        timestamp: new Date().toISOString(),
      });
    })
  );

  return router;
}

module.exports = createHealthRouter;
