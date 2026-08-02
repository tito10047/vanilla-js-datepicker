# Async Cell Rendering

Use `onCellRender` to asynchronously customise individual day cells — perfect for loading availability data from an API.

```ts
import { Datepicker } from '@tito10047/vanilla-js-datepicker';

const dp = new Datepicker('#dp', {
  locale: 'en',
  async onOpen({ from, to }) {
    // Fetch availability for the visible month range
    const data = await fetchAvailability(from, to);
    window.__availability = data;
  },
  async onCellRender(date, { isDisabled }) {
    if (isDisabled) return {};

    const key = date.toISOString().slice(0, 10);
    const avail = window.__availability?.[key];

    if (!avail) return { clickable: false };
    if (avail.spots < 3) return { className: 'cell--limited', title: `${avail.spots} spots left` };
    if (avail.spots === 0) return { clickable: false, title: 'Fully booked' };
    return {};
  },
});
```

## CellRenderContext

```ts
interface CellRenderContext {
  view: 'days' | 'months' | 'years';
  inMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  isDisabled: boolean;
  isWeekend: boolean;
  isHighlighted: boolean;
}
```

## CellRenderResult

```ts
interface CellRenderResult {
  className?: string | string[];  // extra CSS class(es) added to the cell button
  title?: string;                 // tooltip / aria-label
  badge?: string;                 // small badge text inside the cell
  content?: string;               // replaces the cell button's inner HTML entirely
  clickable?: boolean;            // false = non-interactive (marks cell as disabled)
}
```

## Race safety

Results from a previous month are automatically discarded when the user navigates quickly. You don't need to manage this — the library uses an internal render sequence counter.
