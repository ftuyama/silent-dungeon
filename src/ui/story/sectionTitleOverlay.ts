/** Overlay full-screen: título de seção (ato / hub / exploração), estilo Hollow Knight. */

export const SECTION_TITLE_SCRIM_IN_MS = 400;
export const SECTION_TITLE_TITLE_IN_MS = 500;
export const SECTION_TITLE_HOLD_MS_DEFAULT = 1800;
export const SECTION_TITLE_FADE_OUT_MS = 450;
export const SECTION_TITLE_HOLD_MS_REDUCED = 600;

export type SectionTitleOverlayPayload = {
  kicker: string;
  title: string;
  holdMs?: number;
  onBegin: () => void;
  onEnd: () => void;
  onSfx?: () => void;
  /** Invalida timeouts se `render()` voltar a correr (novo valor de `sectionTitleGen`). */
  isCurrentGeneration: () => boolean;
};

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function createOrnamentRow(className: string): HTMLElement {
  const row = document.createElement('div');
  row.className = `section-title-ornament ${className}`;
  row.setAttribute('aria-hidden', 'true');

  const left = document.createElement('span');
  left.className = 'section-title-ornament-line section-title-ornament-line--left';

  const gem = document.createElement('span');
  gem.className = 'section-title-ornament-gem';

  const right = document.createElement('span');
  right.className = 'section-title-ornament-line section-title-ornament-line--right';

  row.append(left, gem, right);
  return row;
}

function createMotesLayer(reduced: boolean): HTMLElement {
  const motes = document.createElement('div');
  motes.className = 'section-title-motes';
  motes.setAttribute('aria-hidden', 'true');
  if (reduced) {
    motes.classList.add('section-title-motes--reduced');
  }
  for (let i = 0; i < 8; i += 1) {
    const mote = document.createElement('span');
    mote.className = 'section-title-mote';
    motes.appendChild(mote);
  }
  return motes;
}

/**
 * Monta overlay centrado com scrim + kicker + título grande.
 * Fases: fade-in scrim → título sobe → hold → fade-out → `onEnd()`.
 */
export function mountSectionTitleOverlay(
  shell: HTMLElement,
  payload: SectionTitleOverlayPayload
): void {
  payload.onBegin();
  payload.onSfx?.();

  const reduced = prefersReducedMotion();
  const holdMs = reduced
    ? SECTION_TITLE_HOLD_MS_REDUCED
    : (payload.holdMs ?? SECTION_TITLE_HOLD_MS_DEFAULT);
  const scrimIn = reduced ? 0 : SECTION_TITLE_SCRIM_IN_MS;
  const titleIn = reduced ? 0 : SECTION_TITLE_TITLE_IN_MS;
  const fadeOut = reduced ? 0 : SECTION_TITLE_FADE_OUT_MS;

  const layer = document.createElement('div');
  layer.className = 'section-title-layer';
  layer.setAttribute('role', 'status');
  layer.setAttribute('aria-live', 'polite');
  if (reduced) {
    layer.classList.add('section-title-layer--reduced');
  }

  const vignette = document.createElement('div');
  vignette.className = 'section-title-vignette';
  vignette.setAttribute('aria-hidden', 'true');
  layer.appendChild(vignette);

  layer.appendChild(createMotesLayer(reduced));

  const panel = document.createElement('div');
  panel.className = 'section-title-panel';

  const frame = document.createElement('div');
  frame.className = 'section-title-frame';
  frame.setAttribute('aria-hidden', 'true');
  panel.appendChild(frame);

  const kicker = document.createElement('div');
  kicker.className = 'section-title-kicker';
  kicker.textContent = payload.kicker;
  panel.appendChild(kicker);

  panel.appendChild(createOrnamentRow('section-title-ornament--top'));

  const titleEl = document.createElement('div');
  titleEl.className = 'section-title-text';
  titleEl.textContent = payload.title;
  panel.appendChild(titleEl);

  panel.appendChild(createOrnamentRow('section-title-ornament--bottom'));

  layer.appendChild(panel);
  shell.appendChild(layer);

  // Force layout so CSS transitions run from the initial state.
  void layer.offsetWidth;
  requestAnimationFrame(() => {
    if (!payload.isCurrentGeneration()) return;
    layer.classList.add('section-title-layer--in');
    window.setTimeout(() => {
      if (!payload.isCurrentGeneration()) return;
      layer.classList.add('section-title-layer--title-in');
    }, scrimIn);
  });

  const outAt = scrimIn + titleIn + holdMs;
  window.setTimeout(() => {
    if (!payload.isCurrentGeneration()) return;
    layer.classList.remove('section-title-layer--in', 'section-title-layer--title-in');
    layer.classList.add('section-title-layer--out');
  }, outAt);

  window.setTimeout(() => {
    if (!payload.isCurrentGeneration()) return;
    layer.remove();
    payload.onEnd();
  }, outAt + fadeOut);
}
