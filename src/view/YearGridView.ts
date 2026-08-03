import { el, cn } from './templates';
import { parseDate } from '../parser/parse';
import { startOfDay } from '../utils/dateMath';
import type { DatepickerOptions, LocaleConfig } from '../core/types';

export interface YearGridCallbacks {
  onYearClick: (year: number) => void;
}

export class YearGridView {
  readonly root: HTMLElement;
  private decadeStart = 0;

  constructor(
    private opts: DatepickerOptions,
    private locale: LocaleConfig,
    private callbacks: YearGridCallbacks,
  ) {
    this.root = document.createElement('div');
    this.root.className = cn(opts, 'yearGrid', 'vdp-year-grid');
    this.root.setAttribute('role', 'grid');
  }

  render(currentYear: number): void {
    this.decadeStart = Math.floor(currentYear / 12) * 12;
    this.root.innerHTML = '';

    const fmt = this.opts.format ?? 'YYYY-MM-DD';
    const minDay = this.opts.minDate
      ? startOfDay(this.opts.minDate instanceof Date ? this.opts.minDate : (parseDate(String(this.opts.minDate), fmt) ?? new Date(NaN)))
      : null;
    const maxDay = this.opts.maxDate
      ? startOfDay(this.opts.maxDate instanceof Date ? this.opts.maxDate : (parseDate(String(this.opts.maxDate), fmt) ?? new Date(NaN)))
      : null;
    const minTitle = this.opts.minYearTitle ?? this.locale.minYearTitle;
    const maxTitle = this.opts.maxYearTitle ?? this.locale.maxYearTitle;

    for (let i = 0; i < 12; i++) {
      const year = this.decadeStart + i;
      const isSelected = year === currentYear;

      // Year is fully before minDate if its last day (Dec 31) < minDate
      const isBelowMin = minDay !== null && isFinite(minDay.getTime()) && year < minDay.getFullYear();
      // Year is fully after maxDate if its first day (Jan 1) > maxDate
      const isAboveMax = maxDay !== null && isFinite(maxDay.getTime()) && year > maxDay.getFullYear();
      const isDisabled = isBelowMin || isAboveMax;
      const rangeTitle = isBelowMin ? minTitle : isAboveMax ? maxTitle : undefined;

      const classes = ['vdp-year-cell', isSelected ? cn(this.opts, 'cellSelected', 'vdp-cell--selected') : ''];
      if (isDisabled) classes.push(cn(this.opts, 'cellDisabled', 'vdp-cell--disabled'));

      const attrs: Record<string, string> = {
        class: classes.join(' ').trim(),
        type: 'button',
        role: 'gridcell',
        'aria-selected': String(isSelected),
        'aria-disabled': String(isDisabled),
        tabindex: isSelected ? '0' : '-1',
        'data-year': String(year),
      };
      if (rangeTitle) attrs['title'] = rangeTitle;

      const btn = el('button', attrs, String(year));
      if (!isDisabled) {
        btn.addEventListener('click', () => this.callbacks.onYearClick(year));
      }
      this.root.append(btn);
    }
  }

  getDecadeStart(): number {
    return this.decadeStart;
  }

  focus(): void {
    const selected = this.root.querySelector<HTMLButtonElement>('[aria-selected="true"]');
    (selected ?? this.root.querySelector<HTMLButtonElement>('button'))?.focus();
  }
}
