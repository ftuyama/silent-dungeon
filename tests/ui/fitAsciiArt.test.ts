import { beforeEach, afterEach, describe, expect, it } from 'vitest';
import { fitAsciiArtToWidth } from '../../src/ui/fitAsciiArt.ts';

const baseGetComputedStyle = globalThis.getComputedStyle;

beforeEach(() => {
  // @ts-expect-error -- mock mínimo para testes em Node
  globalThis.getComputedStyle = (el: HTMLElement) => {
    const padL = parseFloat(el.style.paddingLeft) || 8;
    const padR = parseFloat(el.style.paddingRight) || 8;
    return {
      fontSize: el.style.fontSize || '16px',
      paddingLeft: `${padL}px`,
      paddingRight: `${padR}px`,
    } as unknown as CSSStyleDeclaration;
  };
});

afterEach(() => {
  globalThis.getComputedStyle = baseGetComputedStyle as typeof getComputedStyle;
});

describe('fitAsciiArtToWidth', () => {
  it('reduz font-size quando conteúdo excede a largura disponível', () => {
    const pre = { style: { fontSize: '' }, clientWidth: 100, scrollWidth: 200 } as unknown as HTMLElement;
    pre.style.fontSize = '';
    pre.style.paddingLeft = '8px';
    pre.style.paddingRight = '8px';
    (pre as unknown as Record<string, number>).clientWidth = 100;
    (pre as unknown as Record<string, number>).scrollWidth = 200;

    fitAsciiArtToWidth(pre);

    // (clientWidth - padX) / (scrollWidth - padX) = 84 / 184 ≈ 0.4565
    expect(parseFloat(pre.style.fontSize)).toBeCloseTo(7.3, 1);
  });

  it('não altera nada quando conteúdo já cabe', () => {
    const pre = { style: { fontSize: '' }, clientWidth: 200, scrollWidth: 100 } as unknown as HTMLElement;
    pre.style.paddingLeft = '8px';
    pre.style.paddingRight = '8px';

    fitAsciiArtToWidth(pre);

    expect(pre.style.fontSize).toBe('');
  });
});
