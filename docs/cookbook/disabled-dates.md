# Disabled Dates

## Array of specific dates

```ts
const dp = new Datepicker('#dp', {
  disabledDates: [
    new Date(2026, 6, 4),  // July 4th
    new Date(2026, 6, 14), // July 14th
  ],
});
```

## Predicate function (sync or async)

```ts
const dp = new Datepicker('#dp', {
  disabledDates: async (date) => {
    // Disable all Fridays and weekends booked from server
    if (date.getDay() === 5) return true;
    const booked = await checkIfBooked(date);
    return booked;
  },
});
```

## Disable weekdays

```ts
const dp = new Datepicker('#dp', {
  disabledWeekdays: [0, 6], // Sundays and Saturdays
});
```

## minDate / maxDate

```ts
const dp = new Datepicker('#dp', {
  minDate: '2026-07-01',
  maxDate: new Date(2026, 11, 31),
});
```

When a value outside this range is typed or set programmatically, `vdp:invalid` fires:

```ts
dp.on('vdp:invalid', ({ code, message, value }) => {
  // code: 'BELOW_MIN' | 'ABOVE_MAX' | 'INVALID_DATE'
  console.error(code, message);
});
```
