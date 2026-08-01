# API Reference

## Constructor

```ts
new Datepicker(
  element: HTMLInputElement | string,
  options?: DatepickerOptions
): Datepicker
```

`element` can be an `HTMLInputElement` or a CSS selector string.

## Instance methods

### Open / Close

| Method | Returns | Description |
|--------|---------|-------------|
| `open()` | `Promise<void>` | Open the dropdown. Runs `onBeforeOpen` guard. |
| `close(reason?)` | `Promise<void>` | Close the dropdown. Default reason: `'api'`. |
| `toggle()` | `Promise<void>` | Toggle open/closed. |
| `isOpen()` | `boolean` | Whether the dropdown is currently open. |

### Value

| Method | Returns | Description |
|--------|---------|-------------|
| `setValue(value)` | `Promise<void>` | Set value (string, Date, or null). Runs validation. |
| `getValue()` | `string` | Current formatted value. |
| `getDate()` | `Date \| null` | Currently selected date (single mode). |
| `getDates()` | `Date[]` | Selected dates (multiple mode). |
| `getRange()` | `DateRange \| null` | Selected range (range mode). `DateRange = { from: Date, to: Date }` |
| `setRange(from, to)` | `Promise<void>` | Set range programmatically (range mode). |
| `setDates(dates)` | `Promise<void>` | Set multiple dates (multiple mode). |
| `clear()` | `Promise<void>` | Clear all selections. |
| `setToday()` | `Promise<void>` | Select today's date. |
| `isValid()` | `Promise<boolean>` | Validate current value. |

### Navigation

| Method | Returns | Description |
|--------|---------|-------------|
| `goToDate(date)` | `Promise<void>` | Navigate calendar to the month of `date`. |
| `goToMonth(month, year)` | `Promise<void>` | Navigate to given month (0-indexed) and year. |
| `goToNextMonth()` | `Promise<void>` | Go to next month. |
| `goToPrevMonth()` | `Promise<void>` | Go to previous month. |
| `goToNextYear()` | `Promise<void>` | Go to next year (same month). |
| `goToPrevYear()` | `Promise<void>` | Go to previous year (same month). |
| `switchView(view)` | `Promise<void>` | Switch calendar view: `'days' \| 'months' \| 'years'`. |

### Configuration

| Method | Returns | Description |
|--------|---------|-------------|
| `setOptions(partial)` | `void` | Merge new options at runtime. |
| `setLocale(locale)` | `void` | Change locale (string or `LocaleConfig`). |
| `setTheme(theme)` | `void` | Change theme (`'light' \| 'dark' \| 'auto'`). |
| `refresh()` | `Promise<void>` | Re-render the open calendar. No-op when closed. |
| `focus()` | `void` | Focus the input element. |

### Events

| Method | Returns | Description |
|--------|---------|-------------|
| `on(event, handler)` | `() => void` | Subscribe to an event. Returns unsubscribe function. |
| `off(event, handler)` | `void` | Unsubscribe from an event. |

### Lifecycle

| Method | Returns | Description |
|--------|---------|-------------|
| `destroy()` | `void` | Remove event listeners, clean up DOM, close dropdown. |

## Static methods

| Method | Returns | Description |
|--------|---------|-------------|
| `Datepicker.setDefaults(partial)` | `void` | Set global defaults applied to all new instances. |
| `Datepicker.registerLocale(name, config)` | `void` | Register a custom locale. |
| `Datepicker.autoInit(selector?)` | `Datepicker[]` | Init all matching elements. Default: `[data-datepicker]`. |
| `Datepicker.parse(text, format?)` | `Date \| null` | Parse a date string. |
| `Datepicker.format(date, format?)` | `string` | Format a date. |

## Format tokens

| Token | Output | Example |
|-------|--------|---------|
| `YYYY` | 4-digit year | `2026` |
| `YY` | 2-digit year | `26` |
| `MM` | 2-digit month | `07` |
| `M` | Month (no pad) | `7` |
| `DD` | 2-digit day | `04` |
| `D` | Day (no pad) | `4` |
| `HH` | 2-digit hour (24h) | `14` |
| `H` | Hour (no pad) | `14` |
| `mm` | 2-digit minutes | `05` |
| `m` | Minutes (no pad) | `5` |
| `ss` | 2-digit seconds | `09` |
| `s` | Seconds (no pad) | `9` |
