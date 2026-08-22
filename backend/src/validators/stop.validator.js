const { z } = require('zod');

const createStopSchema = z.object({
  cityId: z.string().uuid(),
  arrivalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  estimatedTransportCost: z.number().int().min(0).optional(),
  estimatedStayCost: z.number().int().min(0).optional(),
}).refine((data) => new Date(data.departureDate) >= new Date(data.arrivalDate), {
  message: 'Departure date must be on or after arrival date',
  path: ['departureDate'],
});

const updateStopSchema = z.object({
  arrivalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  estimatedTransportCost: z.number().int().min(0).optional(),
  estimatedStayCost: z.number().int().min(0).optional(),
});

const reorderStopsSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1),
});

module.exports = { createStopSchema, updateStopSchema, reorderStopsSchema };
