import { describe, it, expect, vi, afterEach } from 'vitest';
import { Datepicker } from '../src/core/Datepicker';

function makeInput(): HTMLInputElement {
  const el = document.createElement('input');
  el.type = 'text';
  document.body.appendChild(el);
  return el;
}

let dp: Datepicker | null = null;
let input: HTMLInputElement;

afterEach(async () => {
  if (dp) { await dp.close(); dp.destroy(); dp = null; }
  document.body.innerHTML = '';
});

// ─── onMonthChange ────────────────────────────────────────────────────────────

describe('onMonthChange — invocation', () => {
  it('is called when goToNextMonth() is called', async () => {
    input = makeInput();
    const onMonthChange = vi.fn().mockResolvedValue(undefined);
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, onMonthChange, value: '2026-07-15' });
    await dp.open();
    await dp.goToNextMonth();
    expect(onMonthChange).toHaveBeenCalledTimes(1);
  });

  it('is called when goToPrevMonth() is called', async () => {
    input = makeInput();
    const onMonthChange = vi.fn().mockResolvedValue(undefined);
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, onMonthChange, value: '2026-07-15' });
    await dp.open();
    await dp.goToPrevMonth();
    expect(onMonthChange).toHaveBeenCalledTimes(1);
  });

  it('is NOT called on initial calendar open', async () => {
    input = makeInput();
    const onMonthChange = vi.fn().mockResolvedValue(undefined);
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, onMonthChange });
    await dp.open();
    expect(onMonthChange).toHaveBeenCalledTimes(0);
  });

  it('is called multiple times for multiple navigations', async () => {
    input = makeInput();
    const onMonthChange = vi.fn().mockResolvedValue(undefined);
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, onMonthChange, value: '2026-07-15' });
    await dp.open();
    await dp.goToNextMonth();
    await dp.goToNextMonth();
    await dp.goToPrevMonth();
    expect(onMonthChange).toHaveBeenCalledTimes(3);
  });
});

describe('onMonthChange — argument shape { from, to }', () => {
  it('receives { from, to } Date objects covering the visible range', async () => {
    input = makeInput();
    const onMonthChange = vi.fn().mockResolvedValue(undefined);
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, onMonthChange, value: '2026-07-15' });
    await dp.open();
    await dp.goToNextMonth(); // navigates to August 2026

    const arg = onMonthChange.mock.calls[0][0] as { from: Date; to: Date };
    expect(arg).toHaveProperty('from');
    expect(arg).toHaveProperty('to');
    expect(arg.from).toBeInstanceOf(Date);
    expect(arg.to).toBeInstanceOf(Date);
  });

  it('from is on or before the 1st of the new month', async () => {
    input = makeInput();
    const onMonthChange = vi.fn().mockResolvedValue(undefined);
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, onMonthChange, value: '2026-07-15' });
    await dp.open();
    await dp.goToNextMonth(); // August 2026

    const { from } = onMonthChange.mock.calls[0][0] as { from: Date; to: Date };
    expect(from <= new Date(2026, 7, 1)).toBe(true); // August 1
  });

  it('to is on or after the last day of the new month', async () => {
    input = makeInput();
    const onMonthChange = vi.fn().mockResolvedValue(undefined);
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, onMonthChange, value: '2026-07-15' });
    await dp.open();
    await dp.goToNextMonth(); // August 2026

    const { to } = onMonthChange.mock.calls[0][0] as { from: Date; to: Date };
    expect(to >= new Date(2026, 7, 31)).toBe(true); // August 31
  });

  it('from <= to', async () => {
    input = makeInput();
    const onMonthChange = vi.fn().mockResolvedValue(undefined);
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, onMonthChange, value: '2026-07-15' });
    await dp.open();
    await dp.goToNextMonth();

    const { from, to } = onMonthChange.mock.calls[0][0] as { from: Date; to: Date };
    expect(from <= to).toBe(true);
  });
});

describe('onMonthChange — async support', () => {
  it('onMonthChange completes before onCellRender starts (navigation phase only)', async () => {
    input = makeInput();
    const callOrder: string[] = [];

    // onMonthChange does async work (e.g. fetches data) before completing
    const onMonthChange = vi.fn().mockImplementation(async () => {
      await Promise.resolve(); // yield one microtask tick
      callOrder.push('monthChange');
    });
    const onCellRender = vi.fn().mockImplementation(() => {
      callOrder.push('cell');
      return {};
    });

    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, onMonthChange, onCellRender, value: '2026-07-15' });
    await dp.open();

    // Clear tracking — only observe the navigation phase
    callOrder.length = 0;
    await dp.goToNextMonth();

    const monthIdx = callOrder.indexOf('monthChange');
    const firstCellIdx = callOrder.indexOf('cell');
    // monthChange must have pushed its entry before the first cell was rendered
    expect(monthIdx).toBeGreaterThanOrEqual(0);
    expect(firstCellIdx).toBeGreaterThanOrEqual(0);
    expect(monthIdx).toBeLessThan(firstCellIdx);
  });

  it('sync (non-Promise) return value is also accepted', async () => {
    input = makeInput();
    const onMonthChange = vi.fn(); // returns undefined synchronously
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, onMonthChange, value: '2026-07-15' });
    await dp.open();
    await expect(dp.goToNextMonth()).resolves.toBeUndefined();
    expect(onMonthChange).toHaveBeenCalledTimes(1);
  });
});
