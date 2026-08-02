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
  async onCellRender({ date, isDisabled }) {
    if (isDisabled) return {};

    const key = date.toISOString().slice(0, 10);
    const avail = window.__availability?.[key];

    if (!avail) return { disabled: true };
    if (avail.spots < 3) return { className: 'cell--limited', title: `${avail.spots} spots left` };
    if (avail.spots === 0) return { disabled: true, title: 'Fully booked' };
    return {};
  },
});
```

## CellRenderContext

```ts
interface CellRenderContext {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  isDisabled: boolean;
  isOutsideMonth: boolean;
  isRangeStart: boolean;
  isRangeEnd: boolean;
  isInRange: boolean;
  isWeekend: boolean;
}
```

## CellRenderResult

```ts
interface CellRenderResult {
  className?: string;   // extra CSS class added to the cell button
  title?: string;       // tooltip / aria-label
  badge?: string;       // small badge text inside the cell
  content?: string;     // replaces the cell button's inner HTML entirely
  disabled?: boolean;   // marks cell as disabled
  clickable?: boolean;  // false = non-interactive (removes click handler)
}
```

## Race safety

Results from a previous month are automatically discarded when the user navigates quickly. You don't need to manage this — the library uses an internal render sequence counter.
