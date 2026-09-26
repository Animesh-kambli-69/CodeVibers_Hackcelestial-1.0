const { z } = require('zod');
const { uuidSchema, paginationQuerySchema } = require('./common');

const listGuestsQuerySchema = {
  query: paginationQuerySchema.extend({
    search: z.string().max(100).optional(),
    loyaltyTier: z.enum(['STANDARD', 'SILVER', 'GOLD', 'PLATINUM']).optional(),
  }),
};

const guestIdParamSchema = {
  params: z.object({
    guestId: uuidSchema,
  }),
};

const cancellationRiskQuerySchema = {
  query: z.object({
    window: z.coerce.number().int().min(1).max(90).default(30),
  }),
};

const bookingIdParamSchema = {
  params: z.object({
    bookingId: uuidSchema,
  }),
};

const roomIdParamSchema = {
  params: z.object({
    roomId: uuidSchema,
  }),
};

module.exports = {
  listGuestsQuerySchema,
  guestIdParamSchema,
  cancellationRiskQuerySchema,
  bookingIdParamSchema,
  roomIdParamSchema,
};
