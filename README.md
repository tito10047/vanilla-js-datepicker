# vanilla-js-datepicker

[![Test](https://github.com/tito10047/vanilla-js-datepicker/actions/workflows/test.yml/badge.svg)](https://github.com/tito10047/vanilla-js-datepicker/actions/workflows/test.yml)
[![Deploy Docs & Demo](https://github.com/tito10047/vanilla-js-datepicker/actions/workflows/docs.yml/badge.svg)](https://github.com/tito10047/vanilla-js-datepicker/actions/workflows/docs.yml)
[![npm version](https://img.shields.io/npm/v/vanilla-js-datepicker.svg)](https://www.npmjs.com/package/vanilla-js-datepicker)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**[📖 Documentation](https://tito10047.github.io/vanilla-js-datepicker/) · [▶ Live Demo](https://tito10047.github.io/vanilla-js-datepicker/demo/)**

Lightweight, dependency-free date picker for vanilla JavaScript and TypeScript.

---

## Features

- **Zero dependencies** — no jQuery, no Moment, no framework required.
- **TypeScript first** — written in TypeScript, ships full declaration files.
- **Async lifecycle hooks** — `onBeforeOpen`, `onOpen`, `onCellRender`, `onBeforeChange`, and `validate` accept Promises.
- **Instant calendar render** — calendar appears immediately; `onCellRender` decorates cells asynchronously without blocking the UI.
- **Range & multi-date selection** — `mode: 'range'` or `mode: 'multiple'`.
- **Fully customizable CSS classes** — every DOM element's class is configurable via `classNames` option (Tailwind-friendly).
- **Fully accessible** — ARIA `combobox`, `dialog`, `grid` roles; full keyboard navigation.
- **CSS-variable theming** — light, dark, and auto (system) themes.
- **Internationalization** — built-in SK, EN, CS, DE; register any custom locale.
- **Multiple formats** — ESM, CommonJS, and UMD builds.

---

## Installation

```bash
npm install vanilla-js-datepicker
```

## Quick start

```ts
import { Datepicker } from 'vanilla-js-datepicker'
import 'vanilla-js-datepicker/dist/datepicker.css'

const dp = new Datepicker('#departure', {
  format: 'DD.MM.YYYY',
  locale: 'sk',
  showTodayButton: true,
  showClearButton: true,
  onChange: (value) => {
    console.log('Selected:', value)
  },
})
```

```html
<input id="departure" type="text" placeholder="DD.MM.YYYY" />
```

## CDN (no build step)

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vanilla-js-datepicker/dist/datepicker.css" />
<script type="module">
  import { Datepicker } from 'https://cdn.jsdelivr.net/npm/vanilla-js-datepicker/dist/datepicker.esm.js'
  new Datepicker('#date', { showTodayButton: true })
</script>
```

---

## Documentation

Full documentation: [https://tito10047.github.io/vanilla-js-datepicker/](https://tito10047.github.io/vanilla-js-datepicker/)

Live demo (12 interactive examples): [https://tito10047.github.io/vanilla-js-datepicker/demo/](https://tito10047.github.io/vanilla-js-datepicker/demo/)

- [Getting Started](https://tito10047.github.io/vanilla-js-datepicker/guide/getting-started)
- [Options](https://tito10047.github.io/vanilla-js-datepicker/guide/options)
- [Events](https://tito10047.github.io/vanilla-js-datepicker/guide/events)
- [Localization](https://tito10047.github.io/vanilla-js-datepicker/guide/localization)
- [Theming](https://tito10047.github.io/vanilla-js-datepicker/guide/theming)
- [API Reference](https://tito10047.github.io/vanilla-js-datepicker/api)
- Cookbook:
  - [Range Picker](https://tito10047.github.io/vanilla-js-datepicker/cookbook/range)
  - [Multiple Selection](https://tito10047.github.io/vanilla-js-datepicker/cookbook/multiple)
  - [Async Cell Render](https://tito10047.github.io/vanilla-js-datepicker/cookbook/async-cell)
  - [Disabled Dates](https://tito10047.github.io/vanilla-js-datepicker/cookbook/disabled-dates)
  - [Inline Calendar](https://tito10047.github.io/vanilla-js-datepicker/cookbook/inline)

---

## License

MIT © 2026 tito10047
