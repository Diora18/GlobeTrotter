const prisma = require('../lib/prisma');
const { notFound, badRequest, forbidden } = require('../utils/errors');
const { formatStop } = require('../utils/format');
const { assertTripOwner } = require('./trip.service');

const STAY_COST_PER_INDEX = 50;

function parseDateOnly(dateStr) {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function nightsBetween(arrival, departure) {
  const ms = departure.getTime() - arrival.getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function toDateOnlyString(date) {
  if (date instanceof Date) return date.toISOString().split('T')[0];
  return date;
}

function assertDatesWithinTrip(stopArrival, stopDeparture, tripStart, tripEnd) {
  const arrival = parseDateOnly(stopArrival);
  const departure = parseDateOnly(stopDeparture);
  const start = parseDateOnly(toDateOnlyString(tripStart));
  const end = parseDateOnly(toDateOnlyString(tripEnd));

  if (arrival < start || departure > end) {
    throw badRequest('Stop dates must fall within trip dates', 'INVALID_DATES');
  }
}

async function getStopWithRelations(stopId) {
  const stop = await prisma.tripStop.findUnique({
    where: { id: stopId },
    include: {
      city: true,
      trip: true,
      activities: {
        orderBy: { orderIndex: 'asc' },
        include: { activity: true },
      },
    },
  });

  if (!stop) throw notFound('Stop not found');
  return stop;
}

async function createStop(tripId, userId, data) {
  const trip = await assertTripOwner(tripId, userId);
  assertDatesWithinTrip(data.arrivalDate, data.departureDate, trip.startDate, trip.endDate);

  const city = await prisma.city.findUnique({ where: { id: data.cityId } });
  if (!city) throw notFound('City not found');

  const lastStop = await prisma.tripStop.findFirst({
    where: { tripId },
    orderBy: { orderIndex: 'desc' },
  });

  const arrival = parseDateOnly(data.arrivalDate);
  const departure = parseDateOnly(data.departureDate);
  const nights = nightsBetween(arrival, departure);

  const estimatedStayCost = data.estimatedStayCost ?? nights * city.costIndex * STAY_COST_PER_INDEX;
  const estimatedTransportCost = data.estimatedTransportCost ?? 0;
  const estimatedMealCost = data.estimatedMealCost ?? 0;

  const stop = await prisma.tripStop.create({
    data: {
      tripId,
      cityId: data.cityId,
      arrivalDate: arrival,
      departureDate: departure,
      orderIndex: lastStop ? lastStop.orderIndex + 1 : 0,
      estimatedStayCost,
      estimatedTransportCost,
      estimatedMealCost,
    },
    include: {
      city: true,
      activities: { include: { activity: true } },
    },
  });

  return formatStop({ ...stop, activities: [] });
}

async function updateStop(stopId, userId, data) {
  const existing = await getStopWithRelations(stopId);
  if (existing.trip.userId !== userId) throw forbidden();

  const arrivalDate = data.arrivalDate || existing.arrivalDate.toISOString().split('T')[0];
  const departureDate = data.departureDate || existing.departureDate.toISOString().split('T')[0];
  assertDatesWithinTrip(arrivalDate, departureDate, existing.trip.startDate, existing.trip.endDate);

  const stop = await prisma.tripStop.update({
    where: { id: stopId },
    data: {
      ...(data.arrivalDate ? { arrivalDate: parseDateOnly(data.arrivalDate) } : {}),
      ...(data.departureDate ? { departureDate: parseDateOnly(data.departureDate) } : {}),
      ...(data.estimatedTransportCost !== undefined ? { estimatedTransportCost: data.estimatedTransportCost } : {}),
      ...(data.estimatedStayCost !== undefined ? { estimatedStayCost: data.estimatedStayCost } : {}),
      ...(data.estimatedMealCost !== undefined ? { estimatedMealCost: data.estimatedMealCost } : {}),
    },
    include: {
      city: true,
      activities: {
        orderBy: { orderIndex: 'asc' },
        include: { activity: true },
      },
    },
  });

  return formatStop(stop);
}

async function deleteStop(stopId, userId) {
  const stop = await getStopWithRelations(stopId);
  if (stop.trip.userId !== userId) throw forbidden();
  await prisma.tripStop.delete({ where: { id: stopId } });
}

async function reorderStops(tripId, userId, orderedIds) {
  await assertTripOwner(tripId, userId);

  const stops = await prisma.tripStop.findMany({ where: { tripId } });
  const stopIds = stops.map((s) => s.id).sort();
  const requestedIds = [...orderedIds].sort();

  if (stopIds.length !== requestedIds.length || stopIds.some((id, i) => id !== requestedIds[i])) {
    throw badRequest('Ordered IDs must match all stops for this trip');
  }

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.tripStop.update({
        where: { id },
        data: { orderIndex: index },
      })
    )
  );

  return orderedIds.map((id, orderIndex) => ({ id, orderIndex }));
}

module.exports = {
  createStop,
  updateStop,
  deleteStop,
  reorderStops,
};
