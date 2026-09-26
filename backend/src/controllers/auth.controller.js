/**
 * Auth Controller.
 */
const asyncHandler = require('../utils/asyncHandler');
const respond = require('../utils/respond');

function createAuthController(authService) {
  const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    return respond.ok(res, result);
  });

  const logout = asyncHandler(async (req, res) => {
    return respond.ok(res, { message: 'Logged out successfully' });
  });

  const me = asyncHandler(async (req, res) => {
    const result = await authService.getMe(req.auth);
    return respond.ok(res, result);
  });

  return {
    login,
    logout,
    me,
  };
}

module.exports = createAuthController;
