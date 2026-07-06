import {
  canCastSpell,
  canUseCombatConsumable,
  executePlayerTurn,
  executeSpellTurn,
  fleeCombat,
  fleeDifficultyTn,
  getEffectiveSpellManaCost,
  getSacrificeValues,
  playerAttack,
  playerSpellOnAlly,
  playerSpellOnEnemy,
  SACRIFICE_MIN_CORRUPTION,
  useCombatConsumable,
} from '../engine/combat/index.ts';
import type {
  Character,
  CombatLogEntry,
  CombatState,
  GameState,
  ItemDef,
  SpellDef,
  Stance,
} from '../engine/schema/index.ts';
import type { GameData } from '../engine/data/index.ts';
import type { ContentRegistry } from '../content/registry.ts';
import type { EventBus } from '../engine/core/index.ts';
import { formatDiceAscii } from './diceAscii.ts';
import {
  buildCombatLogDisplayItems,
  escHtml,
  fmtSignedMod,
  parseCombatLogRounds,
  parseTurnBannerMessage,
  spellEmoji,
  type CombatLogDisplayItem,
} from './gameAppUtils.ts';
import type { GameAudio } from './sound/index.ts';
import { t, matchesAnyLocale } from '../i18n/index.ts';
import {
  extractLethalGhosts,
  getMeleeFxStyleForCharacter,
  isBuffInfoEntry,
  logSliceHasBuffCast,
  resolveCombatLogFx,
  type CombatLogFxResult,
} from './combatFx.ts';

/** Atalhos no combate: 1–9, depois letras (ordem QWERTY). */
const COMBAT_QUICK_KEYS_AFTER_9 = 'qwertyuiopasdfghjklzxcvbnm';

const ENEMY_TURN_BANNER = (message: string): boolean =>
  parseTurnBannerMessage(message)?.phase === 'enemy';

/** Alinhado à duração de `combatFloatDmgRise` em combat.css — o `main` é recriado a cada render, sem isto o número some no próximo frame. */
type PendingEnemyFloatingDamage = {
  encId: string;
  enemyIndex: number;
  amount: number;
  kind: 'crit' | 'normal';
  startMs: number;
  anchorLeftPct: number;
  anchorTopPct: number;
};

let pendingEnemyFloatingDamage: PendingEnemyFloatingDamage[] = [];

const HEADSHOT_IMPACT_FX_CLASS = 'combat-fx-spell-headshot--crit';
const HEADSHOT_AIM_FX_CLASS = 'combat-fx-spell-headshot--aim';

type PendingEnemyHeadshotFx = {
  encId: string;
  enemyIndex: number;
  startMs: number;
};

let pendingEnemyHeadshotFx: PendingEnemyHeadshotFx[] = [];

export function headshotFxDurationMs(): number {
  if (typeof document === 'undefined') return 1100;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1100;
}

function applyHeadshotImpactFx(fxLayer: HTMLElement, elapsedMs = 0): void {
  fxLayer.classList.add(HEADSHOT_IMPACT_FX_CLASS);
  const reduced =
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  if (!reduced && elapsedMs > 0) {
    fxLayer.style.setProperty('--combat-headshot-delay', `${-(elapsedMs / 1000)}s`);
  }
}

function applyHeadshotAimFx(fxLayer: HTMLElement): void {
  fxLayer.classList.add(HEADSHOT_AIM_FX_CLASS);
}

export function rollFloatingDmgAnchor(reducedMotion: boolean): { leftPct: number; topPct: number } {
  const leftPct = Math.round((28 + Math.random() * 44) * 10) / 10;
  const topMin = reducedMotion ? 12 : 14;
  const topSpan = reducedMotion ? 16 : 20;
  const topPct = Math.round((topMin + Math.random() * topSpan) * 10) / 10;
  return { leftPct, topPct };
}

export function floatingEnemyDamageDurationMs(): number {
  if (typeof document === 'undefined') return 2250;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1200 : 2250;
}

function splitNewLogForEnemyTurnStagger(
  entries: CombatLogEntry[]
): { pre: CombatLogEntry[]; enemy: CombatLogEntry[] } {
  const idx = entries.findIndex(
    (e) => e.kind === 'turn_banner' && e.message != null && ENEMY_TURN_BANNER(e.message)
  );
  if (idx < 0) {
    return { pre: entries, enemy: [] };
  }
  return { pre: entries.slice(0, idx), enemy: entries.slice(idx) };
}

export function appendEnemyFloatingDamage(
  fxLayer: HTMLElement,
  amount: number,
  damageKind: 'crit' | 'normal' | undefined,
  elapsedMs: number,
  anchor: { leftPct: number; topPct: number }
): void {
  if (typeof document === 'undefined') return;
  const el = document.createElement('div');
  el.className = 'combat-floating-dmg';
  if (damageKind === 'crit') {
    el.classList.add('combat-floating-dmg--crit');
  }
  el.setAttribute('aria-hidden', 'true');
  el.style.left = `${anchor.leftPct}%`;
  el.style.top = `${anchor.topPct}%`;
  const n = Math.max(0, Math.round(Math.abs(amount)));
  el.textContent = `−${n}`;
  const reduced =
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  if (reduced) {
    el.classList.add('combat-floating-dmg--reduced');
  } else if (elapsedMs > 0) {
    el.style.animationDelay = `${-(elapsedMs / 1000)}s`;
  }
  fxLayer.appendChild(el);
}

export function combatQuickKeyAt(index: number): string | null {
  if (index < 9) return String(index + 1);
  const j = index - 9;
  return j < COMBAT_QUICK_KEYS_AFTER_9.length ? COMBAT_QUICK_KEYS_AFTER_9[j]! : null;
}

export function combatShortcutTitle(btn: HTMLButtonElement): string {
  const raw = btn.dataset.quickNavCombat;
  if (raw == null) return '';
  const keyDisplay =
    raw.length === 1 && raw >= 'a' && raw <= 'z' ? raw.toUpperCase() : raw;
  return t('combat.shortcutHint', { key: keyDisplay });
}

export function createCombatQuickNavDecorator(): (
  btn: HTMLButtonElement,
  setLabel: (key: string | null) => void
) => void {
  let index = 0;
  return (btn, setLabel) => {
    const key = combatQuickKeyAt(index);
    index += 1;
    btn.classList.add('combat-action-btn');
    if (key != null) {
      btn.dataset.quickNavCombat = key;
    } else {
      delete btn.dataset.quickNavCombat;
    }
    btn.querySelector('.ui-hotkey-badge')?.remove();
    setLabel(null);
    if (key != null) {
      const hotkey = document.createElement('span');
      hotkey.className = 'ui-hotkey-badge';
      const display =
        key.length === 1 && key >= 'a' && key <= 'z' ? key.toUpperCase() : key;
      hotkey.textContent = display;
      hotkey.setAttribute('aria-hidden', 'true');
      btn.insertBefore(hotkey, btn.firstChild);
    }
    const shortcut = combatShortcutTitle(btn);
    if (shortcut) {
      btn.title = shortcut;
    } else {
      btn.removeAttribute('title');
    }
  };
}

