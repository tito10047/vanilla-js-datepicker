# Range Picker

```html
<input id="dp-range" type="text" placeholder="Select date range" />
```

```ts
import { Datepicker } from '@tito10047/vanilla-js-datepicker';

const dp = new Datepicker('#dp-range', {
  mode: 'range',
  format: 'YYYY-MM-DD',
  locale: 'en',
  minRangeDays: 2,
  maxRangeDays: 30,
  showClearButton: true,
});

dp.on('vdp:change', ({ date }) => {
  const range = dp.getRange();
  if (range) {
    console.log('From:', range.from, 'To:', range.to);
  }
});
```

## Setting a range programmatically

```ts
await dp.setRange(new Date(2026, 6, 1), new Date(2026, 6, 15));
```

## Getting the range

```ts
const range = dp.getRange(); // { from: Date, to: Date } | null
```
