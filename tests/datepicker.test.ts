import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Datepicker } from '../src/core/Datepicker';

function makeInput(value = ''): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = value;
  document.body.appendChild(input);
  return input;
}

let dp: Datepicker;
let input: HTMLInputElement;

beforeEach(() => {
  input = makeInput();
  dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
});

afterEach(() => {
  dp.destroy();
  document.body.innerHTML = '';
});

// ─── Constructor ──────────────────────────────────────────────────────────────

describe('constructor', () => {
  it('accepts HTMLInputElement', () => {
    expect(dp).toBeInstanceOf(Datepicker);
  });

  it('accepts CSS selector string', () => {
    input.id = 'vdp-test';
    const dp2 = new Datepicker('#vdp-test', { openOnFocus: false });
    expect(dp2).toBeInstanceOf(Datepicker);
    dp2.destroy();
  });

  it('throws when selector not found', () => {
    expect(() => new Datepicker('#does-not-exist')).toThrow();
  });

  it('adds vdp-input class to input', () => {
    expect(input.classList.contains('vdp-input')).toBe(true);
  });

  it('sets role=combobox on input', () => {
    expect(input.getAttribute('role')).toBe('combobox');
  });

  it('sets aria-expanded=false initially', () => {
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('applies value option', () => {
    const inp = makeInput();
    const dp2 = new Datepicker(inp, { format: 'YYYY-MM-DD', value: '2026-07-04', openOnFocus: false });
    expect(inp.value).toBe('2026-07-04');
    dp2.destroy();
  });

  it('applies defaultValue option', () => {
    const inp = makeInput();
    const dp2 = new Datepicker(inp, { format: 'YYYY-MM-DD', defaultValue: '2026-01-15', openOnFocus: false });
    expect(inp.value).toBe('2026-01-15');
    dp2.destroy();
  });

  it('value takes priority over defaultValue', () => {
    const inp = makeInput();
    const dp2 = new Datepicker(inp, { format: 'YYYY-MM-DD', defaultValue: '2026-01-01', value: '2026-07-04', openOnFocus: false });
    expect(inp.value).toBe('2026-07-04');
    dp2.destroy();
  });
});

// ─── getValue / setValue ──────────────────────────────────────────────────────

describe('getValue / setValue', () => {
  it('getValue returns empty string initially', () => {
    expect(dp.getValue()).toBe('');
  });

  it('setValue updates input value', async () => {
    await dp.setValue('2026-07-04');
    expect(input.value).toBe('2026-07-04');
    expect(dp.getValue()).toBe('2026-07-04');
  });

  it('setValue accepts Date object', async () => {
    await dp.setValue(new Date(2026, 6, 4));
    expect(dp.getValue()).toBe('2026-07-04');
  });

  it('setValue null clears value', async () => {
    await dp.setValue('2026-07-04');
    await dp.setValue(null);
    expect(dp.getValue()).toBe('');
    expect(input.value).toBe('');
  });

  it('setValue fires vdp:change event', async () => {
    const handler = vi.fn();
    input.addEventListener('vdp:change', handler);
    await dp.setValue('2026-07-04');
    expect(handler).toHaveBeenCalledOnce();
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.value).toBe('2026-07-04');
  });

  it('setValue fires onChange callback', async () => {
    const onChange = vi.fn();
    const inp = makeInput();
    const dp2 = new Datepicker(inp, { format: 'YYYY-MM-DD', onChange, openOnFocus: false });
    await dp2.setValue('2026-07-04');
    expect(onChange).toHaveBeenCalledWith('2026-07-04', expect.objectContaining({ value: '2026-07-04' }));
    dp2.destroy();
  });

  it('setValue invalid date fires vdp:invalid', async () => {
    const handler = vi.fn();
    input.addEventListener('vdp:invalid', handler);
    await dp.setValue('not-a-date');
    expect(handler).toHaveBeenCalledOnce();
    expect(dp.getValue()).toBe('');
  });

  it('setValue invalid date adds vdp-invalid class', async () => {
    await dp.setValue('2026-99-99');
    expect(input.classList.contains('vdp-invalid')).toBe(true);
  });

  it('setValue valid date removes vdp-invalid class', async () => {
    await dp.setValue('not-a-date');
    await dp.setValue('2026-07-04');
    expect(input.classList.contains('vdp-invalid')).toBe(false);
  });
});

// ─── getDate ──────────────────────────────────────────────────────────────────

describe('getDate', () => {
  it('returns null when empty', () => {
    expect(dp.getDate()).toBeNull();
  });

  it('returns Date object after setValue', async () => {
    await dp.setValue('2026-07-04');
    const d = dp.getDate();
    expect(d).toBeInstanceOf(Date);
    expect(d!.getFullYear()).toBe(2026);
    expect(d!.getMonth()).toBe(6);
    expect(d!.getDate()).toBe(4);
  });
});

// ─── clear / setToday ─────────────────────────────────────────────────────────

describe('clear', () => {
  it('clears value and input', async () => {
    await dp.setValue('2026-07-04');
    await dp.clear();
    expect(dp.getValue()).toBe('');
    expect(input.value).toBe('');
    expect(dp.getDate()).toBeNull();
  });
});

describe('setToday', () => {
  it('sets to today', async () => {
    await dp.setToday();
    const today = new Date();
    const d = dp.getDate();
    expect(d).not.toBeNull();
    expect(d!.getDate()).toBe(today.getDate());
    expect(d!.getMonth()).toBe(today.getMonth());
    expect(d!.getFullYear()).toBe(today.getFullYear());
  });
});

// ─── isValid ──────────────────────────────────────────────────────────────────

describe('isValid', () => {
  it('returns true when empty and emptyOk=true', async () => {
    expect(await dp.isValid()).toBe(true);
  });

  it('returns false when empty and emptyOk=false', async () => {
    const inp = makeInput();
    const dp2 = new Datepicker(inp, { format: 'YYYY-MM-DD', emptyOk: false, openOnFocus: false });
    expect(await dp2.isValid()).toBe(false);
    dp2.destroy();
  });

  it('returns true for valid date', async () => {
    await dp.setValue('2026-07-04');
    expect(await dp.isValid()).toBe(true);
  });
});

// ─── open / close / isOpen ────────────────────────────────────────────────────

describe('open / close / isOpen', () => {
  it('isOpen returns false initially', () => {
    expect(dp.isOpen()).toBe(false);
  });

  it('open sets isOpen=true', async () => {
    await dp.open();
    expect(dp.isOpen()).toBe(true);
    await dp.close();
  });

  it('close sets isOpen=false', async () => {
    await dp.open();
    await dp.close();
    expect(dp.isOpen()).toBe(false);
  });

  it('open sets aria-expanded=true', async () => {
    await dp.open();
    expect(input.getAttribute('aria-expanded')).toBe('true');
    await dp.close();
  });

  it('close sets aria-expanded=false', async () => {
    await dp.open();
    await dp.close();
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('open dispatches vdp:beforeopen', async () => {
    const handler = vi.fn();
    input.addEventListener('vdp:beforeopen', handler);
    await dp.open();
    expect(handler).toHaveBeenCalledOnce();
    await dp.close();
  });

  it('open dispatches vdp:open', async () => {
    const handler = vi.fn();
    input.addEventListener('vdp:open', handler);
    await dp.open();
    expect(handler).toHaveBeenCalledOnce();
    await dp.close();
  });

  it('close dispatches vdp:close with reason', async () => {
    const handler = vi.fn();
    input.addEventListener('vdp:close', handler);
    await dp.open();
    await dp.close('api');
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.reason).toBe('api');
  });

  it('toggle opens when closed', async () => {
    await dp.toggle();
    expect(dp.isOpen()).toBe(true);
    await dp.close();
  });

  it('toggle closes when open', async () => {
    await dp.open();
    await dp.toggle();
    expect(dp.isOpen()).toBe(false);
  });

  it('open is no-op when already open', async () => {
    const handler = vi.fn();
    input.addEventListener('vdp:beforeopen', handler);
    await dp.open();
    await dp.open();
    expect(handler).toHaveBeenCalledOnce();
    await dp.close();
  });

  it('onBeforeOpen returning false blocks open', async () => {
    const inp = makeInput();
    const dp2 = new Datepicker(inp, { onBeforeOpen: async () => false, openOnFocus: false });
    await dp2.open();
    expect(dp2.isOpen()).toBe(false);
    dp2.destroy();
  });

  it('cancelling vdp:beforeopen blocks open', async () => {
    input.addEventListener('vdp:beforeopen', (e) => e.preventDefault());
    await dp.open();
    expect(dp.isOpen()).toBe(false);
  });
});

// ─── minDate / maxDate ────────────────────────────────────────────────────────

describe('minDate / maxDate', () => {
  it('setValue before minDate fires vdp:invalid', async () => {
    const inp = makeInput();
    const dp2 = new Datepicker(inp, { format: 'YYYY-MM-DD', minDate: '2026-07-01', openOnFocus: false });
    const handler = vi.fn();
    inp.addEventListener('vdp:invalid', handler);
    await dp2.setValue('2026-06-30');
    expect(handler).toHaveBeenCalledOnce();
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.code).toBe('BELOW_MIN');
    dp2.destroy();
  });

  it('setValue after maxDate fires vdp:invalid', async () => {
    const inp = makeInput();
    const dp2 = new Datepicker(inp, { format: 'YYYY-MM-DD', maxDate: '2026-07-31', openOnFocus: false });
    const handler = vi.fn();
    inp.addEventListener('vdp:invalid', handler);
    await dp2.setValue('2026-08-01');
    expect(handler).toHaveBeenCalledOnce();
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.code).toBe('ABOVE_MAX');
    dp2.destroy();
  });

  it('setValue on boundary is valid', async () => {
    const inp = makeInput();
    const dp2 = new Datepicker(inp, { format: 'YYYY-MM-DD', minDate: '2026-07-01', maxDate: '2026-07-31', openOnFocus: false });
    await dp2.setValue('2026-07-01');
    expect(dp2.getValue()).toBe('2026-07-01');
    await dp2.setValue('2026-07-31');
    expect(dp2.getValue()).toBe('2026-07-31');
    dp2.destroy();
  });

  it('initial value before minDate keeps original value and fires vdp:invalid', () => {
    const inp = makeInput();
    const handler = vi.fn();
    inp.addEventListener('vdp:invalid', handler);
    const dp2 = new Datepicker(inp, { format: 'YYYY-MM-DD', value: '2020-01-01', minDate: '2026-07-01', openOnFocus: false });
    expect(inp.value).toBe('2020-01-01');
    expect(dp2.getValue()).toBe('2020-01-01');
    expect(handler).toHaveBeenCalledOnce();
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.code).toBe('BELOW_MIN');
    expect(inp.classList.contains('vdp-invalid')).toBe(true);
    dp2.destroy();
  });

  it('initial value after maxDate keeps original value and fires vdp:invalid', () => {
    const inp = makeInput();
    const handler = vi.fn();
    inp.addEventListener('vdp:invalid', handler);
    const dp2 = new Datepicker(inp, { format: 'YYYY-MM-DD', value: '2030-01-01', maxDate: '2026-07-31', openOnFocus: false });
    expect(inp.value).toBe('2030-01-01');
    expect(dp2.getValue()).toBe('2030-01-01');
    expect(handler).toHaveBeenCalledOnce();
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.code).toBe('ABOVE_MAX');
    expect(inp.classList.contains('vdp-invalid')).toBe(true);
    dp2.destroy();
  });

  it('initial value within range is valid and does not fire vdp:invalid', () => {
    const inp = makeInput();
    const handler = vi.fn();
    inp.addEventListener('vdp:invalid', handler);
    const dp2 = new Datepicker(inp, { format: 'YYYY-MM-DD', value: '2026-07-15', minDate: '2026-07-01', maxDate: '2026-07-31', openOnFocus: false });
    expect(inp.value).toBe('2026-07-15');
    expect(handler).not.toHaveBeenCalled();
    expect(inp.classList.contains('vdp-invalid')).toBe(false);
    dp2.destroy();
  });
});

