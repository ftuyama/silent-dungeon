import type { GameState } from '../../engine/schema/index.ts';
import type { LoadedScene, StoryDiceRollBreakdown } from '../../engine/core/index.ts';
import { CIRCULO_SKILL_REROLL_REP_COST } from '../../engine/progression/index.ts';
import { formatDiceAscii } from '../diceAscii.ts';
import { t } from '../../i18n/index.ts';

export type StoryDiceRollPendingPayload = {
  nextState: GameState;
  breakdown: StoryDiceRollBreakdown;
  reroll?: {
    preRollState: GameState;
    rolledScene: LoadedScene;
    rollKind: 'skill' | 'dualSkill' | 'luck';
  };
};

export type StoryDiceBannerHost = {
  clearDiceRollTimers(): void;
  setDiceRollIntervalTimer(t: ReturnType<typeof setInterval> | null): void;
  setDiceRollEnterHandler(h: ((e: KeyboardEvent) => void) | null): void;
  /** clear timers, clear pending roll, stabilize, play click, render */
  dismissStoryDiceRoll: (nextState: GameState) => void;
  playCheckSuccess(): void;
  playCheckFail(): void;
  /** Rerrolagem paga do Círculo após falha em teste elegível (quando `pending.reroll` existe). */
  onCirculoDiceReroll?: () => void;
};

const STORY_DICE_ROLL_TICK_MS = 128;
const STORY_DICE_ROLL_MAX_TICKS = 18;

/** Par de d6 para a animação cosmética: `crypto.getRandomValues` ou xorshift por banner. */
function storyDiceAnimScratchNext(seedRef: { s: number }): number {
  let x = seedRef.s;
  x ^= x << 13;
  x >>>= 0;
  x ^= x >>> 17;
  x ^= x << 5;
  seedRef.s = x >>> 0;
  return seedRef.s;
}

function randomStoryDicePairForAnim(seedRef: { s: number }): [number, number] {
  const c = globalThis.crypto;
  if (typeof c?.getRandomValues === 'function') {
    const buf = new Uint8Array(2);
    c.getRandomValues(buf);
    return [(buf[0]! % 6) + 1, (buf[1]! % 6) + 1];
  }
  const a = storyDiceAnimScratchNext(seedRef);
  const b = storyDiceAnimScratchNext(seedRef);
  return [(a % 6) + 1, (b % 6) + 1];
}

function storyDiceTargetTn(breakdown: StoryDiceRollBreakdown): number {
  if (breakdown.kind === 'dualSkill') {
    return breakdown.rounds[0]?.tn ?? 0;
  }
  return breakdown.tn;
}

function formatModSigned(m: number): string {
  if (m > 0) return `+${m}`;
  if (m < 0) return `−${Math.abs(m)}`;
  return '0';
}

function appendModChip(parent: HTMLElement, label: string, value: string, curse = false): void {
  const chip = document.createElement('span');
  chip.className = curse
    ? 'story-dice-mod-chip story-dice-mod-chip--curse'
    : 'story-dice-mod-chip';
  const lab = document.createElement('span');
  lab.className = 'story-dice-mod-chip-label';
  lab.textContent = label;
  const val = document.createElement('span');
  val.className = 'story-dice-mod-chip-value';
  val.textContent = value;
  chip.append(lab, val);
  parent.appendChild(chip);
}

/** Meta compacta: TN + chips de modificador. */
function populateStoryDiceMeta(el: HTMLElement, breakdown: StoryDiceRollBreakdown): void {
  el.replaceChildren();
  el.className = 'story-dice-meta';

  const tnRow = document.createElement('div');
  tnRow.className = 'story-dice-meta-tn';
  const lab = document.createElement('span');
  lab.className = 'story-dice-meta-tn-label';
  lab.textContent = t('story.difficulty');
  const val = document.createElement('span');
  val.className = 'story-dice-meta-tn-value';
  val.textContent = String(storyDiceTargetTn(breakdown));
  tnRow.append(lab, val);
  el.appendChild(tnRow);

  if (breakdown.kind === 'dualSkill') {
    const sub = document.createElement('div');
    sub.className = 'story-dice-meta-hint';
    sub.textContent = t('story.dualSkillDifficultyHint');
    el.appendChild(sub);
  }

  const chips = document.createElement('div');
  chips.className = 'story-dice-meta-chips';

  if (breakdown.kind === 'skill') {
    if (breakdown.mod !== 0) {
      appendModChip(chips, breakdown.attr.toUpperCase(), formatModSigned(breakdown.mod));
    }
  } else if (breakdown.kind === 'luck') {
    if (breakdown.mod !== 0) {
      appendModChip(chips, t('engine.attrLuck'), formatModSigned(breakdown.mod));
    }
    if (breakdown.luckPenalty > 0) {
      appendModChip(chips, t('story.diceCurse'), `−${breakdown.luckPenalty}`, true);
    }
  } else {
    const r0 = breakdown.rounds[0];
    if (r0) {
      const [a1, a2] = breakdown.attrs;
      if (r0.mod1 !== 0) appendModChip(chips, a1.toUpperCase(), formatModSigned(r0.mod1));
      if (r0.mod2 !== 0) appendModChip(chips, a2.toUpperCase(), formatModSigned(r0.mod2));
    }
  }

  if (chips.childNodes.length > 0) el.appendChild(chips);
}

