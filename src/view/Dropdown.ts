import '../styles/datepicker.css';
import type { DatepickerOptions, CalendarView, ThemeOption, CloseReason } from '../core/types';
import type { State } from '../core/State';
import type { RangeState } from '../core/RangeState';
import { resolveLocale } from '../i18n/i18n';
import { computePosition } from '../utils/position';
import { createFocusTrap } from '../a11y/focusTrap';
import { createLiveRegion } from '../a11y/aria';
import { resolveGridKeyAction } from '../a11y/keyboard';
import { addDays, addMonths, startOfDay } from '../utils/dateMath';
import { parseDate } from '../parser/parse';
import { HeaderView } from './HeaderView';
import { DayGridView } from './DayGridView';
import { MonthGridView } from './MonthGridView';
import { YearGridView } from './YearGridView';
import { FooterView } from './FooterView';
import { el, cn } from './templates';
import type { DatepickerChangeEvent } from '../core/types';

interface DatepickerState extends Record<string, unknown> {
  isOpen: boolean;
  view: CalendarView;
  currentYear: number;
  currentMonth: number;
  rawValue: string;
  selectedDate: Date | null;
}

export interface DropdownCallbacks {
  onDateSelect: (date: Date) => Promise<void>;
  onMonthChange: (year: number, month: number) => Promise<void>;
  onViewChange: (view: CalendarView) => void;
  onClose: (reason: CloseReason) => void;
}

export class Dropdown {
  private container!: HTMLElement;
  private headerView!: HeaderView;
  private dayGridView!: DayGridView;
  private monthGridView!: MonthGridView;
  private yearGridView!: YearGridView;
  private footerView?: FooterView;
  private bodyEl!: HTMLElement;
  private focusTrap!: ReturnType<typeof createFocusTrap>;
  private liveRegion!: ReturnType<typeof createLiveRegion>;
  private outsideCleanup?: () => void;
  private vpCleanup?: () => void;
  // Pending confirm state (showConfirmButton mode)
  private pendingDate: Date | null = null;

  constructor(
    private anchor: HTMLInputElement,
    private opts: DatepickerOptions,
    private state: State<DatepickerState>,
    private rangeState: RangeState,
    private callbacks: DropdownCallbacks,
  ) {}

  // ─── Public ──────────────────────────────────────────────────────────────

