import { describe, it, expect, beforeEach } from 'vitest';
import { RangeState } from '../src/core/RangeState';

function d(y: number, m: number, day: number) {
  return new Date(y, m - 1, day);
}

let rs: RangeState;

beforeEach(() => { rs = new RangeState(); });

// ─── Range mode ───────────────────────────────────────────────────────────────

describe('range mode — clickRange', () => {
  it('first click returns null (start selected)', () => {
    expect(rs.clickRange(d(2026, 7, 1))).toBeNull();
    expect(rs.getPhase()).toBe('selecting');
  });

  it('second click returns range (from < to)', () => {
    rs.clickRange(d(2026, 7, 1));
    const range = rs.clickRange(d(2026, 7, 10));
    expect(range).not.toBeNull();
    expect(range!.from.getDate()).toBe(1);
    expect(range!.to.getDate()).toBe(10);
  });

  it('auto-swaps when second click is before first', () => {
    rs.clickRange(d(2026, 7, 10));
    const range = rs.clickRange(d(2026, 7, 1));
    expect(range!.from.getDate()).toBe(1);
    expect(range!.to.getDate()).toBe(10);
  });

  it('phase is idle after second click', () => {
    rs.clickRange(d(2026, 7, 1));
    rs.clickRange(d(2026, 7, 10));
    expect(rs.getPhase()).toBe('idle');
  });

  it('same day twice = range of 1 day', () => {
    rs.clickRange(d(2026, 7, 5));
    const range = rs.clickRange(d(2026, 7, 5));
    expect(range!.from.getDate()).toBe(5);
    expect(range!.to.getDate()).toBe(5);
  });
});

describe('range mode — hover preview', () => {
  it('getPreviewRange returns null when not selecting', () => {
    expect(rs.getPreviewRange()).toBeNull();
  });

  it('getPreviewRange returns preview while selecting', () => {
    rs.clickRange(d(2026, 7, 1));
    rs.hoverRange(d(2026, 7, 15));
    const preview = rs.getPreviewRange();
    expect(preview).not.toBeNull();
    expect(preview!.from.getDate()).toBe(1);
    expect(preview!.to.getDate()).toBe(15);
  });

  it('preview swaps direction when hovering before start', () => {
    rs.clickRange(d(2026, 7, 15));
    rs.hoverRange(d(2026, 7, 1));
    const preview = rs.getPreviewRange();
    expect(preview!.from.getDate()).toBe(1);
    expect(preview!.to.getDate()).toBe(15);
  });

  it('hoverRange is no-op when not selecting', () => {
    rs.hoverRange(d(2026, 7, 10));
    expect(rs.getPreviewRange()).toBeNull();
  });
});

describe('range mode — isRangeStart / isRangeEnd / isInRange', () => {
  it('isRangeStart returns true for start date', () => {
    rs.setRange(d(2026, 7, 1), d(2026, 7, 10));
    expect(rs.isRangeStart(d(2026, 7, 1))).toBe(true);
    expect(rs.isRangeStart(d(2026, 7, 5))).toBe(false);
  });

  it('isRangeEnd returns true for end date', () => {
    rs.setRange(d(2026, 7, 1), d(2026, 7, 10));
    expect(rs.isRangeEnd(d(2026, 7, 10))).toBe(true);
    expect(rs.isRangeEnd(d(2026, 7, 5))).toBe(false);
  });

  it('isInRange returns true for middle dates', () => {
    rs.setRange(d(2026, 7, 1), d(2026, 7, 10));
    expect(rs.isInRange(d(2026, 7, 5))).toBe(true);
    expect(rs.isInRange(d(2026, 7, 1))).toBe(false); // start is not "in range"
    expect(rs.isInRange(d(2026, 7, 10))).toBe(false); // end is not "in range"
    expect(rs.isInRange(d(2026, 7, 11))).toBe(false);
  });
});

describe('range mode — setRange / clearRange / getRange', () => {
  it('setRange sets both endpoints', () => {
    rs.setRange(d(2026, 7, 1), d(2026, 7, 31));
    const r = rs.getRange();
    expect(r!.from.getDate()).toBe(1);
    expect(r!.to.getDate()).toBe(31);
  });

  it('clearRange empties everything', () => {
    rs.setRange(d(2026, 7, 1), d(2026, 7, 31));
    rs.clearRange();
    expect(rs.getRange()).toBeNull();
    expect(rs.isInRange(d(2026, 7, 15))).toBe(false);
  });

  it('getRange returns null when not set', () => {
    expect(rs.getRange()).toBeNull();
  });
});

// ─── Multiple mode ────────────────────────────────────────────────────────────

describe('multiple mode — toggleDate / isSelected / getSelected', () => {
  it('toggleDate adds date', () => {
    rs.toggleDate(d(2026, 7, 5));
    expect(rs.isSelected(d(2026, 7, 5))).toBe(true);
  });

  it('toggleDate removes already-selected date', () => {
    rs.toggleDate(d(2026, 7, 5));
    rs.toggleDate(d(2026, 7, 5));
    expect(rs.isSelected(d(2026, 7, 5))).toBe(false);
  });

  it('getSelected returns all selected dates', () => {
    rs.toggleDate(d(2026, 7, 1));
    rs.toggleDate(d(2026, 7, 15));
    rs.toggleDate(d(2026, 7, 31));
    expect(rs.getSelected().length).toBe(3);
  });

  it('respects maxSelections cap', () => {
    rs.toggleDate(d(2026, 7, 1), 2);
    rs.toggleDate(d(2026, 7, 2), 2);
    rs.toggleDate(d(2026, 7, 3), 2); // should be ignored
    expect(rs.getSelected().length).toBe(2);
  });

  it('clearSelected empties selection', () => {
    rs.toggleDate(d(2026, 7, 1));
    rs.toggleDate(d(2026, 7, 2));
    rs.clearSelected();
    expect(rs.getSelected().length).toBe(0);
  });

  it('setSelected replaces selection', () => {
    rs.toggleDate(d(2026, 7, 1));
    rs.setSelected([d(2026, 8, 1), d(2026, 8, 15)]);
    expect(rs.getSelected().length).toBe(2);
    expect(rs.isSelected(d(2026, 7, 1))).toBe(false);
    expect(rs.isSelected(d(2026, 8, 1))).toBe(true);
  });

  it('isSelected uses day-only comparison (ignores time)', () => {
    rs.toggleDate(new Date(2026, 6, 5, 14, 30, 0));
    expect(rs.isSelected(new Date(2026, 6, 5, 0, 0, 0))).toBe(true);
  });
});
