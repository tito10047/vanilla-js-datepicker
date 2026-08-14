import { describe, it, expect, vi, afterEach } from 'vitest';
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

// ─── showTodayButton ──────────────────────────────────────────────────────────

describe('showTodayButton', () => {
  it('renders today button when enabled', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, showTodayButton: true });
    await dp.open();
    expect(document.querySelector('.vdp-btn-today')).not.toBeNull();
    await dp.close();
    dp.destroy();
  });

  it('does not render today button by default', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    await dp.open();
    expect(document.querySelector('.vdp-btn-today')).toBeNull();
    await dp.close();
    dp.destroy();
  });

  it('clicking today button sets value to today', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, showTodayButton: true, closeOnSelect: false });
    await dp.open();
    const btn = document.querySelector<HTMLButtonElement>('.vdp-btn-today')!;
    btn.click();
    await new Promise((r) => setTimeout(r, 10));
    const today = new Date();
    const d = dp.getDate();
    expect(d?.getDate()).toBe(today.getDate());
    expect(d?.getMonth()).toBe(today.getMonth());
    await dp.close();
    dp.destroy();
  });

  it('clicking today button keeps calendar open even when closeOnSelect is true', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, showTodayButton: true });
    await dp.open();
    const btn = document.querySelector<HTMLButtonElement>('.vdp-btn-today')!;
    btn.click();
    await new Promise((r) => setTimeout(r, 10));
    expect(dp.isOpen()).toBe(true);
    await dp.close();
    dp.destroy();
  });
});

// ─── showClearButton ──────────────────────────────────────────────────────────

describe('showClearButton', () => {
  it('renders clear button when enabled', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, showClearButton: true });
    await dp.open();
    expect(document.querySelector('.vdp-btn-clear')).not.toBeNull();
    await dp.close();
    dp.destroy();
  });

  it('clicking clear button removes value', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      showClearButton: true,
      value: '2026-07-15',
      closeOnSelect: false,
    });
    await dp.open();
    const btn = document.querySelector<HTMLButtonElement>('.vdp-btn-clear')!;
    btn.click();
    await new Promise((r) => setTimeout(r, 10));
    expect(dp.getValue()).toBe('');
    await dp.close();
    dp.destroy();
  });
});

// ─── showCancelButton ─────────────────────────────────────────────────────────

describe('showCancelButton', () => {
  it('renders cancel button when enabled', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, showCancelButton: true });
    await dp.open();
    expect(document.querySelector('.vdp-btn-cancel')).not.toBeNull();
    await dp.close();
    dp.destroy();
  });

  it('clicking cancel closes with reason=cancel', async () => {
    const input = makeInput();
    const onClose = vi.fn();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      showCancelButton: true,
      onClose,
    });
    await dp.open();
    const btn = document.querySelector<HTMLButtonElement>('.vdp-btn-cancel')!;
    btn.click();
    await new Promise((r) => setTimeout(r, 10));
    expect(onClose).toHaveBeenCalledWith('cancel');
    expect(dp.isOpen()).toBe(false);
    dp.destroy();
  });
});

// ─── showConfirmButton ────────────────────────────────────────────────────────

describe('showConfirmButton', () => {
  it('renders confirm button when enabled', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, showConfirmButton: true });
    await dp.open();
    expect(document.querySelector('.vdp-btn-confirm')).not.toBeNull();
    await dp.close();
    dp.destroy();
  });

  it('with showConfirmButton, clicking a date does not immediately apply value', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      showConfirmButton: true,
      value: '2026-07-15',
    });
    await dp.open();

    // Click July 20
    const cell = document.querySelector<HTMLButtonElement>('[data-date="2026-07-20"]')!;
    cell.click();
    await new Promise((r) => setTimeout(r, 10));

    // Value should still be the old value (not yet confirmed)
    expect(dp.getValue()).toBe('2026-07-15');
    await dp.close();
    dp.destroy();
  });
});

// ─── Footer hasButtons() ──────────────────────────────────────────────────────

describe('footer visibility', () => {
  it('footer is not rendered when no buttons enabled', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    await dp.open();
    expect(document.querySelector('.vdp-footer')).toBeNull();
    await dp.close();
    dp.destroy();
  });

  it('footer is rendered when at least one button is enabled', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, showTodayButton: true });
    await dp.open();
    expect(document.querySelector('.vdp-footer')).not.toBeNull();
    await dp.close();
    dp.destroy();
  });

  it('classNames overrides footer button classes', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      showTodayButton: true,
      showClearButton: true,
      classNames: {
        todayButton: 'my-today',
        clearButton: 'my-clear',
      },
    });
    await dp.open();
    expect(document.querySelector('.my-today')).not.toBeNull();
    expect(document.querySelector('.my-clear')).not.toBeNull();
    expect(document.querySelector('.vdp-btn-today')).toBeNull();
    await dp.close();
    dp.destroy();
  });
});
