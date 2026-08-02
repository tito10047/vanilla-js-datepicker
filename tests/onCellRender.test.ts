import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Datepicker } from '../src/core/Datepicker';

function makeInput(): HTMLInputElement {
  const el = document.createElement('input');
  el.type = 'text';
  document.body.appendChild(el);
  return el;
}

let input: HTMLInputElement;
let dp: Datepicker;

afterEach(() => {
  dp?.destroy();
  document.body.innerHTML = '';
});

// ─── onCellRender ────────────────────────────────────────────────────────────

describe('onCellRender — basic invocation', () => {
  it('is called for each of the 42 grid cells on open', async () => {
    input = makeInput();
    const onCellRender = vi.fn().mockResolvedValue({});
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, onCellRender });
    await dp.open();
    expect(onCellRender).toHaveBeenCalledTimes(42);
  });

  it('receives Date and context object', async () => {
    input = makeInput();
    const onCellRender = vi.fn().mockResolvedValue({});
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, onCellRender });
    await dp.open();
    const [date, ctx] = onCellRender.mock.calls[0]!;
    expect(date).toBeInstanceOf(Date);
    expect(ctx).toHaveProperty('inMonth');
    expect(ctx).toHaveProperty('isToday');
    expect(ctx).toHaveProperty('isSelected');
    expect(ctx).toHaveProperty('isWeekend');
    expect(ctx).toHaveProperty('isDisabled');
  });

  it('context.isSelected is true for the selected date', async () => {
    input = makeInput();
    const onCellRender = vi.fn().mockResolvedValue({});
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, onCellRender, value: '2026-07-15' });
    await dp.open();
    const selectedCall = onCellRender.mock.calls.find(([d]) => {
      return d instanceof Date && d.getDate() === 15 && d.getMonth() === 6 && d.getFullYear() === 2026;
    });
    expect(selectedCall).toBeDefined();
    expect(selectedCall![1].isSelected).toBe(true);
  });
});

describe('onCellRender — className result applied', () => {
  it('adds className string to the cell element', async () => {
    input = makeInput();
    dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      value: '2026-07-15',
      onCellRender: (date) => {
        if (date.getDate() === 10 && date.getMonth() === 6) return { className: 'my-special-day' };
        return {};
      },
    });
    await dp.open();
    const btn = document.querySelector<HTMLElement>('[data-date="2026-07-10"]');
    expect(btn).not.toBeNull();
    expect(btn!.classList.contains('my-special-day')).toBe(true);
  });

  it('adds multiple classNames from array result', async () => {
    input = makeInput();
    dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      value: '2026-07-15',
      onCellRender: (date) => {
        if (date.getDate() === 5 && date.getMonth() === 6) return { className: ['foo', 'bar'] };
        return {};
      },
    });
    await dp.open();
    const btn = document.querySelector<HTMLElement>('[data-date="2026-07-05"]');
    expect(btn!.classList.contains('foo')).toBe(true);
    expect(btn!.classList.contains('bar')).toBe(true);
  });
});

describe('onCellRender — title result applied', () => {
  it('sets title attribute on the cell', async () => {
    input = makeInput();
    dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      value: '2026-07-15',
      onCellRender: (date) => {
        if (date.getDate() === 20 && date.getMonth() === 6) return { title: 'Holiday!' };
        return {};
      },
    });
    await dp.open();
    const btn = document.querySelector<HTMLElement>('[data-date="2026-07-20"]');
    expect(btn!.title).toBe('Holiday!');
    expect(btn!.getAttribute('aria-label')).toBe('Holiday!');
  });
});

describe('onCellRender — badge result applied', () => {
  it('appends a badge span inside the cell', async () => {
    input = makeInput();
    dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      value: '2026-07-15',
      onCellRender: (date) => {
        if (date.getDate() === 3 && date.getMonth() === 6) return { badge: '3' };
        return {};
      },
    });
    await dp.open();
    const btn = document.querySelector<HTMLElement>('[data-date="2026-07-03"]');
    const badge = btn!.querySelector('.vdp-badge');
    expect(badge).not.toBeNull();
    expect(badge!.textContent).toBe('3');
  });
});

describe('onCellRender — clickable=false disables cell', () => {
  it('marks cell as disabled when clickable=false', async () => {
    input = makeInput();
    dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      value: '2026-07-15',
      onCellRender: (date) => {
        if (date.getDate() === 25 && date.getMonth() === 6) return { clickable: false };
        return {};
      },
    });
    await dp.open();
    const btn = document.querySelector<HTMLElement>('[data-date="2026-07-25"]');
    expect(btn!.getAttribute('aria-disabled')).toBe('true');
    expect(btn!.classList.contains('vdp-cell--disabled')).toBe(true);
  });
});