function joinCombatActionHint(description: string, btn: HTMLButtonElement): string {
  const shortcut = combatShortcutTitle(btn);
  return shortcut ? `${description} ${shortcut}` : description;
}

const COMBAT_ATTACK_SECTION_HINT = () => t('combat.attackSectionHint');
const COMBAT_SPELL_SECTION_HINT = () => t('combat.spellSectionHint');
const COMBAT_FLEE_SECTION_HINT = () => t('combat.fleeSectionHint');
const COMBAT_CONSUMABLES_SECTION_HINT = () => t('combat.consumablesSectionHint');

export function appendCombatSectionHeader(
  parent: HTMLElement,
  className: string,
  label: string,
  hintTitle: string,
  ariaLabel: string
): void {
  const hdr = document.createElement('div');
  hdr.className = className;
  const title = document.createElement('span');
  title.textContent = label;
  hdr.appendChild(title);
  const help = document.createElement('button');
  help.type = 'button';
  help.className = 'combat-hdr-help';
  help.textContent = '?';
  help.title = hintTitle;
  help.setAttribute('aria-label', ariaLabel);
  hdr.appendChild(help);
  parent.appendChild(hdr);
}

const STANCE_COMBAT_HINT: Record<Stance, string> = {
  get aggressive() {
    return t('combat.stanceAggressiveHint');
  },
  get defensive() {
    return t('combat.stanceDefensiveHint');
  },
  get focus() {
    return t('combat.stanceFocusHint');
  },
};

function combatTargetMode(
  c: CombatState,
  spells: GameData['spells']
): 'physical' | 'enemy_spell' | 'ally_spell' | null {
  if (c.phase !== 'choose_target') return null;
  if (!c.pendingSpellId) return 'physical';
  const sp = spells[c.pendingSpellId];
  if (!sp) return 'physical';
  if (sp.spellKind === 'heal_self') return 'ally_spell';
  if (sp.spellKind === 'damage') return 'enemy_spell';
  return 'physical';
}

function chooseTargetHintText(c: CombatState, spells: GameData['spells']): string {
  if (!c.pendingSpellId) return t('combat.chooseTargetHint');
  const sp = spells[c.pendingSpellId];
  if (!sp) return t('combat.chooseTargetHint');
  if (sp.spellKind === 'targeted_crit_attack') return t('combat.chooseTargetHeadshot');
  if (sp.spellKind === 'damage') return t('combat.chooseTargetSpell', { spell: sp.name });
  if (sp.spellKind === 'heal_self') return t('combat.chooseTargetHeal', { spell: sp.name });
  return t('combat.chooseTargetHint');
}

function spellCombatHoverText(sp: SpellDef): string {
  if (sp.spellKind === 'damage') {
    return t('combat.spellHoverDamage', { dice: String(sp.dice), base: String(sp.base) });
  }
  if (sp.spellKind === 'heal_self') {
    return t('combat.spellHoverHeal', { dice: String(sp.dice), base: String(sp.base) });
  }
  if (sp.spellKind === 'buff_attack_roll') {
    return t('combat.spellHoverBuffAttack');
  }
  if (sp.spellKind === 'targeted_crit_attack') {
    return t('combat.spellHoverHeadshot');
  }
  if (sp.spellKind === 'damage_all_enemies') {
    return t('combat.spellHoverArrowRain');
  }
  return t('combat.spellHoverBuffArmor');
}

function consumableCombatHover(def: ItemDef): string {
  const bits: string[] = [];
  if (def.restoreHp && def.restoreHp > 0) {
    bits.push(t('combat.consumableHoverHp', { n: def.restoreHp }));
  }
  if (def.restoreMana && def.restoreMana > 0) {
    bits.push(t('combat.consumableHoverMana', { n: def.restoreMana }));
  }
  if (def.stressRelief && def.stressRelief > 0) {
    bits.push(t('combat.consumableHoverStress', { n: def.stressRelief }));
  }
  const summary = bits.length > 0 ? bits.join(', ') : t('combat.consumableHoverDefault');
  return t('combat.consumableHover', { summary });
}

function playCombatLogSound(
  entry: CombatLogEntry,
  partyMemberNames: ReadonlySet<string>,
  audio: GameAudio
): void {
  if (entry.kind === 'attack' && entry.outcome === 'miss') {
    audio.playMiss();
    return;
  }
  if (entry.kind === 'damage' && entry.target && partyMemberNames.has(entry.target)) {
    audio.playDamageTaken();
    return;
  }
  if (entry.kind === 'stress') {
    audio.playStressSting();
    return;
  }
}

