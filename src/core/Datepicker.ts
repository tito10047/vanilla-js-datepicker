import type {
  DatepickerOptions,
  DatepickerEventName,
  DatepickerChangeEvent,
  DatepickerError,
  DateValue,
  DateRange,
  CalendarView,
  CloseReason,
  LocaleConfig,
  ThemeOption,
  OpenRange,
} from './types';
import { EventEmitter } from './EventEmitter';
import { State } from './State';
import { RangeState } from './RangeState';
import { dispatch, on } from '../utils/dom';
import { runGuard, runValidate } from '../utils/async';
import { parseDate } from '../parser/parse';
import { formatDate } from '../parser/format';
import { startOfDay, isSameDay } from '../utils/dateMath';
import { Dropdown } from '../view/Dropdown';

interface DatepickerState extends Record<string, unknown> {
  isOpen: boolean;
  view: CalendarView;
  currentYear: number;
  currentMonth: number;
  rawValue: string;
  selectedDate: Date | null;
}

const DEFAULTS: Required<Omit<DatepickerOptions,
  'value' | 'defaultValue' | 'container' | 'minDate' | 'maxDate' | 'minDateTitle' | 'maxDateTitle' |
  'disabledDates' | 'highlightedDates' |
  'onBeforeOpen' | 'onOpen' | 'onCellRender' | 'onBeforeChange' |
  'onBeforeMonthChange' | 'validate' |
  'onClose' | 'onChange' | 'onInput' | 'onInvalid' | 'onViewChange' |
  'onMonthChange' | 'onYearChange' | 'classNames' |
  'prevButtonContent' | 'nextButtonContent'
>> = {
  format: 'YYYY-MM-DD',
  locale: 'sk',
  weekStart: 1,
  showWeekNumbers: false,
  weekNumberSystem: 'iso',
  disabledWeekdays: [],
  initialView: 'days',
  mode: 'single',
  maxRangeDays: 0,
  minRangeDays: 0,
  maxSelections: 0,
  theme: 'auto',
  position: 'auto',
  zIndex: 1000,
  animation: 'fade',
  inline: false,
  numberOfMonths: 1,
  fixedHeight: false,
  showTodayButton: false,
  showClearButton: false,
  showConfirmButton: false,
  showCancelButton: false,
  showToggleIcon: true,
  showHeader: true,
  weekdayFormat: 'short',
  openOnFocus: true,
  closeOnSelect: true,
  readonlyInput: false,
  allowManualInput: true,
  autofill: true,
  emptyOk: true,
  strictMode: false,
  keepFocus: false,
};

export class Datepicker {
  private input: HTMLInputElement;
  private opts: DatepickerOptions;
  private emitter = new EventEmitter();
  private state: State<DatepickerState>;
  private rangeState = new RangeState();
  private dropdown: Dropdown | null = null;
  private cleanupFns: (() => void)[] = [];
  private destroyed = false;
  private addedInputMode = false;
  private static defaults: Partial<DatepickerOptions> = {};
  private static registry = new WeakMap<HTMLInputElement, Datepicker>();

  constructor(input: HTMLInputElement | string, options: DatepickerOptions = {}) {
    const el =
      typeof input === 'string'
        ? document.querySelector<HTMLInputElement>(input)
        : input;
    if (!el) throw new Error(`Datepicker: element not found for "${input}"`);

    this.input = el;
    this.opts = { ...DEFAULTS, ...Datepicker.defaults, ...options };
    Datepicker.registry.set(this.input, this);

    const today = new Date();
    this.state = new State<DatepickerState>({
      isOpen: false,
      view: this.opts.initialView ?? 'days',
      currentYear: today.getFullYear(),
      currentMonth: today.getMonth(),
      rawValue: '',
      selectedDate: null,
    });

    this.init();
  }

  // ─── Init ────────────────────────────────────────────────────────────────

