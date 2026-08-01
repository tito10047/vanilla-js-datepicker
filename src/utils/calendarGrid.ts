import { addDays, weekdayOffset, weekNumber, isToday, isSameDay, startOfDay } from './dateMath';
import type { WeekNumberSystem } from '../core/types';

export interface GridCell {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  dayOfMonth: number;
  weekNum?: number;
  /** 0=Sun...6=Sat (native JS) */
  weekday: number;
}

export interface GridRow {
  cells: GridCell[];
  weekNum?: number;
}

export interface CalendarGrid {
  rows: GridRow[];
  /** Flat list of all 42 cells */
  cells: GridCell[];
  /** First and last visible date (for onOpen range) */
  firstDate: Date;
  lastDate: Date;
  year: number;
  month: number;
}

/**
 * Build a 6-row × 7-col calendar grid for the given year+month.
 * Always 42 cells; cells outside the month have inMonth=false.
 *
 * @param year    full year (e.g. 2026)
 * @param month   0-based month index
 * @param firstDay  first day of week: 0=Sun, 1=Mon, …, 6=Sat
 * @param weekNumSystem  'iso' | 'us' (only relevant when caller requests weekNums)
 */
export function buildGrid(
  year: number,
  month: number,
  firstDay: 0 | 1 | 2 | 3 | 4 | 5 | 6 = 1,
  weekNumSystem: WeekNumberSystem = 'iso',
): CalendarGrid {
  const firstOfMonth = new Date(year, month, 1);
  const firstDayOfMonth = firstOfMonth.getDay();

  // How many cells from the previous month we need to show
  const leadingDays = weekdayOffset(firstDayOfMonth, firstDay);

  // Start date: could be in the previous month
  const gridStart = addDays(firstOfMonth, -leadingDays);

  const cells: GridCell[] = [];
  const rows: GridRow[] = [];

  for (let i = 0; i < 42; i++) {
    const date = addDays(gridStart, i);
    const inMonth = date.getMonth() === month && date.getFullYear() === year;
    cells.push({
      date,
      inMonth,
      isToday: isToday(date),
      dayOfMonth: date.getDate(),
      weekday: date.getDay(),
    });
  }

  // Group into rows of 7
  for (let r = 0; r < 6; r++) {
    const rowCells = cells.slice(r * 7, r * 7 + 7);
    const wn = weekNumber(rowCells[0]!.date, weekNumSystem);
    rowCells.forEach((c) => { c.weekNum = wn; });
    rows.push({ cells: rowCells, weekNum: wn });
  }

  return {
    rows,
    cells,
    firstDate: startOfDay(cells[0]!.date),
    lastDate: startOfDay(cells[41]!.date),
    year,
    month,
  };
}
