const prisma = require('../lib/prisma');
const { notFound, forbidden, conflict, badRequest } = require('../utils/errors');
const { formatStopActivity } = require('../utils/format');

function defaultScheduledAt(arrivalDate) {
  const date = arrivalDate.toISOString().split('T')[0];
  return new Date(`${date}T09:00:00.000Z`);
}

async function getStopWithTrip(stopId) {
  const stop = await prisma.tripStop.findUnique({
    where: { id: stopId },
    include: { trip: true, city: true },
  });
  if (!stop) throw notFound('Stop not found');
  return stop;
}

async function getStopActivityWithRelations(stopActivityId) {
  const stopActivity = await prisma.stopActivity.findUnique({
    where: { id: stopActivityId },
    include: {
      activity: true,
      stop: { include: { trip: true } },
    },
  });
  if (!stopActivity) throw notFound('Stop activity not found');
  return stopActivity;
}

function formatStopActivityResponse(stopActivity) {
  return {
    stopId: stopActivity.stopId,
    ...formatStopActivity(stopActivity),
  };
}

async function addActivityToStop(stopId, userId, data) {
  const stop = await getStopWithTrip(stopId);
  if (stop.trip.userId !== userId) throw forbidden();

  const activity = await prisma.activity.findUnique({ where: { id: data.activityId } });
  if (!activity) throw notFound('Activity not found');
  if (activity.cityId !== stop.cityId) {
    throw badRequest('Activity must belong to the stop city');
  }

  const existing = await prisma.stopActivity.findFirst({
    where: { stopId, activityId: data.activityId },
  });
  if (existing) throw conflict('Activity already added to this stop');

  const lastActivity = await prisma.stopActivity.findFirst({
    where: { stopId },
    orderBy: { orderIndex: 'desc' },
  });

  const scheduledAt = data.scheduledAt
    ? new Date(data.scheduledAt)
    : defaultScheduledAt(stop.arrivalDate);

  const stopActivity = await prisma.stopActivity.create({
    data: {
      stopId,
      activityId: data.activityId,
      scheduledAt,
      costOverride: data.costOverride ?? null,
      orderIndex: lastActivity ? lastActivity.orderIndex + 1 : 0,
    },
    include: { activity: true },
  });

  return formatStopActivityResponse(stopActivity);
}

async function updateStopActivity(stopActivityId, userId, data) {
  const existing = await getStopActivityWithRelations(stopActivityId);
  if (existing.stop.trip.userId !== userId) throw forbidden();

  const stopActivity = await prisma.stopActivity.update({
    where: { id: stopActivityId },
    data: {
      ...(data.scheduledAt !== undefined
        ? { scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null }
        : {}),
      ...(data.costOverride !== undefined ? { costOverride: data.costOverride } : {}),
      ...(data.orderIndex !== undefined ? { orderIndex: data.orderIndex } : {}),
    },
    include: { activity: true },
  });

  return formatStopActivityResponse({ ...stopActivity, stopId: existing.stopId });
}

async function removeStopActivity(stopActivityId, userId) {
  const existing = await getStopActivityWithRelations(stopActivityId);
  if (existing.stop.trip.userId !== userId) throw forbidden();
  await prisma.stopActivity.delete({ where: { id: stopActivityId } });
}

module.exports = {
  addActivityToStop,
  updateStopActivity,
  removeStopActivity,
};
