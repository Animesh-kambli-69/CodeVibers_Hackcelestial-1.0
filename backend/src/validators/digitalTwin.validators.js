const { z } = require('zod');

const weatherQuerySchema = {
  query: z.object({
    days: z.coerce.number().int().min(1).max(16).default(7),
  }),
};

const socialSignalsQuerySchema = {
  query: z.object({
    query: z.string().max(200).optional(),
    limit: z.coerce.number().int().min(1).max(50).default(15),
  }),
};

const simulateBodySchema = {
  body: z.object({
    precipitationMm: z.coerce.number().min(0).max(1000).default(0),
    windSpeedKmh: z.coerce.number().min(0).max(300).default(0),
    temperatureC: z.coerce.number().min(-30).max(60).default(28),
    stormDurationHrs: z.coerce.number().min(0).max(240).default(0),
    flooding: z.coerce.boolean().default(false),
    label: z.string().max(120).optional(),
  }),
};

module.exports = {
  weatherQuerySchema,
  socialSignalsQuerySchema,
  simulateBodySchema,
};
