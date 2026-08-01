import type { DateRange } from './types';
import { isSameDay, startOfDay } from '../utils/dateMath';

export type RangePhase = 'idle' | 'selecting';

export class RangeState {
  private start: Date | null = null;
  private end: Date | null = null;
  private phase: RangePhase = 'idle';
  private hoverDate: Date | null = null;

  // Single-date selections for multiple mode
  private selected: Date[] = [];

  // ─── Range mode ───────────────────────────────────────────────────────────

  clickRange(date: Date): DateRange | null {
    if (this.phase === 'idle') {
      this.start = startOfDay(date);
      this.end = null;
      this.phase = 'selecting';
      return null;
    }
    // second click
    const end = startOfDay(date);
    const start = this.start!;
    this.phase = 'idle';
    this.hoverDate = null;

    if (end < start) {
      this.start = end;
      this.end = start;
    } else {
      this.end = end;
    }
    return { from: this.start!, to: this.end };
  }

  hoverRange(date: Date): void {
    if (this.phase === 'selecting') {
      this.hoverDate = startOfDay(date);
    }
  }

  getPreviewRange(): DateRange | null {
    if (this.phase !== 'selecting' || !this.start || !this.hoverDate) return null;
    const a = this.start;
    const b = this.hoverDate;
    return a <= b ? { from: a, to: b } : { from: b, to: a };
  }

  getRange(): DateRange | null {
    if (!this.start || !this.end) return null;
    return { from: this.start, to: this.end };
  }

  getPhase(): RangePhase {
    return this.phase;
  }

  isRangeStart(date: Date): boolean {
    return !!this.start && isSameDay(date, this.start);
  }

  isRangeEnd(date: Date): boolean {
    return !!this.end && isSameDay(date, this.end);
  }

  isInRange(date: Date): boolean {
    const range = this.getPreviewRange() ?? this.getRange();
    if (!range) return false;
    const d = startOfDay(date);
    return d > range.from && d < range.to;
  }

  setRange(from: Date, to: Date): void {
    this.start = startOfDay(from);
    this.end = startOfDay(to);
    this.phase = 'idle';
    this.hoverDate = null;
  }

  clearRange(): void {
    this.start = null;
    this.end = null;
    this.phase = 'idle';
    this.hoverDate = null;
  }

  // ─── Multiple mode ────────────────────────────────────────────────────────

  toggleDate(date: Date, maxSelections?: number): void {
    const d = startOfDay(date);
    const idx = this.selected.findIndex((s) => isSameDay(s, d));
    if (idx >= 0) {
      this.selected.splice(idx, 1);
    } else if (!maxSelections || this.selected.length < maxSelections) {
      this.selected.push(d);
    }
  }

  isSelected(date: Date): boolean {
    return this.selected.some((s) => isSameDay(s, date));
  }

  getSelected(): Date[] {
    return [...this.selected];
  }

  setSelected(dates: Date[]): void {
    this.selected = dates.map(startOfDay);
  }

  clearSelected(): void {
    this.selected = [];
  }
}
