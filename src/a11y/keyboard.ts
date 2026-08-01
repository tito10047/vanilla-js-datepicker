export type KeyAction =
  | 'prev-day' | 'next-day'
  | 'prev-week' | 'next-week'
  | 'prev-month' | 'next-month'
  | 'prev-year' | 'next-year'
  | 'start-week' | 'end-week'
  | 'start-month' | 'end-month'
  | 'select' | 'close'
  | 'prev-row' | 'next-row' | 'prev-col' | 'next-col';

export function resolveGridKeyAction(e: KeyboardEvent): KeyAction | null {
  switch (e.key) {
    case 'ArrowLeft': return 'prev-day';
    case 'ArrowRight': return 'next-day';
    case 'ArrowUp': return 'prev-week';
    case 'ArrowDown': return 'next-week';
    case 'PageUp': return e.shiftKey ? 'prev-year' : 'prev-month';
    case 'PageDown': return e.shiftKey ? 'next-year' : 'next-month';
    case 'Home': return e.ctrlKey ? 'start-month' : 'start-week';
    case 'End': return e.ctrlKey ? 'end-month' : 'end-week';
    case 'Enter':
    case ' ': return 'select';
    case 'Escape': return 'close';
    case 'Tab': return null;
    default: return null;
  }
}
