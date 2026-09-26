const { z } = require('zod');
const { uuidSchema, paginationQuerySchema } = require('./common');

const listUsersQuerySchema = {
  query: paginationQuerySchema.extend({
    search: z.string().max(100).optional(),
  }),
};

const createOperationsManagerSchema = {
  body: z.object({
    name: z.string().min(1).max(120),
    email: z.string().min(3).max(255),
  }),
};

const userIdParamSchema = {
  params: z.object({
    userId: uuidSchema,
  }),
};

const setActiveBodySchema = {
  params: z.object({
    userId: uuidSchema,
  }),
  body: z.object({
    isActive: z.boolean(),
  }),
};

module.exports = {
  listUsersQuerySchema,
  createOperationsManagerSchema,
  userIdParamSchema,
  setActiveBodySchema,
};
