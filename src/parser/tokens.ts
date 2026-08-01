/** Supported format tokens (longest first to avoid partial matches). */
export const FORMAT_TOKENS = ['YYYY', 'YY', 'MMMM', 'MMM', 'MM', 'M', 'DD', 'D', 'dddd', 'ddd'] as const;
export type FormatToken = typeof FORMAT_TOKENS[number];

export interface TokenizedFormat {
  parts: Array<{ type: 'token'; token: FormatToken } | { type: 'literal'; value: string }>;
  hasYear: boolean;
  hasMonth: boolean;
  hasDay: boolean;
  hasWeekday: boolean;
}

export function tokenize(format: string): TokenizedFormat {
  const parts: TokenizedFormat['parts'] = [];
  let i = 0;
  let hasYear = false, hasMonth = false, hasDay = false, hasWeekday = false;

  while (i < format.length) {
    let matched = false;
    for (const token of FORMAT_TOKENS) {
      if (format.startsWith(token, i)) {
        parts.push({ type: 'token', token });
        i += token.length;
        if (token === 'YYYY' || token === 'YY') hasYear = true;
        else if (token === 'MMMM' || token === 'MMM' || token === 'MM' || token === 'M') hasMonth = true;
        else if (token === 'DD' || token === 'D') hasDay = true;
        else if (token === 'dddd' || token === 'ddd') hasWeekday = true;
        matched = true;
        break;
      }
    }
    if (!matched) {
      const last = parts[parts.length - 1];
      if (last?.type === 'literal') {
        last.value += format[i];
      } else {
        parts.push({ type: 'literal', value: format[i]! });
      }
      i++;
    }
  }

  return { parts, hasYear, hasMonth, hasDay, hasWeekday };
}
