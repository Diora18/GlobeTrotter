const prisma = require('../lib/prisma');
const { forbidden, notFound, badRequest } = require('../utils/errors');
const { formatTripSummary, formatTripDetail } = require('../utils/format');

const tripDetailInclude = {
  stops: {
    orderBy: { orderIndex: 'asc' },
    include: {
      city: true,
      activities: {
        orderBy: { orderIndex: 'asc' },
        include: { activity: true },
      },
    },
  },
  _count: { select: { stops: true } },
};

async function assertTripOwner(tripId, userId) {
  const trip = await prisma.trip.findUnique({ where: { id: tripId } });
  if (!trip) throw notFound('Trip not found');
  if (trip.userId !== userId) throw forbidden();
  return trip;
}

async function listTrips(userId, { sort = 'upcoming', limit }) {
  let orderBy = { startDate: 'asc' };
  if (sort === 'recent') orderBy = { updatedAt: 'desc' };
  if (sort === 'created') orderBy = { createdAt: 'desc' };

  const trips = await prisma.trip.findMany({
    where: { userId },
    orderBy,
    take: limit ? Number(limit) : undefined,
    include: {
      stops: {
        include: {
          activities: { include: { activity: true } },
        },
      },
      _count: { select: { stops: true } },
    },
  });

  return trips.map(formatTripSummary);
}

async function createTrip(userId, data) {
  const trip = await prisma.trip.create({
    data: {
      userId,
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      travelerCount: data.travelerCount || 1,
      description: data.description,
      coverPhotoUrl: data.coverPhotoUrl,
    },
    include: tripDetailInclude,
  });

  return formatTripDetail(trip);
}

async function getTripById(tripId, userId) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: tripDetailInclude,
  });

  if (!trip) throw notFound('Trip not found');
  if (trip.userId !== userId) throw forbidden();

  return formatTripDetail(trip);
}

async function updateTrip(tripId, userId, data) {
  await assertTripOwner(tripId, userId);

  const updateData = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.coverPhotoUrl !== undefined) updateData.coverPhotoUrl = data.coverPhotoUrl;
  if (data.startDate) updateData.startDate = new Date(data.startDate);
  if (data.endDate) updateData.endDate = new Date(data.endDate);
  if (data.travelerCount !== undefined) updateData.travelerCount = data.travelerCount;
  if (data.isPublic !== undefined) updateData.isPublic = data.isPublic;
  if (data.shareSlug !== undefined) updateData.shareSlug = data.shareSlug;

  const trip = await prisma.trip.update({
    where: { id: tripId },
    data: updateData,
    include: { _count: { select: { stops: true } } },
  });

  return formatTripSummary(trip);
}

async function deleteTrip(tripId, userId) {
  await assertTripOwner(tripId, userId);
  await prisma.trip.delete({ where: { id: tripId } });
}

async function getTripBySlug(slug) {
  const trip = await prisma.trip.findUnique({
    where: { shareSlug: slug },
    include: tripDetailInclude,
  });

  if (!trip) throw notFound('Trip not found');
  if (!trip.isPublic) throw forbidden('This trip is private');

  return formatTripDetail(trip);
}

async function duplicateTrip(tripId, userId) {
  const original = await prisma.trip.findUnique({
    where: { id: tripId },
    include: tripDetailInclude,
  });

  if (!original) throw notFound('Trip not found');
  if (!original.isPublic && original.userId !== userId) {
    throw forbidden('Cannot copy a private trip');
  }

  const newTrip = await prisma.trip.create({
    data: {
      userId,
      name: `${original.name} (Copy)`,
      startDate: original.startDate,
      endDate: original.endDate,
      travelerCount: original.travelerCount || 1,
      description: original.description,
      coverPhotoUrl: original.coverPhotoUrl,
    },
  });

  for (const stop of original.stops) {
    const newStop = await prisma.tripStop.create({
      data: {
        tripId: newTrip.id,
        cityId: stop.cityId,
        arrivalDate: stop.arrivalDate,
        departureDate: stop.departureDate,
        orderIndex: stop.orderIndex,
        estimatedStayCost: stop.estimatedStayCost,
        estimatedTransportCost: stop.estimatedTransportCost,
        estimatedMealCost: stop.estimatedMealCost,
      },
    });

    for (const sa of stop.activities) {
      await prisma.stopActivity.create({
        data: {
          stopId: newStop.id,
          activityId: sa.activityId,
          scheduledAt: sa.scheduledAt,
          costOverride: sa.costOverride,
          orderIndex: sa.orderIndex,
        },
      });
    }
  }

  return getTripById(newTrip.id, userId);
}

module.exports = {
  listTrips,
  createTrip,
  getTripById,
  updateTrip,
  deleteTrip,
  getTripBySlug,
  duplicateTrip,
  assertTripOwner,
};
