import { tokenize } from './tokens';
import type { LocaleConfig } from '../core/types';

export function formatDate(date: Date, format: string, locale?: Partial<LocaleConfig>): string {
  const { parts } = tokenize(format);
  let result = '';

  for (const part of parts) {
    if (part.type === 'literal') {
      result += part.value;
      continue;
    }
    const token = part.token;
    switch (token) {
      case 'YYYY': result += String(date.getFullYear()); break;
      case 'YY': result += String(date.getFullYear()).slice(-2); break;
      case 'MMMM': result += locale?.monthsLong?.[date.getMonth()] ?? String(date.getMonth() + 1); break;
      case 'MMM': result += locale?.monthsShort?.[date.getMonth()] ?? String(date.getMonth() + 1); break;
      case 'MM': result += String(date.getMonth() + 1).padStart(2, '0'); break;
      case 'M': result += String(date.getMonth() + 1); break;
      case 'DD': result += String(date.getDate()).padStart(2, '0'); break;
      case 'D': result += String(date.getDate()); break;
      case 'dddd': result += locale?.weekdaysLong?.[date.getDay()] ?? String(date.getDay()); break;
      case 'ddd': result += locale?.weekdaysShort?.[date.getDay()] ?? String(date.getDay()); break;
    }
  }

  return result;
}
