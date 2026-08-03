import { describe, it, expect, vi, afterEach } from 'vitest';
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

// ─── minDate / maxDate calendar cell rendering ────────────────────────────────

describe('minDate — calendar cell rendering', () => {
  it('cells before minDate are disabled', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', minDate: '2026-07-10',
    });
    await dp.open();
    const cell = document.querySelector('[data-date="2026-07-05"]');
    expect(cell?.getAttribute('aria-disabled')).toBe('true');
    expect(cell?.classList.contains('vdp-cell--disabled')).toBe(true);
    await dp.close(); dp.destroy();
  });

  it('minDate cell itself is NOT disabled', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', minDate: '2026-07-10',
    });
    await dp.open();
    const cell = document.querySelector('[data-date="2026-07-10"]');
    expect(cell?.getAttribute('aria-disabled')).toBe('false');
    expect(cell?.classList.contains('vdp-cell--disabled')).toBe(false);
    await dp.close(); dp.destroy();
  });

  it('cells before minDate have a title attribute', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', minDate: '2026-07-10',
    });
    await dp.open();
    const cell = document.querySelector('[data-date="2026-07-05"]');
    expect(cell?.getAttribute('title')).toBeTruthy();
    await dp.close(); dp.destroy();
  });

  it('minDateTitle option overrides the title on cells before minDate', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', minDate: '2026-07-10',
      minDateTitle: 'Custom min title',
    });
    await dp.open();
    const cell = document.querySelector('[data-date="2026-07-05"]');
    expect(cell?.getAttribute('title')).toBe('Custom min title');
    await dp.close(); dp.destroy();
  });

  it('clicking a cell before minDate does not change value', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', minDate: '2026-07-10',
      closeOnSelect: false,
    });
    await dp.open();
    const cell = document.querySelector<HTMLButtonElement>('[data-date="2026-07-05"]');
    cell?.click();
    expect(dp.getValue()).toBe('2026-07-15');
    await dp.close(); dp.destroy();
  });
});

describe('maxDate — calendar cell rendering', () => {
  it('cells after maxDate are disabled', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', maxDate: '2026-07-20',
    });
    await dp.open();
    const cell = document.querySelector('[data-date="2026-07-25"]');
    expect(cell?.getAttribute('aria-disabled')).toBe('true');
    expect(cell?.classList.contains('vdp-cell--disabled')).toBe(true);
    await dp.close(); dp.destroy();
  });

  it('maxDate cell itself is NOT disabled', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', maxDate: '2026-07-20',
    });
    await dp.open();
    const cell = document.querySelector('[data-date="2026-07-20"]');
    expect(cell?.getAttribute('aria-disabled')).toBe('false');
    expect(cell?.classList.contains('vdp-cell--disabled')).toBe(false);
    await dp.close(); dp.destroy();
  });

  it('cells after maxDate have a title attribute', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', maxDate: '2026-07-20',
    });
    await dp.open();
    const cell = document.querySelector('[data-date="2026-07-25"]');
    expect(cell?.getAttribute('title')).toBeTruthy();
    await dp.close(); dp.destroy();
  });

  it('maxDateTitle option overrides the title on cells after maxDate', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', maxDate: '2026-07-20',
      maxDateTitle: 'Custom max title',
    });
    await dp.open();
    const cell = document.querySelector('[data-date="2026-07-25"]');
    expect(cell?.getAttribute('title')).toBe('Custom max title');
    await dp.close(); dp.destroy();
  });

  it('clicking a cell after maxDate does not change value', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', maxDate: '2026-07-20',
      closeOnSelect: false,
    });
    await dp.open();
    const cell = document.querySelector<HTMLButtonElement>('[data-date="2026-07-25"]');
    cell?.click();
    expect(dp.getValue()).toBe('2026-07-15');
    await dp.close(); dp.destroy();
  });
});

// ─── minDate / maxDate — month grid ───────────────────────────────────────────

describe('minDate — month grid rendering', () => {
  it('months fully before minDate are disabled', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', minDate: '2026-07-01',
    });
    await dp.open();
    await dp.switchView('months');
    // June (month 5) last day = 2026-06-30 < 2026-07-01 → disabled
    const june = document.querySelector('[data-month="5"]');
    expect(june?.getAttribute('aria-disabled')).toBe('true');
    expect(june?.classList.contains('vdp-cell--disabled')).toBe(true);
    await dp.close(); dp.destroy();
  });

  it('month containing minDate is NOT disabled', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', minDate: '2026-07-01',
    });
    await dp.open();
    await dp.switchView('months');
    const july = document.querySelector('[data-month="6"]');
    expect(july?.getAttribute('aria-disabled')).toBe('false');
    expect(july?.classList.contains('vdp-cell--disabled')).toBe(false);
    await dp.close(); dp.destroy();
  });

  it('disabled months before minDate have a title attribute', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', minDate: '2026-07-01',
    });
    await dp.open();
    await dp.switchView('months');
    const june = document.querySelector('[data-month="5"]');
    expect(june?.getAttribute('title')).toBeTruthy();
    await dp.close(); dp.destroy();
  });

  it('minMonthTitle option overrides title on months before minDate', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', minDate: '2026-07-01',
      minMonthTitle: 'Custom month min',
    });
    await dp.open();
    await dp.switchView('months');
    const june = document.querySelector('[data-month="5"]');
    expect(june?.getAttribute('title')).toBe('Custom month min');
    await dp.close(); dp.destroy();
  });

  it('clicking a disabled month does not navigate', async () => {
    const input = makeInput();
    const handler = vi.fn();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', minDate: '2026-07-01',
    });
    input.addEventListener('vdp:monthchange', handler);
    await dp.open();
    await dp.switchView('months');
    const june = document.querySelector<HTMLButtonElement>('[data-month="5"]');
    june?.click();
    expect(handler).not.toHaveBeenCalled();
    await dp.close(); dp.destroy();
  });
});

