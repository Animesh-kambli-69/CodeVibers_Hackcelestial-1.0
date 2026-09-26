/**
 * Date manipulation and formatting utilities for resort operations.
 * Handles dates in RESORT_TIMEZONE (default Asia/Kolkata).
 */
const env = require('../config/env');

function getTodayString(tz = env.RESORT_TIMEZONE) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}

function addDays(dateStr, days) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day));
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
}

function diffDays(startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

function getStayNights(arrivalDateStr, departureDateStr) {
  let weekendNights = 0;
  let weekNights = 0;

  const start = new Date(arrivalDateStr);
  const end = new Date(departureDateStr);

  const cur = new Date(start);
  while (cur < end) {
    const dayOfWeek = cur.getUTCDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // 0 = Sunday, 6 = Saturday (H1 weekend definition)
      weekendNights++;
    } else {
      weekNights++;
    }
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  return {
    totalNights: weekendNights + weekNights,
    weekendNights,
    weekNights,
  };
}

module.exports = {
  getTodayString,
  addDays,
  diffDays,
  getStayNights,
};