  private init(): void {
    this.input.classList.add('vdp-input');
    this.input.setAttribute('autocomplete', 'off');
    this.input.setAttribute('aria-autocomplete', 'none');
    this.input.setAttribute('data-lpignore', 'true');
    this.input.setAttribute('data-1p-ignore', '');
    this.input.setAttribute('data-form-type', 'other');
    this.input.setAttribute('spellcheck', 'false');
    this.input.setAttribute('role', 'combobox');
    this.input.setAttribute('aria-haspopup', 'dialog');
    this.input.setAttribute('aria-expanded', 'false');

    if (!this.input.hasAttribute('inputmode')) {
      this.input.setAttribute('inputmode', 'numeric');
      this.addedInputMode = true;
    }

    const initialValue = this.opts.value ?? this.opts.defaultValue;
    if (initialValue != null) {
      this.applyInitialValue(initialValue);
    }

    if (this.opts.openOnFocus) {
      this.cleanupFns.push(on(this.input, 'focus', () => this.open()));
    }

    if (this.opts.allowManualInput) {
      this.cleanupFns.push(
        on(this.input, 'input', (e) => this.onRawInput((e.target as HTMLInputElement).value)),
        on(this.input, 'blur', () => this.onBlur()),
        on(this.input, 'keydown', (e) => this.onInputKeydown(e as KeyboardEvent)),
      );
    } else {
      this.input.setAttribute('readonly', 'readonly');
    }

    // Wire option callbacks to internal emitter
    if (this.opts.onClose) this.emitter.on('vdp:close', ({ reason }: { reason: CloseReason }) => this.opts.onClose!(reason));
    if (this.opts.onChange) this.emitter.on('vdp:change', (e: DatepickerChangeEvent) => this.opts.onChange!(e.value, e));
    if (this.opts.onInput) this.emitter.on('vdp:input', ({ raw }: { raw: string }) => this.opts.onInput!(raw));
    if (this.opts.onInvalid) this.emitter.on('vdp:invalid', (e: DatepickerError) => this.opts.onInvalid!(e));
    if (this.opts.onViewChange) this.emitter.on('vdp:viewchange', ({ to }: { to: CalendarView }) => this.opts.onViewChange!(to));
    if (this.opts.onYearChange) this.emitter.on('vdp:yearchange', ({ year }: { year: number }) => this.opts.onYearChange!(year));
  }

