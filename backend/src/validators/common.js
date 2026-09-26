/**
 * Common Zod validation schemas.
 */
const { z } = require('zod');

const uuidSchema = z.string().uuid({ message: 'Must be a valid UUID' });

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date must be formatted as YYYY-MM-DD' });

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = {
  uuidSchema,
  dateStringSchema,
  paginationQuerySchema,
};
