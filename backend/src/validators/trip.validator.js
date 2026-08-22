const { z } = require('zod');

const createTripSchema = z
  .object({
    name: z.string().min(1).max(100),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
    travelerCount: z.coerce.number().int().min(1).optional().default(1),
    description: z.string().max(2000).optional(),
    coverPhotoUrl: z.string().url().optional().or(z.literal('')).transform((v) => v || undefined),
  })
  .refine(
    (data) => {
      const todayStr = new Date().toISOString().split('T')[0];
      return data.startDate >= todayStr;
    },
    {
      message: 'Start date cannot be in the past',
      path: ['startDate'],
    },
  )
  .refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    },
  );

const updateTripSchema = z
  .object({
    name: z.string().min(1).max(100).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    travelerCount: z.coerce.number().int().min(1).optional(),
    description: z.string().max(2000).optional().nullable(),
    coverPhotoUrl: z.string().url().optional().nullable(),
    isPublic: z.boolean().optional(),
    shareSlug: z.string().min(3).max(50).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    },
  );

module.exports = { createTripSchema, updateTripSchema };
