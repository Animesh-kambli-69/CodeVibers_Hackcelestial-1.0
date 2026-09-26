const { z } = require('zod');
const { uuidSchema, paginationQuerySchema } = require('./common');
const { RecommendationStatus, RecommendationPriority, RecommendationCategory } = require('../models/enums');

const forecastQuerySchema = {
  query: z.object({
    days: z.coerce.number().int().min(1).max(90).default(7),
  }),
};

const cancellationSummaryQuerySchema = {
  query: z.object({
    window: z.coerce.number().int().min(1).max(90).default(30),
  }),
};

const roomDemandQuerySchema = {
  query: z.object({
    window: z.coerce.number().int().min(1).max(90).default(30),
  }),
};

const listRecommendationsQuerySchema = {
  query: paginationQuerySchema.extend({
    status: z.enum(['NEW', 'VIEWED', 'ACCEPTED', 'DISMISSED']).optional(),
    priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
    category: z.enum(['OCCUPANCY', 'CANCELLATION', 'REVENUE', 'STAFFING', 'GUEST_EXPERIENCE', 'MAINTENANCE', 'OPERATIONS', 'PRICING']).optional(),
  }),
};

const patchRecommendationSchema = {
  params: z.object({
    recommendationId: uuidSchema,
  }),
  body: z.object({
    status: z.enum(['VIEWED', 'ACCEPTED', 'DISMISSED']),
    note: z.string().max(500).optional().nullable(),
  }),
};

module.exports = {
  forecastQuerySchema,
  cancellationSummaryQuerySchema,
  roomDemandQuerySchema,
  listRecommendationsQuerySchema,
  patchRecommendationSchema,
};
