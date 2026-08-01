# Multiple Selection

```ts
import { Datepicker } from 'vanilla-js-datepicker';

const dp = new Datepicker('#dp', {
  mode: 'multiple',
  format: 'YYYY-MM-DD',
  maxSelections: 5,
  locale: 'en',
});

dp.on('vdp:change', () => {
  const dates = dp.getDates();
  console.log('Selected dates:', dates);
});
```

## Setting dates programmatically

```ts
await dp.setDates([
  new Date(2026, 6, 5),
  new Date(2026, 6, 12),
  new Date(2026, 6, 19),
]);
```

## Getting selected dates

```ts
const dates = dp.getDates(); // Date[]
```
