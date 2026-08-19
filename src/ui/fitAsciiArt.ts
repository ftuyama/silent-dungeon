/**
 * Reduz o `font-size` de um `<pre>` ASCII/Braille até caber na largura disponível
 * (ecrãs estreitos / telemóvel). Reajusta em resize via `ResizeObserver`.
 * Idempotente: em jsdom (dimensões 0) ou conteúdo já ajustado é no-op.
 */
export function fitAsciiArtToWidth(pre: HTMLElement): void {
  const refit = (): void => {
    pre.style.fontSize = '';
    const basePx = parseFloat(getComputedStyle(pre).fontSize);
    if (!basePx) return;
    const style = getComputedStyle(pre);
    const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const availW = pre.clientWidth - padX;
    const contentW = pre.scrollWidth - padX;
    if (availW <= 0 || contentW <= 0 || contentW <= availW) return;
    pre.style.fontSize = `${(basePx * availW) / contentW}px`;
  };

  refit();
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(refit).observe(pre);
  }
}