/** Sons de impacto alinhados aos FX visuais (corte, fogo, arcano…). */
function playCombatFxImpactSounds(
  entries: CombatLogEntry[],
  party: Character[],
  audio: GameAudio,
  data: GameData
): void {
  if (entries.some((e) => e.kind === 'boss_twist')) {
    audio.playBossTwistRevelation();
  }
  const hasPotionHeal = entries.some(
    (e) => e.kind === 'heal' && e.itemId != null && e.spellId == null
  );
  for (const e of entries) {
    if (e.kind === 'heal' && e.spellId) {
      audio.playSpellHeal();
    }
  }
  if (hasPotionHeal) {
    audio.playPotionDrink();
  } else if (entries.some((e) => e.kind === 'info' && e.itemId != null)) {
    audio.playPotionDrink();
  }

  if (logSliceHasBuffCast(entries, data)) {
    const warriorsFocus = entries.some(
      (e) => isBuffInfoEntry(e, data) && e.spellId === 'warriors_focus'
    );
    if (warriorsFocus) {
      audio.playWarriorsFocus();
    } else {
      audio.playBuffCast();
    }
  }

  for (const e of entries) {
    if (e.kind === 'armor_break') {
      audio.playArmorShatter();
    }
  }

  let lastPartyAttacker: Character | undefined;
  for (const e of entries) {
    if (e.kind === 'attack') {
      const actorMember = party.find((p) => p.name === e.actor);
      if (actorMember) lastPartyAttacker = actorMember;
    }
    if (e.kind !== 'damage' || e.enemyIndex == null) continue;
    if (e.spellId) {
      if (e.spellId === 'ember_spark') {
        audio.playSpellFire();
      } else if (e.spellId === 'silver_bolt') {
        audio.playSpellIceSpark();
      } else {
        audio.playSpellArcaneBurst();
      }
      if (e.damageKind === 'crit') {
        audio.playCritImpact();
      }
      continue;
    }
    const style = getMeleeFxStyleForCharacter(lastPartyAttacker ?? party[0]);
    if (style === 'slash') {
      audio.playSwordSlash();
    } else if (style === 'blunt') {
      audio.playBluntImpact();
    } else {
      audio.playStaffWhoosh();
    }
    if (e.damageKind === 'crit') {
      audio.playCritImpact();
    }
  }

  if (entries.some((e) => e.kind === 'damage' && e.lethal)) {
    audio.playLethalStrike();
  }
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseLegacyInitiativeLabels(message: string): string[] | null {
  const prefixes = [t('combatLog.initiativeOrder'), 'Ordem de iniciativa:', 'Initiative order:'];
  let rest: string | null = null;
  for (const prefix of prefixes) {
    if (message.startsWith(prefix)) {
      rest = message.slice(prefix.length).trim();
      break;
    }
  }
  if (!rest || !rest.includes('→')) return null;
  const labels = rest
    .split('→')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return labels.length ? labels : null;
}

function appendInitiativeOrderEntry(
  parent: HTMLElement,
  entry: CombatLogEntry,
  combatantNames: readonly string[]
): boolean {
  const labels = entry.initiativeLabels ?? parseLegacyInitiativeLabels(entry.message);
  if (!labels?.length) return false;

  const wrap = document.createElement('div');
  wrap.className = 'combat-log-entry combat-log-info combat-log-initiative';

  const msg = document.createElement('div');
  msg.className = 'combat-log-msg';
  msg.textContent = t('combatLog.initiativeOrder');
  wrap.appendChild(msg);

  const list = document.createElement('ul');
  list.className = 'combat-log-initiative-list';
  for (const name of labels) {
    const item = document.createElement('li');
    item.className = 'combat-log-initiative-item';
    appendCombatLogMessageWithBoldNames(item, name, combatantNames);
    list.appendChild(item);
  }
  wrap.appendChild(list);
  parent.appendChild(wrap);
  return true;
}

export function appendCombatLogMessageWithBoldNames(
  container: HTMLElement,
  message: string,
  combatantNames: readonly string[]
): void {
  if (!combatantNames.length) {
    container.textContent = message;
    return;
  }
  const unique = [...new Set(combatantNames)].filter((name) => name.trim().length > 0);
  if (!unique.length) {
    container.textContent = message;
    return;
  }
  const sorted = unique.sort((a, b) => b.length - a.length);
  const namesSet = new Set(sorted);
  const pattern = new RegExp(
    `(${sorted.map((name) => escapeRegExp(name)).join('|')})`,
    'g'
  );
  const parts = message.split(pattern);
  for (const part of parts) {
    if (!part) continue;
    if (namesSet.has(part)) {
      const strong = document.createElement('strong');
      strong.textContent = part;
      container.appendChild(strong);
      continue;
    }
    container.appendChild(document.createTextNode(part));
  }
}

function appendCombatLogMergedHitMeta(
  wrap: HTMLElement,
  attack: CombatLogEntry,
  damage: CombatLogEntry
): void {
  if (attack.final === undefined || attack.vsDefense === undefined) return;
  const meta = document.createElement('div');
  meta.className = 'combat-log-meta combat-log-meta--attack-roll';
  let line = `${attack.final} vs ${t('engine.ac')} ${attack.vsDefense}`;
  if (attack.modifier !== undefined) {
    line += ` ${t('combat.logMetaBonus', { mod: fmtSignedMod(attack.modifier) })}`;
  }
  if (damage.final !== undefined) {
    line += ` ${t('combat.logMetaDamage', { amount: damage.final })}`;
  }
  if (damage.damageKind === 'crit') {
    line += ` ${t('combat.logMetaCrit')}`;
  }
  meta.textContent = line;
  wrap.appendChild(meta);
}

function appendCombatLogMeta(wrap: HTMLElement, entry: CombatLogEntry): void {
  if (entry.kind === 'attack' && entry.final !== undefined && entry.vsDefense !== undefined) {
    const meta = document.createElement('div');
    meta.className = 'combat-log-meta combat-log-meta--attack-roll';
    let line = `${entry.final} vs ${t('engine.ac')} ${entry.vsDefense}`;
    if (entry.modifier !== undefined) {
      line += ` ${t('combat.logMetaBonus', { mod: fmtSignedMod(entry.modifier) })}`;
    }
    meta.textContent = line;
    wrap.appendChild(meta);
    return;
  }

  const parts: string[] = [];
  if (entry.modifier !== undefined) {
    parts.push(t('combat.logMetaModifier', { mod: fmtSignedMod(entry.modifier) }));
  }
  if (entry.kind === 'damage' && entry.final !== undefined) {
    parts.push(t('combat.logMetaDamageAmount', { amount: entry.final }));
  } else if (entry.kind === 'heal' && entry.final !== undefined) {
    parts.push(t('combat.logMetaHealAmount', { amount: entry.final }));
  } else if (entry.final !== undefined) {
    parts.push(t('combat.logMetaTotal', { amount: entry.final }));
  }

  if (parts.length === 0) return;
  const meta = document.createElement('div');
  meta.className = 'combat-log-meta';
  meta.textContent = parts.join(' · ');
  wrap.appendChild(meta);
}

type CombatLogRenderCtx = {
  partyNames: Set<string>;
  combatantNames: readonly string[];
};

type CombatLogEnemyTurnReveal = {
  /** Só entradas novas do bloco “inimigos” (mesma ordem que o som). */
  batch: CombatLogEntry[];
};

/** Physical attack log row: actor in party → player/companion; otherwise enemy. */
function combatAttackOriginClass(
  entry: { actor?: string; target?: string },
  partyNames: Set<string>
): 'combat-attack-by-party' | 'combat-attack-by-enemy' {
  if (entry.actor != null) {
    return partyNames.has(entry.actor) ? 'combat-attack-by-party' : 'combat-attack-by-enemy';
  }
  if (entry.target != null) {
    return partyNames.has(entry.target) ? 'combat-attack-by-enemy' : 'combat-attack-by-party';
  }
  return 'combat-attack-by-party';
}

function applyEnemyTurnLogReveal(
  wrap: HTMLElement,
  item: CombatLogDisplayItem,
  reveal: CombatLogEnemyTurnReveal
): void {
  const b =
    item.mode === 'merged_hit'
      ? [item.attack, item.quaseCritico, item.damage]
      : [item.entry];
  const steps = b
    .filter((e): e is CombatLogEntry => e != null)
    .map((e) => reveal.batch.findIndex((x) => x === e))
    .filter((s) => s >= 0);
  if (!steps.length) {
    return;
  }
  const step = Math.max(...steps);
  wrap.classList.add('combat-log-entry--stagger-reveal');
  if (step === 0) {
    requestAnimationFrame(() => {
      wrap.classList.add('is-revealed');
    });
  } else {
    window.setTimeout(
      () => {
        wrap.classList.add('is-revealed');
      },
      step * 150
    );
  }
}

function appendCombatLogDisplayItems(
  parent: HTMLElement,
  items: CombatLogDisplayItem[],
  ctx: CombatLogRenderCtx,
  reveal: CombatLogEnemyTurnReveal | null
): void {
  const { partyNames, combatantNames } = ctx;

  for (const item of items) {
    if (item.mode === 'merged_hit') {
      const { attack, damage, quaseCritico } = item;
      const wrap = document.createElement('div');
      wrap.className = 'combat-log-entry combat-log-attack combat-outcome-hit combat-log-damage';
      wrap.classList.add(combatAttackOriginClass(attack, partyNames));
      if (damage.target) {
        wrap.classList.add(
          partyNames.has(damage.target) ? 'combat-damage-to-hero' : 'combat-damage-to-enemy'
        );
      }
      if (damage.damageKind === 'crit') {
        wrap.classList.add('combat-damage-crit');
      }

      const msg = document.createElement('div');
      msg.className = 'combat-log-msg';
      appendCombatLogMessageWithBoldNames(msg, attack.message, combatantNames);
      wrap.appendChild(msg);

      if (quaseCritico) {
        const qc = document.createElement('div');
        qc.className = 'combat-log-msg combat-log-msg--sub';
        appendCombatLogMessageWithBoldNames(qc, quaseCritico.message, combatantNames);
        wrap.appendChild(qc);
      }

      const diceRow = document.createElement('div');
      diceRow.className = 'dice-ascii-row';
      if (attack.dice?.length) {
        const preAtk = document.createElement('pre');
        preAtk.className = 'dice-ascii-block';
        preAtk.textContent = formatDiceAscii(attack.dice);
        diceRow.appendChild(preAtk);
      }
      if (damage.dice?.length) {
        const preDmg = document.createElement('pre');
        preDmg.className = 'dice-ascii-block';
        preDmg.textContent = formatDiceAscii(damage.dice);
        diceRow.appendChild(preDmg);
      }
      if (diceRow.childElementCount) wrap.appendChild(diceRow);

      appendCombatLogMergedHitMeta(wrap, attack, damage);
      parent.appendChild(wrap);
      if (reveal) {
        applyEnemyTurnLogReveal(wrap, item, reveal);
      }
      continue;
    }

    const entry = item.entry;
    if (entry.kind === 'enemy_line') {
      continue;
    }
    if (entry.kind === 'info' && appendInitiativeOrderEntry(parent, entry, combatantNames)) {
      continue;
    }
    const wrap = document.createElement('div');
    wrap.className = `combat-log-entry combat-log-${entry.kind}`;
    if (entry.kind === 'attack' && entry.outcome) {
      wrap.classList.add(entry.outcome === 'hit' ? 'combat-outcome-hit' : 'combat-outcome-miss');
      wrap.classList.add(combatAttackOriginClass(entry, partyNames));
    }
    if (entry.kind === 'damage' && entry.target) {
      wrap.classList.add(
        partyNames.has(entry.target) ? 'combat-damage-to-hero' : 'combat-damage-to-enemy'
      );
    }
    if (entry.kind === 'damage' && entry.damageKind === 'crit') {
      wrap.classList.add('combat-damage-crit');
    }

    const msg = document.createElement('div');
    msg.className = 'combat-log-msg';
    appendCombatLogMessageWithBoldNames(msg, entry.message, combatantNames);
    wrap.appendChild(msg);

    if (entry.dice?.length) {
      const pre = document.createElement('pre');
      pre.className = 'dice-ascii-block';
      pre.textContent = formatDiceAscii(entry.dice);
      wrap.appendChild(pre);
    }

    appendCombatLogMeta(wrap, entry);
    parent.appendChild(wrap);
    if (reveal) {
      applyEnemyTurnLogReveal(wrap, item, reveal);
    }
  }
}

function scrollCombatLogToLatestRound(scrollEl: HTMLElement, stackEl: HTMLElement): void {
  const lastRound = stackEl.querySelector('.combat-log-round:last-of-type') as HTMLElement | null;
  if (!lastRound) {
    scrollEl.scrollTop = scrollEl.scrollHeight;
    return;
  }
  const top =
    lastRound.getBoundingClientRect().top -
    scrollEl.getBoundingClientRect().top +
    scrollEl.scrollTop;
  scrollEl.scrollTop = Math.max(0, top);
}

/** Última fala de combate registada para o inimigo nesse índice (log pode crescer). */
function lastEnemyCombatLine(
  log: CombatLogEntry[],
  enemyIndex: number
): string | undefined {
  for (let i = log.length - 1; i >= 0; i--) {
    const e = log[i]!;
    if (e.kind === 'enemy_line' && e.enemyIndex === enemyIndex) {
      return e.message;
    }
  }
  return undefined;
}

/**
 * Entorno amarelo no painel do campo: último dano resolvido foi crítico
 * (ignora rodada / vitória / pânico após o golpe).
 */
function combatLastResolvedDamageWasCrit(log: CombatLogEntry[]): boolean {
  let i = log.length - 1;
  while (i >= 0) {
    const e = log[i]!;
    if (e.kind === 'turn_banner') {
      i--;
      continue;
    }
    if (e.kind === 'enemy_line') {
      i--;
      continue;
    }
    if (e.kind === 'info' && (matchesAnyLocale('combatLog.victory', e.message) || matchesAnyLocale('combatLog.gameOver', e.message))) {
      i--;
      continue;
    }
    if (e.kind === 'stress' && matchesAnyLocale('combatLog.panic', e.message ?? '')) {
      i--;
      continue;
    }
    if (e.kind === 'boss_twist') {
      i--;
      continue;
    }
    break;
  }
  if (i < 0) return false;
  const e = log[i]!;
  return e.kind === 'damage' && e.damageKind === 'crit';
}

export type CombatRenderContext = {
  state: GameState;
  registry: ContentRegistry;
  bus: EventBus;
  audio: GameAudio;
  combatLog: {
    soundCursor: { encounterId: string; index: number };
    /** Mesmo índice que sound — FX de combate usam este slice do log. */
    fxCursor: { encounterId: string; index: number };
    setSoundCursor: (v: { encounterId: string; index: number }) => void;
  };
  lifecycle: {
    unlockAudio: () => void;
    stabilize: (s: GameState) => GameState;
    commitState: (s: GameState) => void;
  };
  /** Chamado quando há novas linhas `boss_twist` no log (um lote por fatia). */
  onBossTwistReveal?: (messages: string[]) => void;
};

export function renderCombatInto(shell: HTMLElement, ctx: CombatRenderContext): void {
  const c = ctx.state.combat;
  if (!c) return;

  const enc = ctx.registry.data.encounters[c.encounterId];
  if (!enc) return;

  const encId = c.encounterId;
  const fxI = ctx.combatLog.fxCursor.index;
  const partyMemberNames = new Set(ctx.state.party.map((m) => m.name));
  let newLogEntries: CombatLogEntry[] = [];
  let logReveal: CombatLogEnemyTurnReveal | null = null;
  if (ctx.combatLog.soundCursor.encounterId !== encId) {
    const v = { encounterId: encId, index: c.log.length };
    ctx.combatLog.setSoundCursor(v);
  } else {
    newLogEntries = c.log.slice(fxI);
    const { pre, enemy: enemyLog } = splitNewLogForEnemyTurnStagger(newLogEntries);
    const reducedMotion =
      typeof document === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const stagger = enemyLog.length > 0 && !reducedMotion;
    if (stagger) {
      logReveal = { batch: enemyLog };
    }

    if (stagger) {
      for (const e of pre) {
        playCombatLogSound(e, partyMemberNames, ctx.audio);
      }
      playCombatFxImpactSounds(newLogEntries, ctx.state.party, ctx.audio, ctx.registry.data);
      const v = { encounterId: encId, index: c.log.length };
      ctx.combatLog.setSoundCursor(v);
      enemyLog.forEach((e, i) => {
        window.setTimeout(() => {
          playCombatLogSound(e, partyMemberNames, ctx.audio);
        }, i * 150);
      });
    } else {
      for (const entry of newLogEntries) {
        playCombatLogSound(entry, partyMemberNames, ctx.audio);
      }
      playCombatFxImpactSounds(newLogEntries, ctx.state.party, ctx.audio, ctx.registry.data);
      const v = { encounterId: encId, index: c.log.length };
      ctx.combatLog.setSoundCursor(v);
    }
  }
  const twistMsgs = newLogEntries
    .filter((e) => e.kind === 'boss_twist')
    .map((e) => e.message);
  if (twistMsgs.length > 0 && ctx.onBossTwistReveal) {
    ctx.onBossTwistReveal(twistMsgs);
  }
  const combatFx: CombatLogFxResult =
    newLogEntries.length > 0
      ? resolveCombatLogFx(newLogEntries, ctx.state.party, ctx.registry.data)
      : { byEnemyIndex: new Map(), columnPulse: null, columnFlash: null, potionParticles: null };
  const lethalGhosts =
    newLogEntries.length > 0
      ? extractLethalGhosts(newLogEntries, c, ctx.registry.data)
      : [];

  const floatNow = Date.now();
  const floatDurMs = floatingEnemyDamageDurationMs();
  const headshotDurMs = headshotFxDurationMs();
  pendingEnemyFloatingDamage = pendingEnemyFloatingDamage.filter(
    (p) => p.encId === encId && floatNow - p.startMs < floatDurMs
  );
  pendingEnemyHeadshotFx = pendingEnemyHeadshotFx.filter(
    (p) => p.encId === encId && floatNow - p.startMs < headshotDurMs
  );
  const reducedMotionFloat =
    typeof document !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  for (const logEntry of newLogEntries) {
    if (
      logEntry.kind === 'attack' &&
      logEntry.spellId === 'headshot' &&
      logEntry.enemyIndex != null &&
      logEntry.outcome === 'hit'
    ) {
      pendingEnemyHeadshotFx.push({
        encId,
        enemyIndex: logEntry.enemyIndex,
        startMs: floatNow,
      });
    }
    if (logEntry.kind === 'damage' && logEntry.enemyIndex != null && logEntry.final != null) {
      const anchor = rollFloatingDmgAnchor(reducedMotionFloat);
      pendingEnemyFloatingDamage.push({
        encId,
        enemyIndex: logEntry.enemyIndex,
        amount: logEntry.final,
        kind: logEntry.damageKind === 'crit' ? 'crit' : 'normal',
        startMs: floatNow,
        anchorLeftPct: anchor.leftPct,
        anchorTopPct: anchor.topPct,
      });
    }
  }

  const targetMode = combatTargetMode(c, ctx.registry.data.spells);
  const headshotAimMode =
    c.phase === 'choose_target' && c.pendingSpellId === 'headshot' && targetMode === 'physical';

  const inner = document.createElement('div');
  inner.className = 'shell combat-shell';
  inner.innerHTML = `<h1>${escHtml(t('combat.title'))}</h1>`;

  const layout = document.createElement('div');
  layout.className = 'combat-layout';

  const left = document.createElement('div');
  left.className = 'combat-enemies-column';
  if (combatLastResolvedDamageWasCrit(c.log)) {
    left.classList.add('combat-enemies-column--crit-damage');
  }
  if (combatFx.columnFlash === 'ember') {
    left.classList.add('combat-enemies-column--flash-ember');
  }
  if (combatFx.columnPulse === 'heal_spell') {
    left.classList.add('combat-enemies-column--pulse-heal-spell');
  } else if (combatFx.columnPulse === 'heal_potion') {
    left.classList.add('combat-enemies-column--pulse-potion');
    if (combatFx.potionParticles === 'hp') {
      left.classList.add('combat-enemies-column--potion-fx-hp');
    } else if (combatFx.potionParticles === 'mana') {
      left.classList.add('combat-enemies-column--potion-fx-mana');
    } else if (combatFx.potionParticles === 'stress') {
      left.classList.add('combat-enemies-column--potion-fx-stress');
    }
  } else if (combatFx.columnPulse === 'buff') {
    left.classList.add('combat-enemies-column--pulse-buff');
  }

  for (let enemyIdx = 0; enemyIdx < c.enemies.length; enemyIdx++) {
    const inst = c.enemies[enemyIdx]!;
    if (inst.hp <= 0) continue;
    const def = ctx.registry.data.enemies[inst.defId];
    if (!def) continue;
    const panel = document.createElement('div');
    panel.className = 'enemy-panel';
    if (targetMode === 'physical' || targetMode === 'enemy_spell') {
      panel.classList.add('enemy-panel--targetable');
      panel.setAttribute('role', 'button');
      panel.tabIndex = 0;
      const pickTarget = () => {
        ctx.lifecycle.unlockAudio();
        ctx.audio.playDice();
        const next =
          targetMode === 'enemy_spell'
            ? playerSpellOnEnemy(ctx.state, enemyIdx, ctx.registry.data, ctx.bus)
            : playerAttack(ctx.state, enemyIdx, ctx.registry.data, false, ctx.bus);
        ctx.lifecycle.commitState(ctx.lifecycle.stabilize(next));
      };
      panel.addEventListener('click', pickTarget);
      panel.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          pickTarget();
        }
      });
    }
    const sprite = def.sprite;
    const fx = combatFx.byEnemyIndex.get(enemyIdx);
    const stack = document.createElement('div');
    stack.className = 'enemy-sprite-stack';
    const pre = document.createElement('pre');
    pre.className = 'enemy-sprite';
    if (fx?.spriteCritShake) pre.classList.add('crit-flash');
    pre.textContent = sprite;
    const fxLayer = document.createElement('div');
    fxLayer.className = 'enemy-fx-layer';
    fxLayer.setAttribute('aria-hidden', 'true');
    if (fx?.layerClasses.length) {
      for (const cls of fx.layerClasses) {
        fxLayer.classList.add(cls);
      }
    }
    const pendingHeadshot = pendingEnemyHeadshotFx.find(
      (p) => p.encId === encId && p.enemyIndex === enemyIdx
    );
    if (pendingHeadshot) {
      applyHeadshotImpactFx(fxLayer, floatNow - pendingHeadshot.startMs);
    } else if (headshotAimMode) {
      applyHeadshotAimFx(fxLayer);
    }
    stack.appendChild(pre);
    stack.appendChild(fxLayer);
    const dmgFloatRoot = document.createElement('div');
    dmgFloatRoot.className = 'enemy-dmg-float-root';
    dmgFloatRoot.setAttribute('aria-hidden', 'true');
    stack.appendChild(dmgFloatRoot);
    for (const p of pendingEnemyFloatingDamage) {
      if (p.enemyIndex !== enemyIdx) continue;
      const elapsed = floatNow - p.startMs;
      if (elapsed >= floatDurMs) continue;
      appendEnemyFloatingDamage(dmgFloatRoot, p.amount, p.kind, elapsed, {
        leftPct: p.anchorLeftPct,
        topPct: p.anchorTopPct,
      });
    }
    const hpPct = Math.max(0, Math.min(100, Math.round((inst.hp / inst.maxHp) * 100)));
    panel.innerHTML = `<div class="enemy-panel-header"><strong>${escHtml(def.name)}</strong><span class="enemy-hp-text">${t('combat.hpLabel', { current: inst.hp, max: inst.maxHp })}</span></div>
      <div class="enemy-hp-track" title="${escHtml(t('combat.hpLabel', { current: inst.hp, max: inst.maxHp }))}">
        <div class="enemy-hp-fill" style="width:${hpPct}%"></div>
      </div>`;
    if (def.type === 'armored') {
      const armorChips = Math.max(0, Math.min(2, inst.armorChipsRemaining));
      const armorLine = document.createElement('div');
      armorLine.className = 'enemy-armor-line';
      armorLine.innerHTML = `${escHtml(t('combat.armorLabel'))} <span class="enemy-armor-slot${armorChips >= 1 ? ' enemy-armor-slot--filled' : ''}">■</span><span class="enemy-armor-slot${armorChips >= 2 ? ' enemy-armor-slot--filled' : ''}">■</span>`;
      panel.appendChild(armorLine);
    }
    panel.appendChild(stack);
    const line = lastEnemyCombatLine(c.log, enemyIdx);
    if (line) {
      const quote = document.createElement('blockquote');
      quote.className = 'enemy-combat-quote';
      quote.textContent = line;
      panel.appendChild(quote);
    }
    left.appendChild(panel);
  }

  for (const ghost of lethalGhosts) {
    const panel = document.createElement('div');
    panel.className = 'enemy-panel enemy-panel--defeated';
    const stack = document.createElement('div');
    stack.className = 'enemy-sprite-stack enemy-sprite-stack--defeated';
    const pre = document.createElement('pre');
    pre.className = 'enemy-sprite enemy-sprite--defeated';
    pre.textContent = ghost.sprite;
    const fxLayer = document.createElement('div');
    fxLayer.className = 'enemy-fx-layer';
    fxLayer.setAttribute('aria-hidden', 'true');
    const pendingHeadshot = pendingEnemyHeadshotFx.find(
      (p) => p.encId === encId && p.enemyIndex === ghost.enemyIndex
    );
    if (pendingHeadshot) {
      applyHeadshotImpactFx(fxLayer, floatNow - pendingHeadshot.startMs);
    } else {
      fxLayer.classList.add('combat-fx-death');
    }
    stack.appendChild(pre);
    stack.appendChild(fxLayer);
    panel.innerHTML = `<div class="enemy-panel-header"><strong>${escHtml(ghost.name)}</strong><span class="enemy-hp-text enemy-hp-text--defeated">${escHtml(t('combat.downed'))}</span></div>`;
    panel.appendChild(stack);
    left.appendChild(panel);
  }

  const lead = ctx.state.party[0];

  const actionsPanel = document.createElement('div');
  actionsPanel.className = 'combat-actions-panel';
  if (combatFx.columnPulse === 'heal_spell') {
    actionsPanel.classList.add('combat-actions-panel--fx-heal-spell');
  } else if (combatFx.columnPulse === 'heal_potion') {
    actionsPanel.classList.add('combat-actions-panel--fx-potion');
    if (combatFx.potionParticles === 'hp') {
      actionsPanel.classList.add('combat-actions-panel--potion-fx-hp');
    } else if (combatFx.potionParticles === 'mana') {
      actionsPanel.classList.add('combat-actions-panel--potion-fx-mana');
    } else if (combatFx.potionParticles === 'stress') {
      actionsPanel.classList.add('combat-actions-panel--potion-fx-stress');
    }
  } else if (combatFx.columnPulse === 'buff') {
    actionsPanel.classList.add('combat-actions-panel--fx-buff');
  }
  const actionsHdr = document.createElement('div');
  actionsHdr.className = 'combat-actions-panel-hdr';
  actionsHdr.textContent = t('combat.actions');
  actionsPanel.appendChild(actionsHdr);
  const buffParts: string[] = [];
  if ((c.buffAttackRoll ?? 0) > 0) {
    buffParts.push(t('combat.buffAttackShort', { n: c.buffAttackRoll! }));
  }
  if ((c.buffArmorClass ?? 0) > 0) {
    buffParts.push(t('combat.buffArmorShort', { n: c.buffArmorClass! }));
  }
  if (buffParts.length > 0) {
    const buffHint = document.createElement('div');
    buffHint.className = 'combat-active-buffs-hint';
    buffHint.textContent = t('combat.activeBuffs', { buffs: buffParts.join(' · ') });
    actionsPanel.appendChild(buffHint);
  }
  const decorateCombatQuickNav = createCombatQuickNavDecorator();

  if (c.phase === 'choose_target' && lead) {
    const targetBar = document.createElement('div');
    targetBar.className = 'combat-target-bar';
    const hint = document.createElement('p');
    hint.className = 'combat-target-hint';
    hint.textContent = chooseTargetHintText(c, ctx.registry.data.spells);
    targetBar.appendChild(hint);

    const choicesWrap = document.createElement('div');
    choicesWrap.className = 'choices combat-target-choices';

    if (targetMode === 'ally_spell') {
      for (let partyIdx = 0; partyIdx < ctx.state.party.length; partyIdx++) {
        const member = ctx.state.party[partyIdx]!;
        if (member.hp <= 0) continue;

        const pickAlly = (): void => {
          ctx.lifecycle.unlockAudio();
          ctx.audio.playDice();
          ctx.lifecycle.commitState(
            ctx.lifecycle.stabilize(
              playerSpellOnAlly(ctx.state, partyIdx, ctx.registry.data, ctx.bus)
            )
          );
        };

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className =
          'choice choice--tone-combat combat-target-choice combat-target-choice--ally combat-action-btn';
        const hpLine = t('combat.hpLabel', { current: member.hp, max: member.maxHp });
        decorateCombatQuickNav(btn, () => {
          btn.replaceChildren();
          btn.appendChild(document.createTextNode(member.name));
          const prev = document.createElement('span');
          prev.className = 'preview';
          prev.textContent = hpLine;
          btn.appendChild(prev);
        });
        btn.title = joinCombatActionHint(hpLine, btn);
        btn.addEventListener('click', pickAlly);
        choicesWrap.appendChild(btn);
      }
    } else if (targetMode === 'physical' || targetMode === 'enemy_spell') {
      for (let enemyIdx = 0; enemyIdx < c.enemies.length; enemyIdx++) {
        const inst = c.enemies[enemyIdx]!;
        if (inst.hp <= 0) continue;
        const def = ctx.registry.data.enemies[inst.defId];
        if (!def) continue;

        const pickTarget = (): void => {
          ctx.lifecycle.unlockAudio();
          ctx.audio.playDice();
          const next =
            targetMode === 'enemy_spell'
              ? playerSpellOnEnemy(ctx.state, enemyIdx, ctx.registry.data, ctx.bus)
              : playerAttack(ctx.state, enemyIdx, ctx.registry.data, false, ctx.bus);
          ctx.lifecycle.commitState(ctx.lifecycle.stabilize(next));
        };

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'choice choice--tone-combat combat-target-choice combat-action-btn';
        const hpLine = t('combat.hpLabel', { current: inst.hp, max: inst.maxHp });
        decorateCombatQuickNav(btn, () => {
          btn.replaceChildren();
          btn.appendChild(document.createTextNode(def.name));
          const prev = document.createElement('span');
          prev.className = 'preview';
          prev.textContent = hpLine;
          btn.appendChild(prev);
        });
        btn.title = joinCombatActionHint(hpLine, btn);
        btn.addEventListener('click', pickTarget);
        choicesWrap.appendChild(btn);
      }
    }

    if (choicesWrap.childElementCount > 0) {
      targetBar.appendChild(choicesWrap);
    }
    actionsPanel.appendChild(targetBar);
  }

  if (c.phase === 'choose_stance' && lead) {
    const attackBar = document.createElement('div');
    attackBar.className = 'combat-attack-bar';
    appendCombatSectionHeader(
      attackBar,
      'combat-attack-hdr',
      t('combat.attacks'),
      COMBAT_ATTACK_SECTION_HINT(),
      t('combat.attackHelpAria')
    );
    const bar = document.createElement('div');
    bar.className = 'stance-bar';
    const stances: Stance[] = ['aggressive', 'defensive', 'focus'];
    const labels: Record<Stance, string> = {
      aggressive: t('combat.stanceAggressive'),
      defensive: t('combat.stanceDefensive'),
      focus: t('combat.stanceFocus'),
    };
    for (const st of stances) {
      const btn = document.createElement('button');
      btn.className = 'stance';
      decorateCombatQuickNav(btn, () => {
        btn.textContent = labels[st];
      });
      btn.title = joinCombatActionHint(STANCE_COMBAT_HINT[st], btn);
      btn.addEventListener('click', () => {
        ctx.lifecycle.unlockAudio();
        ctx.audio.playDice();
        ctx.lifecycle.commitState(
          ctx.lifecycle.stabilize(executePlayerTurn(ctx.state, st, ctx.registry.data, false, false, ctx.bus))
        );
      });
      bar.appendChild(btn);
    }
    const canSacrificeChoice =
      ctx.state.flags.act6_void_pact && ctx.state.resources.corruption >= SACRIFICE_MIN_CORRUPTION;
    if (canSacrificeChoice) {
      const sacrifice = document.createElement('button');
      sacrifice.className = 'stance special';
      decorateCombatQuickNav(sacrifice, () => {
        sacrifice.textContent = t('combat.voidSeal');
      });
      const sacVals = getSacrificeValues(ctx.state);
      const sacExplain =
        sacVals != null
          ? t('combat.voidSealHintActive', {
              hpCost: sacVals.hpCost,
              damageBonus: sacVals.damageBonus,
              corruption: ctx.state.resources.corruption,
            })
          : t('combat.voidSealHintShort', { corruption: ctx.state.resources.corruption });
      sacrifice.title = joinCombatActionHint(sacExplain, sacrifice);
      sacrifice.disabled = lead.hp <= 1;
      sacrifice.addEventListener('click', () => {
        if (lead.hp <= 1) return;
        ctx.lifecycle.unlockAudio();
        ctx.audio.playDice();
        ctx.lifecycle.commitState(
          ctx.lifecycle.stabilize(
            executePlayerTurn(ctx.state, 'aggressive', ctx.registry.data, false, true, ctx.bus)
          )
        );
      });
      bar.appendChild(sacrifice);
    }
    const sp = document.createElement('button');
    sp.className = 'stance special';
    decorateCombatQuickNav(sp, () => {
      sp.textContent = lead.specialUsedThisCombat ? t('combat.specialStrikeUsed') : t('combat.specialStrike');
    });
    const specialExplain = lead.specialUsedThisCombat
      ? t('combat.specialStrikeUsedHint')
      : t('combat.specialStrikeHint');
    sp.title = joinCombatActionHint(specialExplain, sp);
    sp.disabled = lead.specialUsedThisCombat;
    sp.addEventListener('click', () => {
      if (!lead.specialUsedThisCombat) {
        ctx.lifecycle.unlockAudio();
        ctx.audio.playDice();
        ctx.lifecycle.commitState(
          ctx.lifecycle.stabilize(
            executePlayerTurn(ctx.state, 'aggressive', ctx.registry.data, true, false, ctx.bus)
          )
        );
      }
    });
    bar.appendChild(sp);
    attackBar.appendChild(bar);
    actionsPanel.appendChild(attackBar);

    if (lead.maxMana > 0) {
      const spellBar = document.createElement('div');
      spellBar.className = 'combat-spell-bar';
      appendCombatSectionHeader(
        spellBar,
        'combat-spell-hdr',
        t('combat.spells'),
        COMBAT_SPELL_SECTION_HINT(),
        t('combat.spellHelpAria')
      );
      const spells = ctx.registry.data.spells;
      for (const spellId of ctx.state.knownSpells) {
        const spellDef = spells[spellId];
        if (!spellDef) continue;
        if (spellDef.classId !== 'any' && spellDef.classId !== lead.class) continue;
        if (ctx.state.level < spellDef.minLevel) continue;
        const btn = document.createElement('button');
        btn.className = 'combat-spell combat-action-btn--primary';
        btn.type = 'button';
        decorateCombatQuickNav(btn, () => {
          const manaCost = getEffectiveSpellManaCost(ctx.state, spellId, ctx.registry.data);
          btn.innerHTML = `<span class="spell-emoji" aria-hidden="true">${spellEmoji(spellId, spellDef)}</span><span class="combat-action-label">${escHtml(`${spellDef.name} (${manaCost} MP)`)}</span>`;
        });
        btn.title = joinCombatActionHint(spellCombatHoverText(spellDef), btn);
        const castOk = canCastSpell(ctx.state, spellId, ctx.registry.data);
        btn.disabled = !castOk;
        btn.addEventListener('click', () => {
          if (!canCastSpell(ctx.state, spellId, ctx.registry.data)) return;
          ctx.lifecycle.unlockAudio();
          ctx.audio.playDice();
          ctx.lifecycle.commitState(
            ctx.lifecycle.stabilize(executeSpellTurn(ctx.state, spellId, ctx.registry.data, ctx.bus))
          );
        });
        spellBar.appendChild(btn);
      }
      actionsPanel.appendChild(spellBar);
    }

    const potionIds = [...new Set(ctx.state.inventory)].filter((id) => {
      const d = ctx.registry.data.items[id];
      return d?.slot === 'consumable';
    });
    if (potionIds.length) {
      const potionBar = document.createElement('div');
      potionBar.className = 'combat-potion-bar';
      appendCombatSectionHeader(
        potionBar,
        'combat-potion-hdr',
        t('combat.consumables'),
        COMBAT_CONSUMABLES_SECTION_HINT(),
        t('combat.consumableHelpAria')
      );
      const potionListHost =
        potionIds.length > 3
          ? (() => {
              const details = document.createElement('details');
              details.className = 'combat-potion-collapsible';
              details.open = true;
              const summary = document.createElement('summary');
              summary.className = 'combat-potion-collapsible-summary';
              summary.textContent = t('combat.consumablesToggle', { count: potionIds.length });
              const list = document.createElement('div');
              list.className = 'combat-potion-list';
              details.appendChild(summary);
              details.appendChild(list);
              potionBar.appendChild(details);
              return list;
            })()
          : (() => {
              const list = document.createElement('div');
              list.className = 'combat-potion-list';
              potionBar.appendChild(list);
              return list;
            })();
      for (const itemId of potionIds) {
        const def = ctx.registry.data.items[itemId];
        if (!def) continue;
        const count = ctx.state.inventory.filter((x) => x === itemId).length;
        const btn = document.createElement('button');
        btn.className = 'combat-potion combat-action-btn--primary';
        btn.type = 'button';
        decorateCombatQuickNav(btn, () => {
          const qty = count > 1 ? ` ${t('combat.itemQty', { count })}` : '';
          btn.textContent = `${def.name}${qty}`;
        });
        btn.title = joinCombatActionHint(consumableCombatHover(def), btn);
        const ok = canUseCombatConsumable(ctx.state, itemId, ctx.registry.data);
        btn.disabled = !ok;
        btn.addEventListener('click', () => {
          if (!canUseCombatConsumable(ctx.state, itemId, ctx.registry.data)) return;
          ctx.lifecycle.unlockAudio();
          ctx.audio.playDice();
          ctx.lifecycle.commitState(
            ctx.lifecycle.stabilize(useCombatConsumable(ctx.state, itemId, ctx.registry.data, ctx.bus))
          );
        });
        potionListHost.appendChild(btn);
      }
      actionsPanel.appendChild(potionBar);
    }
  }

  const fleeBar = document.createElement('div');
  fleeBar.className = 'combat-flee-bar';
  appendCombatSectionHeader(
    fleeBar,
    'combat-flee-hdr',
    t('combat.fleeSection'),
    COMBAT_FLEE_SECTION_HINT(),
    t('combat.fleeHelpAria')
  );
  const flee = document.createElement('button');
  flee.className = 'combat-flee-btn';
  const canFlee = c.phase === 'choose_stance' && lead != null && lead.hp > 0;
  flee.disabled = !canFlee;
  decorateCombatQuickNav(flee, () => {
    flee.textContent = t('combat.tryFlee');
  });
  const fleeTn = fleeDifficultyTn(c.fleeRate ?? 0.5);
  const fleeExplain = canFlee
    ? t('combat.fleeHintActive', { tn: fleeTn })
    : t('combat.fleeHintBlocked');
  flee.title = joinCombatActionHint(fleeExplain, flee);
  flee.addEventListener('click', () => {
    if (!canFlee) return;
    ctx.lifecycle.unlockAudio();
    ctx.lifecycle.commitState(
      ctx.lifecycle.stabilize(fleeCombat(ctx.state, ctx.registry.data, ctx.bus))
    );
  });
  fleeBar.appendChild(flee);
  actionsPanel.appendChild(fleeBar);

  left.appendChild(actionsPanel);
  layout.appendChild(left);

  const right = document.createElement('div');
  right.className = 'combat-log-column';
  const logOuter = document.createElement('div');
  logOuter.className = 'combat-log-outer';
  const dice = document.createElement('div');
  dice.className = 'dice-panel';
  const hdr = document.createElement('div');
  hdr.className = 'dice-panel-header';
  hdr.textContent = t('combat.diceLog');
  hdr.title = t('combat.diceLogScrollHint');
  dice.appendChild(hdr);

  const logScroll = document.createElement('div');
  logScroll.className = 'combat-log-scroll';
  logScroll.title = hdr.title;

  const partyNames = new Set(ctx.state.party.map((x) => x.name));
  const combatantNames = [
    ...ctx.state.party.map((member) => member.name),
    ...c.enemies
      .map((enemy) => ctx.registry.data.enemies[enemy.defId]?.name)
      .filter((name): name is string => Boolean(name)),
  ];

  const logRenderCtx: CombatLogRenderCtx = { partyNames, combatantNames };

  const stack = document.createElement('div');
  stack.className = 'combat-log-stack';

  const { preamble, rounds } = parseCombatLogRounds(c.log.slice(-64));

  if (preamble.length) {
    const pre = document.createElement('div');
    pre.className = 'combat-log-preamble';
    const preHdr = document.createElement('div');
    preHdr.className = 'combat-log-preamble-hdr';
    preHdr.textContent = t('combat.opening');
    pre.appendChild(preHdr);
    const preBody = document.createElement('div');
    preBody.className = 'combat-log-preamble-body';
    appendCombatLogDisplayItems(
      preBody,
      buildCombatLogDisplayItems(preamble),
      logRenderCtx,
      null
    );
    pre.appendChild(preBody);
    stack.appendChild(pre);
  }

  for (const bundle of rounds) {
    const roundEl = document.createElement('div');
    roundEl.className = 'combat-log-round';
    const roundHdr = document.createElement('div');
    roundHdr.className = 'combat-log-round-header';
    roundHdr.textContent = t('combat.round', { round: String(bundle.round) });
    roundEl.appendChild(roundHdr);

    for (const section of bundle.sections) {
      const phase = document.createElement('div');
      phase.className = `combat-log-phase combat-log-phase--${section.kind}`;
      const label = document.createElement('div');
      label.className = 'combat-log-phase-label';
      label.textContent =
        section.kind === 'player' ? t('combat.yourTurn') : t('combat.enemiesTurn');
      phase.appendChild(label);
      const body = document.createElement('div');
      body.className = 'combat-log-phase-body';
      appendCombatLogDisplayItems(
        body,
        buildCombatLogDisplayItems(section.body),
        logRenderCtx,
        logReveal
      );
      phase.appendChild(body);
      roundEl.appendChild(phase);
    }
    stack.appendChild(roundEl);
  }

  logScroll.appendChild(stack);
  dice.appendChild(logScroll);

  const scrollLogToLatestRound = (): void => {
    scrollCombatLogToLatestRound(logScroll, stack);
  };
  requestAnimationFrame(() => {
    scrollLogToLatestRound();
    requestAnimationFrame(scrollLogToLatestRound);
  });
  logOuter.appendChild(dice);
  right.appendChild(logOuter);
  layout.appendChild(right);
  inner.appendChild(layout);

  shell.appendChild(inner);
}
