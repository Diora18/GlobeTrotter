const prisma = require('../lib/prisma');
const { notFound } = require('../utils/errors');
const { formatUser } = require('../utils/format');

async function getStats() {
  const [totalUsers, totalTrips, totalStops, totalActivities, publicTripsCount] = await Promise.all([
    prisma.user.count(),
    prisma.trip.count(),
    prisma.tripStop.count(),
    prisma.stopActivity.count(),
    prisma.trip.count({ where: { isPublic: true } }),
  ]);

  return {
    totalUsers,
    totalTrips,
    totalStops,
    totalActivities,
    publicTripsCount,
  };
}

async function getAnalytics() {
  // Top cities by stop count
  const cityStops = await prisma.tripStop.groupBy({
    by: ['cityId'],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 10,
  });

  const cityIds = cityStops.map((cs) => cs.cityId);
  const cities = await prisma.city.findMany({
    where: { id: { in: cityIds } },
    select: { id: true, name: true, country: true, imageUrl: true },
  });

  const topCities = cityStops.map((cs) => {
    const city = cities.find((c) => c.id === cs.cityId);
    return {
      cityId: cs.cityId,
      name: city ? `${city.name}, ${city.country}` : 'Unknown',
      imageUrl: city?.imageUrl || null,
      stopCount: cs._count.id,
    };
  });

  // Top activities scheduled
  const topActivitiesGroup = await prisma.stopActivity.groupBy({
    by: ['activityId'],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 10,
  });

  const activityIds = topActivitiesGroup.map((ta) => ta.activityId);
  const activities = await prisma.activity.findMany({
    where: { id: { in: activityIds } },
    include: { city: { select: { name: true } } },
  });

  const topActivities = topActivitiesGroup.map((ta) => {
    const act = activities.find((a) => a.id === ta.activityId);
    return {
      activityId: ta.activityId,
      name: act?.name || 'Unknown Activity',
      cityName: act?.city?.name || '',
      type: act?.type || 'sightseeing',
      scheduleCount: ta._count.id,
    };
  });

  // Recent trips overview
  const recentTrips = await prisma.trip.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      _count: { select: { stops: true } },
    },
  });

  return {
    topCities,
    topActivities,
    recentTrips: recentTrips.map((t) => ({
      id: t.id,
      name: t.name,
      userName: t.user.name,
      userEmail: t.user.email,
      stopCount: t._count.stops,
      createdAt: t.createdAt,
    })),
  };
}

async function listUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { trips: true } },
    },
  });

  return users.map((u) => ({
    ...formatUser(u),
    isAdmin: u.isAdmin,
    tripCount: u._count.trips,
  }));
}

async function toggleUserAdmin(userId, isAdmin) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw notFound('User not found');

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isAdmin },
  });

  return {
    ...formatUser(updated),
    isAdmin: updated.isAdmin,
  };
}

module.exports = {
  getStats,
  getAnalytics,
  listUsers,
  toggleUserAdmin,
};
