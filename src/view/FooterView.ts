import { el, cn } from './templates';
import type { DatepickerOptions, LocaleConfig } from '../core/types';

export interface FooterCallbacks {
  onToday: () => void;
  onClear: () => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export class FooterView {
  readonly root: HTMLElement;

  constructor(
    private opts: DatepickerOptions,
    private locale: LocaleConfig,
    private callbacks: FooterCallbacks,
  ) {
    this.root = document.createElement('div');
    this.root.className = cn(opts, 'footer', 'vdp-footer');
    this.build();
  }

  private build(): void {
    if (this.opts.showTodayButton) {
      const btn = el('button', { class: cn(this.opts, 'todayButton', 'vdp-btn vdp-btn-today'), type: 'button' }, this.locale.todayLabel);
      btn.addEventListener('click', () => this.callbacks.onToday());
      this.root.append(btn);
    }
    if (this.opts.showClearButton) {
      const btn = el('button', { class: cn(this.opts, 'clearButton', 'vdp-btn vdp-btn-clear'), type: 'button' }, this.locale.clearLabel);
      btn.addEventListener('click', () => this.callbacks.onClear());
      this.root.append(btn);
    }
    if (this.opts.showCancelButton) {
      const btn = el('button', { class: cn(this.opts, 'cancelButton', 'vdp-btn vdp-btn-cancel'), type: 'button' }, this.locale.cancelLabel);
      btn.addEventListener('click', () => this.callbacks.onCancel());
      this.root.append(btn);
    }
    if (this.opts.showConfirmButton) {
      const btn = el('button', { class: cn(this.opts, 'confirmButton', 'vdp-btn vdp-btn-confirm'), type: 'button' }, this.locale.confirmLabel);
      btn.addEventListener('click', () => this.callbacks.onConfirm());
      this.root.append(btn);
    }
  }

  hasButtons(): boolean {
    return !!(this.opts.showTodayButton || this.opts.showClearButton || this.opts.showConfirmButton || this.opts.showCancelButton);
  }
}
