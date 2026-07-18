import type {
  CombatLogEntry,
  Effect,
  LevelUpStatDeltas,
  SpellDef,
} from '../engine/schema/index.ts';
import { icons, type IconId } from './icons/index.ts';
import { t, tArray } from '../i18n/index.ts';
import { matchesAnyLocale } from '../i18n/combatLogMessages.ts';
import {
  pickCampCombatHintParty,
  pickCampCombatHints,
} from '../campaigns/calvario/overlayPick.ts';

export type CombatLogDisplayItem =
  | { mode: 'single'; entry: CombatLogEntry }
  | {
      mode: 'merged_hit';
      attack: CombatLogEntry;
      damage: CombatLogEntry;
      quaseCritico?: CombatLogEntry;
    };

export function preserveExplorationNodeForChoiceEffects(
  effects: Effect[],
  currentExploration: { graphId: string; nodeId: string } | null
): Effect[] {
  if (!currentExploration) return effects;
  return effects.map((effect) => {
    if (effect.op !== 'setExploration') return effect;
    if (effect.graphId !== currentExploration.graphId) return effect;
    if (effect.nodeId === currentExploration.nodeId) return effect;
    return { ...effect, nodeId: currentExploration.nodeId };
  });
}

export function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Dicas aleatórias de combate (mostradas no acampamento). */
function campCombatHintFallbacks(): readonly string[] {
  const hints = tArray('combatHints.general');
  return hints.length > 0 ? hints : [];
}

function campCombatHintPartyFallback(): string {
  return t('combatHints.party');
}

export function randomCampCombatHint(partySize: number): string {
  const pool: string[] = pickCampCombatHints(campCombatHintFallbacks());
  if (partySize > 1) pool.push(pickCampCombatHintParty(campCombatHintPartyFallback()));
  if (pool.length === 0) return '';
  return pool[Math.floor(Math.random() * pool.length)]!;
}

export function spellEmoji(spellId: string, spellDef: SpellDef): string {
  const byId: Partial<Record<string, string>> = {
    ember_spark: '🔥',
    arcane_bolt: '✨',
    silver_bolt: '⚡',
    lesser_heal: '💚',
    merciful_light: '🕯️',
    whisper_cache: '🫧',
    pilgrims_benediction: '🙏',
    silent_arrow: '🏹',
    warriors_focus: '⚔️',
    iron_ward: '🛡️',
    headshot: '🎯',
    arrow_rain: '🏹',
  };
  const byKind: Record<SpellDef['spellKind'], string> = {
    damage: '✨',
    heal_self: '💚',
    buff_attack_roll: '⚔️',
    buff_armor_class: '🛡️',
    targeted_crit_attack: '🎯',
    damage_all_enemies: '🏹',
  };
  return byId[spellId] ?? byKind[spellDef.spellKind] ?? '✦';
}

/** SVG para passivo de classe ou id em `leadStoryPassives`. Marcas no diário: `markBadgeIconSvg`. */
export function passiveSidebarIconSvg(passiveKey: string): string {
  const byId: Partial<Record<string, IconId>> = {
    knight_crit_edge: 'weapon',
    cleric_sacred_pulse: 'faith',
    mage_ley_trickle: 'spellbook',
    archer_keen_reflex: 'weapon',
    monk_inner_peace: 'faith',
  };
  const id = byId[passiveKey] ?? 'tier';
  return icons[id];
}

