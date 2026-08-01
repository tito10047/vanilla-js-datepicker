import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { resolveGridKeyAction } from '../src/a11y/keyboard';
import { createFocusTrap } from '../src/a11y/focusTrap';
import { createLiveRegion } from '../src/a11y/aria';
import { Datepicker } from '../src/core/Datepicker';

function makeKeyEvent(key: string, opts: Partial<KeyboardEventInit> = {}): KeyboardEvent {
  return new KeyboardEvent('keydown', { key, bubbles: true, ...opts });
}

function makeInput(): HTMLInputElement {
  const el = document.createElement('input');
  el.type = 'text';
  document.body.appendChild(el);
  return el;
}

// ─── resolveGridKeyAction ─────────────────────────────────────────────────────

describe('resolveGridKeyAction', () => {
  it('ArrowLeft → prev-day', () => {
    expect(resolveGridKeyAction(makeKeyEvent('ArrowLeft'))).toBe('prev-day');
  });
  it('ArrowRight → next-day', () => {
    expect(resolveGridKeyAction(makeKeyEvent('ArrowRight'))).toBe('next-day');
  });
  it('ArrowUp → prev-week', () => {
    expect(resolveGridKeyAction(makeKeyEvent('ArrowUp'))).toBe('prev-week');
  });
  it('ArrowDown → next-week', () => {
    expect(resolveGridKeyAction(makeKeyEvent('ArrowDown'))).toBe('next-week');
  });
  it('PageUp → prev-month', () => {
    expect(resolveGridKeyAction(makeKeyEvent('PageUp'))).toBe('prev-month');
  });
  it('PageDown → next-month', () => {
    expect(resolveGridKeyAction(makeKeyEvent('PageDown'))).toBe('next-month');
  });
  it('Shift+PageUp → prev-year', () => {
    expect(resolveGridKeyAction(makeKeyEvent('PageUp', { shiftKey: true }))).toBe('prev-year');
  });
  it('Shift+PageDown → next-year', () => {
    expect(resolveGridKeyAction(makeKeyEvent('PageDown', { shiftKey: true }))).toBe('next-year');
  });
  it('Home → start-week', () => {
    expect(resolveGridKeyAction(makeKeyEvent('Home'))).toBe('start-week');
  });
  it('End → end-week', () => {
    expect(resolveGridKeyAction(makeKeyEvent('End'))).toBe('end-week');
  });
  it('Ctrl+Home → start-month', () => {
    expect(resolveGridKeyAction(makeKeyEvent('Home', { ctrlKey: true }))).toBe('start-month');
  });
  it('Ctrl+End → end-month', () => {
    expect(resolveGridKeyAction(makeKeyEvent('End', { ctrlKey: true }))).toBe('end-month');
  });
  it('Enter → select', () => {
    expect(resolveGridKeyAction(makeKeyEvent('Enter'))).toBe('select');
  });
  it('Space → select', () => {
    expect(resolveGridKeyAction(makeKeyEvent(' '))).toBe('select');
  });
  it('Escape → close', () => {
    expect(resolveGridKeyAction(makeKeyEvent('Escape'))).toBe('close');
  });
  it('Tab → null', () => {
    expect(resolveGridKeyAction(makeKeyEvent('Tab'))).toBeNull();
  });
  it('unknown key → null', () => {
    expect(resolveGridKeyAction(makeKeyEvent('a'))).toBeNull();
  });
});

// ─── createFocusTrap ──────────────────────────────────────────────────────────

