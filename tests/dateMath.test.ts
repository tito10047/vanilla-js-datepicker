import { describe, it, expect } from 'vitest';
import {
  startOfDay,
  isSameDay,
  isSameMonth,
  isToday,
  addDays,
  addMonths,
  addYears,
  startOfMonth,
  endOfMonth,
  daysInMonth,
  isLeapYear,
  isoWeekNumber,
  usWeekNumber,
  weekNumber,
  isWeekend,
  weekdayOffset,
} from '../src/utils/dateMath';

describe('startOfDay', () => {
  it('sets hours/minutes/seconds/ms to 0', () => {
    const d = new Date(2026, 6, 4, 13, 45, 30, 500);
    const r = startOfDay(d);
    expect(r.getHours()).toBe(0);
    expect(r.getMinutes()).toBe(0);
    expect(r.getSeconds()).toBe(0);
    expect(r.getMilliseconds()).toBe(0);
  });

  it('does not mutate original', () => {
    const d = new Date(2026, 6, 4, 12, 0, 0);
    startOfDay(d);
    expect(d.getHours()).toBe(12);
  });
});

describe('isSameDay', () => {
  it('returns true for same date', () => {
    expect(isSameDay(new Date(2026, 6, 4), new Date(2026, 6, 4, 23, 59))).toBe(true);
  });
  it('returns false for different day', () => {
    expect(isSameDay(new Date(2026, 6, 4), new Date(2026, 6, 5))).toBe(false);
  });
  it('returns false for different month', () => {
    expect(isSameDay(new Date(2026, 5, 4), new Date(2026, 6, 4))).toBe(false);
  });
});

describe('isSameMonth', () => {
  it('true for same month', () => {
    expect(isSameMonth(new Date(2026, 6, 1), new Date(2026, 6, 31))).toBe(true);
  });
  it('false for different month', () => {
    expect(isSameMonth(new Date(2026, 6, 1), new Date(2026, 7, 1))).toBe(false);
  });
});

describe('addDays', () => {
  it('adds positive days', () => {
    const r = addDays(new Date(2026, 0, 28), 5);
    expect(r.getFullYear()).toBe(2026);
    expect(r.getMonth()).toBe(1);
    expect(r.getDate()).toBe(2);
  });
  it('adds negative days', () => {
    const r = addDays(new Date(2026, 1, 1), -1);
    expect(r.getMonth()).toBe(0);
    expect(r.getDate()).toBe(31);
  });
  it('does not mutate original', () => {
    const d = new Date(2026, 0, 1);
    addDays(d, 1);
    expect(d.getDate()).toBe(1);
  });
});

describe('addMonths', () => {
  it('adds months normally', () => {
    const r = addMonths(new Date(2026, 0, 15), 1);
    expect(r.getMonth()).toBe(1);
    expect(r.getDate()).toBe(15);
  });
  it('wraps year', () => {
    const r = addMonths(new Date(2025, 11, 15), 1);
    expect(r.getFullYear()).toBe(2026);
    expect(r.getMonth()).toBe(0);
  });
  it('clamps Jan 31 + 1 month to Feb 28 (non-leap)', () => {
    const r = addMonths(new Date(2026, 0, 31), 1);
    expect(r.getMonth()).toBe(1);
    expect(r.getDate()).toBe(28);
  });
  it('clamps Jan 31 + 1 month to Feb 29 (leap)', () => {
    const r = addMonths(new Date(2024, 0, 31), 1);
    expect(r.getMonth()).toBe(1);
    expect(r.getDate()).toBe(29);
  });
  it('negative months', () => {
    const r = addMonths(new Date(2026, 2, 15), -2);
    expect(r.getMonth()).toBe(0);
    expect(r.getDate()).toBe(15);
  });
});

describe('addYears', () => {
  it('adds years', () => {
    const r = addYears(new Date(2024, 1, 29), 1);
    // 2025 is non-leap, Feb 29 → Feb 28
    expect(r.getFullYear()).toBe(2025);
    expect(r.getMonth()).toBe(1);
    expect(r.getDate()).toBe(28);
  });
});

