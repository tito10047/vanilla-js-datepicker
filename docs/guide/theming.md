# Theming

## CSS custom properties

The calendar uses CSS custom properties that you can override:

```css
:root {
  --vdp-bg: #ffffff;
  --vdp-text: #1a1a1a;
  --vdp-border: #e5e7eb;
  --vdp-accent: #3b82f6;
  --vdp-accent-text: #ffffff;
  --vdp-cell-hover: #eff6ff;
  --vdp-cell-range: #dbeafe;
  --vdp-radius: 8px;
  --vdp-shadow: 0 4px 24px rgba(0,0,0,.12);
  --vdp-z: 1000;
}
```

## Dark mode

Set `theme: 'dark'` or `theme: 'auto'` (follows `prefers-color-scheme`):

```ts
const dp = new Datepicker('#dp', { theme: 'dark' });
```

Switch at runtime:

```ts
dp.setTheme('dark');
```

## Overriding class names

Every element class can be replaced via the `classNames` option:

```ts
const dp = new Datepicker('#dp', {
  classNames: {
    dropdown:       'my-calendar',
    cell:           'my-cell',
    cellSelected:   'my-cell--active',
    cellToday:      'my-cell--today',
    cellDisabled:   'my-cell--off',
    cellHighlighted:'my-cell--highlight',
    cellInRange:    'my-cell--range',
    cellRangeStart: 'my-cell--start',
    cellRangeEnd:   'my-cell--end',
    inputActive:    'my-input--open',
    inputInvalid:   'my-input--error',
  },
});
```

## Animations

```ts
const dp = new Datepicker('#dp', { animation: 'slide' }); // 'fade' | 'slide' | 'none'
```

Users who prefer reduced motion automatically get no animations regardless of this setting.