describe('onCellRender — content result applied', () => {
  it('replaces cell text content', async () => {
    input = makeInput();
    dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      value: '2026-07-15',
      onCellRender: (date) => {
        if (date.getDate() === 1 && date.getMonth() === 6) return { content: '①' };
        return {};
      },
    });
    await dp.open();
    const btn = document.querySelector<HTMLElement>('[data-date="2026-07-01"]');
    expect(btn!.textContent).toBe('①');
  });
});

describe('onCellRender — async (Promise-returning)', () => {
  it('waits for async onCellRender before applying', async () => {
    input = makeInput();
    dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      value: '2026-07-15',
      onCellRender: async (date) => {
        await new Promise((r) => setTimeout(r, 0));
        if (date.getDate() === 7 && date.getMonth() === 6) return { className: 'async-class' };
        return {};
      },
    });
    await dp.open();
    const btn = document.querySelector<HTMLElement>('[data-date="2026-07-07"]');
    expect(btn!.classList.contains('async-class')).toBe(true);
  });
});

// ─── onCellRender race guard ─────────────────────────────────────────────────

describe('onCellRender — race guard discards stale results', () => {
  it('does not apply old month results after month navigation', async () => {
    input = makeInput();

    // Block the FIRST batch of cells using callbacks, then let subsequent renders through.
    // Using a flag (not date.getMonth()) avoids deadlock from cells shared between month grids.
    const firstRenderCallbacks: Array<() => void> = [];
    let isFirstRender = true;

    dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      value: '2026-07-15',
      onCellRender: async (_date) => {
        if (isFirstRender) {
          await new Promise<void>((res) => firstRenderCallbacks.push(res));
          return { className: 'stale-july-class' };
        }
        return {};
      },
    });

    // Start open — open() will yield at runGuard, then synchronously reach
    // await Promise.all in applyRenderResults, populating firstRenderCallbacks
    const openPromise = dp.open();

    // Yield once so open() runs through runGuard and reaches the blocked Promise.all.
    // After this microtask turn, firstRenderCallbacks has 42 entries.
    await Promise.resolve();

    // Flip flag before navigating so the August grid cells don't block
    isFirstRender = false;

    // Navigate to August — refresh() will re-render and run a non-blocking applyRenderResults
    await dp.goToNextMonth();

    // Resolve the stale first-batch cells — race guard should discard them
    firstRenderCallbacks.forEach((cb) => cb());

    // Wait for open() to complete (it was blocked on the stale cells)
    await openPromise;

    // Stale July results must not appear in the DOM
    const stale = document.querySelector('.stale-july-class');
    expect(stale).toBeNull();
  }, 10000);
});

// ─── onOpen ──────────────────────────────────────────────────────────────────

describe('onOpen callback', () => {
  it('is called with visible date range on open', async () => {
    input = makeInput();
    const onOpen = vi.fn().mockResolvedValue(undefined);
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, onOpen });
    await dp.open();
    expect(onOpen).toHaveBeenCalledOnce();
    const range = onOpen.mock.calls[0][0];
    expect(range).toHaveProperty('from');
    expect(range).toHaveProperty('to');
    expect(range.from).toBeInstanceOf(Date);
    expect(range.to).toBeInstanceOf(Date);
    expect(range.from <= range.to).toBe(true);
  });

  it('onOpen range covers the whole visible grid (from ≤ 1st of month, to ≥ last of month)', async () => {
    input = makeInput();
    const onOpen = vi.fn().mockResolvedValue(undefined);
    dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      onOpen,
      value: '2026-07-15',
    });
    await dp.open();
    const { from, to } = onOpen.mock.calls[0][0];
    const firstOfMonth = new Date(2026, 6, 1);
    const lastOfMonth = new Date(2026, 6, 31);
    expect(from <= firstOfMonth).toBe(true);
    expect(to >= lastOfMonth).toBe(true);
  });

  it('onOpen range includes month — first day of the displayed month', async () => {
    input = makeInput();
    const onOpen = vi.fn().mockResolvedValue(undefined);
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, onOpen, value: '2026-07-15' });
    await dp.open();
    const { month } = onOpen.mock.calls[0][0];
    expect(month).toBeInstanceOf(Date);
    expect(month.getFullYear()).toBe(2026);
    expect(month.getMonth()).toBe(6); // July = 6
    expect(month.getDate()).toBe(1);
  });

  it('onOpen is NOT called again on month navigation', async () => {
    input = makeInput();
    const onOpen = vi.fn().mockResolvedValue(undefined);
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, onOpen });
    await dp.open();
    await dp.goToNextMonth();
    // onOpen fires once on calendar open; month navigation uses onMonthChange
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
