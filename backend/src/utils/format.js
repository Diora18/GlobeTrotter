function formatDate(date) {
  if (!date) return null;
  return date.toISOString().split('T')[0];
}

function formatDateTime(date) {
  if (!date) return null;
  return date.toISOString();
}

function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    phoneNumber: user.phoneNumber || null,
    city: user.city || null,
    country: user.country || null,
    avatarUrl: user.avatarUrl || null,
    language: user.language || 'en',
    isAdmin: Boolean(user.isAdmin),
    ...(user.createdAt ? { createdAt: formatDateTime(user.createdAt) } : {}),
  };
}

function formatCity(city) {
  return {
    id: city.id,
    name: city.name,
    country: city.country,
    region: city.region,
    costIndex: city.costIndex,
    popularity: city.popularity,
    imageUrl: city.imageUrl,
  };
}

function formatActivity(activity) {
  return {
    id: activity.id,
    cityId: activity.cityId,
    name: activity.name,
    description: activity.description,
    type: activity.type,
    estimatedCost: activity.estimatedCost,
    durationMinutes: activity.durationMinutes,
    imageUrl: activity.imageUrl,
  };
}

function formatStopActivity(stopActivity) {
  const effectiveCost = stopActivity.costOverride ?? stopActivity.activity.estimatedCost;

  return {
    id: stopActivity.id,
    activityId: stopActivity.activityId,
    activity: {
      id: stopActivity.activity.id,
      name: stopActivity.activity.name,
      description: stopActivity.activity.description,
      type: stopActivity.activity.type,
      estimatedCost: stopActivity.activity.estimatedCost,
      durationMinutes: stopActivity.activity.durationMinutes,
      imageUrl: stopActivity.activity.imageUrl,
    },
    scheduledAt: formatDateTime(stopActivity.scheduledAt),
    costOverride: stopActivity.costOverride,
    effectiveCost,
    orderIndex: stopActivity.orderIndex,
  };
}

function formatStop(stop) {
  return {
    id: stop.id,
    tripId: stop.tripId,
    cityId: stop.cityId,
    city: formatCity(stop.city),
    arrivalDate: formatDate(stop.arrivalDate),
    departureDate: formatDate(stop.departureDate),
    orderIndex: stop.orderIndex,
    estimatedStayCost: stop.estimatedStayCost,
    estimatedTransportCost: stop.estimatedTransportCost,
    activities: (stop.activities || []).map(formatStopActivity),
  };
}

function formatTripSummary(trip) {
  let totalEstimatedCost = 0;
  if (trip.stops && Array.isArray(trip.stops)) {
    for (const stop of trip.stops) {
      totalEstimatedCost += (stop.estimatedStayCost || 0) + (stop.estimatedTransportCost || 0) + (stop.estimatedMealCost || 0);
      if (stop.activities && Array.isArray(stop.activities)) {
        for (const sa of stop.activities) {
          totalEstimatedCost += sa.costOverride ?? (sa.activity?.estimatedCost || 0);
        }
      }
    }
  }

  return {
    id: trip.id,
    name: trip.name,
    startDate: formatDate(trip.startDate),
    endDate: formatDate(trip.endDate),
    travelerCount: trip.travelerCount || 1,
    description: trip.description,
    coverPhotoUrl: trip.coverPhotoUrl,
    isPublic: trip.isPublic,
    shareSlug: trip.shareSlug,
    stopCount: trip._count?.stops ?? trip.stops?.length ?? trip.stopCount ?? 0,
    totalEstimatedCost,
    createdAt: formatDateTime(trip.createdAt),
    updatedAt: formatDateTime(trip.updatedAt),
  };
}

function formatTripDetail(trip) {
  return {
    ...formatTripSummary(trip),
    stops: (trip.stops || []).map(formatStop),
  };
}

module.exports = {
  formatUser,
  formatCity,
  formatActivity,
  formatStop,
  formatStopActivity,
  formatTripSummary,
  formatTripDetail,
  formatDate,
  formatDateTime,
};