// ─── onBeforeChange guard ─────────────────────────────────────────────────────

describe('onBeforeChange', () => {
  it('blocks setValue when returns false', async () => {
    const inp = makeInput();
    const dp2 = new Datepicker(inp, { format: 'YYYY-MM-DD', onBeforeChange: async () => false, openOnFocus: false });
    await dp2.setValue('2026-07-04');
    expect(dp2.getValue()).toBe('');
    dp2.destroy();
  });

  it('allows setValue when returns true', async () => {
    const inp = makeInput();
    const dp2 = new Datepicker(inp, { format: 'YYYY-MM-DD', onBeforeChange: async () => true, openOnFocus: false });
    await dp2.setValue('2026-07-04');
    expect(dp2.getValue()).toBe('2026-07-04');
    dp2.destroy();
  });

  it('cancelling vdp:beforechange blocks setValue', async () => {
    input.addEventListener('vdp:beforechange', (e) => e.preventDefault());
    await dp.setValue('2026-07-04');
    expect(dp.getValue()).toBe('');
  });
});

// ─── validate hook ────────────────────────────────────────────────────────────

describe('validate', () => {
  it('fires vdp:invalid when validate returns false', async () => {
    const inp = makeInput();
    const dp2 = new Datepicker(inp, { format: 'YYYY-MM-DD', validate: async () => false, openOnFocus: false });
    const handler = vi.fn();
    inp.addEventListener('vdp:invalid', handler);
    await dp2.setValue('2026-07-04');
    expect(handler).toHaveBeenCalledOnce();
    dp2.destroy();
  });

  it('fires vdp:invalid with message when validate returns string', async () => {
    const inp = makeInput();
    const dp2 = new Datepicker(inp, {
      format: 'YYYY-MM-DD',
      validate: async () => 'Date not allowed',
      openOnFocus: false,
    });
    const handler = vi.fn();
    inp.addEventListener('vdp:invalid', handler);
    await dp2.setValue('2026-07-04');
    expect((handler.mock.calls[0][0] as CustomEvent).detail.message).toBe('Date not allowed');
    dp2.destroy();
  });

  it('allows when validate returns true', async () => {
    const inp = makeInput();
    const dp2 = new Datepicker(inp, { format: 'YYYY-MM-DD', validate: async () => true, openOnFocus: false });
    await dp2.setValue('2026-07-04');
    expect(dp2.getValue()).toBe('2026-07-04');
    dp2.destroy();
  });
});