  private applyInitialValue(value: string | Date | null): void {
    if (!value) return;
    const date = value instanceof Date ? value : parseDate(String(value), this.opts.format!);
    if (!date) return;
    const formatted = formatDate(date, this.opts.format!);
    this.input.value = formatted;
    this.state.patch({
      rawValue: formatted,
      selectedDate: startOfDay(date),
      currentYear: date.getFullYear(),
      currentMonth: date.getMonth(),
    });
    if (this.opts.minDate) {
      const min = this.opts.minDate instanceof Date ? this.opts.minDate : parseDate(String(this.opts.minDate), this.opts.format!);
      if (min && startOfDay(date) < startOfDay(min)) {
        this.fireInvalid('BELOW_MIN', `${formatted} is before minDate`, formatted);
        return;
      }
    }
    if (this.opts.maxDate) {
      const max = this.opts.maxDate instanceof Date ? this.opts.maxDate : parseDate(String(this.opts.maxDate), this.opts.format!);
      if (max && startOfDay(date) > startOfDay(max)) {
        this.fireInvalid('ABOVE_MAX', `${formatted} is after maxDate`, formatted);
      }
    }
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  async open(): Promise<void> {
    if (this.state.get('isOpen') || this.destroyed) return;

    const allowed = await runGuard(this.opts.onBeforeOpen);
    if (!allowed) return;
    if (!dispatch(this.input, 'vdp:beforeopen', {}, true)) return;

    this.state.set('isOpen', true);
    this.input.setAttribute('aria-expanded', 'true');
    this.input.classList.add(this.opts.classNames?.inputActive ?? 'vdp-input--active');

    this.dropdown = new Dropdown(this.input, this.opts, this.state, this.rangeState, {
      onDateSelect: async (date) => {
        await this.handleDateSelect(date);
      },
      onMonthChange: async (year, month) => {
        await this.handleMonthChange(year, month);
      },
      onViewChange: (view) => {
        const prev = this.state.get('view');
        this.state.set('view', view);
        this.emitter.emit('vdp:viewchange', { from: prev, to: view });
        dispatch(this.input, 'vdp:viewchange', { from: prev, to: view });
      },
      onClose: (reason) => this.close(reason),
    });

    await this.dropdown.show();

    this.emitter.emit('vdp:open', { view: this.state.get('view') });
    dispatch(this.input, 'vdp:open', { view: this.state.get('view') });
  }

  async close(reason: CloseReason = 'api'): Promise<void> {
    if (!this.state.get('isOpen')) return;
    this.state.set('isOpen', false);
    this.input.setAttribute('aria-expanded', 'false');
    this.input.classList.remove(this.opts.classNames?.inputActive ?? 'vdp-input--active');
    this.dropdown?.hide();
    this.dropdown = null;
    this.emitter.emit('vdp:close', { reason });
    dispatch(this.input, 'vdp:close', { reason });
  }

  async toggle(): Promise<void> {
    if (this.state.get('isOpen')) {
      await this.close('api');
    } else {
      await this.open();
    }
  }

  async setValue(value: string | Date | null): Promise<void> {
    if (this.destroyed) return;

    if (value === null || value === '') {
      if (this.opts.emptyOk) await this.applyValue(null);
      return;
    }

    const date = value instanceof Date ? value : parseDate(String(value), this.opts.format!);
    if (!date) {
      this.fireInvalid('INVALID_DATE', `"${String(value)}" is not a valid date`, String(value));
      return;
    }

    if (!this.checkRange(date, String(value))) return;

    const formatted = formatDate(date, this.opts.format!);
    const validation = await runValidate(this.opts.validate, startOfDay(date));
    if (!validation.ok) {
      this.fireInvalid('INVALID_DATE', validation.message ?? 'Validation failed', formatted);
      return;
    }

    const prev = this.state.get('selectedDate');
    const allowed = await runGuard(() => this.opts.onBeforeChange?.(startOfDay(date), prev) ?? true);
    if (!allowed) return;

    if (!dispatch(this.input, 'vdp:beforechange', { next: startOfDay(date), prev }, true)) return;

    await this.applyValue(date);
  }

  async setRange(from: Date, to: Date): Promise<void> {
    if (this.destroyed) return;
    this.rangeState.setRange(from, to);
    const formatted = `${formatDate(from, this.opts.format!)} – ${formatDate(to, this.opts.format!)}`;
    this.input.value = formatted;
    this.state.set('rawValue', formatted);
    const range: DateRange = { from: startOfDay(from), to: startOfDay(to) };
    this.emitChange(formatted, range);
    this.dropdown?.refresh();
  }

  async setDates(dates: Date[]): Promise<void> {
    if (this.destroyed) return;
    this.rangeState.setSelected(dates);
    const formatted = dates.map((d) => formatDate(d, this.opts.format!)).join(', ');
    this.input.value = formatted;
    this.state.set('rawValue', formatted);
    this.emitChange(formatted, dates.map(startOfDay));
    this.dropdown?.refresh();
  }

  async clear(): Promise<void> {
    this.rangeState.clearRange();
    this.rangeState.clearSelected();
    await this.applyValue(null);
  }

  async setToday(): Promise<void> {
    await this.setValue(new Date());
  }

  async goToDate(date: Date): Promise<void> {
    this.state.patch({ currentYear: date.getFullYear(), currentMonth: date.getMonth() });
    this.dropdown?.refresh();
  }

  async goToMonth(month: number, year: number): Promise<void> {
    await this.handleMonthChange(year, month);
  }

  async goToNextMonth(): Promise<void> {
    let m = this.state.get('currentMonth') + 1;
    let y = this.state.get('currentYear');
    if (m > 11) { m = 0; y++; }
    await this.handleMonthChange(y, m);
  }

  async goToPrevMonth(): Promise<void> {
    let m = this.state.get('currentMonth') - 1;
    let y = this.state.get('currentYear');
    if (m < 0) { m = 11; y--; }
    await this.handleMonthChange(y, m);
  }

  async goToNextYear(): Promise<void> {
    await this.handleMonthChange(this.state.get('currentYear') + 1, this.state.get('currentMonth'));
  }

  async goToPrevYear(): Promise<void> {
    await this.handleMonthChange(this.state.get('currentYear') - 1, this.state.get('currentMonth'));
  }

  async switchView(view: CalendarView): Promise<void> {
    if (this.dropdown) {
      // Let onViewChange callback handle state update + event dispatch
      this.dropdown.switchView(view);
    } else {
      const prev = this.state.get('view');
      this.state.set('view', view);
      this.emitter.emit('vdp:viewchange', { from: prev, to: view });
      dispatch(this.input, 'vdp:viewchange', { from: prev, to: view });
    }
  }

  async refresh(): Promise<void> {
    this.dropdown?.refresh();
  }

  getValue(): string {
    return this.state.get('rawValue');
  }

  getDate(): Date | null {
    return this.state.get('selectedDate');
  }

  getDates(): Date[] {
    return this.rangeState.getSelected();
  }

  getRange(): DateRange | null {
    return this.rangeState.getRange();
  }

  isOpen(): boolean {
    return this.state.get('isOpen');
  }

  async isValid(): Promise<boolean> {
    const v = this.state.get('rawValue');
    if (!v) return this.opts.emptyOk ?? true;
    const date = parseDate(v, this.opts.format!);
    if (!date) return false;
    const result = await runValidate(this.opts.validate, startOfDay(date));
    return result.ok;
  }

  setOptions(partial: Partial<DatepickerOptions>): void {
    this.opts = { ...this.opts, ...partial };
  }

  setLocale(locale: string | LocaleConfig): void {
    this.opts.locale = locale;
    this.dropdown?.refresh();
  }

  setTheme(theme: ThemeOption): void {
    this.opts.theme = theme;
    this.dropdown?.setTheme(theme);
  }

  focus(): void {
    this.input.focus();
  }

  on<T = unknown>(event: DatepickerEventName, handler: (detail: T) => void): () => void {
    return this.emitter.on(event, handler);
  }

  off<T = unknown>(event: DatepickerEventName, handler: (detail: T) => void): void {
    this.emitter.off(event, handler);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    Datepicker.registry.delete(this.input);
    if (this.state.get('isOpen')) this.close('api');
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns = [];
    this.emitter.removeAllListeners();
    this.input.classList.remove('vdp-input');
    this.input.removeAttribute('autocomplete');
    this.input.removeAttribute('aria-autocomplete');
    this.input.removeAttribute('data-lpignore');
    this.input.removeAttribute('data-1p-ignore');
    this.input.removeAttribute('data-form-type');
    this.input.removeAttribute('spellcheck');
    this.input.removeAttribute('role');
    this.input.removeAttribute('aria-haspopup');
    this.input.removeAttribute('aria-expanded');
    if (this.addedInputMode) this.input.removeAttribute('inputmode');
    dispatch(this.input, 'vdp:destroy', {});
  }

  // ─── Static API ───────────────────────────────────────────────────────────

  static setDefaults(partial: Partial<DatepickerOptions>): void {
    Datepicker.defaults = { ...Datepicker.defaults, ...partial };
  }

  static registerLocale(name: string, config: LocaleConfig): void {
    // Delegated to i18n module at runtime (import avoids circular dep)
    import('../i18n/i18n').then(({ registerLocale }) => registerLocale(name, config));
  }

  static autoInit(selector = '[data-datepicker]'): Datepicker[] {
    return Array.from(document.querySelectorAll<HTMLInputElement>(selector)).map(
      (el) => new Datepicker(el, JSON.parse(el.dataset['datepickerOptions'] ?? '{}')),
    );
  }

  static getInstance(el: HTMLInputElement | string): Datepicker | null {
    const input = typeof el === 'string' ? document.querySelector<HTMLInputElement>(el) : el;
    return input ? Datepicker.registry.get(input) ?? null : null;
  }

  static parse(text: string, format = 'YYYY-MM-DD'): Date | null {
    return parseDate(text, format);
  }

  static format(date: Date, format = 'YYYY-MM-DD'): string {
    return formatDate(date, format);
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private async handleDateSelect(date: Date): Promise<void> {
    // NaN date = "clear" signal from the Clear footer button
    if (!isFinite(date.getTime())) {
      await this.applyValue(null);
      if (this.opts.closeOnSelect ?? true) await this.close('select');
      return;
    }

    const mode = this.opts.mode ?? 'single';

    if (mode === 'multiple') {
      this.rangeState.toggleDate(date, this.opts.maxSelections);
      const dates = this.rangeState.getSelected();
      const formatted = dates.map((d) => formatDate(d, this.opts.format!)).join(', ');
      this.input.value = formatted;
      this.state.set('rawValue', formatted);
      this.emitChange(formatted, dates);
      this.dropdown?.refresh();
      return;
    }

    if (mode === 'range') {
      const result = this.rangeState.clickRange(date);
      if (result) {
        const formatted = `${formatDate(result.from, this.opts.format!)} – ${formatDate(result.to, this.opts.format!)}`;
        this.input.value = formatted;
        this.state.set('rawValue', formatted);
        this.emitChange(formatted, result);
        dispatch(this.input, 'vdp:rangeselect', result);
        if (this.opts.closeOnSelect ?? true) await this.close('select');
      }
      this.dropdown?.refresh();
      return;
    }

    // single mode
    await this.setValue(date);
    dispatch(this.input, 'vdp:dayselect', { date });
    if (this.opts.closeOnSelect ?? true) await this.close('select');
  }

  private async handleMonthChange(year: number, month: number): Promise<void> {
    const prevMonth = new Date(this.state.get('currentYear'), this.state.get('currentMonth'), 1);
    const nextMonth = new Date(year, month, 1);

    const allowed = await runGuard(() => this.opts.onBeforeMonthChange?.(nextMonth, prevMonth) ?? true);
    if (!allowed) return;
    if (!dispatch(this.input, 'vdp:beforemonthchange', { next: nextMonth, prev: prevMonth }, true)) return;

    this.state.patch({ currentYear: year, currentMonth: month });

    this.emitter.emit('vdp:monthchange', { month: nextMonth });
    dispatch(this.input, 'vdp:monthchange', { month: nextMonth });

    if (nextMonth.getFullYear() !== prevMonth.getFullYear()) {
      this.emitter.emit('vdp:yearchange', { year });
      dispatch(this.input, 'vdp:yearchange', { year });
    }

    await this.dropdown?.refresh();
  }

  private async applyValue(date: Date | null): Promise<void> {
    const prev = this.state.get('rawValue');
    const formatted = date ? formatDate(date, this.opts.format!) : '';
    this.input.value = formatted;
    this.input.classList.remove(this.opts.classNames?.inputInvalid ?? 'vdp-invalid');
    this.state.patch({
      rawValue: formatted,
      selectedDate: date ? startOfDay(date) : null,
      currentYear: date ? date.getFullYear() : this.state.get('currentYear'),
      currentMonth: date ? date.getMonth() : this.state.get('currentMonth'),
    });

    this.emitChange(formatted, date ? startOfDay(date) : null, prev);
    this.dropdown?.refresh();
  }

  private emitChange(formatted: string, value: DateValue, prev = ''): void {
    const event: DatepickerChangeEvent = {
      value: formatted,
      date: value,
      formatted,
      prev,
    };
    this.emitter.emit('vdp:change', event);
    dispatch(this.input, 'vdp:change', event);
  }

  private checkRange(date: Date, formatted: string): boolean {
    if (this.opts.minDate) {
      const min = this.opts.minDate instanceof Date ? this.opts.minDate : parseDate(String(this.opts.minDate), this.opts.format!);
      if (min && startOfDay(date) < startOfDay(min)) {
        this.fireInvalid('BELOW_MIN', `${formatted} is before minDate`, formatted);
        return false;
      }
    }
    if (this.opts.maxDate) {
      const max = this.opts.maxDate instanceof Date ? this.opts.maxDate : parseDate(String(this.opts.maxDate), this.opts.format!);
      if (max && startOfDay(date) > startOfDay(max)) {
        this.fireInvalid('ABOVE_MAX', `${formatted} is after maxDate`, formatted);
        return false;
      }
    }
    return true;
  }

  private fireInvalid(code: DatepickerError['code'], message: string, value: string): void {
    const err: DatepickerError = { code, message, value };
    this.emitter.emit('vdp:invalid', err);
    dispatch(this.input, 'vdp:invalid', err);
    this.input.classList.add(this.opts.classNames?.inputInvalid ?? 'vdp-invalid');
  }

  private onRawInput(raw: string): void {
    this.input.classList.remove(this.opts.classNames?.inputInvalid ?? 'vdp-invalid');
    this.emitter.emit('vdp:input', { raw });
    dispatch(this.input, 'vdp:input', { raw });
  }

  private async onBlur(): Promise<void> {
    if (!this.opts.autofill) return;
    const raw = this.input.value;
    if (!raw && this.opts.emptyOk) return;
    if (!raw) return;
    const date = parseDate(raw, this.opts.format!);
    if (date) {
      await this.setValue(date);
    } else if (this.opts.strictMode) {
      this.fireInvalid('INVALID_DATE', `"${raw}" is not a valid date`, raw);
    }
  }

  private onInputKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape') this.close('escape');
    if (e.key === 'Enter') this.onBlur();
  }
}
