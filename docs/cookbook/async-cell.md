# Async Cell Rendering

Use `onCellRender` to asynchronously customise individual day cells — perfect for loading availability data from an API.

## Fetching data on open and on navigation

`onOpen` fires once when the calendar first opens. `onMonthChange` fires every time the user navigates to a different month. Both receive `{ from, to }` — the visible date range — and are awaited before `onCellRender` runs, so the data is ready by the time cells are decorated.

```ts
import { Datepicker } from '@tito10047/vanilla-js-datepicker';

let availability: Record<string, { spots: number }> = {};

async function loadMonth({ month, from, to }: { month: Date; from: Date; to: Date }) {
  // month  — 1st day of the displayed month (e.g. 2026-08-01)
  // from   — first visible cell (may be from the previous month)
  // to     — last visible cell (may be from the next month)
  availability = await fetchAvailability(from, to);
}

const dp = new Datepicker('#dp', {
  locale: 'en',
  onOpen: loadMonth,
  onMonthChange: loadMonth,
  async onCellRender(date, { isDisabled }) {
    if (isDisabled) return {};

    const key = date.toISOString().slice(0, 10);
    const avail = availability[key];

    if (!avail) return { clickable: false };
    if (avail.spots === 0) return { clickable: false, title: 'Fully booked' };
    if (avail.spots < 3) return { className: 'cell--limited', title: `${avail.spots} spots left` };
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
