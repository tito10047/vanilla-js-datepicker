import { describe, it, expect, afterEach } from 'vitest';
import { Datepicker } from '../src/core/Datepicker';

function makeInput(): HTMLInputElement {
  const el = document.createElement('input');
  el.type = 'text';
  document.body.appendChild(el);
  return el;
}

function d(y: number, m: number, day: number) {
  return new Date(y, m - 1, day);
}

afterEach(() => {
  document.body.innerHTML = '';
});

// ─── disabledDates (array) ────────────────────────────────────────────────────

describe('disabledDates — array', () => {
  it('marks specific dates as disabled', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      value: '2026-07-15',
      disabledDates: [d(2026, 7, 10), d(2026, 7, 20)],
    });
    await dp.open();
    const cell10 = document.querySelector('[data-date="2026-07-10"]');
    const cell20 = document.querySelector('[data-date="2026-07-20"]');
    expect(cell10?.getAttribute('aria-disabled')).toBe('true');
    expect(cell20?.getAttribute('aria-disabled')).toBe('true');
    expect(cell10?.classList.contains('vdp-cell--disabled')).toBe(true);
    await dp.close();
    dp.destroy();
  });

  it('non-disabled dates are not marked disabled', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      value: '2026-07-15',
      disabledDates: [d(2026, 7, 10)],
    });
    await dp.open();
    const cell15 = document.querySelector('[data-date="2026-07-15"]');
    expect(cell15?.getAttribute('aria-disabled')).toBe('false');
    await dp.close();
    dp.destroy();
  });
});

// ─── disabledWeekdays ─────────────────────────────────────────────────────────

describe('disabledWeekdays', () => {
  it('marks all Sundays (0) as disabled', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      value: '2026-07-15',
      disabledWeekdays: [0],
    });
    await dp.open();
    // July 5, 2026 is a Sunday
    const sundayCell = document.querySelector('[data-date="2026-07-05"]');
    expect(sundayCell?.getAttribute('aria-disabled')).toBe('true');
    expect(sundayCell?.classList.contains('vdp-cell--disabled')).toBe(true);
    await dp.close();
    dp.destroy();
  });

  it('marks all Saturdays (6) as disabled', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      value: '2026-07-15',
      disabledWeekdays: [6],
    });
    await dp.open();
    // July 4, 2026 is a Saturday
    const satCell = document.querySelector('[data-date="2026-07-04"]');
    expect(satCell?.getAttribute('aria-disabled')).toBe('true');
    await dp.close();
    dp.destroy();
  });

  it('weekdays array can disable multiple days of week', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      value: '2026-07-15',
      disabledWeekdays: [0, 6], // Sundays and Saturdays
    });
    await dp.open();
    const sat = document.querySelector('[data-date="2026-07-04"]');
    const sun = document.querySelector('[data-date="2026-07-05"]');
    expect(sat?.getAttribute('aria-disabled')).toBe('true');
    expect(sun?.getAttribute('aria-disabled')).toBe('true');
    await dp.close();
    dp.destroy();
  });
});

// ─── highlightedDates ─────────────────────────────────────────────────────────

describe('highlightedDates', () => {
  it('marks highlighted dates with vdp-cell--highlighted class', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      value: '2026-07-15',
      highlightedDates: [d(2026, 7, 8), d(2026, 7, 22)],
    });
    await dp.open();
    const cell8 = document.querySelector('[data-date="2026-07-08"]');
    const cell22 = document.querySelector('[data-date="2026-07-22"]');
    expect(cell8?.classList.contains('vdp-cell--highlighted')).toBe(true);
    expect(cell22?.classList.contains('vdp-cell--highlighted')).toBe(true);
    await dp.close();
    dp.destroy();
  });

  it('non-highlighted dates do not have highlighted class', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      value: '2026-07-15',
      highlightedDates: [d(2026, 7, 8)],
    });
    await dp.open();
    const cell15 = document.querySelector('[data-date="2026-07-15"]');
    expect(cell15?.classList.contains('vdp-cell--highlighted')).toBe(false);
    await dp.close();
    dp.destroy();
  });
});

// ─── disabledDates + minDate/maxDate interaction ──────────────────────────────

describe('minDate / maxDate disable out-of-range cells via setValue', () => {
  it('setValue below minDate fires vdp:invalid with BELOW_MIN', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      minDate: '2026-07-10',
    });
    const handler = (e: Event) => {
      expect((e as CustomEvent).detail.code).toBe('BELOW_MIN');
    };
    input.addEventListener('vdp:invalid', handler);
    await dp.setValue('2026-07-05');
    expect(dp.getValue()).toBe('');
    dp.destroy();
  });
});
