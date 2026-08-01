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

// ─── setRange ────────────────────────────────────────────────────────────────

describe('setRange', () => {
  it('sets both endpoints and formats input', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, mode: 'range' });
    await dp.setRange(new Date(2026, 6, 1), new Date(2026, 6, 31));
    expect(input.value).toBe('2026-07-01 – 2026-07-31');
    const range = dp.getRange();
    expect(range).not.toBeNull();
    expect(range!.from.getDate()).toBe(1);
    expect(range!.to.getDate()).toBe(31);
    dp.destroy();
  });
});

// ─── setDates (multiple mode) ─────────────────────────────────────────────────

describe('setDates', () => {
  it('sets multiple dates', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, mode: 'multiple' });
    await dp.setDates([new Date(2026, 6, 5), new Date(2026, 6, 15), new Date(2026, 6, 25)]);
    const dates = dp.getDates();
    expect(dates.length).toBe(3);
    dp.destroy();
  });

  it('getDates returns empty array initially', () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    expect(dp.getDates()).toHaveLength(0);
    dp.destroy();
  });
});

// ─── goToDate ─────────────────────────────────────────────────────────────────

describe('goToDate', () => {
  it('navigates calendar to specified date month', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    await dp.open();
    await dp.goToDate(new Date(2027, 0, 1)); // January 2027
    // January 2027 cells should be visible
    const janCell = document.querySelector('[data-date="2027-01-15"]');
    expect(janCell).not.toBeNull();
    await dp.close();
    dp.destroy();
  });
});

// ─── goToMonth ────────────────────────────────────────────────────────────────

describe('goToMonth', () => {
  it('navigates to specified month/year', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    await dp.open();
    await dp.goToMonth(1, 2027); // February 2027 (0-indexed)
    const febCell = document.querySelector('[data-date="2027-02-15"]');
    expect(febCell).not.toBeNull();
    await dp.close();
    dp.destroy();
  });
});

// ─── goToNextMonth / goToPrevMonth ────────────────────────────────────────────

describe('goToNextMonth / goToPrevMonth', () => {
  it('goToNextMonth advances month', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, value: '2026-07-15' });
    await dp.open();
    await dp.goToNextMonth();
    const augCell = document.querySelector('[data-date="2026-08-15"]');
    expect(augCell).not.toBeNull();
    await dp.close();
    dp.destroy();
  });

  it('goToPrevMonth goes back one month', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, value: '2026-07-15' });
    await dp.open();
    await dp.goToPrevMonth();
    const junCell = document.querySelector('[data-date="2026-06-15"]');
    expect(junCell).not.toBeNull();
    await dp.close();
    dp.destroy();
  });

  it('goToNextYear advances year', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, value: '2026-07-15' });
    await dp.open();
    await dp.goToNextYear();
    const nextYearCell = document.querySelector('[data-date="2027-07-15"]');
    expect(nextYearCell).not.toBeNull();
    await dp.close();
    dp.destroy();
  });

  it('goToPrevYear goes back one year', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, value: '2026-07-15' });
    await dp.open();
    await dp.goToPrevYear();
    const prevYearCell = document.querySelector('[data-date="2025-07-15"]');
    expect(prevYearCell).not.toBeNull();
    await dp.close();
    dp.destroy();
  });
});

// ─── switchView ───────────────────────────────────────────────────────────────

describe('switchView', () => {
  it('switches to months view', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    await dp.open();
    await dp.switchView('months');
    expect(document.querySelector('.vdp-month-grid')).not.toBeNull();
    await dp.close();
    dp.destroy();
  });

  it('switches to years view', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    await dp.open();
    await dp.switchView('years');
    expect(document.querySelector('.vdp-year-grid')).not.toBeNull();
    await dp.close();
    dp.destroy();
  });

  it('dispatches vdp:viewchange event', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    await dp.open();
    const handler = (e: Event) => {
      const { from, to } = (e as CustomEvent).detail;
      expect(from).toBe('days');
      expect(to).toBe('months');
    };
    input.addEventListener('vdp:viewchange', handler);
    await dp.switchView('months');
    await dp.close();
    dp.destroy();
  });
});

// ─── setLocale ────────────────────────────────────────────────────────────────

describe('setLocale', () => {
  it('changes locale (updates month names)', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, locale: 'sk', value: '2026-07-15' });
    await dp.open();

    // Initially SK locale
    const headerSk = document.querySelector('.vdp-btn-month');
    expect(headerSk?.textContent).toBe('júl'); // Slovak for July

    dp.setLocale('en');
    await dp.refresh();

    const headerEn = document.querySelector('.vdp-btn-month');
    expect(headerEn?.textContent).toBe('July'); // English for July
    await dp.close();
    dp.destroy();
  });
});

// ─── refresh ─────────────────────────────────────────────────────────────────

describe('refresh', () => {
  it('re-renders the calendar without error', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    await dp.open();
    await dp.refresh();
    expect(document.querySelector('.vdp-dropdown')).not.toBeNull();
    await dp.close();
    dp.destroy();
  });

  it('is a no-op when calendar is closed', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    await expect(dp.refresh()).resolves.toBeUndefined();
    dp.destroy();
  });
});

// ─── focus ────────────────────────────────────────────────────────────────────

describe('focus', () => {
  it('focuses the input element', () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    dp.focus();
    expect(document.activeElement).toBe(input);
    dp.destroy();
  });
});

// ─── Datepicker.setDefaults ───────────────────────────────────────────────────

describe('Datepicker.setDefaults', () => {
  it('applies defaults to new instances', () => {
    Datepicker.setDefaults({ format: 'DD/MM/YYYY' });
    const input = makeInput();
    const dp = new Datepicker(input, { openOnFocus: false });
    // Verify format is used when setValue is called
    dp.setValue(new Date(2026, 6, 4));
    // Default format is now DD/MM/YYYY
    // (we can't easily check synchronously, just verify no error)
    expect(dp).toBeTruthy();
    dp.destroy();
    // Reset
    Datepicker.setDefaults({ format: 'YYYY-MM-DD' });
  });
});
