import { describe, it, expect, beforeEach } from 'vitest';
import { resolveLocale, registerLocale } from '../src/i18n/i18n';
import type { LocaleConfig } from '../src/core/types';

describe('resolveLocale', () => {
  it('resolves "sk" to Slovak', () => {
    const locale = resolveLocale('sk');
    expect(locale.code).toBe('sk');
    expect(locale.monthsLong[0]).toBe('január');
    expect(locale.monthsLong[6]).toBe('júl');
    expect(locale.weekStart).toBe(1);
  });

  it('resolves "en" to English', () => {
    const locale = resolveLocale('en');
    expect(locale.code).toBe('en');
    expect(locale.monthsLong[0]).toBe('January');
    expect(locale.weekStart).toBe(0);
  });

  it('resolves "cs" to Czech', () => {
    const locale = resolveLocale('cs');
    expect(locale.code).toBe('cs');
    expect(locale.monthsLong[0]).toBe('leden');
    expect(locale.weekStart).toBe(1);
  });

  it('resolves "de" to German', () => {
    const locale = resolveLocale('de');
    expect(locale.code).toBe('de');
    expect(locale.monthsLong[0]).toBe('Januar');
    expect(locale.weekStart).toBe(1);
  });

  it('falls back to sk for unknown locale', () => {
    const locale = resolveLocale('xx-unknown');
    expect(locale.code).toBe('sk');
  });

  it('returns passed LocaleConfig object directly', () => {
    const custom: LocaleConfig = {
      code: 'test',
      title: 'Test',
      monthsLong: Array(12).fill('month'),
      monthsShort: Array(12).fill('mo'),
      weekdaysLong: Array(7).fill('day'),
      weekdaysShort: Array(7).fill('dy'),
      weekdaysNarrow: Array(7).fill('d'),
      weekStart: 0,
      todayLabel: 'Today',
      clearLabel: 'Clear',
      confirmLabel: 'OK',
      cancelLabel: 'Cancel',
      prevMonthLabel: 'Prev',
      nextMonthLabel: 'Next',
      prevYearLabel: 'Prev year',
      nextYearLabel: 'Next year',
      prevDecadeLabel: 'Prev decade',
      nextDecadeLabel: 'Next decade',
      monthPickerLabel: 'Months',
      yearPickerLabel: 'Years',
      weekNumberLabel: 'W',
    };
    expect(resolveLocale(custom)).toBe(custom);
  });

  it('returns sk when undefined is passed', () => {
    expect(resolveLocale(undefined).code).toBe('sk');
  });
});

describe('registerLocale', () => {
  const hu: LocaleConfig = {
    code: 'hu',
    title: 'Dátum kiválasztása',
    monthsLong: ['január', 'február', 'március', 'április', 'május', 'június', 'július', 'augusztus', 'szeptember', 'október', 'november', 'december'],
    monthsShort: ['jan', 'feb', 'már', 'ápr', 'máj', 'jún', 'júl', 'aug', 'szep', 'okt', 'nov', 'dec'],
    weekdaysLong: ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat'],
    weekdaysShort: ['va', 'hé', 'ke', 'sze', 'csü', 'pé', 'szo'],
    weekdaysNarrow: ['V', 'H', 'K', 'Sz', 'Cs', 'P', 'Sz'],
    weekStart: 1,
    todayLabel: 'Ma',
    clearLabel: 'Törlés',
    confirmLabel: 'OK',
    cancelLabel: 'Mégse',
    prevMonthLabel: 'Előző hónap',
    nextMonthLabel: 'Következő hónap',
    prevYearLabel: 'Előző év',
    nextYearLabel: 'Következő év',
    prevDecadeLabel: 'Előző évtized',
    nextDecadeLabel: 'Következő évtized',
    monthPickerLabel: 'Hónap kiválasztása',
    yearPickerLabel: 'Év kiválasztása',
    weekNumberLabel: 'Hét',
  };

  it('registers and resolves custom locale', () => {
    registerLocale('hu', hu);
    const resolved = resolveLocale('hu');
    expect(resolved.code).toBe('hu');
    expect(resolved.monthsLong[6]).toBe('július');
  });

  it('custom locale overrides built-in code if same name', () => {
    const customEn: LocaleConfig = { ...hu, code: 'en-custom' };
    registerLocale('en-custom', customEn);
    expect(resolveLocale('en-custom').code).toBe('en-custom');
  });
});

describe('sk locale completeness', () => {
  it('has 12 monthsLong', () => { expect(resolveLocale('sk').monthsLong.length).toBe(12); });
  it('has 12 monthsShort', () => { expect(resolveLocale('sk').monthsShort.length).toBe(12); });
  it('has 7 weekdaysLong', () => { expect(resolveLocale('sk').weekdaysLong.length).toBe(7); });
  it('has 7 weekdaysShort', () => { expect(resolveLocale('sk').weekdaysShort.length).toBe(7); });
  it('has 7 weekdaysNarrow', () => { expect(resolveLocale('sk').weekdaysNarrow.length).toBe(7); });
  it('has all required label keys', () => {
    const l = resolveLocale('sk');
    expect(l.todayLabel).toBeTruthy();
    expect(l.clearLabel).toBeTruthy();
    expect(l.confirmLabel).toBeTruthy();
    expect(l.cancelLabel).toBeTruthy();
    expect(l.prevMonthLabel).toBeTruthy();
    expect(l.nextMonthLabel).toBeTruthy();
    expect(l.weekNumberLabel).toBeTruthy();
  });
});
