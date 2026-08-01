import { describe, it, expect } from 'vitest';
import { parseDate } from '../src/parser/parse';
import { formatDate } from '../src/parser/format';
import { tokenize } from '../src/parser/tokens';

// ─── tokenize ─────────────────────────────────────────────────────────────────

describe('tokenize', () => {
  it('tokenizes YYYY-MM-DD', () => {
    const r = tokenize('YYYY-MM-DD');
    expect(r.hasYear).toBe(true);
    expect(r.hasMonth).toBe(true);
    expect(r.hasDay).toBe(true);
    expect(r.parts.length).toBe(5); // YYYY - MM - DD
  });

  it('tokenizes DD.MM.YYYY', () => {
    const r = tokenize('DD.MM.YYYY');
    expect(r.parts[0]).toMatchObject({ type: 'token', token: 'DD' });
    expect(r.parts[2]).toMatchObject({ type: 'token', token: 'MM' });
    expect(r.parts[4]).toMatchObject({ type: 'token', token: 'YYYY' });
  });

  it('tokenizes MMMM D, YYYY', () => {
    const r = tokenize('MMMM D, YYYY');
    expect(r.parts[0]).toMatchObject({ type: 'token', token: 'MMMM' });
    expect(r.parts[2]).toMatchObject({ type: 'token', token: 'D' });
    expect(r.parts[4]).toMatchObject({ type: 'token', token: 'YYYY' });
  });
});

// ─── formatDate ───────────────────────────────────────────────────────────────

describe('formatDate', () => {
  const d = new Date(2026, 6, 4); // 2026-07-04

  it('formats YYYY-MM-DD', () => {
    expect(formatDate(d, 'YYYY-MM-DD')).toBe('2026-07-04');
  });

  it('formats DD.MM.YYYY', () => {
    expect(formatDate(d, 'DD.MM.YYYY')).toBe('04.07.2026');
  });

  it('formats MM/DD/YYYY', () => {
    expect(formatDate(d, 'MM/DD/YYYY')).toBe('07/04/2026');
  });

  it('formats YY', () => {
    expect(formatDate(d, 'YY')).toBe('26');
  });

  it('formats M (no pad)', () => {
    expect(formatDate(d, 'M')).toBe('7');
  });

  it('formats D (no pad)', () => {
    expect(formatDate(d, 'D')).toBe('4');
  });

  it('formats MMMM with locale', () => {
    const locale = { monthsLong: ['január', 'február', 'marec', 'apríl', 'máj', 'jún', 'júl', 'august', 'september', 'október', 'november', 'december'] };
    expect(formatDate(d, 'MMMM D, YYYY', locale)).toBe('júl 4, 2026');
  });

  it('formats MMM with locale', () => {
    const locale = { monthsShort: ['jan', 'feb', 'mar', 'apr', 'máj', 'jún', 'júl', 'aug', 'sep', 'okt', 'nov', 'dec'] };
    expect(formatDate(d, 'MMM', locale)).toBe('júl');
  });
});

// ─── parseDate — §5.3 test criteria ──────────────────────────────────────────

describe('parseDate', () => {
  it('parses 2026-07-04 (YYYY-MM-DD)', () => {
    const r = parseDate('2026-07-04', 'YYYY-MM-DD');
    expect(r).not.toBeNull();
    expect(r!.getFullYear()).toBe(2026);
    expect(r!.getMonth()).toBe(6);
    expect(r!.getDate()).toBe(4);
  });

  it('parses 04.07.2026 (DD.MM.YYYY)', () => {
    const r = parseDate('04.07.2026', 'DD.MM.YYYY');
    expect(r!.getFullYear()).toBe(2026);
    expect(r!.getMonth()).toBe(6);
    expect(r!.getDate()).toBe(4);
  });

  it('parses 4.7.26 (D.M.YY)', () => {
    const r = parseDate('4.7.26', 'D.M.YY');
    expect(r!.getFullYear()).toBe(2026);
    expect(r!.getMonth()).toBe(6);
    expect(r!.getDate()).toBe(4);
  });

  it('parses 07/04/2026 (MM/DD/YYYY)', () => {
    const r = parseDate('07/04/2026', 'MM/DD/YYYY');
    expect(r!.getFullYear()).toBe(2026);
    expect(r!.getMonth()).toBe(6);
    expect(r!.getDate()).toBe(4);
  });

  it('parses "júl 4, 2026" (MMMM D, YYYY) with sk locale', () => {
    const locale = {
      monthsLong: ['január', 'február', 'marec', 'apríl', 'máj', 'jún', 'júl', 'august', 'september', 'október', 'november', 'december'],
    };
    const r = parseDate('júl 4, 2026', 'MMMM D, YYYY', locale);
    expect(r).not.toBeNull();
    expect(r!.getMonth()).toBe(6);
    expect(r!.getDate()).toBe(4);
  });

  it('returns null for 2026-02-29 (non-leap)', () => {
    expect(parseDate('2026-02-29', 'YYYY-MM-DD')).toBeNull();
  });

  it('returns valid date for 2024-02-29 (leap)', () => {
    const r = parseDate('2024-02-29', 'YYYY-MM-DD');
    expect(r).not.toBeNull();
    expect(r!.getDate()).toBe(29);
  });

  it('returns null for month > 12', () => {
    expect(parseDate('2026-13-01', 'YYYY-MM-DD')).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseDate('', 'YYYY-MM-DD')).toBeNull();
  });

  it('returns null for random text', () => {
    expect(parseDate('not a date', 'YYYY-MM-DD')).toBeNull();
  });

  it('parses YY 00–68 as 2000–2068', () => {
    expect(parseDate('01.01.50', 'DD.MM.YY')!.getFullYear()).toBe(2050);
  });

  it('parses YY 69–99 as 1969–1999', () => {
    expect(parseDate('01.01.85', 'DD.MM.YY')!.getFullYear()).toBe(1985);
  });

  it('returns null for day 0', () => {
    expect(parseDate('2026-07-00', 'YYYY-MM-DD')).toBeNull();
  });

  it('returns null for month 0', () => {
    expect(parseDate('2026-00-01', 'YYYY-MM-DD')).toBeNull();
  });

  it('is tolerant to different separators', () => {
    // format uses '.' but input has '-'
    const r = parseDate('04-07-2026', 'DD.MM.YYYY');
    expect(r).not.toBeNull();
    expect(r!.getDate()).toBe(4);
    expect(r!.getMonth()).toBe(6);
  });
});

// ─── round-trip ───────────────────────────────────────────────────────────────

describe('format → parse round-trip', () => {
  const formats = ['YYYY-MM-DD', 'DD.MM.YYYY', 'MM/DD/YYYY', 'D.M.YYYY'];
  const testDates = [
    new Date(2026, 0, 1),
    new Date(2026, 6, 15),
    new Date(2024, 1, 29), // leap day
    new Date(2026, 11, 31),
  ];

  formats.forEach((fmt) => {
    testDates.forEach((orig) => {
      it(`round-trip ${fmt} for ${orig.toDateString()}`, () => {
        const str = formatDate(orig, fmt);
        const parsed = parseDate(str, fmt);
        expect(parsed).not.toBeNull();
        expect(parsed!.getFullYear()).toBe(orig.getFullYear());
        expect(parsed!.getMonth()).toBe(orig.getMonth());
        expect(parsed!.getDate()).toBe(orig.getDate());
      });
    });
  });
});
