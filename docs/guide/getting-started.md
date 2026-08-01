# Getting Started

## Installation

```bash
npm install vanilla-js-datepicker
```

## Basic usage

```html
<input id="dp" type="text" />
```

```ts
import { Datepicker } from 'vanilla-js-datepicker';
import 'vanilla-js-datepicker/dist/datepicker.css';

const dp = new Datepicker('#dp', {
  format: 'YYYY-MM-DD',
  locale: 'en',
});
```

## CDN (UMD)

```html
<link rel="stylesheet" href="https://unpkg.com/vanilla-js-datepicker/dist/datepicker.css" />
<script src="https://unpkg.com/vanilla-js-datepicker/dist/datepicker.umd.js"></script>
<script>
  const dp = new VanillaDatepicker.Datepicker('#dp', { locale: 'en' });
</script>
```

## Auto-init via data attributes

```html
<input data-datepicker data-datepicker-options='{"locale":"en"}' />
```

```ts
import { Datepicker } from 'vanilla-js-datepicker';
Datepicker.autoInit(); // initialises all [data-datepicker] elements
```

## Cleanup

Always call `destroy()` when removing the element from the DOM to prevent memory leaks:

```ts
dp.destroy();
```
