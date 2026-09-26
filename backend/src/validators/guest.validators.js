const { z } = require('zod');
const { uuidSchema, paginationQuerySchema } = require('./common');

const chatBodySchema = {
  body: z.object({
    conversationId: uuidSchema.optional().nullable(),
    message: z.string().min(1, { message: 'Message is required' }).max(1000, { message: 'Message cannot exceed 1000 characters' }),
  }),
};

const resortInfoQuerySchema = {
  query: paginationQuerySchema.extend({
    category: z.enum(['DINING', 'SPA', 'ACTIVITIES', 'FACILITIES', 'POLICIES', 'TRANSPORTATION', 'ROOMS', 'CHECK_IN', 'CHECK_OUT', 'SERVICES']).optional(),
    search: z.string().max(100).optional(),
  }),
};

module.exports = {
  chatBodySchema,
  resortInfoQuerySchema,
};
