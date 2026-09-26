const { z } = require('zod');

// Login identifier is NOT required to be a real email address — Operations
// Manager and Guest accounts can be system-generated usernames (e.g.
// "raghav482", see utils/credentials.js), not just emails. The field is
// still named `email` throughout (matches the `users.email` column, which
// has no email-format constraint), but validated as a generic identifier.
const loginSchema = {
  body: z.object({
    email: z.string().min(3, { message: 'Email or username is required' }).max(255),
    password: z.string().min(1, { message: 'Password is required' }),
  }),
};

module.exports = {
  loginSchema,
};