/** Modificador após a soma dos dados (ex.: "+ 2" ou "− 1"). */
function formatModAfterDice(mod: number): string {
  if (mod >= 0) return `+ ${mod}`;
  return `− ${Math.abs(mod)}`;
}

/** Lado esquerdo da equação + total destacado (dados já vistos no ASCII acima). */
function appendMathWithTotal(parent: HTMLElement, beforeEquals: string, total: number): void {
  const math = document.createElement('div');
  math.className = 'story-dice-result-math';
  math.append(document.createTextNode(beforeEquals));
  const eq = document.createElement('span');
  eq.className = 'story-dice-result-math-eq';
  eq.textContent = '=';
  const totalEl = document.createElement('span');
  totalEl.className = 'story-dice-result-total';
  totalEl.textContent = String(total);
  math.append(document.createTextNode('\u00a0'), eq, document.createTextNode('\u00a0'), totalEl);
  parent.appendChild(math);
}

function appendOutcomeLine(parent: HTMLElement, success: boolean): void {
  const line = document.createElement('div');
  line.className = success
    ? 'story-dice-result-outcome story-dice-result-outcome--ok'
    : 'story-dice-result-outcome story-dice-result-outcome--fail';
  line.textContent = success ? t('story.dicePass') : t('story.diceFail');
  parent.appendChild(line);
}

function populateStoryDiceRollResult(region: HTMLElement, breakdown: StoryDiceRollBreakdown): void {
  region.replaceChildren();
  region.className = 'story-dice-reveal story-dice-result story-dice-result--rich';
  region.setAttribute('aria-label', breakdown.rollLog);

  if (breakdown.kind === 'skill') {
    appendOutcomeLine(region, breakdown.success);
    const lhs = `${breakdown.d1} + ${breakdown.d2} ${formatModAfterDice(breakdown.mod)}`.replace(/\s+/g, ' ').trim();
    appendMathWithTotal(region, lhs, breakdown.total);
    return;
  }

  if (breakdown.kind === 'luck') {
    appendOutcomeLine(region, breakdown.success);
    let lhs = `${breakdown.d1} + ${breakdown.d2} ${formatModAfterDice(breakdown.mod)}`.replace(/\s+/g, ' ').trim();
    if (breakdown.luckPenalty > 0) {
      lhs += ` − ${breakdown.luckPenalty}`;
    }
    appendMathWithTotal(region, lhs, breakdown.total);
    return;
  }

  const [a1, a2] = breakdown.attrs;
  const totalR = breakdown.rounds.length;
  for (let i = 0; i < totalR; i++) {
    const r = breakdown.rounds[i]!;
    const seal = document.createElement('div');
    seal.className = r.success
      ? 'story-dice-result-seal story-dice-result-seal--ok'
      : 'story-dice-result-seal story-dice-result-seal--fail';
    const st = document.createElement('div');
    st.className = 'story-dice-result-seal-title';
    st.textContent = t('story.diceSealTitle', { current: String(i + 1), total: String(totalR) });
    seal.appendChild(st);
    appendOutcomeLine(seal, r.success);
    const lhs = `${r.d1} + ${r.d2} + ${r.mod1} (${a1.toUpperCase()}) + ${r.mod2} (${a2.toUpperCase()})`;
    appendMathWithTotal(seal, lhs, r.total);
    region.appendChild(seal);
  }
}

