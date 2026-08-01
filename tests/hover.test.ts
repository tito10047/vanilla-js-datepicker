import { describe, it, expect, afterEach, vi } from 'vitest';
import { Datepicker } from '../src/core/Datepicker';

function makeInput(): HTMLInputElement {
  const el = document.createElement('input');
  el.type = 'text';
  document.body.appendChild(el);
  return el;
}

function mouseenter(el: Element): void {
  el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false, cancelable: false }));
}

afterEach(() => {
  document.body.innerHTML = '';
});

// ─── hover does NOT re-render in single mode ──────────────────────────────────

describe('mouseenter in single mode', () => {
  it('does NOT detach the cell from DOM on mouseenter', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, value: '2026-07-15' });
    await dp.open();

    const cell = document.querySelector('[data-date="2026-07-15"]') as HTMLElement;
    expect(cell).not.toBeNull();

    // Fire mouseenter — should NOT trigger re-render that detaches cell
    mouseenter(cell);

    // Cell must still be in the DOM (connected)
    expect(cell.isConnected).toBe(true);
    await dp.close();
    dp.destroy();
  });

  it('firing mouseenter twice keeps the cell stable', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, value: '2026-07-15' });
    await dp.open();

    const cell = document.querySelector('[data-date="2026-07-20"]') as HTMLElement;
    mouseenter(cell);
    mouseenter(cell);

    // Still connected after two rapid mousenter events
    expect(document.querySelector('[data-date="2026-07-20"]')).not.toBeNull();
    await dp.close();
    dp.destroy();
  });

  it('cell click handler still fires after mouseenter', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, value: '2026-07-15' });
    await dp.open();

    const cell = document.querySelector('[data-date="2026-07-20"]') as HTMLButtonElement;
    mouseenter(cell);

    // Cell must still be clickable (in DOM and connected)
    expect(cell.isConnected).toBe(true);
    cell.click();

    // Click handler is async — wait for value to propagate
    await vi.waitFor(() => expect(dp.getValue()).toBe('2026-07-20'), { timeout: 500 });
    dp.destroy();
  });
});

// ─── hover in range mode (preview re-render) ─────────────────────────────────

describe('mouseenter in range mode', () => {
  it('does NOT re-render before first click (idle phase)', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, mode: 'range', value: '2026-07-01' });
    await dp.open();

    const cell = document.querySelector('[data-date="2026-07-15"]') as HTMLElement;
    mouseenter(cell);

    // Cell still connected (no re-render)
    expect(cell.isConnected).toBe(true);
    await dp.close();
    dp.destroy();
  });

  it('re-renders exactly once on first hover after range start is set', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, mode: 'range', value: '2026-07-01' });
    await dp.open();

    // Click first date to start range selection
    const cell10 = document.querySelector('[data-date="2026-07-10"]') as HTMLButtonElement;
    cell10.click();
    // Phase is now 'selecting'

    // Hover over another cell — should re-render once (preview)
    const cell20 = document.querySelector('[data-date="2026-07-20"]') as HTMLElement;
    mouseenter(cell20);

    // After ONE re-render, the new cell20 should be in the DOM
    const cell20After = document.querySelector('[data-date="2026-07-20"]') as HTMLElement;
    expect(cell20After).not.toBeNull();

    // Fire mouseenter again on the same cell — should NOT re-render (same hover date)
    mouseenter(cell20After);
    const cell20AfterSecond = document.querySelector('[data-date="2026-07-20"]') as HTMLElement;
    // The element should be the SAME object (not a new one from re-render)
    expect(cell20AfterSecond).toBe(cell20After);

    await dp.close();
    dp.destroy();
  });

  it('second click in range mode completes the range', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, mode: 'range' });
    await dp.open();

    // Navigate to July 2026
    await dp.goToMonth(6, 2026);

    const cell5 = document.querySelector('[data-date="2026-07-05"]') as HTMLButtonElement;
    const cell15 = document.querySelector('[data-date="2026-07-15"]') as HTMLButtonElement;

    // Hover (idle phase) — no re-render
    mouseenter(cell5);
    expect(cell5.isConnected).toBe(true);

    // First click — starts range
    cell5.click();

    // Hover over second date — one re-render (preview)
    const newCell15 = document.querySelector('[data-date="2026-07-15"]') as HTMLButtonElement;
    mouseenter(newCell15);

    // Hover again — no re-render (same hover date)
    const sameCell15 = document.querySelector('[data-date="2026-07-15"]') as HTMLButtonElement;
    mouseenter(sameCell15);
    expect(document.querySelector('[data-date="2026-07-15"]')).toBe(sameCell15);

    // Second click — completes range
    sameCell15.click();
    const range = dp.getRange();
    expect(range).not.toBeNull();
    expect(range!.from.getDate()).toBe(5);
    expect(range!.to.getDate()).toBe(15);

    dp.destroy();
  });
});
