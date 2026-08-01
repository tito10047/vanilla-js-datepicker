import { describe, it, expect } from 'vitest';
import { buildGrid } from '../src/utils/calendarGrid';

describe('buildGrid', () => {
  it('always returns exactly 42 cells', () => {
    const grid = buildGrid(2026, 6, 1); // July 2026
    expect(grid.cells.length).toBe(42);
  });

  it('returns 6 rows of 7', () => {
    const grid = buildGrid(2026, 6, 1);
    expect(grid.rows.length).toBe(6);
    grid.rows.forEach((row) => expect(row.cells.length).toBe(7));
  });

  it('inMonth cells for July 2026 are 1–31', () => {
    const grid = buildGrid(2026, 6, 1);
    const inMonth = grid.cells.filter((c) => c.inMonth);
    expect(inMonth.length).toBe(31);
    expect(inMonth[0]!.dayOfMonth).toBe(1);
    expect(inMonth[30]!.dayOfMonth).toBe(31);
  });

  it('first cell with weekStart=1 (Mon): July 2026 starts on Wed → prev month cells', () => {
    // July 1 2026 is Wednesday (weekday 3). With Mon=first, there are 2 leading days (Mon, Tue from Jun).
    const grid = buildGrid(2026, 6, 1);
    expect(grid.cells[0]!.inMonth).toBe(false);
    expect(grid.cells[0]!.date.getMonth()).toBe(5); // June
    expect(grid.cells[0]!.date.getDate()).toBe(29); // Jun 29
    expect(grid.cells[2]!.inMonth).toBe(true); // Jul 1
    expect(grid.cells[2]!.dayOfMonth).toBe(1);
  });

  it('first cell with weekStart=0 (Sun): July 2026 starts on Wed → 3 leading days', () => {
    const grid = buildGrid(2026, 6, 0);
    expect(grid.cells[0]!.inMonth).toBe(false);
    expect(grid.cells[3]!.inMonth).toBe(true);
    expect(grid.cells[3]!.dayOfMonth).toBe(1);
  });

  it('trailing out-of-month cells are from next month', () => {
    const grid = buildGrid(2026, 6, 1);
    const outMonth = grid.cells.filter((c) => !c.inMonth);
    const trailing = outMonth.filter((c) => c.date.getMonth() === 7); // August
    expect(trailing.length).toBeGreaterThan(0);
  });

  it('February non-leap 2026 has 28 inMonth cells', () => {
    const grid = buildGrid(2026, 1, 1);
    expect(grid.cells.filter((c) => c.inMonth).length).toBe(28);
  });

  it('February leap 2024 has 29 inMonth cells', () => {
    const grid = buildGrid(2024, 1, 1);
    expect(grid.cells.filter((c) => c.inMonth).length).toBe(29);
  });

  it('firstDate and lastDate span all 42 cells', () => {
    const grid = buildGrid(2026, 6, 1);
    expect(grid.firstDate).toEqual(grid.cells[0]!.date);
    expect(grid.lastDate.getTime()).toBeLessThanOrEqual(grid.cells[41]!.date.getTime() + 1000);
  });

  it('year and month properties are set correctly', () => {
    const grid = buildGrid(2026, 6, 1);
    expect(grid.year).toBe(2026);
    expect(grid.month).toBe(6);
  });

  it('each row has correct weekNum assigned', () => {
    const grid = buildGrid(2026, 6, 1);
    grid.rows.forEach((row) => {
      expect(typeof row.weekNum).toBe('number');
      expect(row.weekNum).toBeGreaterThan(0);
    });
  });

  it('isToday flag is set for today', () => {
    const today = new Date();
    const grid = buildGrid(today.getFullYear(), today.getMonth(), 1);
    const todayCell = grid.cells.find(
      (c) => c.inMonth && c.dayOfMonth === today.getDate(),
    );
    expect(todayCell?.isToday).toBe(true);
  });

  it('December 2025: trailing cells go into Jan 2026', () => {
    const grid = buildGrid(2025, 11, 1); // December 2025
    const trailing = grid.cells.filter((c) => !c.inMonth && c.date.getMonth() === 0);
    expect(trailing.length).toBeGreaterThan(0);
    trailing.forEach((c) => expect(c.date.getFullYear()).toBe(2026));
  });
});
