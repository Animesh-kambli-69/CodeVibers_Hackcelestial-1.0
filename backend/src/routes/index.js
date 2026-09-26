const express = require('express');
const createHealthRouter = require('./health.routes');
const createPublicRoutes = require('./public.routes');
const authenticate = require('../middleware/auth');
const requireRole = require('../middleware/roleCheck');
const rejectGuestIdInput = require('../middleware/rejectGuestIdInput');

function createApiRouter(deps = {}) {
  const router = express.Router();

  // Public / Health probe
  router.use('/health', createHealthRouter(deps));
  router.use('/public', createPublicRoutes());

  // Auth Routes (Public + Authenticated)
  if (deps.authRouter) {
    router.use('/auth', deps.authRouter);
  }

  // Manager Routes (Protected: RESORT_MANAGER)
  if (deps.managerRouter) {
    router.use('/manager', authenticate, requireRole('RESORT_MANAGER'), deps.managerRouter);
  }

  // Operations Routes (Protected: OPERATIONS_MANAGER)
  if (deps.operationsRouter) {
    router.use('/operations', authenticate, requireRole('OPERATIONS_MANAGER'), deps.operationsRouter);
  }

  // Guest Routes (Protected: GUEST with guestId injection rejection)
  if (deps.guestRouter) {
    router.use('/guest', authenticate, requireRole('GUEST'), rejectGuestIdInput, deps.guestRouter);
  }

  return router;
}

module.exports = createApiRouter;