/** Ícone para badges de marca no diário (ids em `journeyMarks`). */
export function markBadgeIconSvg(markId: string): string {
  const byMark: Partial<Record<string, IconId>> = {
    world_wound_remembered: 'memories',
    act1_surface_whisper_intel: 'scroll',
    act1_surface_whisper_taint: 'corruption',
    act1_wall_memory: 'scroll',
    act1_door_runes: 'scroll',
    act1_mirror_shard: 'relic',
    act1_entrance_mirror: 'relic',
    act1_hand_mirror: 'relic',
    act2_rats_listen: 'person',
    act2_rats_smell: 'corruption',
    act2_cruzeiro_marks: 'scroll',
    act3_cult_flight: 'map',
    act3_well_truth: 'scroll',
    act3_well_snare: 'corruption',
    act3_rune_tuned: 'scroll',
    act3_rune_jarred: 'corruption',
    act6_memory_kept: 'memories',
    act6_memory_spoiled: 'memories',
    act6_shadow_faced: 'memories',
    act6_veil_aligned: 'scroll',
    act6_veil_broken: 'scroll',
    act6_void_pact_mark: 'corruption',
    act6_will_direct: 'weapon',
    act6_will_measured: 'weapon',
    act6_will_scattered: 'weapon',
    act7_bell_ate_promise: 'corruption',
    act7_bell_paid_faith: 'faith',
    act7_broke_hollow_line: 'weapon',
    act7_cinder_burned: 'corruption',
    act7_cinder_favored: 'relic',
    act7_ember_witness: 'relic',
    act7_heard_ash_sermon: 'scroll',
    act7_last_train_rider: 'map',
    act7_paid_sky_in_faith: 'faith',
    act7_sealed_in_ember: 'relic',
    act7_sky_stitch_torn: 'corruption',
    act7_sky_stitch_true: 'faith',
    act7_walked_bare: 'person',
    calvario_sealed: 'faith',
    fled_rats: 'map',
    act2_brazier_scar: 'supply',
    mira_camp_shadows: 'person',
    mira_cruzeiro_confidencia: 'person',
    mira_frost_pact: 'person',
    mira_void_endtalk: 'person',
    monk_inner_peace: 'faith',
    morvayn_slain: 'weapon',
    pact_bound: 'corruption',
    soul_scarred_by_seal: 'corruption',
    title_fallen_god: 'relic',
    tomas_camp_oath: 'person',
    tomas_void_duty: 'person',
    vetrnax_slain: 'weapon',
    magma_lord_slain: 'weapon',
    wound_mire_leg: 'corruption',
  };
  const id = byMark[markId] ?? 'tier';
  return icons[id];
}

/** Ícone para badge de path narrativo no diário. */
export function storyPathBadgeIconSvg(pathId: string, value: string): string {
  if (pathId === 'throne') {
    if (value === 'sealed') return icons.faith;
    if (value === 'pact') return icons.corruption;
    if (value === 'slain') return icons.weapon;
  }
  return icons.scroll;
}

/** One mechanical description line for the sidebar. */
export function spellSidebarMechanicsLine(sp: SpellDef): string {
  if (sp.spellKind === 'damage') {
    return sp.base > 0
      ? t('sidebar.spellMechanicsDamageBase', { base: String(sp.base), dice: String(sp.dice) })
      : t('sidebar.spellMechanicsDamage', { dice: String(sp.dice) });
  }
  if (sp.spellKind === 'heal_self') {
    return sp.base > 0
      ? t('sidebar.spellMechanicsHealBase', { base: String(sp.base), dice: String(sp.dice) })
      : t('sidebar.spellMechanicsHeal', { dice: String(sp.dice) });
  }
  if (sp.spellKind === 'buff_attack_roll') {
    return t('sidebar.spellMechanicsBuffAttack');
  }
  if (sp.spellKind === 'targeted_crit_attack') {
    return t('sidebar.spellMechanicsHeadshot');
  }
  if (sp.spellKind === 'damage_all_enemies') {
    if (sp.classId === 'mage') {
      return sp.base > 0
        ? t('sidebar.spellMechanicsMageAoE', { base: String(sp.base), dice: String(sp.dice) })
        : t('sidebar.spellMechanicsMageAoENoBase', { dice: String(sp.dice) });
    }
    return t('sidebar.spellMechanicsArrowRain', { dice: String(sp.dice) });
  }
  if (sp.spellKind === 'buff_armor_class') {
    return t('sidebar.spellMechanicsBuffArmor');
  }
  return t('sidebar.spellMechanicsBuffArmor');
}