// ─── on / off ─────────────────────────────────────────────────────────────────

describe('on / off', () => {
  it('on() subscribes to events', async () => {
    const handler = vi.fn();
    dp.on('vdp:change', handler);
    await dp.setValue('2026-07-04');
    expect(handler).toHaveBeenCalledOnce();
  });

  it('off() unsubscribes', async () => {
    const handler = vi.fn();
    dp.on('vdp:change', handler);
    dp.off('vdp:change', handler);
    await dp.setValue('2026-07-04');
    expect(handler).not.toHaveBeenCalled();
  });

  it('on() returns unsubscribe function', async () => {
    const handler = vi.fn();
    const off = dp.on('vdp:change', handler);
    off();
    await dp.setValue('2026-07-04');
    expect(handler).not.toHaveBeenCalled();
  });
});

// ─── destroy ──────────────────────────────────────────────────────────────────

describe('destroy', () => {
  it('removes vdp-input class', () => {
    dp.destroy();
    expect(input.classList.contains('vdp-input')).toBe(false);
  });

  it('removes role attribute', () => {
    dp.destroy();
    expect(input.getAttribute('role')).toBeNull();
  });

  it('dispatches vdp:destroy', () => {
    const handler = vi.fn();
    input.addEventListener('vdp:destroy', handler);
    dp.destroy();
    expect(handler).toHaveBeenCalledOnce();
  });

  it('is no-op when called twice', () => {
    dp.destroy();
    expect(() => dp.destroy()).not.toThrow();
  });
});

