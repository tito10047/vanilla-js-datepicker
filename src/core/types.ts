// ─── Calendar view ────────────────────────────────────────────────────────────

export type CalendarView = 'days' | 'months' | 'years';
export type CloseReason = 'select' | 'escape' | 'outside' | 'confirm' | 'cancel' | 'api';
export type ThemeOption = 'light' | 'dark' | 'auto';
export type PositionOption = 'auto' | 'top' | 'bottom' | 'left' | 'right';
export type AnimationOption = 'fade' | 'slide' | 'none';
export type SelectionMode = 'single' | 'range' | 'multiple';
export type WeekNumberSystem = 'iso' | 'us';
export type WeekdayFormat = 'narrow' | 'short' | 'long';

// ─── Date value union ─────────────────────────────────────────────────────────

export type DateRange = { from: Date; to: Date };
export type DateValue = Date | Date[] | DateRange | null;

// ─── Cell render ──────────────────────────────────────────────────────────────

export interface CellRenderContext {
  view: CalendarView;
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isWeekend: boolean;
  isHighlighted: boolean;
}

export interface CellRenderResult {
  className?: string | string[];
  clickable?: boolean;
  title?: string;
  content?: string;
  badge?: string;
}

export type CellRenderer = (
  date: Date,
  context: CellRenderContext,
) => CellRenderResult | Promise<CellRenderResult>;

// ─── Open handler ─────────────────────────────────────────────────────────────

export interface OpenRange {
  month: Date;
  from: Date;
  to: Date;
}

// ─── Events ───────────────────────────────────────────────────────────────────

export interface DatepickerChangeEvent {
  value: string;
  date: DateValue;
  formatted: string;
  prev: string;
}

export interface DatepickerError {
  code: 'INVALID_DATE' | 'BELOW_MIN' | 'ABOVE_MAX' | 'DISABLED' | 'CANCELLED' | 'RANGE_TOO_SHORT' | 'RANGE_TOO_LONG';
  message: string;
  value: string;
}

export type DatepickerEventName =
  | 'vdp:beforeopen'
  | 'vdp:open'
  | 'vdp:cellsrendered'
  | 'vdp:close'
  | 'vdp:beforemonthchange'
  | 'vdp:monthchange'
  | 'vdp:yearchange'
  | 'vdp:viewchange'
  | 'vdp:input'
  | 'vdp:beforechange'
  | 'vdp:change'
  | 'vdp:dayselect'
  | 'vdp:rangeselect'
  | 'vdp:invalid'
  | 'vdp:destroy';

// ─── i18n ─────────────────────────────────────────────────────────────────────

export interface LocaleConfig {
  code: string;
  title: string;
  monthsLong: string[];
  monthsShort: string[];
  weekdaysLong: string[];
  weekdaysShort: string[];
  weekdaysNarrow: string[];
  weekStart: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  todayLabel: string;
  clearLabel: string;
  confirmLabel: string;
  cancelLabel: string;
  prevMonthLabel: string;
  nextMonthLabel: string;
  prevYearLabel: string;
  nextYearLabel: string;
  prevDecadeLabel: string;
  nextDecadeLabel: string;
  monthPickerLabel: string;
  yearPickerLabel: string;
  weekNumberLabel: string;
  minDateTitle: string;
  maxDateTitle: string;
}

// ─── Class name overrides ─────────────────────────────────────────────────────

export interface ClassNames {
  dropdown?: string;
  inline?: string;
  header?: string;
  body?: string;
  footer?: string;

  prevButton?: string;
  nextButton?: string;
  monthButton?: string;
  yearButton?: string;
  title?: string;

  dayGrid?: string;
  monthGrid?: string;
  yearGrid?: string;
  weekdayRow?: string;
  weekdayCell?: string;
  weekNumberColumn?: string;
  weekNumberCell?: string;

  cell?: string;
  cellToday?: string;
  cellSelected?: string;
  cellInRange?: string;
  cellRangeStart?: string;
  cellRangeEnd?: string;
  cellOutOfMonth?: string;
  cellDisabled?: string;
  cellWeekend?: string;
  cellHighlighted?: string;
  cellFocused?: string;

  todayButton?: string;
  clearButton?: string;
  confirmButton?: string;
  cancelButton?: string;

  inputActive?: string;
  inputInvalid?: string;
  toggleIcon?: string;
}

// ─── Disabled dates ───────────────────────────────────────────────────────────

export type DisabledDatesFn = (date: Date) => boolean | Promise<boolean>;

// ─── Options ──────────────────────────────────────────────────────────────────

export interface DatepickerOptions {
  // Format & locale
  format?: string;
  locale?: string | LocaleConfig;
  weekStart?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  showWeekNumbers?: boolean;
  weekNumberSystem?: WeekNumberSystem;

  // Value
  value?: string | Date | null;
  defaultValue?: string | Date | null;
  minDate?: string | Date;
  maxDate?: string | Date;
  minDateTitle?: string;
  maxDateTitle?: string;
  disabledDates?: (string | Date)[] | DisabledDatesFn;
  disabledWeekdays?: number[];
  highlightedDates?: (string | Date)[];
  initialView?: CalendarView;

  // Selection mode
  mode?: SelectionMode;
  maxRangeDays?: number;
  minRangeDays?: number;
  maxSelections?: number;

  // UI / positioning
  theme?: ThemeOption;
  position?: PositionOption;
  container?: HTMLElement;
  zIndex?: number;
  animation?: AnimationOption;
  inline?: boolean;
  numberOfMonths?: 1 | 2 | 3;
  fixedHeight?: boolean;

  // Buttons / chrome
  showTodayButton?: boolean;
  showClearButton?: boolean;
  showConfirmButton?: boolean;
  showCancelButton?: boolean;
  showToggleIcon?: boolean;
  showHeader?: boolean;
  weekdayFormat?: WeekdayFormat;

  // Prev/next button content (UTF-8 arrow, SVG, or text)
  prevButtonContent?: string;
  nextButtonContent?: string;

  // Behavior
  openOnFocus?: boolean;
  closeOnSelect?: boolean;
  readonlyInput?: boolean;
  allowManualInput?: boolean;
  autofill?: boolean;
  emptyOk?: boolean;
  strictMode?: boolean;
  keepFocus?: boolean;

  // Class name overrides
  classNames?: ClassNames;

  // Async lifecycle hooks
  onBeforeOpen?: () => boolean | Promise<boolean>;
  onOpen?: (range: OpenRange) => void | Promise<void>;
  onMonthChange?: (range: OpenRange) => void | Promise<void>;
  onCellRender?: CellRenderer;
  onBeforeChange?: (next: DateValue, prev: DateValue) => boolean | Promise<boolean>;
  onBeforeMonthChange?: (nextMonth: Date, prevMonth: Date) => boolean | Promise<boolean>;
  validate?: (value: DateValue) => boolean | string | Promise<boolean | string>;

  // Sync callbacks
  onClose?: (reason: CloseReason) => void;
  onChange?: (value: string, e: DatepickerChangeEvent) => void;
  onInput?: (rawValue: string) => void;
  onInvalid?: (err: DatepickerError) => void;
  onViewChange?: (view: CalendarView) => void;
  onYearChange?: (year: number) => void;
}

export type EventHandler<T = unknown> = (detail: T) => void;
