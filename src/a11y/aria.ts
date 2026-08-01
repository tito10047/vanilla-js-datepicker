export function createLiveRegion() {
  const el = document.createElement('div');
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-atomic', 'true');
  el.className = 'vdp-live';
  document.body.appendChild(el);
  return {
    el,
    announce(message: string): void {
      el.textContent = '';
      // Force re-announcement by clearing and setting with rAF
      requestAnimationFrame(() => { el.textContent = message; });
    },
  };
}