  /** Phase 1: build DOM + show immediately (sync), then run async pipeline. */
  async show(): Promise<void> {
    const locale = resolveLocale(this.opts.locale);

    this.container = el('div', {
      class: cn(this.opts, 'dropdown', 'vdp-dropdown'),
      role: 'dialog',
      'aria-modal': 'false',
      'aria-label': locale.title,
      'data-vdp-theme': this.opts.theme ?? 'auto',
      'data-animation': this.opts.animation ?? 'fade',
    });
    this.container.style.setProperty('--vdp-z', String(this.opts.zIndex ?? 1000));

    // Header
    this.headerView = new HeaderView(this.opts, locale, {
      onPrev: () => this.navigate(-1),
      onNext: () => this.navigate(1),
      onMonthClick: () => this.switchView('months'),
      onYearClick: () => this.switchView('years'),
    });

    // Body
    this.bodyEl = el('div', { class: cn(this.opts, 'body', 'vdp-body') });

    this.dayGridView = new DayGridView(this.opts, locale, {
      onDateClick: async (date) => {
        if (this.opts.showConfirmButton) {
          this.pendingDate = date;
          this.renderCurrentView();
          return;
        }
        await this.callbacks.onDateSelect(date);
      },
      onDateHover: (date) => {
        // Only re-render for range hover preview, and only when the preview changes.
        // Unconditional re-renders cause an infinite mouseenter loop because
        // rebuilding the grid detaches cells, the new cell at the same position
        // gets mouseenter immediately, triggering another re-render, and so on.
        if (this.rangeState.getPhase() !== 'selecting') return;
        const prev = this.rangeState.getPreviewRange();
        this.rangeState.hoverRange(date);
        const next = this.rangeState.getPreviewRange();
        if (prev?.from?.getTime() === next?.from?.getTime() &&
            prev?.to?.getTime() === next?.to?.getTime()) return;
        this.renderCurrentView();
      },
    });

    this.monthGridView = new MonthGridView(this.opts, locale, {
      onMonthClick: async (month) => {
        const year = this.state.get('currentYear');
        await this.callbacks.onMonthChange(year, month);
        this.switchView('days');
      },
    });

    this.yearGridView = new YearGridView(this.opts, {
      onYearClick: async (year) => {
        await this.callbacks.onMonthChange(year, this.state.get('currentMonth'));
        this.switchView('months');
      },
    });

    this.bodyEl.append(this.dayGridView.root);
    this.container.append(this.headerView.root, this.bodyEl);

    // Footer
    this.footerView = new FooterView(this.opts, locale, {
      onToday: async () => { await this.callbacks.onDateSelect(startOfDay(new Date())); },
      onClear: async () => {
        this.pendingDate = null;
        await this.callbacks.onDateSelect(new Date(NaN));
      },
      onConfirm: async () => {
        if (this.pendingDate) await this.callbacks.onDateSelect(this.pendingDate);
        else await this.callbacks.onClose('confirm');
        await this.callbacks.onClose('confirm');
      },
      onCancel: () => this.callbacks.onClose('cancel'),
    });
    if (this.footerView.hasButtons()) {
      this.container.append(this.footerView.root);
    }

    // Attach keyboard handler
    this.attachKeyboard();

    // ── SYNC: append to DOM immediately (user sees calendar NOW) ──
    const target = this.opts.container ?? document.body;
    target.appendChild(this.container);

    this.renderCurrentView();
    this.position();

    this.focusTrap = createFocusTrap(this.container);
    this.liveRegion = createLiveRegion();
    this.focusTrap.activate();

    this.outsideCleanup = this.attachOutsideClick();
    this.vpCleanup = this.attachViewportResize();

    // Store aria-controls
    const id = `vdp-${Math.random().toString(36).slice(2, 8)}`;
    this.container.id = id;
    this.anchor.setAttribute('aria-controls', id);

    // ── ASYNC pipeline: onOpen → onCellRender ────────────────────
    await this.runAsyncPipeline(true);
  }

  hide(): void {
    this.container?.remove();
    this.liveRegion?.el.remove();
    this.focusTrap?.deactivate();
    this.outsideCleanup?.();
    this.vpCleanup?.();
    this.anchor.removeAttribute('aria-controls');
  }

  async refresh(): Promise<void> {
    if (!this.container) return;
    this.headerView.updateLocale(resolveLocale(this.opts.locale));
    this.renderCurrentView();
    await this.runAsyncPipeline(false);
  }

  switchView(view: CalendarView): void {
    this.callbacks.onViewChange(view);
    this.renderCurrentView();
  }

