import { describe, it, expect, afterEach } from 'vitest';
import { Datepicker } from '../src/core/Datepicker';

function makeInput(): HTMLInputElement {
  const el = document.createElement('input');
  el.type = 'text';
  document.body.appendChild(el);
  return el;
}

afterEach(() => {
  document.body.innerHTML = '';
});

// ─── prevButtonContent / nextButtonContent ────────────────────────────────────

describe('prevButtonContent — default SVG', () => {
  it('renders an SVG inside the prev button by default', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    await dp.open();

    const prevBtn = document.querySelector<HTMLElement>('.vdp-btn-prev');
    expect(prevBtn).not.toBeNull();
    expect(prevBtn!.querySelector('svg')).not.toBeNull();

    await dp.close();
    dp.destroy();
  });
});

describe('nextButtonContent — default SVG', () => {
  it('renders an SVG inside the next button by default', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, { format: 'YYYY-MM-DD', openOnFocus: false });
    await dp.open();

    const nextBtn = document.querySelector<HTMLElement>('.vdp-btn-next');
    expect(nextBtn).not.toBeNull();
    expect(nextBtn!.querySelector('svg')).not.toBeNull();

    await dp.close();
    dp.destroy();
  });
});

describe('prevButtonContent — custom text character', () => {
  it('replaces the default SVG with a custom character', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      prevButtonContent: '‹',
    });
    await dp.open();

    const prevBtn = document.querySelector<HTMLElement>('.vdp-btn-prev');
    expect(prevBtn!.textContent).toBe('‹');
    expect(prevBtn!.querySelector('svg')).toBeNull();

    await dp.close();
    dp.destroy();
  });
});

describe('nextButtonContent — custom text character', () => {
  it('replaces the default SVG with a custom character', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      nextButtonContent: '›',
    });
    await dp.open();

    const nextBtn = document.querySelector<HTMLElement>('.vdp-btn-next');
    expect(nextBtn!.textContent).toBe('›');
    expect(nextBtn!.querySelector('svg')).toBeNull();

    await dp.close();
    dp.destroy();
  });
});

describe('prevButtonContent — custom SVG string', () => {
  it('renders the provided SVG markup', async () => {
    const svgIcon = '<svg data-testid="custom-prev"><path d="M10 5L5 10"/></svg>';
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      prevButtonContent: svgIcon,
    });
    await dp.open();

    const prevBtn = document.querySelector<HTMLElement>('.vdp-btn-prev');
    expect(prevBtn!.querySelector('[data-testid="custom-prev"]')).not.toBeNull();

    await dp.close();
    dp.destroy();
  });
});

describe('nextButtonContent — custom SVG string', () => {
  it('renders the provided SVG markup', async () => {
    const svgIcon = '<svg data-testid="custom-next"><path d="M5 5L10 10"/></svg>';
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      nextButtonContent: svgIcon,
    });
    await dp.open();

    const nextBtn = document.querySelector<HTMLElement>('.vdp-btn-next');
    expect(nextBtn!.querySelector('[data-testid="custom-next"]')).not.toBeNull();

    await dp.close();
    dp.destroy();
  });
});

describe('prevButtonContent and nextButtonContent — set independently', () => {
  it('can override only prev without affecting next', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      prevButtonContent: '«',
    });
    await dp.open();

    const prevBtn = document.querySelector<HTMLElement>('.vdp-btn-prev');
    const nextBtn = document.querySelector<HTMLElement>('.vdp-btn-next');
    expect(prevBtn!.textContent).toBe('«');
    expect(nextBtn!.querySelector('svg')).not.toBeNull();

    await dp.close();
    dp.destroy();
  });

  it('can override only next without affecting prev', async () => {
    const input = makeInput();
    const dp = new Datepicker(input, {
      format: 'YYYY-MM-DD',
      openOnFocus: false,
      nextButtonContent: '»',
    });
    await dp.open();

    const prevBtn = document.querySelector<HTMLElement>('.vdp-btn-prev');
    const nextBtn = document.querySelector<HTMLElement>('.vdp-btn-next');
    expect(prevBtn!.querySelector('svg')).not.toBeNull();
    expect(nextBtn!.textContent).toBe('»');

    await dp.close();
    dp.destroy();
  });
});