export function fmtSignedMod(n: number): string {
  if (n >= 0) return `+${n}`;
  return `−${Math.abs(n)}`;
}

/** Trecho do log entre marcadores `turn_banner` (Rodada N — …). */
export type CombatLogPhaseSection = {
  kind: 'player' | 'enemy';
  banner: CombatLogEntry;
  body: CombatLogEntry[];
};

export type CombatLogRoundBundle = {
  round: number;
  sections: CombatLogPhaseSection[];
};

/**
 * Separa abertura (aparições, ordem de iniciativa) das rodadas.
 * Reconhece mensagens `Rodada N — sua vez` / `Rodada N — inimigos` (hífen ou travessão).
 */
export function parseTurnBannerMessage(
  message: string
): { round: number; phase: 'player' | 'enemy' } | null {
  const m = message.match(/^(?:Rodada|Round)\s+(\d+)\s*[—–-]\s*(.+)$/);
  if (!m) return null;
  const round = Number(m[1]);
  const tail = (m[2] ?? '').trim();
  if (tail.startsWith('sua vez') || tail.startsWith('your turn')) {
    return { round, phase: 'player' };
  }
  if (tail.startsWith('inimigos') || tail.startsWith('enemies')) {
    return { round, phase: 'enemy' };
  }
  return null;
}

export function parseCombatLogRounds(log: CombatLogEntry[]): {
  preamble: CombatLogEntry[];
  rounds: CombatLogRoundBundle[];
} {
  const preamble: CombatLogEntry[] = [];
  let i = 0;
  while (i < log.length) {
    const e = log[i]!;
    if (e.kind === 'turn_banner') break;
    preamble.push(e);
    i++;
  }

  const rounds: CombatLogRoundBundle[] = [];

  while (i < log.length) {
    const e = log[i]!;
    if (e.kind !== 'turn_banner') {
      if (rounds.length === 0) preamble.push(e);
      else {
        const last = rounds[rounds.length - 1]!;
        const lastSec = last.sections[last.sections.length - 1]!;
        lastSec.body.push(e);
      }
      i++;
      continue;
    }

    const parsed = parseTurnBannerMessage(e.message);
    i++;
    const body: CombatLogEntry[] = [];
    while (i < log.length && log[i]!.kind !== 'turn_banner') {
      body.push(log[i]!);
      i++;
    }

    if (!parsed) {
      preamble.push(e, ...body);
      continue;
    }

    if (parsed.phase === 'player') {
      rounds.push({
        round: parsed.round,
        sections: [{ kind: 'player', banner: e, body }],
      });
    } else {
      const last = rounds[rounds.length - 1];
      if (last && last.round === parsed.round) {
        last.sections.push({ kind: 'enemy', banner: e, body });
      } else {
        rounds.push({
          round: parsed.round,
          sections: [{ kind: 'enemy', banner: e, body }],
        });
      }
    }
  }

  return { preamble, rounds };
}

export function buildCombatLogDisplayItems(log: CombatLogEntry[]): CombatLogDisplayItem[] {
  const out: CombatLogDisplayItem[] = [];
  let i = 0;
  while (i < log.length) {
    const e = log[i]!;
    if (e.kind === 'attack' && e.outcome === 'hit') {
      let j = i + 1;
      let quase: CombatLogEntry | undefined;
      const next = log[j];
      if (next?.kind === 'info' && matchesAnyLocale('combatLog.almostCrit', next.message)) {
        quase = next;
        j++;
      }
      const dmg = log[j];
      if (dmg?.kind === 'damage') {
        out.push({ mode: 'merged_hit', attack: e, damage: dmg, quaseCritico: quase });
        i = j + 1;
        continue;
      }
    }
    out.push({ mode: 'single', entry: e });
    i++;
  }
  return out;
}

