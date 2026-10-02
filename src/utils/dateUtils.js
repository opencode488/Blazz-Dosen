/**
 * Indonesian date utilities for Dosen Chat Bot
 */

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Format date string (YYYY-MM-DD) into Indonesian readable format:
 * "Senin, 5 Oktober 2026"
 */
export function formatIndonesianDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const dayName = DAYS[date.getDay()];
  const day = date.getDate();
  const monthName = MONTHS[date.getMonth()];
  const year = date.getFullYear();

  return `${dayName}, ${day} ${monthName} ${year}`;
}

/**
 * Short date format: "5 Okt 2026"
 */
export function formatShortDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = date.getDate();
  const monthShort = MONTHS[date.getMonth()].slice(0, 3);
  const year = date.getFullYear();
  return `${day} ${monthShort} ${year}`;
}

/**
 * Calculate H-1 Auto Chat scheduled time.
 * If date is "2026-10-05", returns "2026-10-04T08:00:00"
 */
export function calculateHMinusOne(dateString, time = '08:00') {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  // subtract 1 day
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${time}:00`;
}

/**
 * Format scheduled timestamp to Indonesian format:
 * "4 Oktober 2026, 08.00 WIB"
 */
export function formatScheduledTimestamp(isoString) {
  if (!isoString) return '-';
  const [datePart, timePart] = isoString.split('T');
  if (!datePart) return isoString;

  const date = new Date(datePart);
  if (isNaN(date.getTime())) return isoString;

  const day = date.getDate();
  const month = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const time = timePart ? timePart.slice(0, 5).replace(':', '.') : '08.00';

  return `${day} ${month} ${year}, ${time} WIB`;
}

/**
 * Check if a date string is today
 */
export function isToday(dateString) {
  if (!dateString) return false;
  const today = new Date();
  const target = new Date(dateString);
  return (
    today.getFullYear() === target.getFullYear() &&
    today.getMonth() === target.getMonth() &&
    today.getDate() === target.getDate()
  );
}

export const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export function getDayNameFromDate(dateString) {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return '';
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return '';
  return DAYS_ID[date.getDay()];
}

export function getNextDateForDay(dayName, fromDateString = null) {
  const targetDayIdx = DAYS_ID.indexOf(dayName);
  if (targetDayIdx === -1) return new Date().toISOString().split('T')[0];

  let baseDate;
  if (fromDateString) {
    const [y, m, d] = fromDateString.split('-').map(Number);
    baseDate = new Date(y, m - 1, d);
  } else {
    baseDate = new Date();
  }

  const currentDayIdx = baseDate.getDay();
  let diff = targetDayIdx - currentDayIdx;
  if (diff < 0) {
    diff += 7;
  }

  const targetDate = new Date(baseDate);
  targetDate.setDate(targetDate.getDate() + diff);

  const y = targetDate.getFullYear();
  const m = String(targetDate.getMonth() + 1).padStart(2, '0');
  const d = String(targetDate.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function generateWeeklyDates(startDateString, count = 14) {
  const dates = [];
  const [y, m, d] = startDateString.split('-').map(Number);
  const base = new Date(y, m - 1, d);

  for (let i = 0; i < count; i++) {
    const nextDate = new Date(base);
    nextDate.setDate(base.getDate() + (i * 7));
    const year = nextDate.getFullYear();
    const month = String(nextDate.getMonth() + 1).padStart(2, '0');
    const day = String(nextDate.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
}
