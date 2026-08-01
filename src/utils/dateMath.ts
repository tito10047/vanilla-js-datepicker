export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

/** DST-safe: always adds calendar days, not 86400-second units. */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** DST-safe: changes month on same calendar day, clamping to end of month. */
export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  const targetMonth = d.getMonth() + months;
  d.setMonth(targetMonth);
  // If day overflowed (e.g. Jan 31 + 1 month = Mar 3), go back to last day of target month
  const expected = ((targetMonth % 12) + 12) % 12;
  if (d.getMonth() !== expected) {
    d.setDate(0); // last day of previous month = the overflow target
  }
  return d;
}

export function addYears(date: Date, years: number): Date {
  return addMonths(date, years * 12);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * ISO 8601 week number.
 * Week 1 = the week that contains the first Thursday of the year.
 */
export function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Thursday in current week determines the year
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * US week number: week 1 starts on the first Sunday of the year (or Jan 1).
 */
export function usWeekNumber(date: Date): number {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const jan1 = new Date(date.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((d.getTime() - jan1.getTime()) / 86400000);
  return Math.floor((dayOfYear + jan1.getDay()) / 7) + 1;
}

export function weekNumber(date: Date, system: 'iso' | 'us' = 'iso'): number {
  return system === 'iso' ? isoWeekNumber(date) : usWeekNumber(date);
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/** Normalise a weekday (0=Sun) to an offset from the given firstDay (0=Sun,1=Mon,...). */
export function weekdayOffset(day: number, firstDay: number): number {
  return ((day - firstDay) + 7) % 7;
}
