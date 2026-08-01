import { tokenize } from './tokens';
import { daysInMonth } from '../utils/dateMath';
import type { LocaleConfig } from '../core/types';

/**
 * Parse a date string according to a format string.
 * Returns null for invalid / out-of-range dates.
 */
export function parseDate(input: string, format: string, locale?: Partial<LocaleConfig>): Date | null {
  if (!input.trim()) return null;

  const { parts } = tokenize(format);
  let s = input;

  // Use null to distinguish "not provided" from "parsed to 0 / invalid"
  let year: number | null = null;
  let month: number | null = null;
  let day: number | null = null;

  for (const part of parts) {
    if (!s) break;

    if (part.type === 'literal') {
      const lit = part.value;
      if (s.startsWith(lit)) {
        s = s.slice(lit.length);
      } else if (/\W/.test(s[0]!)) {
        s = s.slice(1);
      }
      continue;
    }

    const token = part.token;

    switch (token) {
      case 'YYYY': {
        const m = s.match(/^(\d{4})/);
        if (!m) return null;
        year = parseInt(m[1]!, 10);
        s = s.slice(4);
        break;
      }
      case 'YY': {
        const m = s.match(/^(\d{2})/);
        if (!m) return null;
        const yy = parseInt(m[1]!, 10);
        year = yy >= 0 && yy <= 68 ? 2000 + yy : 1900 + yy;
        s = s.slice(2);
        break;
      }
      case 'MMMM': {
        const names = locale?.monthsLong ?? [];
        const idx = names.findIndex((n) => s.toLowerCase().startsWith(n.toLowerCase()));
        if (idx < 0) return null;
        month = idx; // 0-based, valid range 0-11
        s = s.slice(names[idx]!.length);
        break;
      }
      case 'MMM': {
        const names = locale?.monthsShort ?? locale?.monthsLong ?? [];
        const idx = names.findIndex((n) => s.toLowerCase().startsWith(n.toLowerCase()));
        if (idx < 0) return null;
        month = idx;
        s = s.slice(names[idx]!.length);
        break;
      }
      case 'MM':
      case 'M': {
        const m = s.match(/^(\d{1,2})/);
        if (!m) return null;
        const rawMonth = parseInt(m[1]!, 10);
        // 1-based input — validate before converting to 0-based
        if (rawMonth < 1 || rawMonth > 12) return null;
        month = rawMonth - 1;
        s = s.slice(m[1]!.length);
        break;
      }
      case 'DD':
      case 'D': {
        const m = s.match(/^(\d{1,2})/);
        if (!m) return null;
        day = parseInt(m[1]!, 10);
        s = s.slice(m[1]!.length);
        break;
      }
      case 'dddd':
      case 'ddd':
        // weekday tokens — consume but ignore
        s = s.replace(/^[^\d\W]+/, '');
        break;
    }
  }

  // Defaults for missing parts (use today)
  const today = new Date();
  const resolvedYear = year ?? today.getFullYear();
  const resolvedMonth = month ?? today.getMonth();
  const resolvedDay = day ?? today.getDate();

  // Range validation
  if (resolvedMonth < 0 || resolvedMonth > 11) return null;
  if (resolvedDay < 1) return null;
  if (resolvedDay > daysInMonth(resolvedYear, resolvedMonth)) return null;

  return new Date(resolvedYear, resolvedMonth, resolvedDay);
}
