# vanilla-js-datepicker

[![Test](https://github.com/tito10047/vanilla-js-datepicker/actions/workflows/test.yml/badge.svg)](https://github.com/tito10047/vanilla-js-datepicker/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/vanilla-js-datepicker.svg)](https://www.npmjs.com/package/vanilla-js-datepicker)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

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

---

## License

MIT © 2026 tito10047
