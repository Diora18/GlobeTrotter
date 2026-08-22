const MEALS_PER_DAY = 50;
const DAILY_BUDGET_ALERT = 200;

function parseDateOnly(date) {
  if (!date) return null;
  if (date instanceof Date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (typeof date === 'string') {
    return date.split('T')[0];
  }
  return date;
}

function daysBetweenInclusive(start, end) {
  const startStr = parseDateOnly(start);
  const endStr = parseDateOnly(end);
  const startDate = new Date(`${startStr}T00:00:00Z`);
  const endDate = new Date(`${endStr}T00:00:00Z`);
  const diff = endDate.getTime() - startDate.getTime();
  return Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)) + 1);
}

function eachDayInclusive(start, end) {
  const days = [];
  const startStr = parseDateOnly(start);
  const endStr = parseDateOnly(end);
  const current = new Date(`${startStr}T00:00:00Z`);
  const last = new Date(`${endStr}T00:00:00Z`);

  while (current <= last) {
    const year = current.getUTCFullYear();
    const month = String(current.getUTCMonth() + 1).padStart(2, '0');
    const day = String(current.getUTCDate()).padStart(2, '0');
    days.push(`${year}-${month}-${day}`);
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