describe('maxDate — month grid rendering', () => {
  it('months fully after maxDate are disabled', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', maxDate: '2026-07-31',
    });
    await dp.open();
    await dp.switchView('months');
    // August (month 7) first day = 2026-08-01 > 2026-07-31 → disabled
    const august = document.querySelector('[data-month="7"]');
    expect(august?.getAttribute('aria-disabled')).toBe('true');
    expect(august?.classList.contains('vdp-cell--disabled')).toBe(true);
    await dp.close(); dp.destroy();
  });

  it('month containing maxDate is NOT disabled', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', maxDate: '2026-07-31',
    });
    await dp.open();
    await dp.switchView('months');
    const july = document.querySelector('[data-month="6"]');
    expect(july?.getAttribute('aria-disabled')).toBe('false');
    await dp.close(); dp.destroy();
  });

  it('maxMonthTitle option overrides title on months after maxDate', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', maxDate: '2026-07-31',
      maxMonthTitle: 'Custom month max',
    });
    await dp.open();
    await dp.switchView('months');
    const august = document.querySelector('[data-month="7"]');
    expect(august?.getAttribute('title')).toBe('Custom month max');
    await dp.close(); dp.destroy();
  });
});

// ─── minDate / maxDate — year grid ────────────────────────────────────────────

describe('minDate — year grid rendering', () => {
  it('years fully before minDate year are disabled', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', minDate: '2026-01-01',
    });
    await dp.open();
    await dp.switchView('years');
    // year 2025 < 2026 → disabled
    const y2025 = document.querySelector('[data-year="2025"]');
    expect(y2025?.getAttribute('aria-disabled')).toBe('true');
    expect(y2025?.classList.contains('vdp-cell--disabled')).toBe(true);
    await dp.close(); dp.destroy();
  });

  it('year containing minDate is NOT disabled', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', minDate: '2026-01-01',
    });
    await dp.open();
    await dp.switchView('years');
    const y2026 = document.querySelector('[data-year="2026"]');
    expect(y2026?.getAttribute('aria-disabled')).toBe('false');
    expect(y2026?.classList.contains('vdp-cell--disabled')).toBe(false);
    await dp.close(); dp.destroy();
  });

  it('disabled years have a title attribute', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', minDate: '2026-01-01',
    });
    await dp.open();
    await dp.switchView('years');
    const y2025 = document.querySelector('[data-year="2025"]');
    expect(y2025?.getAttribute('title')).toBeTruthy();
    await dp.close(); dp.destroy();
  });

  it('minYearTitle option overrides title on years before minDate', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', minDate: '2026-01-01',
      minYearTitle: 'Custom year min',
    });
    await dp.open();
    await dp.switchView('years');
    const y2025 = document.querySelector('[data-year="2025"]');
    expect(y2025?.getAttribute('title')).toBe('Custom year min');
    await dp.close(); dp.destroy();
  });

  it('clicking a disabled year does not navigate', async () => {
    const input = makeInput();
    const handler = vi.fn();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', minDate: '2026-01-01',
    });
    input.addEventListener('vdp:monthchange', handler);
    await dp.open();
    await dp.switchView('years');
    const y2025 = document.querySelector<HTMLButtonElement>('[data-year="2025"]');
    y2025?.click();
    expect(handler).not.toHaveBeenCalled();
    await dp.close(); dp.destroy();
  });
});

describe('maxDate — year grid rendering', () => {
  it('years fully after maxDate year are disabled', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', maxDate: '2026-12-31',
    });
    await dp.open();
    await dp.switchView('years');
    const y2027 = document.querySelector('[data-year="2027"]');
    expect(y2027?.getAttribute('aria-disabled')).toBe('true');
    expect(y2027?.classList.contains('vdp-cell--disabled')).toBe(true);
    await dp.close(); dp.destroy();
  });

  it('year containing maxDate is NOT disabled', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', maxDate: '2026-12-31',
    });
    await dp.open();
    await dp.switchView('years');
    const y2026 = document.querySelector('[data-year="2026"]');
    expect(y2026?.getAttribute('aria-disabled')).toBe('false');
    await dp.close(); dp.destroy();
  });

  it('maxYearTitle option overrides title on years after maxDate', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD', openOnFocus: false,
      value: '2026-07-15', maxDate: '2026-12-31',
      maxYearTitle: 'Custom year max',
    });
    await dp.open();
    await dp.switchView('years');
    const y2027 = document.querySelector('[data-year="2027"]');
    expect(y2027?.getAttribute('title')).toBe('Custom year max');
    await dp.close(); dp.destroy();
  });
});
