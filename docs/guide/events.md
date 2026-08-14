# Events

Every event fires both via the internal emitter (`dp.on(...)`) and as a native `CustomEvent` on the input element.

## Listening via `dp.on`

```ts
const off = dp.on('vdp:change', ({ value, date }) => {
  console.log('Selected:', value, date);
});

// Stop listening
off();
```

## Listening via DOM events

```ts
input.addEventListener('vdp:change', (e) => {
  const { value } = (e as CustomEvent).detail;
});
```

## Event reference

| Event | Detail payload | Description |
|-------|---------------|-------------|
| `vdp:open` | `{ view }` | Dropdown opened. |
| `vdp:close` | `{ reason }` | Dropdown closed. `reason`: `'select' \| 'escape' \| 'outside' \| 'cancel' \| 'confirm' \| 'api'` |
| `vdp:change` | `{ value, date, formatted, prev }` | Selected value changed. Note: returning `false` from this event has no effect on closing — use the `onChange` option instead. |
| `vdp:input` | `{ raw }` | User typed in the input. |
| `vdp:invalid` | `{ code, message, value }` | Invalid value rejected. `code`: `'INVALID_DATE' \| 'BELOW_MIN' \| 'ABOVE_MAX'` |
| `vdp:viewchange` | `{ from, to }` | Calendar view switched (days / months / years). |
| `vdp:monthchange` | `{ month }` | Displayed month navigated. |
| `vdp:yearchange` | `{ year }` | Displayed year navigated. |
| `vdp:dayselect` | `{ date }` | Day cell clicked (single mode). |
| `vdp:rangeselect` | `{ from, to }` | Full range selected (range mode). |
| `vdp:beforeopen` | `{}` | Cancellable (`e.preventDefault()`). |
| `vdp:beforechange` | `{ next, prev }` | Cancellable. |
| `vdp:beforemonthchange` | `{ next, prev }` | Cancellable. |
| `vdp:destroy` | `{}` | Datepicker destroyed. |
