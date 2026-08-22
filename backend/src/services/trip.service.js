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
    include: { _count: { select: { stops: true } } },
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

module.exports = {
  listTrips,
  createTrip,
  getTripById,
  updateTrip,
  deleteTrip,
  assertTripOwner,
};
