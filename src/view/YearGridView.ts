import { el, cn } from './templates';
import type { DatepickerOptions } from '../core/types';

export interface YearGridCallbacks {
  onYearClick: (year: number) => void;
}

export class YearGridView {
  readonly root: HTMLElement;
  private decadeStart = 0;

  constructor(
    private opts: DatepickerOptions,
    private callbacks: YearGridCallbacks,
  ) {
    this.root = document.createElement('div');
    this.root.className = cn(opts, 'yearGrid', 'vdp-year-grid');
    this.root.setAttribute('role', 'grid');
  }

  render(currentYear: number): void {
    this.decadeStart = Math.floor(currentYear / 12) * 12;
    this.root.innerHTML = '';

    for (let i = 0; i < 12; i++) {
      const year = this.decadeStart + i;
      const isSelected = year === currentYear;
      const btn = el('button', {
        class: ['vdp-year-cell', isSelected ? cn(this.opts, 'cellSelected', 'vdp-cell--selected') : ''].join(' ').trim(),
        type: 'button',
        role: 'gridcell',
        'aria-selected': String(isSelected),
        tabindex: isSelected ? '0' : '-1',
      }, String(year));
      btn.addEventListener('click', () => this.callbacks.onYearClick(year));
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
