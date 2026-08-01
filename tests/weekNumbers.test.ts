import { describe, it, expect, afterEach } from 'vitest';
import { Datepicker } from '../src/core/Datepicker';

function makeInput(): HTMLInputElement {
  const el = document.createElement('input');
  el.type = 'text';
  document.body.appendChild(el);
  return el;
}

afterEach(() => {
  document.body.innerHTML = '';
});

// ─── showWeekNumbers ──────────────────────────────────────────────────────────

describe('showWeekNumbers', () => {
  it('does not show week number column by default', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    await dp.open();
    expect(document.querySelector('.vdp-wn-cell')).toBeNull();
    await dp.close();
    dp.destroy();
  });

  it('shows week number column when enabled', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, showWeekNumbers: true });
    await dp.open();
    const wnCells = document.querySelectorAll('.vdp-wn-cell');
    expect(wnCells.length).toBeGreaterThan(0);
    await dp.close();
    dp.destroy();
  });

  it('shows correct ISO week number for year-end edge case (2025-12-29 = W1 2026)', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      showWeekNumbers: true,
      weekNumberSystem: 'iso',
      value: '2025-12-29',
    });
    await dp.open();

    // Dec 29, 2025 is a Monday — first day of ISO week 1 of 2026
    // The row for Dec 29 should show week number 1
    const wn1 = Array.from(document.querySelectorAll('.vdp-wn-cell')).find(
      (el) => el.getAttribute('aria-label')?.includes('1') && el.textContent?.trim() === '1',
    );
    expect(wn1).toBeDefined();
    await dp.close();
    dp.destroy();
  });

  it('has columnheader role on header week number cell', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, showWeekNumbers: true });
    await dp.open();
    const headerWn = document.querySelector('.vdp-weekday-row .vdp-wn-cell');
    expect(headerWn?.getAttribute('role')).toBe('columnheader');
    await dp.close();
    dp.destroy();
  });

  it('has rowheader role on row week number cells', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, showWeekNumbers: true });
    await dp.open();
    const rowWns = document.querySelectorAll('.vdp-day-grid .vdp-wn-cell');
    expect(rowWns.length).toBe(6); // 6 rows
    rowWns.forEach((el) => expect(el.getAttribute('role')).toBe('rowheader'));
    await dp.close();
    dp.destroy();
  });
});
