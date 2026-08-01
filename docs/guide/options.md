# Options

All options are passed as the second argument to `new Datepicker(el, options)`.

## Core

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `format` | `string` | `'YYYY-MM-DD'` | Date format string. Tokens: `YYYY MM DD HH mm ss`. |
| `locale` | `string \| LocaleConfig` | `'sk'` | Locale identifier or full locale config object. |
| `value` | `string \| Date` | — | Initial selected date. |
| `defaultValue` | `string \| Date` | — | Alias for `value` (used when `value` is uncontrolled). |
| `mode` | `'single' \| 'range' \| 'multiple'` | `'single'` | Selection mode. |
| `theme` | `'light' \| 'dark' \| 'auto'` | `'auto'` | Color theme. |

## Constraints

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `minDate` | `string \| Date` | — | Earliest selectable date. |
| `maxDate` | `string \| Date` | — | Latest selectable date. |
| `disabledDates` | `Date[] \| ((d: Date) => boolean \| Promise<boolean>)` | — | Specific dates or predicate to disable. |
| `disabledWeekdays` | `number[]` | `[]` | Weekday indices to disable (0=Sun … 6=Sat). |
| `maxRangeDays` | `number` | `0` | Max span of a range selection (0 = unlimited). |
| `minRangeDays` | `number` | `0` | Min span of a range selection. |
| `maxSelections` | `number` | `0` | Max number of multiple selections (0 = unlimited). |

## Display

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `position` | `'auto' \| 'top' \| 'bottom' \| 'left' \| 'right'` | `'auto'` | Dropdown placement. |
| `zIndex` | `number` | `1000` | z-index of the dropdown. |
| `animation` | `'fade' \| 'slide' \| 'none'` | `'fade'` | Open/close animation. |
| `inline` | `boolean` | `false` | Render calendar inline (always visible). |
| `numberOfMonths` | `number` | `1` | Number of months visible side-by-side. |
| `fixedHeight` | `boolean` | `false` | Always render 6 rows (prevents layout shift). |
| `showWeekNumbers` | `boolean` | `false` | Show ISO week number column. |
| `weekNumberSystem` | `'iso' \| 'us'` | `'iso'` | Week numbering system. |
| `weekStart` | `0-6` | locale default | First day of week (0=Sun, 1=Mon …). |
| `weekdayFormat` | `'short' \| 'narrow' \| 'long'` | `'short'` | Weekday header format. |
| `showTodayButton` | `boolean` | `false` | Show "Today" footer button. |
| `showClearButton` | `boolean` | `false` | Show "Clear" footer button. |
| `showConfirmButton` | `boolean` | `false` | Show "OK" confirm button (defers selection). |
| `showCancelButton` | `boolean` | `false` | Show "Cancel" button. |
| `showToggleIcon` | `boolean` | `true` | Show calendar icon in input (via CSS). |
| `showHeader` | `boolean` | `true` | Show month/year navigation header. |
| `highlightedDates` | `Date[]` | — | Dates to mark with `vdp-cell--highlighted` class. |

## Behaviour

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `openOnFocus` | `boolean` | `true` | Open dropdown on input focus. |
| `closeOnSelect` | `boolean` | `true` | Close after date selection. |
| `allowManualInput` | `boolean` | `true` | Allow typing in the input field. |
| `readonlyInput` | `boolean` | `false` | Make input read-only. |
| `autofill` | `boolean` | `true` | Parse + format raw input on blur. |
| `strictMode` | `boolean` | `false` | Fire `vdp:invalid` on blur if text can't be parsed. |
| `emptyOk` | `boolean` | `true` | Allow empty value. |
| `keepFocus` | `boolean` | `false` | Return focus to input after close. |
| `initialView` | `'days' \| 'months' \| 'years'` | `'days'` | Which view to open on. |
| `container` | `HTMLElement` | `document.body` | Portal target for the dropdown. |

## Callbacks

| Option | Signature | Description |
|--------|-----------|-------------|
| `onOpen` | `({ from, to }: OpenRange) => void \| Promise<void>` | Called once when calendar opens, with the visible date range. |
| `onClose` | `(reason: CloseReason) => void` | Called when calendar closes. |
| `onChange` | `(value: string, event: DatepickerChangeEvent) => void` | Called when selected date changes. |
| `onInput` | `(raw: string) => void` | Called on every keystroke in the input. |
| `onInvalid` | `(error: DatepickerError) => void` | Called when an invalid value is rejected. |
| `onViewChange` | `(view: CalendarView) => void` | Called when the calendar view changes. |
| `onMonthChange` | `(month: Date) => void` | Called when the displayed month changes. |
| `onYearChange` | `(year: number) => void` | Called when the displayed year changes. |
| `onCellRender` | `(ctx: CellRenderContext) => CellRenderResult \| Promise<CellRenderResult>` | Called per visible day cell for async customisation. |
| `onBeforeOpen` | `() => boolean \| Promise<boolean>` | Return `false` to cancel opening. |
| `onBeforeChange` | `(next: Date, prev: Date \| null) => boolean \| Promise<boolean>` | Return `false` to cancel selection. |
| `onBeforeMonthChange` | `(next: Date, prev: Date) => boolean \| Promise<boolean>` | Return `false` to cancel navigation. |
| `validate` | `(date: Date) => boolean \| string \| Promise<boolean \| string>` | Custom validation; return `false` or error string to reject. |

## Appearance

| Option | Type | Description |
|--------|------|-------------|
| `classNames` | `Partial<ClassNames>` | Override any default class name. See [Theming](/guide/theming). |
| `prevButtonContent` | `string` | HTML for the previous-month button (default: SVG arrow). |
| `nextButtonContent` | `string` | HTML for the next-month button (default: SVG arrow). |
