const prisma = require('../lib/prisma');
const { forbidden, notFound } = require('../utils/errors');
const {
  DAILY_BUDGET_ALERT,
  daysBetweenInclusive,
  eachDayInclusive,
  nightsBetween,
  effectiveCost,
  parseDateOnly,
} = require('../utils/budget');

function emptyDayBreakdown() {
  return { transport: 0, stay: 0, activities: 0, meals: 0 };
}

function addToBreakdown(target, source) {
  target.transport += source.transport;
  target.stay += source.stay;
  target.activities += source.activities;
  target.meals += source.meals;
  return target;
}

function sumBreakdown(breakdown) {
  return breakdown.transport + breakdown.stay + breakdown.activities + breakdown.meals;
}

async function calculateBudget(tripId, userId) {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      stops: {
        orderBy: { orderIndex: 'asc' },
        include: {
          city: true,
          activities: { include: { activity: true } },
        },
      },
    },
  });

  if (!trip) throw notFound('Trip not found');
  if (trip.userId !== userId) throw forbidden();

  const tripDays = daysBetweenInclusive(trip.startDate, trip.endDate);
  const allDates = eachDayInclusive(trip.startDate, trip.endDate);

  const byDayMap = {};
  for (const date of allDates) {
    byDayMap[date] = { ...emptyDayBreakdown() };
  }

  let transportTotal = 0;
  let stayTotal = 0;
  let activitiesTotal = 0;
  let mealsTotal = 0;

  const byStop = trip.stops.map((stop) => {
    const nights = nightsBetween(stop.arrivalDate, stop.departureDate);
    const transport = stop.estimatedTransportCost || 0;
    const stay = stop.estimatedStayCost || 0;
    const meals = stop.estimatedMealCost || 0;

    transportTotal += transport;
    stayTotal += stay;
    mealsTotal += meals;

    const stopBreakdown = {
      transport,
      stay,
      activities: 0,
      meals: meals,
    };

    const arrivalDate = parseDateOnly(stop.arrivalDate);
    if (byDayMap[arrivalDate]) {
      byDayMap[arrivalDate].transport += transport;
    }

    const stayPerNight = nights > 0 ? Math.round(stay / nights) : stay;
    const mealsPerDay = nights > 0 ? Math.round(meals / nights) : meals;
    const stopDates = eachDayInclusive(stop.arrivalDate, stop.departureDate);
    for (let i = 0; i < stopDates.length - 1; i += 1) {
      const date = stopDates[i];
      if (byDayMap[date]) {
        byDayMap[date].stay += stayPerNight;
        byDayMap[date].meals += mealsPerDay;
      }
    }
    if (stopDates.length === 1 && byDayMap[stopDates[0]]) {
      byDayMap[stopDates[0]].stay += stay;
      byDayMap[stopDates[0]].meals += meals;
    }

    for (const stopActivity of stop.activities) {
      const cost = effectiveCost(stopActivity);
      activitiesTotal += cost;
      stopBreakdown.activities += cost;

      const activityDate = stopActivity.scheduledAt
        ? parseDateOnly(stopActivity.scheduledAt)
        : arrivalDate;

      if (byDayMap[activityDate]) {
        byDayMap[activityDate].activities += cost;
      }
    }

    return {
      stopId: stop.id,
      cityName: stop.city.name,
      total: sumBreakdown(stopBreakdown),
      nights,
      breakdown: stopBreakdown,
    };
  });

  const byCategory = {
    transport: transportTotal,
    stay: stayTotal,
    activities: activitiesTotal,
    meals: mealsTotal,
  };

  const totalEstimated = Object.values(byCategory).reduce((a, b) => a + b, 0);
  const averagePerDay = Math.round(totalEstimated / tripDays);

  const byDay = allDates.map((date) => {
    const breakdown = byDayMap[date];
    return {
      date,
      amount: sumBreakdown(breakdown),
      breakdown,
    };
  });

  const alerts = byDay
    .filter((day) => day.amount > DAILY_BUDGET_ALERT)
    .map((day) => ({
      date: day.date,
      message: `Daily spend exceeds $${DAILY_BUDGET_ALERT}`,
      amount: day.amount,
    }));

  return {
    tripId: trip.id,
    totalEstimated,
    tripDays,
    averagePerDay,
    byCategory,
    byDay,
    byStop,
    alerts,
  };
}

module.exports = { calculateBudget };