describe('startOfMonth', () => {
  it('returns day 1', () => {
    const r = startOfMonth(new Date(2026, 6, 15));
    expect(r.getDate()).toBe(1);
    expect(r.getMonth()).toBe(6);
  });
});

describe('endOfMonth', () => {
  it('returns last day of month', () => {
    expect(endOfMonth(new Date(2026, 0, 1)).getDate()).toBe(31); // Jan
    expect(endOfMonth(new Date(2026, 1, 1)).getDate()).toBe(28); // Feb non-leap
    expect(endOfMonth(new Date(2024, 1, 1)).getDate()).toBe(29); // Feb leap
    expect(endOfMonth(new Date(2026, 3, 1)).getDate()).toBe(30); // Apr
  });
});

describe('daysInMonth', () => {
  it('returns 31 for January', () => { expect(daysInMonth(2026, 0)).toBe(31); });
  it('returns 28 for Feb non-leap', () => { expect(daysInMonth(2026, 1)).toBe(28); });
  it('returns 29 for Feb leap', () => { expect(daysInMonth(2024, 1)).toBe(29); });
  it('returns 30 for April', () => { expect(daysInMonth(2026, 3)).toBe(30); });
  it('returns 31 for December', () => { expect(daysInMonth(2026, 11)).toBe(31); });
});

describe('isLeapYear', () => {
  it('2024 is leap', () => { expect(isLeapYear(2024)).toBe(true); });
  it('2026 is not leap', () => { expect(isLeapYear(2026)).toBe(false); });
  it('2000 is leap (div 400)', () => { expect(isLeapYear(2000)).toBe(true); });
  it('1900 is not leap (div 100 but not 400)', () => { expect(isLeapYear(1900)).toBe(false); });
  it('1904 is leap', () => { expect(isLeapYear(1904)).toBe(true); });
});

describe('isoWeekNumber', () => {
  // ISO critical cases
  it('2026-01-01 = W1', () => { expect(isoWeekNumber(new Date(2026, 0, 1))).toBe(1); });
  it('2026-07-04 = W27', () => { expect(isoWeekNumber(new Date(2026, 6, 4))).toBe(27); });
  // 2025-12-29 is in W1 of 2026 (ISO — first Thursday of 2026 is Jan 1)
  it('2025-12-29 = W1 (of 2026)', () => { expect(isoWeekNumber(new Date(2025, 11, 29))).toBe(1); });
  it('2025-12-28 = W52', () => { expect(isoWeekNumber(new Date(2025, 11, 28))).toBe(52); });
});

describe('usWeekNumber', () => {
  it('2026-01-01 = W1', () => { expect(usWeekNumber(new Date(2026, 0, 1))).toBe(1); });
  it('2026-01-04 = W2', () => { expect(usWeekNumber(new Date(2026, 0, 4))).toBe(2); });
});

describe('weekNumber dispatch', () => {
  it('iso system calls isoWeekNumber', () => {
    expect(weekNumber(new Date(2025, 11, 29), 'iso')).toBe(1);
  });
  it('us system calls usWeekNumber', () => {
    expect(weekNumber(new Date(2026, 0, 1), 'us')).toBe(1);
  });
});

describe('isWeekend', () => {
  it('Sunday = weekend', () => { expect(isWeekend(new Date(2026, 6, 5))).toBe(true); }); // Jul 5 2026 = Sun
  it('Saturday = weekend', () => { expect(isWeekend(new Date(2026, 6, 4))).toBe(true); }); // Jul 4 2026 = Sat
  it('Monday = not weekend', () => { expect(isWeekend(new Date(2026, 6, 6))).toBe(false); }); // Jul 6 2026 = Mon
});

describe('weekdayOffset', () => {
  it('Mon first day: Sun (0) = position 6', () => {
    expect(weekdayOffset(0, 1)).toBe(6);
  });
  it('Mon first day: Mon (1) = position 0', () => {
    expect(weekdayOffset(1, 1)).toBe(0);
  });
  it('Sun first day: Sun (0) = position 0', () => {
    expect(weekdayOffset(0, 0)).toBe(0);
  });
  it('Sun first day: Sat (6) = position 6', () => {
    expect(weekdayOffset(6, 0)).toBe(6);
  });
});
