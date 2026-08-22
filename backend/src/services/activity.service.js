const prisma = require('../lib/prisma');
const { notFound, badRequest } = require('../utils/errors');
const { formatActivity } = require('../utils/format');

async function listActivities({ cityId, type, maxCost, minDuration, maxDuration, q, limit = 50 }) {
  const where = {};

  if (cityId) where.cityId = cityId;
  if (type) where.type = type;
  if (q) where.name = { contains: q, mode: 'insensitive' };
  if (maxCost !== undefined) where.estimatedCost = { lte: Number(maxCost) };
  if (minDuration !== undefined || maxDuration !== undefined) {
    where.durationMinutes = {};
    if (minDuration !== undefined) where.durationMinutes.gte = Number(minDuration);
    if (maxDuration !== undefined) where.durationMinutes.lte = Number(maxDuration);
  }

  const activities = await prisma.activity.findMany({
    where,
    orderBy: { name: 'asc' },
    take: Number(limit),
  });

  return activities.map(formatActivity);
}

async function getActivityById(activityId) {
  const activity = await prisma.activity.findUnique({ where: { id: activityId } });
  if (!activity) throw notFound('Activity not found');
  return formatActivity(activity);
}

async function createActivity({ cityId, name, description, type, estimatedCost, durationMinutes, imageUrl }) {
  if (!cityId || !name) {
    throw badRequest('City ID and activity name are required');
  }

  const city = await prisma.city.findUnique({ where: { id: cityId } });
  if (!city) throw notFound('City not found');

  const activity = await prisma.activity.create({
    data: {
      cityId,
      name,
      description: description || '',
      type: type || 'custom',
      estimatedCost: estimatedCost ? Number(estimatedCost) : 0,
      durationMinutes: durationMinutes ? Number(durationMinutes) : 60,
      imageUrl: imageUrl || city.imageUrl || null,
    },
  });

  return formatActivity(activity);
}

module.exports = { listActivities, getActivityById, createActivity };