  setTheme(theme: ThemeOption): void {
    this.container?.setAttribute('data-vdp-theme', theme);
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  private renderCurrentView(): void {
    const view = this.state.get('view');
    const year = this.state.get('currentYear');
    const month = this.state.get('currentMonth');
    const selectedDate = this.state.get('selectedDate');

    this.bodyEl.innerHTML = '';

    if (view === 'days') {
      const disabledDates = Array.isArray(this.opts.disabledDates) ? this.opts.disabledDates as Date[] : [];
      const highlightedDates = (this.opts.highlightedDates ?? []).map((d) => d instanceof Date ? d : new Date(d));
      this.dayGridView.render(year, month, selectedDate, this.rangeState, highlightedDates, disabledDates);
      this.bodyEl.append(this.dayGridView.root);
      this.headerView.update('days', year, month);
    } else if (view === 'months') {
      this.monthGridView.render(month);
      this.bodyEl.append(this.monthGridView.root);
      this.headerView.update('months', year, month);
      this.monthGridView.focus();
    } else {
      this.yearGridView.render(year);
      this.bodyEl.append(this.yearGridView.root);
      this.headerView.update('years', year, month, this.yearGridView.getDecadeStart());
      this.yearGridView.focus();
    }
  }

  // ─── Async pipeline (plan §2.1) ──────────────────────────────────────────

  private async runAsyncPipeline(isInitial = false): Promise<void> {
    const view = this.state.get('view');
    if (view !== 'days') return;

    const year = this.state.get('currentYear');
    const month = this.state.get('currentMonth');

    // onOpen — only on initial calendar open, not on month navigation
    if (isInitial && this.opts.onOpen) {
      const weekStart = this.opts.weekStart ?? resolveLocale(this.opts.locale).weekStart ?? 1;
      const { buildGrid } = await import('../utils/calendarGrid');
      const g = buildGrid(year, month, weekStart as 0|1|2|3|4|5|6);
      await this.opts.onOpen({ from: g.firstDate, to: g.lastDate });
    }

    // onCellRender — parallel, race-safe
    if (this.opts.onCellRender) {
      const selectedDate = this.state.get('selectedDate');
      await this.dayGridView.applyRenderResults(year, month, this.opts.onCellRender, selectedDate, this.rangeState);
    }
  }

  // ─── Navigation ──────────────────────────────────────────────────────────

  private async navigate(dir: -1 | 1): Promise<void> {
    const view = this.state.get('view');
    const year = this.state.get('currentYear');
    const month = this.state.get('currentMonth');

    if (view === 'days') {
      const d = addMonths(new Date(year, month, 1), dir);
      await this.callbacks.onMonthChange(d.getFullYear(), d.getMonth());
    } else if (view === 'months') {
      await this.callbacks.onMonthChange(year + dir, month);
    } else {
      // years — decade
      await this.callbacks.onMonthChange(year + dir * 12, month);
    }
    // renderCurrentView() is already called inside handleMonthChange → refresh(),
    // together with the async pipeline. Calling it again here would wipe out
    // any className/badge decorations applied by onCellRender.
  }

  // ─── Keyboard ────────────────────────────────────────────────────────────

  private attachKeyboard(): void {
    this.container.addEventListener('keydown', async (e) => {
      const action = resolveGridKeyAction(e);
      if (!action) return;

      const view = this.state.get('view');

      if (action === 'close') { e.preventDefault(); this.callbacks.onClose('escape'); return; }

      if (view === 'days') {
        const focused = this.dayGridView.getFocusedDate();
        if (!focused) return;
        e.preventDefault();

        let next: Date | null = null;
        switch (action) {
          case 'prev-day': next = addDays(focused, -1); break;
          case 'next-day': next = addDays(focused, 1); break;
          case 'prev-week': next = addDays(focused, -7); break;
          case 'next-week': next = addDays(focused, 7); break;
          case 'prev-month': next = addMonths(focused, -1); break;
          case 'next-month': next = addMonths(focused, 1); break;
          case 'prev-year': next = addMonths(focused, -12); break;
          case 'next-year': next = addMonths(focused, 12); break;
          case 'select': await this.callbacks.onDateSelect(focused); return;
        }

        if (next) {
          // Navigate month if needed
          if (next.getMonth() !== this.state.get('currentMonth') || next.getFullYear() !== this.state.get('currentYear')) {
            await this.callbacks.onMonthChange(next.getFullYear(), next.getMonth());
            // renderCurrentView() is already called inside refresh(); don't call again.
          }
          this.dayGridView.focusDate(next);
          this.liveRegion?.announce(`${next.getDate()} ${resolveLocale(this.opts.locale).monthsLong[next.getMonth()]} ${next.getFullYear()}`);
        }
      }
    });
  }

  // ─── Position ────────────────────────────────────────────────────────────

  private position(): void {
    const result = computePosition(this.anchor, this.container, this.opts.position ?? 'auto', this.opts.container);
    this.container.style.top = `${result.top}px`;
    this.container.style.left = `${result.left}px`;
    this.container.setAttribute('data-placement', result.placement);
  }

  private attachViewportResize(): () => void {
    if (typeof window === 'undefined' || !window.visualViewport) return () => {};
    const vv = window.visualViewport;
    const reposition = () => this.position();
    vv.addEventListener('resize', reposition);
    vv.addEventListener('scroll', reposition);
    return () => {
      vv.removeEventListener('resize', reposition);
      vv.removeEventListener('scroll', reposition);
    };
  }

  private attachOutsideClick(): () => void {
    const handler = (e: MouseEvent) => {
      if (!this.container.contains(e.target as Node) && e.target !== this.anchor) {
        this.callbacks.onClose('outside');
      }
    };
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }
}