describe('createFocusTrap', () => {
  let container: HTMLElement;
  let trap: ReturnType<typeof createFocusTrap>;

  beforeEach(() => {
    container = document.createElement('div');
    const btn1 = document.createElement('button');
    btn1.textContent = 'First';
    const btn2 = document.createElement('button');
    btn2.textContent = 'Second';
    const btn3 = document.createElement('button');
    btn3.textContent = 'Third';
    container.append(btn1, btn2, btn3);
    document.body.appendChild(container);
    trap = createFocusTrap(container);
  });

  afterEach(() => {
    trap.deactivate();
    document.body.innerHTML = '';
  });

  it('activate focuses first focusable element', () => {
    trap.activate();
    expect(document.activeElement).toBe(container.querySelector('button'));
  });

  it('deactivate removes keydown listener', () => {
    trap.activate();
    trap.deactivate();
    // After deactivating, Tab should not wrap (no listener active)
    const buttons = container.querySelectorAll('button');
    (buttons[buttons.length - 1] as HTMLElement).focus();
    const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    document.dispatchEvent(tabEvent);
    // Focus should NOT have moved to first button (trap is deactivated)
    expect(document.activeElement).not.toBe(buttons[0]);
  });
});

// ─── createLiveRegion ────────────────────────────────────────────────────────

describe('createLiveRegion', () => {
  let region: ReturnType<typeof createLiveRegion>;

  afterEach(() => {
    region?.el.remove();
    document.body.innerHTML = '';
  });

  it('creates a div with aria-live=polite in body', () => {
    region = createLiveRegion();
    expect(region.el.getAttribute('aria-live')).toBe('polite');
    expect(region.el.getAttribute('aria-atomic')).toBe('true');
    expect(document.body.contains(region.el)).toBe(true);
  });

  it('has vdp-live class', () => {
    region = createLiveRegion();
    expect(region.el.classList.contains('vdp-live')).toBe(true);
  });
});

// ─── Calendar keyboard navigation ────────────────────────────────────────────

describe('keyboard navigation in calendar', () => {
  let dp: Datepicker;
  let input: HTMLInputElement;

  beforeEach(() => {
    input = makeInput();
  });

  afterEach(async () => {
    await dp?.close();
    dp?.destroy();
    document.body.innerHTML = '';
  });

  it('Escape closes the calendar', async () => {
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, value: '2026-07-15' });
    await dp.open();
    expect(dp.isOpen()).toBe(true);

    const dropdown = document.querySelector('.vdp-dropdown')!;
    dropdown.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));

    expect(dp.isOpen()).toBe(false);
  });

  it('ArrowRight moves focus to next day', async () => {
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, value: '2026-07-15' });
    await dp.open();

    const dropdown = document.querySelector('.vdp-dropdown')!;

    // Focus the selected cell first (July 15)
    const cell15 = document.querySelector<HTMLButtonElement>('[data-date="2026-07-15"]')!;
    cell15.focus();
    expect(document.activeElement).toBe(cell15);

    // Press ArrowRight
    dropdown.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));

    // Focus should be on July 16
    expect((document.activeElement as HTMLElement)?.getAttribute('data-date')).toBe('2026-07-16');
  });

  it('ArrowLeft moves focus to previous day', async () => {
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, value: '2026-07-15' });
    await dp.open();

    const dropdown = document.querySelector('.vdp-dropdown')!;
    const cell15 = document.querySelector<HTMLButtonElement>('[data-date="2026-07-15"]')!;
    cell15.focus();

    dropdown.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));

    expect((document.activeElement as HTMLElement)?.getAttribute('data-date')).toBe('2026-07-14');
  });

  it('ArrowDown moves focus one week forward', async () => {
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, value: '2026-07-15' });
    await dp.open();

    const dropdown = document.querySelector('.vdp-dropdown')!;
    const cell15 = document.querySelector<HTMLButtonElement>('[data-date="2026-07-15"]')!;
    cell15.focus();

    dropdown.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));

    expect((document.activeElement as HTMLElement)?.getAttribute('data-date')).toBe('2026-07-22');
  });

  it('ArrowUp moves focus one week back', async () => {
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, value: '2026-07-15' });
    await dp.open();

    const dropdown = document.querySelector('.vdp-dropdown')!;
    const cell15 = document.querySelector<HTMLButtonElement>('[data-date="2026-07-15"]')!;
    cell15.focus();

    dropdown.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));

    expect((document.activeElement as HTMLElement)?.getAttribute('data-date')).toBe('2026-07-08');
  });

  it('PageUp navigates to previous month', async () => {
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, value: '2026-07-15' });
    await dp.open();

    const dropdown = document.querySelector('.vdp-dropdown')!;
    const cell15 = document.querySelector<HTMLButtonElement>('[data-date="2026-07-15"]')!;
    cell15.focus();

    dropdown.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageUp', bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));

    // Calendar should now show June — check for June 15
    const juneCell = document.querySelector('[data-date="2026-06-15"]');
    expect(juneCell).not.toBeNull();
  });

  it('PageDown navigates to next month', async () => {
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, value: '2026-07-15' });
    await dp.open();

    const dropdown = document.querySelector('.vdp-dropdown')!;
    const cell15 = document.querySelector<HTMLButtonElement>('[data-date="2026-07-15"]')!;
    cell15.focus();

    dropdown.dispatchEvent(new KeyboardEvent('keydown', { key: 'PageDown', bubbles: true }));
    await new Promise((r) => setTimeout(r, 0));

    // Calendar should now show August — check for August 15
    const augCell = document.querySelector('[data-date="2026-08-15"]');
    expect(augCell).not.toBeNull();
  });

  it('Enter selects focused date', async () => {
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, value: '2026-07-15', closeOnSelect: false });
    await dp.open();

    const dropdown = document.querySelector('.vdp-dropdown')!;
    const cell20 = document.querySelector<HTMLButtonElement>('[data-date="2026-07-20"]')!;
    cell20.focus();

    dropdown.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    await new Promise((r) => setTimeout(r, 10));

    expect(dp.getValue()).toBe('2026-07-20');
  });
});

