import { el, cn } from './templates';
import { buildGrid } from '../utils/calendarGrid';
import { isSameDay, isWeekend, startOfDay } from '../utils/dateMath';
import type { DatepickerOptions, LocaleConfig, CellRenderResult, WeekdayFormat } from '../core/types';
import type { RangeState } from '../core/RangeState';

function localISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export interface DayGridCallbacks {
  onDateClick: (date: Date) => void;
  onDateHover: (date: Date) => void;
}

export class DayGridView {
  readonly root: HTMLElement;
  private cellEls: HTMLButtonElement[] = [];
  private focusedDate: Date | null = null;
  private renderSeq = 0;
  private lastRenderedYear = -1;
  private lastRenderedMonth = -1;

  constructor(
    private opts: DatepickerOptions,
    private locale: LocaleConfig,
    private callbacks: DayGridCallbacks,
  ) {
    this.root = document.createElement('div');
    this.root.className = cn(opts, 'body', 'vdp-body');
  }

  /** Render (or re-render) the day grid for a given year/month. */
  render(
    year: number,
    month: number,
    selectedDate: Date | null,
    rangeState: RangeState,
    highlightedDates: Date[] = [],
    disabledDates: Date[] = [],
  ): void {
    this.root.innerHTML = '';
    this.cellEls = [];
    this.lastRenderedYear = year;
    this.lastRenderedMonth = month;

    const weekStart = this.opts.weekStart ?? this.locale.weekStart ?? 1;
    const grid = buildGrid(year, month, weekStart as 0|1|2|3|4|5|6, this.opts.weekNumberSystem ?? 'iso');
    const showWeekNums = this.opts.showWeekNumbers ?? false;
    const wdFormat: WeekdayFormat = this.opts.weekdayFormat ?? 'short';

    // ── Weekday header ─────────────────────────────────────────
    const wdRow = el('div', { class: cn(this.opts, 'weekdayRow', 'vdp-weekday-row'), role: 'row' });
    if (showWeekNums) {
      wdRow.append(el('div', { class: cn(this.opts, 'weekNumberCell', 'vdp-wn-cell'), role: 'columnheader', 'aria-label': this.locale.weekNumberLabel }, '#'));
    }
    const wdNames = wdFormat === 'long' ? this.locale.weekdaysLong
      : wdFormat === 'narrow' ? this.locale.weekdaysNarrow
      : this.locale.weekdaysShort;
    for (let i = 0; i < 7; i++) {
      const dayIdx = (weekStart + i) % 7;
      const cell = el('div', {
        class: cn(this.opts, 'weekdayCell', 'vdp-weekday-cell'),
        role: 'columnheader',
        'aria-label': this.locale.weekdaysLong[dayIdx] ?? '',
      }, wdNames[dayIdx] ?? '');
      wdRow.append(cell);
    }
    this.root.append(wdRow);

    // ── Day grid ──────────────────────────────────────────────
    const gridEl = el('div', {
      class: cn(this.opts, 'dayGrid', 'vdp-day-grid'),
      role: 'grid',
    });

    grid.rows.forEach((row) => {
      const rowEl = el('div', { class: 'vdp-grid-row', role: 'row' });

      if (showWeekNums) {
        rowEl.append(el('div', {
          class: cn(this.opts, 'weekNumberCell', 'vdp-wn-cell'),
          role: 'rowheader',
          'aria-label': `${this.locale.weekNumberLabel} ${row.weekNum}`,
        }, String(row.weekNum)));
      }

      row.cells.forEach((cell) => {
        const isSelected = selectedDate ? isSameDay(cell.date, selectedDate) : false;
        const inRange = rangeState.isInRange(cell.date);
        const rangeStart = rangeState.isRangeStart(cell.date);
        const rangeEnd = rangeState.isRangeEnd(cell.date);
        const isMultiSelected = rangeState.isSelected(cell.date);
        const weekend = isWeekend(cell.date);
        const isDisabled = disabledDates.some((d) => isSameDay(d, cell.date)) ||
          (this.opts.disabledWeekdays ?? []).includes(cell.date.getDay());
        const isHighlighted = highlightedDates.some((d) => isSameDay(d, cell.date));

        const classes = [cn(this.opts, 'cell', 'vdp-cell')];
        if (!cell.inMonth) classes.push(cn(this.opts, 'cellOutOfMonth', 'vdp-cell--out'));
        if (cell.isToday) classes.push(cn(this.opts, 'cellToday', 'vdp-cell--today'));
        if (isSelected || isMultiSelected) classes.push(cn(this.opts, 'cellSelected', 'vdp-cell--selected'));
        if (inRange) classes.push(cn(this.opts, 'cellInRange', 'vdp-cell--in-range'));
        if (rangeStart) classes.push(cn(this.opts, 'cellRangeStart', 'vdp-cell--range-start'));
        if (rangeEnd) classes.push(cn(this.opts, 'cellRangeEnd', 'vdp-cell--range-end'));
        if (weekend) classes.push(cn(this.opts, 'cellWeekend', 'vdp-cell--weekend'));
        if (isHighlighted) classes.push(cn(this.opts, 'cellHighlighted', 'vdp-cell--highlighted'));
        if (isDisabled) classes.push(cn(this.opts, 'cellDisabled', 'vdp-cell--disabled'));

        const btn = el('button', {
          class: classes.join(' '),
          type: 'button',
          role: 'gridcell',
          tabindex: (isSelected || (cell.isToday && !selectedDate)) ? '0' : '-1',
          'aria-selected': String(isSelected || isMultiSelected),
          'aria-disabled': String(isDisabled),
          'aria-current': cell.isToday ? 'date' : '',
          'aria-label': `${cell.dayOfMonth} ${this.locale.monthsLong[cell.date.getMonth()]} ${cell.date.getFullYear()}`,
          'data-date': localISODate(cell.date),
        }, String(cell.dayOfMonth));

        btn.addEventListener('focus', () => { this.focusedDate = startOfDay(cell.date); });
        if (!isDisabled) {
          btn.addEventListener('click', () => this.callbacks.onDateClick(startOfDay(cell.date)));
          btn.addEventListener('mouseenter', () => this.callbacks.onDateHover(startOfDay(cell.date)));
        }

        rowEl.append(btn);
        this.cellEls.push(btn);
      });

      gridEl.append(rowEl);
    });

    this.root.append(gridEl);
  }

