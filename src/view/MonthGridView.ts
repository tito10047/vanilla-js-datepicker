import { el, cn } from './templates';
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

  render(currentMonth: number): void {
    this.root.innerHTML = '';
    this.locale.monthsLong.forEach((name, idx) => {
      const isSelected = idx === currentMonth;
      const btn = el('button', {
        class: ['vdp-month-cell', isSelected ? cn(this.opts, 'cellSelected', 'vdp-cell--selected') : ''].join(' ').trim(),
        type: 'button',
        role: 'gridcell',
        'aria-selected': String(isSelected),
        tabindex: isSelected ? '0' : '-1',
      }, name);
      btn.addEventListener('click', () => this.callbacks.onMonthClick(idx));
      this.root.append(btn);
    });
  }

  focus(): void {
    const selected = this.root.querySelector<HTMLButtonElement>('[aria-selected="true"]');
    (selected ?? this.root.querySelector<HTMLButtonElement>('button'))?.focus();
  }
}
