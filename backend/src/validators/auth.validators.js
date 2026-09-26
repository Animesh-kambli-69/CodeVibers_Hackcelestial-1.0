const { z } = require('zod');

const loginSchema = {
  body: z.object({
    email: z.string().email({ message: 'Must be a valid email address' }),
    password: z.string().min(1, { message: 'Password is required' }),
  }),
};

const changePasswordSchema = {
  body: z.object({
    currentPassword: z.string().min(1, { message: 'Current password is required' }),
    newPassword: z.string().min(6, { message: 'New password must be at least 6 characters' }),
  }),
};

module.exports = {
  loginSchema,
  changePasswordSchema,
};