export function appendStoryDiceRollBanner(
  inner: HTMLElement,
  host: StoryDiceBannerHost,
  pending: StoryDiceRollPendingPayload
): void {
  const { nextState, breakdown, reroll } = pending;

  const wrap = document.createElement('div');
  wrap.className = 'story-dice-banner';

  const panel = document.createElement('div');
  panel.className = 'story-dice-banner-panel';
  panel.setAttribute('role', 'region');
  panel.setAttribute(
    'aria-label',
    breakdown.kind === 'skill'
      ? t('story.diceSkillResultAria')
      : breakdown.kind === 'dualSkill'
        ? t('story.diceDualSkillResultAria')
        : t('story.diceLuckResultAria')
  );

  const hdr = document.createElement('div');
  hdr.className = 'story-dice-banner-hdr';
  hdr.textContent =
    breakdown.kind === 'skill'
      ? t('story.diceSkillKicker', { attr: breakdown.attr.toUpperCase() })
      : breakdown.kind === 'dualSkill'
        ? t('story.diceDualSkillKicker', {
            a1: breakdown.attrs[0].toUpperCase(),
            a2: breakdown.attrs[1].toUpperCase(),
          })
        : t('story.diceLuckKicker');
  panel.appendChild(hdr);

  const body = document.createElement('div');
  body.className = 'story-dice-banner-body';

  const metaEl = document.createElement('div');
  populateStoryDiceMeta(metaEl, breakdown);
  body.appendChild(metaEl);

  const stage = document.createElement('div');
  stage.className = 'story-dice-stage';
  const pre = document.createElement('pre');
  pre.className = 'dice-ascii-block story-dice-pre story-dice-pre--rolling';
  pre.textContent = formatDiceAscii([3, 4]);
  stage.appendChild(pre);
  body.appendChild(stage);

  const resultRegion = document.createElement('div');
  resultRegion.className = 'story-dice-reveal story-dice-result';
  resultRegion.setAttribute('aria-live', 'polite');
  resultRegion.setAttribute('aria-atomic', 'true');
  resultRegion.hidden = true;
  body.appendChild(resultRegion);

  panel.appendChild(body);

  const btnRow = document.createElement('div');
  btnRow.className = 'story-dice-banner-actions';

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'story-dice-banner-dismiss';
  btn.dataset.quickNavContinue = '';
  btn.title = t('story.spacebarTitle');
  btn.textContent = t('story.continueSpace');
  btn.disabled = true;
  btnRow.appendChild(btn);

  let circuloRerollBtn: HTMLButtonElement | null = null;
  if (reroll && host.onCirculoDiceReroll) {
    const rerollBtn = document.createElement('button');
    rerollBtn.type = 'button';
    rerollBtn.className = 'story-dice-banner-reroll';
    const costLabel =
      CIRCULO_SKILL_REROLL_REP_COST < 0
        ? `−${Math.abs(CIRCULO_SKILL_REROLL_REP_COST)}`
        : String(CIRCULO_SKILL_REROLL_REP_COST);
    rerollBtn.textContent = t('story.diceCirculoReroll', { cost: costLabel });
    rerollBtn.title = t('story.diceCirculoRerollHint');
    rerollBtn.disabled = true;
    rerollBtn.addEventListener('click', () => {
      host.onCirculoDiceReroll?.();
    });
    btnRow.appendChild(rerollBtn);
    circuloRerollBtn = rerollBtn;
  }

  panel.appendChild(btnRow);

  wrap.appendChild(panel);
  inner.appendChild(wrap);
  wrap.classList.add('story-dice-banner--intro');
  panel.classList.add('story-dice-banner-panel--rolling');

  const dismiss = (): void => {
    host.dismissStoryDiceRoll(nextState);
  };

  const finishReveal = (): void => {
    panel.classList.remove('story-dice-banner-panel--rolling');
    const dPair =
      breakdown.kind === 'dualSkill'
        ? (() => {
            const last = breakdown.rounds[breakdown.rounds.length - 1];
            return last ? [last.d1, last.d2] : [1, 1];
          })()
        : [breakdown.d1, breakdown.d2];
    pre.textContent = formatDiceAscii(dPair);
    pre.classList.remove('story-dice-pre--rolling');
    pre.classList.add('story-dice-pre--landed');
    window.setTimeout(() => {
      pre.classList.remove('story-dice-pre--landed');
    }, 620);
    panel.classList.add(
      breakdown.success ? 'story-dice-banner-panel--success' : 'story-dice-banner-panel--fail'
    );
    if (breakdown.success) host.playCheckSuccess();
    else host.playCheckFail();
    resultRegion.hidden = false;
    populateStoryDiceRollResult(resultRegion, breakdown);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resultRegion.classList.add('story-dice-result--animate-in');
      });
    });
    btn.disabled = false;
    if (circuloRerollBtn) circuloRerollBtn.disabled = false;
    btn.focus();

    const onEnter = (e: KeyboardEvent): void => {
      if (e.key !== 'Enter' || btn.disabled) return;
      e.preventDefault();
      dismiss();
    };
    host.setDiceRollEnterHandler(onEnter);
    window.addEventListener('keydown', onEnter);
  };

  let ticks = 0;
  let animSeed =
    (Date.now() ^
      (typeof performance !== 'undefined' ? (performance.now() * 7919) | 0 : 0) ^
      ((Math.random() * 0xffffffff) | 0) ^
      0x9e3779b9) >>>
    0;
  if (animSeed === 0) animSeed = 0xdeadbeef;
  const animRng = { s: animSeed };

  host.setDiceRollIntervalTimer(
    setInterval(() => {
      ticks += 1;
      const [r1, r2] = randomStoryDicePairForAnim(animRng);
      pre.textContent = formatDiceAscii([r1, r2]);
      if (ticks >= STORY_DICE_ROLL_MAX_TICKS) {
        host.clearDiceRollTimers();
        finishReveal();
      }
    }, STORY_DICE_ROLL_TICK_MS)
  );

  btn.addEventListener('click', () => dismiss());
}
