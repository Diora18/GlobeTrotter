const MEALS_PER_DAY = 50;
const DAILY_BUDGET_ALERT = 200;

function parseDateOnly(date) {
  if (date instanceof Date) return date.toISOString().split('T')[0];
  return date;
}

function daysBetweenInclusive(start, end) {
  const startDate = new Date(parseDateOnly(start));
  const endDate = new Date(parseDateOnly(end));
  const diff = endDate.getTime() - startDate.getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)) + 1);
}

function eachDayInclusive(start, end) {
  const days = [];
  const current = new Date(parseDateOnly(start));
  const last = new Date(parseDateOnly(end));

  while (current <= last) {
    days.push(current.toISOString().split('T')[0]);
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return days;
}

function nightsBetween(arrival, departure) {
  const ms = new Date(parseDateOnly(departure)) - new Date(parseDateOnly(arrival));
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function effectiveCost(stopActivity) {
  return stopActivity.costOverride ?? stopActivity.activity.estimatedCost;
}

module.exports = {
  MEALS_PER_DAY,
  DAILY_BUDGET_ALERT,
  parseDateOnly,
  daysBetweenInclusive,
  eachDayInclusive,
  nightsBetween,
  effectiveCost,
};