// ─── ARIA attributes ──────────────────────────────────────────────────────────

describe('ARIA attributes', () => {
  let dp: Datepicker;
  let input: HTMLInputElement;

  afterEach(() => {
    dp?.destroy();
    document.body.innerHTML = '';
  });

  it('input has role=combobox', () => {
    input = makeInput();
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    expect(input.getAttribute('role')).toBe('combobox');
  });

  it('input has aria-haspopup=dialog', () => {
    input = makeInput();
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    expect(input.getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('dropdown has role=dialog', async () => {
    input = makeInput();
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    await dp.open();
    const dropdown = document.querySelector('.vdp-dropdown');
    expect(dropdown?.getAttribute('role')).toBe('dialog');
    await dp.close();
  });

  it('dropdown has aria-modal=false', async () => {
    input = makeInput();
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    await dp.open();
    const dropdown = document.querySelector('.vdp-dropdown');
    expect(dropdown?.getAttribute('aria-modal')).toBe('false');
    await dp.close();
  });

  it('selected cell has aria-selected=true', async () => {
    input = makeInput();
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false, value: '2026-07-15' });
    await dp.open();
    const cell = document.querySelector<HTMLElement>('[data-date="2026-07-15"]');
    expect(cell?.getAttribute('aria-selected')).toBe('true');
    await dp.close();
  });

  it('today cell has aria-current=date', async () => {
    input = makeInput();
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    await dp.open();
    const today = document.querySelector('[aria-current="date"]');
    expect(today).not.toBeNull();
    await dp.close();
  });

  it('input aria-controls references dropdown id after open', async () => {
    input = makeInput();
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    await dp.open();
    const controls = input.getAttribute('aria-controls');
    expect(controls).not.toBeNull();
    const dropdown = document.getElementById(controls!);
    expect(dropdown).not.toBeNull();
    expect(dropdown?.classList.contains('vdp-dropdown')).toBe(true);
    await dp.close();
  });

  it('aria-controls is removed after close', async () => {
    input = makeInput();
    dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    await dp.open();
    await dp.close();
    expect(input.getAttribute('aria-controls')).toBeNull();
  });
});
