import { el, cn, SVG_PREV, SVG_NEXT } from './templates';
import type { DatepickerOptions, CalendarView, LocaleConfig } from '../core/types';

export interface HeaderViewCallbacks {
  onPrev: () => void;
  onNext: () => void;
  onMonthClick: () => void;
  onYearClick: () => void;
}

export class HeaderView {
  readonly root: HTMLElement;
  private monthBtn!: HTMLButtonElement;
  private yearBtn!: HTMLButtonElement;
  private decadeSpan!: HTMLElement;

  constructor(
    private opts: DatepickerOptions,
    private locale: LocaleConfig,
    private callbacks: HeaderViewCallbacks,
  ) {
    this.root = this.build();
  }

  private build(): HTMLElement {
    const header = el('div', { class: cn(this.opts, 'header', 'vdp-header') });

    const prevBtn = el('button', {
      class: cn(this.opts, 'prevButton', 'vdp-btn-prev'),
      type: 'button',
      'aria-label': this.locale.prevMonthLabel,
    });
    prevBtn.innerHTML = this.opts.prevButtonContent ?? SVG_PREV;
    prevBtn.addEventListener('click', () => this.callbacks.onPrev());

    const navWrap = el('div', { class: 'vdp-header-nav' });

    this.monthBtn = el('button', {
      class: cn(this.opts, 'monthButton', 'vdp-btn-month'),
      type: 'button',
      'aria-label': this.locale.monthPickerLabel,
    });
    this.monthBtn.addEventListener('click', () => this.callbacks.onMonthClick());

    this.yearBtn = el('button', {
      class: cn(this.opts, 'yearButton', 'vdp-btn-year'),
      type: 'button',
      'aria-label': this.locale.yearPickerLabel,
    });
    this.yearBtn.addEventListener('click', () => this.callbacks.onYearClick());

    this.decadeSpan = el('span', { class: 'vdp-decade-label' });

    navWrap.append(this.monthBtn, this.yearBtn, this.decadeSpan);

    const nextBtn = el('button', {
      class: cn(this.opts, 'nextButton', 'vdp-btn-next'),
      type: 'button',
      'aria-label': this.locale.nextMonthLabel,
    });
    nextBtn.innerHTML = this.opts.nextButtonContent ?? SVG_NEXT;
    nextBtn.addEventListener('click', () => this.callbacks.onNext());

    header.append(prevBtn, navWrap, nextBtn);
    return header;
  }

  updateLocale(locale: LocaleConfig): void {
    this.locale = locale;
  }

  update(view: CalendarView, year: number, month: number, decadeStart?: number): void {
    if (view === 'days') {
      this.monthBtn.textContent = this.locale.monthsLong[month] ?? '';
      this.monthBtn.style.display = '';
      this.yearBtn.textContent = String(year);
      this.yearBtn.style.display = '';
      this.decadeSpan.style.display = 'none';
    } else if (view === 'months') {
      this.monthBtn.style.display = 'none';
      this.yearBtn.textContent = String(year);
      this.yearBtn.style.display = '';
      this.decadeSpan.style.display = 'none';
    } else {
      // years view
      this.monthBtn.style.display = 'none';
      this.yearBtn.style.display = 'none';
      const end = (decadeStart ?? year) + 11;
      this.decadeSpan.textContent = `${decadeStart ?? year} – ${end}`;
      this.decadeSpan.style.display = '';
    }
  }
}
