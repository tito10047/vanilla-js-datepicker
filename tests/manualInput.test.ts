import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Datepicker } from '../src/core/Datepicker';

function makeInput(value = ''): HTMLInputElement {
  const el = document.createElement('input');
  el.type = 'text';
  el.value = value;
  document.body.appendChild(el);
  return el;
}

let dp: Datepicker;
let input: HTMLInputElement;

afterEach(() => {
  dp?.destroy();
  document.body.innerHTML = '';
});

// ─── autofill on blur ────────────────────────────────────────────────────────

describe('autofill — blur normalises raw input', () => {
  beforeEach(() => {
    input = makeInput();
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, autofill: true });
  });

  it('formats valid date string on blur', async () => {
    input.value = '2026-07-04';
    input.dispatchEvent(new Event('blur'));
    await new Promise((r) => setTimeout(r, 0));
    expect(dp.getValue()).toBe('2026-07-04');
    expect(input.value).toBe('2026-07-04');
  });

  it('formats date using configured format on blur', async () => {
    const inp = makeInput();
    const dp2 = new Datepicker(inp, { format: 'DD.MM.YYYY', openOnFocus: false, autofill: true });
    inp.value = '04.07.2026';
    inp.dispatchEvent(new Event('blur'));
    await new Promise((r) => setTimeout(r, 0));
    expect(dp2.getValue()).toBe('04.07.2026');
    dp2.destroy();
  });

  it('does not fire vdp:invalid for empty value when emptyOk=true', async () => {
    const handler = vi.fn();
    input.addEventListener('vdp:invalid', handler);
    input.value = '';
    input.dispatchEvent(new Event('blur'));
    await new Promise((r) => setTimeout(r, 0));
    expect(handler).not.toHaveBeenCalled();
  });
});

// ─── autofill=false ───────────────────────────────────────────────────────────

describe('autofill=false — blur does nothing', () => {
  it('does not format on blur when autofill=false', async () => {
    input = makeInput();
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, autofill: false });
    input.value = '2026-07-04';
    input.dispatchEvent(new Event('blur'));
    await new Promise((r) => setTimeout(r, 0));
    // No change event should fire since autofill is off
    expect(dp.getValue()).toBe('');
  });
});

// ─── strictMode ───────────────────────────────────────────────────────────────

describe('strictMode — invalid blur fires vdp:invalid', () => {
  beforeEach(() => {
    input = makeInput();
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, autofill: true, strictMode: true });
  });

  it('fires vdp:invalid for invalid date on blur', async () => {
    const handler = vi.fn();
    input.addEventListener('vdp:invalid', handler);
    input.value = 'not-a-date';
    input.dispatchEvent(new Event('blur'));
    await new Promise((r) => setTimeout(r, 0));
    expect(handler).toHaveBeenCalledOnce();
  });

  it('adds vdp-invalid class for invalid date on blur', async () => {
    input.value = 'not-a-date';
    input.dispatchEvent(new Event('blur'));
    await new Promise((r) => setTimeout(r, 0));
    expect(input.classList.contains('vdp-invalid')).toBe(true);
  });

  it('does not fire vdp:invalid for valid date on blur', async () => {
    const handler = vi.fn();
    input.addEventListener('vdp:invalid', handler);
    input.value = '2026-07-04';
    input.dispatchEvent(new Event('blur'));
    await new Promise((r) => setTimeout(r, 0));
    expect(handler).not.toHaveBeenCalled();
  });
});

// ─── Enter key → format ───────────────────────────────────────────────────────

describe('Enter key triggers autofill', () => {
  beforeEach(() => {
    input = makeInput();
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, autofill: true });
  });

  it('Enter key with valid date sets value', async () => {
    input.value = '2026-07-15';
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    expect(dp.getValue()).toBe('2026-07-15');
  });

  it('Escape key closes picker', async () => {
    await dp.open();
    expect(dp.isOpen()).toBe(true);
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));
    expect(dp.isOpen()).toBe(false);
  });
});

// ─── allowManualInput=false ───────────────────────────────────────────────────

describe('allowManualInput=false — input is readonly', () => {
  it('sets readonly attribute on input', () => {
    input = makeInput();
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, allowManualInput: false });
    expect(input.hasAttribute('readonly')).toBe(true);
  });

  it('does NOT add blur listener when allowManualInput=false', async () => {
    input = makeInput();
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, allowManualInput: false });
    // Blur should not trigger autofill
    input.value = '2026-07-04';
    input.dispatchEvent(new Event('blur'));
    await new Promise((r) => setTimeout(r, 0));
    // getValue should still be empty (no autofill ran)
    expect(dp.getValue()).toBe('');
  });
});

// ─── vdp:input event ─────────────────────────────────────────────────────────

describe('vdp:input — fires on every keystroke', () => {
  it('dispatches vdp:input event on input', () => {
    input = makeInput();
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    const handler = vi.fn();
    input.addEventListener('vdp:input', handler);
    input.value = '2026';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(handler).toHaveBeenCalledOnce();
    const { detail } = handler.mock.calls[0][0] as CustomEvent;
    expect(detail.raw).toBe('2026');
  });

  it('removes vdp-invalid class on new input', async () => {
    input = makeInput();
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    // First set invalid
    await dp.setValue('bad-date');
    expect(input.classList.contains('vdp-invalid')).toBe(true);
    // Then type something new
    input.value = '2026';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(input.classList.contains('vdp-invalid')).toBe(false);
  });

  it('fires onInput callback', () => {
    const onInput = vi.fn();
    input = makeInput();
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, onInput });
    input.value = '2026-07';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onInput).toHaveBeenCalledWith('2026-07');
  });
});

// ─── onBeforeMonthChange guard ────────────────────────────────────────────────

describe('onBeforeMonthChange guard', () => {
  it('blocks month change when returns false', async () => {
    input = makeInput();
    dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      onBeforeMonthChange: async () => false,
      value: '2026-07-15',
    });
    const initialMonth = 6; // July
    await dp.goToNextMonth();
    // Month should not have changed
    await dp.open();
    // The calendar should still show July
    const julyCell = document.querySelector('[data-date="2026-07-15"]');
    expect(julyCell).not.toBeNull();
    await dp.close();
  });

  it('fires vdp:beforemonthchange event', async () => {
    input = makeInput();
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, value: '2026-07-15' });
    const handler = vi.fn();
    input.addEventListener('vdp:beforemonthchange', handler);
    await dp.goToNextMonth();
    expect(handler).toHaveBeenCalledOnce();
    const { detail } = handler.mock.calls[0][0] as CustomEvent;
    expect(detail.next).toBeInstanceOf(Date);
    expect(detail.prev).toBeInstanceOf(Date);
  });

  it('cancelling vdp:beforemonthchange blocks navigation', async () => {
    input = makeInput();
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, value: '2026-07-15' });
    input.addEventListener('vdp:beforemonthchange', (e) => e.preventDefault());
    await dp.open();
    const initialCells = document.querySelectorAll('[data-date^="2026-07"]').length;
    await dp.goToNextMonth();
    // Should not navigate (July cells still there)
    const cellsAfter = document.querySelectorAll('[data-date^="2026-07"]').length;
    expect(cellsAfter).toBe(initialCells);
    await dp.close();
  });
});
