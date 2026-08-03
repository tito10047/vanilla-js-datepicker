import { el, cn } from './templates';
import { parseDate } from '../parser/parse';
import { startOfDay } from '../utils/dateMath';
import type { DatepickerOptions, LocaleConfig } from '../core/types';

export interface MonthGridCallbacks {
  onMonthClick: (month: number) => void;
}

export class MonthGridView {
  readonly root: HTMLElement;

  constructor(
    private opts: DatepickerOptions,
    private locale: LocaleConfig,
    private callbacks: MonthGridCallbacks,
  ) {
    this.root = document.createElement('div');
    this.root.className = cn(opts, 'monthGrid', 'vdp-month-grid');
    this.root.setAttribute('role', 'grid');
  }

  render(currentMonth: number, currentYear: number): void {
    this.root.innerHTML = '';

    const fmt = this.opts.format ?? 'YYYY-MM-DD';
    const minDay = this.opts.minDate
      ? startOfDay(this.opts.minDate instanceof Date ? this.opts.minDate : (parseDate(String(this.opts.minDate), fmt) ?? new Date(NaN)))
      : null;
    const maxDay = this.opts.maxDate
      ? startOfDay(this.opts.maxDate instanceof Date ? this.opts.maxDate : (parseDate(String(this.opts.maxDate), fmt) ?? new Date(NaN)))
      : null;
    const minTitle = this.opts.minMonthTitle ?? this.locale.minMonthTitle;
    const maxTitle = this.opts.maxMonthTitle ?? this.locale.maxMonthTitle;

    this.locale.monthsLong.forEach((name, idx) => {
      const isSelected = idx === currentMonth;

      // Last day of this month in currentYear
      const lastDay = startOfDay(new Date(currentYear, idx + 1, 0));
      // First day of this month in currentYear
      const firstDay = startOfDay(new Date(currentYear, idx, 1));

      const isBelowMin = minDay !== null && isFinite(minDay.getTime()) && lastDay < minDay;
      const isAboveMax = maxDay !== null && isFinite(maxDay.getTime()) && firstDay > maxDay;
      const isDisabled = isBelowMin || isAboveMax;
      const rangeTitle = isBelowMin ? minTitle : isAboveMax ? maxTitle : undefined;

      const classes = ['vdp-month-cell', isSelected ? cn(this.opts, 'cellSelected', 'vdp-cell--selected') : ''];
      if (isDisabled) classes.push(cn(this.opts, 'cellDisabled', 'vdp-cell--disabled'));

      const attrs: Record<string, string> = {
        class: classes.join(' ').trim(),
        type: 'button',
        role: 'gridcell',
        'aria-selected': String(isSelected),
        'aria-disabled': String(isDisabled),
        tabindex: isSelected ? '0' : '-1',
        'data-month': String(idx),
      };
      if (rangeTitle) attrs['title'] = rangeTitle;

      const btn = el('button', attrs, name);
      if (!isDisabled) {
        btn.addEventListener('click', () => this.callbacks.onMonthClick(idx));
      }
      this.root.append(btn);
    });
  }

  focus(): void {
    const selected = this.root.querySelector<HTMLButtonElement>('[aria-selected="true"]');
    (selected ?? this.root.querySelector<HTMLButtonElement>('button'))?.focus();
  }
}
