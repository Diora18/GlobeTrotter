const { z } = require('zod');

const addStopActivitySchema = z.object({
  activityId: z.string().uuid(),
  scheduledAt: z.string().datetime().optional(),
  costOverride: z.number().int().min(0).nullable().optional(),
});

const updateStopActivitySchema = z.object({
  scheduledAt: z.string().datetime().optional().nullable(),
  costOverride: z.number().int().min(0).optional().nullable(),
  orderIndex: z.number().int().min(0).optional(),
});

module.exports = { addStopActivitySchema, updateStopActivitySchema };