export function formatLevelUpDeltaLine(d: LevelUpStatDeltas): string {
  const parts: string[] = [];
  if (d.str) parts.push(t('story.levelUpDeltaStr', { n: String(d.str) }));
  if (d.agi) parts.push(t('story.levelUpDeltaAgi', { n: String(d.agi) }));
  if (d.mind) parts.push(t('story.levelUpDeltaMind', { n: String(d.mind) }));
  if (d.maxHp) parts.push(t('story.levelUpDeltaMaxHp', { n: String(d.maxHp) }));
  if (d.hp) parts.push(t('story.levelUpDeltaHp', { n: String(d.hp) }));
  if (d.maxMana) parts.push(t('story.levelUpDeltaMaxMana', { n: String(d.maxMana) }));
  if (d.mana) parts.push(t('story.levelUpDeltaMana', { n: String(d.mana) }));
  return parts.join(' · ');
}

function resourceBarAria(label: string, current: number, max: number): string {
  return t('sidebar.resourceBar', { label, current: String(current), max: String(max) });
}

export function hpBarMarkup(
  cur: number,
  max: number,
  trackClass?: string,
  fill: 'xp' | 'hp' = 'xp'
): string {
  const stateCls =
    fill === 'hp' && max > 0 && cur > 0 && cur / max <= 0.3 ? ' hp-bar-track--critical' : '';
  const trackCls = trackClass
    ? `hp-bar-track ${trackClass}${stateCls}`
    : `hp-bar-track${stateCls}`;
  const fillCls = fill === 'hp' ? 'hp-bar-fill hp-bar-fill--hp' : 'hp-bar-fill hp-bar-fill--xp';
  if (max <= 0) return `<div class="${trackCls} empty"></div>`;
  const pct = Math.min(100, Math.max(0, Math.round((cur / max) * 100)));
  const label = fill === 'hp' ? t('sidebar.hp') : t('sidebar.xp');
  return `<div class="${trackCls}" role="img" aria-label="${escHtml(resourceBarAria(label, cur, max))}">
      <div class="${fillCls}" style="width:${pct}%"></div>
    </div>`;
}

export function manaBarMarkup(cur: number, max: number): string {
  if (max <= 0) return '';
  const pct = Math.min(100, Math.max(0, Math.round((cur / max) * 100)));
  return `<div class="mana-bar-track" role="img" aria-label="${escHtml(resourceBarAria(t('sidebar.mana'), cur, max))}">
      <div class="mana-bar-fill" style="width:${pct}%"></div>
    </div>`;
}

export function stressBarMarkup(cur: number): string {
  const max = 4;
  const pct = Math.min(100, Math.max(0, Math.round((cur / max) * 100)));
  const criticalCls = cur >= 3 ? ' stress-bar-track--critical' : '';
  return `<div class="stress-bar-track${criticalCls}" role="img" aria-label="${escHtml(resourceBarAria(t('sidebar.stress'), cur, max))}">
      <div class="stress-bar-fill" style="width:${pct}%"></div>
    </div>`;
}

/** Barra de vínculo com companheiro (0–100). */
export function friendshipBarMarkup(cur: number, max: number = 100): string {
  const trackCls = 'bond-bar-track bond-bar-resource';
  if (max <= 0) return `<div class="${trackCls} empty"></div>`;
  const pct = Math.min(100, Math.max(0, Math.round((cur / max) * 100)));
  return `<div class="${trackCls}" role="img" aria-label="${escHtml(resourceBarAria(t('sidebar.bond'), cur, max))}">
      <div class="bond-bar-fill" style="width:${pct}%"></div>
    </div>`;
}

export function statBonusParen(n: number): string {
  if (n === 0) return '';
  const sign = n > 0 ? '+' : '';
  return ` <span class="stat-build-bonus">(${sign}${n})</span>`;
}
