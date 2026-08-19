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
| `setValue(value, triggerChange?)` | `Promise<void>` | Set value (string, Date, or null). Runs validation. |
| `getValue()` | `string` | Current formatted value. |
| `getDate()` | `Date \| null` | Currently selected date (single mode). |
| `getDates()` | `Date[]` | Selected dates (multiple mode). |
| `getRange()` | `DateRange \| null` | Selected range (range mode). `DateRange = { from: Date, to: Date }` |
| `setRange(from, to, triggerChange?)` | `Promise<void>` | Set range programmatically (range mode). |
| `setDates(dates, triggerChange?)` | `Promise<void>` | Set multiple dates (multiple mode). |
| `clear(triggerChange?)` | `Promise<void>` | Clear all selections. |
| `setToday(triggerChange?)` | `Promise<void>` | Select today's date. |
| `isValid()` | `Promise<boolean>` | Validate current value. |

#### Programmatic changes and `onChange`

`setValue`, `setRange`, `setDates`, `clear` and `setToday` are **silent by default**: calling them from your own code does *not* fire `onChange` (or the `vdp:change` event). This mirrors how setting a native `input.value` from script never fires a `change` event, and matches flatpickr's `setDate(date, triggerChange)` convention — so inside `onChange` you never have to guess whether the update came from the user or from your own code, because your own code simply doesn't trigger it unless you ask it to.

Pass `true` as the last argument to opt in and notify listeners same as a user-driven change would:

```ts
// silent — onChange is NOT called
await dp.setValue('2026-09-01')

// explicit opt-in — onChange IS called, just like a user pick
await dp.setValue('2026-09-01', true)
```

Selections made by the user (clicking a day, the Today button, typing + blur, the Clear button) always notify — this flag only affects calls you make from your own code.

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
| `Datepicker.getInstance(el)` | `Datepicker \| null` | Return the existing instance attached to `el` (element or CSS selector), or `null` if none. |
| `Datepicker.setDefaults(partial)` | `void` | Set global defaults applied to all new instances. |
| `Datepicker.registerLocale(name, config)` | `void` | Register a custom locale. |
| `Datepicker.autoInit(selector?)` | `Datepicker[]` | Init all matching elements. Default: `[data-datepicker]`. |
| `Datepicker.parse(text, format?)` | `Date \| null` | Parse a date string. |
| `Datepicker.format(date, format?)` | `string` | Format a date. |

### `Datepicker.getInstance`

Retrieves the `Datepicker` instance previously created on a given input element. Returns `null` if the element has no associated instance (not yet initialised, or already destroyed).

```ts
Datepicker.getInstance(el: HTMLInputElement | string): Datepicker | null
```

Useful when you need to control a datepicker from code that doesn't hold a reference to the original instance — for example inside a framework component, an event handler, or a third-party plugin.

```ts
// by CSS selector
Datepicker.getInstance('#arrival')?.setValue('2026-09-01')

// by element reference
const input = document.querySelector<HTMLInputElement>('#arrival')!
Datepicker.getInstance(input)?.open()

// safe null-check
const dp = Datepicker.getInstance('#arrival')
if (dp) {
  console.log(dp.getValue())
}
```

The registry uses a `WeakMap` internally, so destroyed instances and detached elements are garbage-collected without any manual cleanup.

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
