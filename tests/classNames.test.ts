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

// ─── classNames override ──────────────────────────────────────────────────────

describe('classNames option overrides default vdp-* classes', () => {
  it('overrides dropdown class', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      classNames: { dropdown: 'tw-picker' },
    });
    await dp.open();
    const dropdown = document.querySelector('.tw-picker');
    expect(dropdown).not.toBeNull();
    // Default class should NOT be used
    expect(document.querySelector('.vdp-dropdown')).toBeNull();
    await dp.close();
    dp.destroy();
  });

  it('overrides cell class', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      classNames: { cell: 'tw-day' },
    });
    await dp.open();
    const cells = document.querySelectorAll('.tw-day');
    expect(cells.length).toBeGreaterThan(0);
    expect(document.querySelector('.vdp-cell')).toBeNull();
    await dp.close();
    dp.destroy();
  });

  it('overrides cellSelected class', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      value: '2026-07-15',
      classNames: { cellSelected: 'tw-selected' },
    });
    await dp.open();
    const selected = document.querySelector('.tw-selected');
    expect(selected).not.toBeNull();
    expect(document.querySelector('.vdp-cell--selected')).toBeNull();
    await dp.close();
    dp.destroy();
  });

  it('overrides cellToday class', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      classNames: { cellToday: 'tw-today' },
    });
    await dp.open();
    const today = document.querySelector('.tw-today');
    expect(today).not.toBeNull();
    expect(document.querySelector('.vdp-cell--today')).toBeNull();
    await dp.close();
    dp.destroy();
  });

  it('overrides inputActive class on open', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      classNames: { inputActive: 'tw-input-open' },
    });
    await dp.open();
    expect(input.classList.contains('tw-input-open')).toBe(true);
    expect(input.classList.contains('vdp-input--active')).toBe(false);
    await dp.close();
    dp.destroy();
  });

  it('removes custom inputActive class on close', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      classNames: { inputActive: 'tw-input-open' },
    });
    await dp.open();
    await dp.close();
    expect(input.classList.contains('tw-input-open')).toBe(false);
    dp.destroy();
  });

  it('overrides inputInvalid class', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      classNames: { inputInvalid: 'tw-error' },
    });
    await dp.setValue('bad-date');
    expect(input.classList.contains('tw-error')).toBe(true);
    expect(input.classList.contains('vdp-invalid')).toBe(false);
    dp.destroy();
  });
});

// ─── setTheme ─────────────────────────────────────────────────────────────────

describe('setTheme', () => {
  it('changes data-vdp-theme attribute on dropdown', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, theme: 'light' });
    await dp.open();

    dp.setTheme('dark');
    const dropdown = document.querySelector('.vdp-dropdown');
    expect(dropdown?.getAttribute('data-vdp-theme')).toBe('dark');

    await dp.close();
    dp.destroy();
  });

  it('initial theme is set on dropdown', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, theme: 'dark' });
    await dp.open();
    const dropdown = document.querySelector('.vdp-dropdown');
    expect(dropdown?.getAttribute('data-vdp-theme')).toBe('dark');
    await dp.close();
    dp.destroy();
  });

  it('auto theme is the default', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    await dp.open();
    const dropdown = document.querySelector('.vdp-dropdown');
    expect(dropdown?.getAttribute('data-vdp-theme')).toBe('auto');
    await dp.close();
    dp.destroy();
  });
});
