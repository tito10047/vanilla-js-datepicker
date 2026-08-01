const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function createFocusTrap(container: HTMLElement) {
  let active = false;

  function onKeydown(e: KeyboardEvent): void {
    if (!active || e.key !== 'Tab') return;
    const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => !el.closest('[hidden]'),
    );
    if (!focusable.length) { e.preventDefault(); return; }
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  return {
    activate(): void {
      active = true;
      document.addEventListener('keydown', onKeydown);
      const first = container.querySelector<HTMLElement>(FOCUSABLE);
      first?.focus();
    },
    deactivate(): void {
      active = false;
      document.removeEventListener('keydown', onKeydown);
    },
  };
}
