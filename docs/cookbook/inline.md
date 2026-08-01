# Inline Calendar

Render the calendar permanently inside a container instead of a floating dropdown.

```html
<div id="calendar-container"></div>
```

```ts
import { Datepicker } from 'vanilla-js-datepicker';

// For inline mode, pass a hidden input or a div
const input = document.createElement('input');
input.type = 'hidden';
document.getElementById('calendar-container')!.appendChild(input);

const dp = new Datepicker(input, {
  inline: true,
  container: document.getElementById('calendar-container')!,
  locale: 'en',
  format: 'YYYY-MM-DD',
});

// Opens immediately and cannot be closed
await dp.open();

dp.on('vdp:change', ({ value }) => {
  console.log('Picked:', value);
});
```

The inline calendar opens automatically and cannot be closed by clicking outside or pressing Escape.
