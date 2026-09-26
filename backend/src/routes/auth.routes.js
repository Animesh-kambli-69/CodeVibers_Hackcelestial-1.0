const express = require('express');
const validate = require('../middleware/validate');
const { loginLimiter } = require('../middleware/rateLimit');
const authenticate = require('../middleware/auth');
const { loginSchema, changePasswordSchema } = require('../validators/auth.validators');

function createAuthRoutes(authController) {
  const router = express.Router();

  router.post('/login', loginLimiter, validate(loginSchema), authController.login);
  router.post('/logout', authenticate, authController.logout);
  router.get('/me', authenticate, authController.me);
  router.post('/change-password', authenticate, validate(changePasswordSchema), authController.changePassword);

  return router;
}

module.exports = createAuthRoutes;
