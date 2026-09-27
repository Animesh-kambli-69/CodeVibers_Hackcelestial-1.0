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

const submitFeedbackSchema = {
  params: z.object({
    bookingId: uuidSchema,
  }),
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().max(1000).optional().nullable(),
  }),
};

const createServiceRequestSchema = {
  body: z.object({
    type: z.string().min(1, { message: 'type is required' }).max(80),
    description: z.string().max(1000).optional().nullable(),
  }),
};

module.exports = {
  chatBodySchema,
  resortInfoQuerySchema,
  submitFeedbackSchema,
  createServiceRequestSchema,
};