// ─── setOptions ───────────────────────────────────────────────────────────────

describe('setOptions', () => {
  it('updates format', async () => {
    dp.setOptions({ format: 'DD.MM.YYYY' });
    await dp.setValue(new Date(2026, 6, 4));
    expect(dp.getValue()).toBe('04.07.2026');
  });
});

// ─── static API ───────────────────────────────────────────────────────────────

describe('static API', () => {
  it('Datepicker.parse returns Date', () => {
    const d = Datepicker.parse('2026-07-04', 'YYYY-MM-DD');
    expect(d).not.toBeNull();
    expect(d!.getDate()).toBe(4);
  });

  it('Datepicker.parse returns null for invalid', () => {
    expect(Datepicker.parse('invalid', 'YYYY-MM-DD')).toBeNull();
  });

  it('Datepicker.format formats date', () => {
    expect(Datepicker.format(new Date(2026, 6, 4), 'DD.MM.YYYY')).toBe('04.07.2026');
  });

  it('Datepicker.autoInit finds [data-datepicker] elements', () => {
    const el = document.createElement('input');
    el.setAttribute('data-datepicker', '');
    el.setAttribute('data-datepicker-options', '{"openOnFocus":false}');
    document.body.appendChild(el);
    const pickers = Datepicker.autoInit();
    expect(pickers.length).toBeGreaterThan(0);
    pickers.forEach((p) => p.destroy());
  });

  it('Datepicker.getInstance returns instance by element', () => {
    const inp = makeInput();
    const dp2 = new Datepicker(inp, { openOnFocus: false });
    expect(Datepicker.getInstance(inp)).toBe(dp2);
    dp2.destroy();
  });

  it('Datepicker.getInstance returns instance by CSS selector', () => {
    const inp = makeInput();
    inp.id = 'vdp-gi-test';
    const dp2 = new Datepicker(inp, { openOnFocus: false });
    expect(Datepicker.getInstance('#vdp-gi-test')).toBe(dp2);
    dp2.destroy();
  });

  it('Datepicker.getInstance returns null when not initialised', () => {
    const inp = makeInput();
    expect(Datepicker.getInstance(inp)).toBeNull();
  });

  it('Datepicker.getInstance returns null after destroy', () => {
    const inp = makeInput();
    const dp2 = new Datepicker(inp, { openOnFocus: false });
    dp2.destroy();
    expect(Datepicker.getInstance(inp)).toBeNull();
  });

  it('Datepicker.getInstance returns null for unknown selector', () => {
    expect(Datepicker.getInstance('#no-such-element')).toBeNull();
  });
});
