/**
 * User Management Controller.
 * Manager-only (mounted under /api/manager/users).
 */
const asyncHandler = require('../utils/asyncHandler');
const respond = require('../utils/respond');

function createUserManagementController(userManagementService) {
  const listOperationsManagers = asyncHandler(async (req, res) => {
    const { page, limit, search } = req.query;
    const offset = (page - 1) * limit;
    const { items, total } = await userManagementService.listOperationsManagers({ search, limit, offset });
    return respond.paginated(res, items, { page, limit, total });
  });

  const createOperationsManager = asyncHandler(async (req, res) => {
    const { name, email } = req.body;
    const result = await userManagementService.createOperationsManager({ name, email });
    return respond.created(res, result);
  });

  const setActive = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { isActive } = req.body;
    const result = await userManagementService.setActive(userId, isActive);
    return respond.ok(res, result);
  });

  return {
    listOperationsManagers,
    createOperationsManager,
    setActive,
  };
}

module.exports = createUserManagementController;