  /** Apply onCellRender results to existing cells (async patch, race-safe). */
  async applyRenderResults(
    year: number,
    month: number,
    onCellRender: NonNullable<DatepickerOptions['onCellRender']>,
    selectedDate: Date | null,
    rangeState: RangeState,
  ): Promise<void> {
    const seq = ++this.renderSeq;
    const weekStart = this.opts.weekStart ?? 1;
    const grid = buildGrid(year, month, weekStart as 0|1|2|3|4|5|6);

    const results = await Promise.all(
      grid.cells.map((cell) => {
        const ctx = {
          view: 'days' as const,
          inMonth: cell.inMonth,
          isToday: cell.isToday,
          isSelected: selectedDate ? isSameDay(cell.date, selectedDate) : false,
          isDisabled: false,
          isWeekend: isWeekend(cell.date),
          isHighlighted: false,
        };
        return Promise.resolve(onCellRender(cell.date, ctx)).catch(() => ({} as CellRenderResult));
      }),
    );

    // Race guard: discard if month changed
    if (seq !== this.renderSeq) return;
    if (year !== this.lastRenderedYear || month !== this.lastRenderedMonth) return;

    results.forEach((result, i) => {
      let btn = this.cellEls[i];
      if (!btn) return;

      if (result.clickable === false) {
        btn.setAttribute('aria-disabled', 'true');
        btn.classList.add(cn(this.opts, 'cellDisabled', 'vdp-cell--disabled'));
        const newBtn = btn.cloneNode(true) as HTMLButtonElement;
        btn.parentNode?.replaceChild(newBtn, btn);
        this.cellEls[i] = newBtn;
        btn = newBtn;
      }

      if (result.className) {
        const classes = Array.isArray(result.className) ? result.className : [result.className];
        btn.classList.add(...classes);
      }

      if (result.title) {
        btn.title = result.title;
        btn.setAttribute('aria-label', result.title);
      }

      if (result.badge) {
        const badge = el('span', { class: 'vdp-badge' }, result.badge);
        btn.append(badge);
      }

      if (result.content !== undefined) {
        btn.textContent = result.content;
      }
    });
  }

  focusDate(date: Date): void {
    const iso = localISODate(date);
    const btn = this.root.querySelector<HTMLButtonElement>(`[data-date="${iso}"]`);
    if (btn) {
      this.cellEls.forEach((b) => { b.tabIndex = -1; });
      btn.tabIndex = 0;
      btn.focus();
      this.focusedDate = date;
    }
  }

  getFocusedDate(): Date | null {
    return this.focusedDate;
  }
}
