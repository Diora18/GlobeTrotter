const DISPLAY = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});

export function parseDate(dateStr) {
  if (!dateStr) return new Date();
  const cleanStr = String(dateStr).split('T')[0];
  const [year, month, day] = cleanStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  return DISPLAY.format(parseDate(dateStr));
}

export function formatDateRange(startDate, endDate) {
  return `${formatDisplayDate(startDate)} – ${formatDisplayDate(endDate)}`;
}

export function tripDayCount(startDate, endDate) {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

export function eachDayInRange(startDate, endDate) {
  if (!startDate || !endDate) return [];
  const days = [];
  const start = parseDate(startDate);
  const end = parseDate(endDate);

  const current = new Date(start.getTime());

  while (current <= end) {
    const y = current.getUTCFullYear();
    const m = String(current.getUTCMonth() + 1).padStart(2, '0');
    const d = String(current.getUTCDate()).padStart(2, '0');
    days.push(`${y}-${m}-${d}`);
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return days;
}

export function isDateInRange(dateStr, startDate, endDate) {
  const date = parseDate(dateStr);
  return date >= parseDate(startDate) && date <= parseDate(endDate);
}

export function toDateInputValue(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
