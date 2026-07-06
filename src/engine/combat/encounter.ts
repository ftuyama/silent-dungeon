import { mulberry32, roll2d6 } from '../core/rng.ts';
import type {
  BattleEncounter,
  CombatLogEntry,
  CombatState,
  Encounter,
  EnemyInstance,
  GameState,
} from '../schema/index.ts';
import { isDialogueEncounter } from '../schema/index.ts';
import type { GameData } from '../data/gameData.ts';
import { pickLocalized, getLocale } from '../../i18n/index.ts';
import * as combatLog from '../../i18n/combatLogMessages.ts';
import { effectiveLeadAttr } from '../progression/leadStats.ts';

/** Ajusta seed global após consumo de RNG em combate */
export function bumpRngSeed(state: GameState): GameState {
  return { ...state, rngSeed: (state.rngSeed + 0x1f) >>> 0 };
}

export function beginEncounter(
  state: GameState,
  enc: Encounter,
  data: GameData,
  opts: {
    returnScene: string;
    onVictory?: string;
    onFlee?: string;
    onDefeat?: string;
  }
): GameState {
  if (isDialogueEncounter(enc)) {
    return beginDialogueEncounter(state, enc, data, opts);
  }
  return beginBattleEncounter(state, enc, data, opts);
}

function beginDialogueEncounter(
  state: GameState,
  enc: Extract<Encounter, { combatType: 'dialogue' }>,
  data: GameData,
  opts: {
    returnScene: string;
    onVictory?: string;
    onFlee?: string;
    onDefeat?: string;
  }
): GameState {
  const dlgDef = data.dialogueEnemies[enc.dialogueEnemyId];
  if (!dlgDef) {
    console.error(`Dialogue enemy not found: ${enc.dialogueEnemyId} @ encounter ${enc.id}`);
    return state;
  }
  const rootId = dlgDef.graph.rootNodeId;
  const rootNode = dlgDef.graph.nodes[rootId];
  if (!rootNode) {
    console.error(`Dialogue graph missing root "${rootId}" @ ${enc.id}`);
    return state;
  }

  const dialogueCombat = {
    encounterId: enc.id,
    dialogueEnemyId: enc.dialogueEnemyId,
    nodeId: rootId,
    tensionHp: dlgDef.tensionMax,
    tensionMax: dlgDef.tensionMax,
    log: [
      { kind: 'info' as const, message: combatLog.logDialogueTrap(dlgDef.name) },
      { kind: 'interlocutor_line' as const, message: pickLocalized(rootNode.line, getLocale()) },
    ],
    returnScene: opts.returnScene,
    onVictory: opts.onVictory,
    onFlee: opts.onFlee,
    onDefeat: opts.onDefeat,
  };

  const party = state.party.map((p) => ({ ...p, specialUsedThisCombat: false }));

  return {
    ...bumpRngSeed(state),
    party,
    mode: 'dialogue_combat',
    combat: null,
    dialogueCombat,
  };
}

function beginBattleEncounter(
  state: GameState,
  enc: BattleEncounter,
  data: GameData,
  opts: {
    returnScene: string;
    onVictory?: string;
    onFlee?: string;
    onDefeat?: string;
  }
): GameState {
  const enemies: EnemyInstance[] = [];
  const log: CombatLogEntry[] = [];
  for (const eid of enc.enemies) {
    const def = data.enemies[eid];
    if (!def) continue;
    enemies.push({
      defId: eid,
      hp: def.hp,
      maxHp: def.maxHp,
      armorChipsRemaining: def.armorChips,
      stress: 0,
    });
    log.push({
      kind: 'info',
      message: combatLog.logEnemyAppears(def.name),
    });
  }

  const combat: CombatState = {
    encounterId: enc.id,
    enemies,
    turnOrder: [],
    turnIndex: 0,
    round: 1,
    phase: 'choose_stance',
    log,
    playerAdvantage: enc.playerAdvantage,
    enemyAdvantage: enc.enemyAdvantage,
    fleeRate: enc.fleeRate,
    pendingSacrificeDamage: 0,
    pendingSacrificeCost: 0,
    buffAttackRoll: 0,
    buffArmorClass: 0,
    enemyBuffArmorClass: 0,
    enemyBuffAttackRoll: 0,
    returnScene: opts.returnScene,
    onVictory: opts.onVictory,
    onFlee: opts.onFlee,
    onDefeat: opts.onDefeat,
    bossTwistAppliedIds: [],
    bossTwistInitialHpSum: enc.isBoss ? enemies.reduce((s, e) => s + e.hp, 0) : undefined,
  };

  combat.turnOrder = buildTurnOrder(state, combat, data, mulberry32(state.rngSeed));

  const initiativeLabels = formatTurnOrderLabels(combat.turnOrder, state, combat, data);
  log.push({
    kind: 'info',
    message: combatLog.logInitiativeOrder(),
    initiativeLabels,
  });
  log.push({
    kind: 'turn_banner',
    message: combatLog.logRoundPlayer(combat.round),
  });

  const party = state.party.map((p) => ({ ...p, specialUsedThisCombat: false }));

  return {
    ...bumpRngSeed(state),
    party,
    mode: 'combat',
    combat,
    dialogueCombat: null,
  };
}

function buildTurnOrder(
  state: GameState,
  combat: CombatState,
  data: GameData,
  rng: () => number
): string[] {
  const rolls: { id: string; score: number }[] = [];
  for (const p of state.party) {
    const [d1, d2] = roll2d6(rng);
    const agi = effectiveLeadAttr(state, p, 'agi');
    const score = d1 + d2 + agi;
    rolls.push({ id: `p:${p.id}`, score });
  }
  for (let i = 0; i < combat.enemies.length; i++) {
    const def = data.enemies[combat.enemies[i]!.defId];
    if (!def) continue;
    const [d1, d2] = roll2d6(rng);
    rolls.push({ id: `e:${i}`, score: d1 + d2 + def.agi });
  }
  rolls.sort((a, b) => b.score - a.score);
  return rolls.map((r) => r.id);
}

/** Nomes legíveis na ordem de iniciativa (em vez de p:rogue_mira, e:0…). */
function formatTurnOrderLabels(
  turnOrder: string[],
  state: GameState,
  combat: CombatState,
  data: GameData
): string[] {
  const enemyNameSeen = new Map<string, number>();
  return turnOrder.map((token) => {
    if (token.startsWith('p:')) {
      const pid = token.slice(2);
      const c = state.party.find((x) => x.id === pid);
      return c?.name ?? pid;
    }
    if (token.startsWith('e:')) {
      const idx = Number(token.slice(2));
      const inst = combat.enemies[idx];
      if (!inst) return combatLog.logEnemyFallback(idx + 1);
      const def = data.enemies[inst.defId];
      const base = def?.name ?? combatLog.logEnemyFallback(idx + 1);
      const seen = enemyNameSeen.get(base) ?? 0;
      enemyNameSeen.set(base, seen + 1);
      return seen === 0 ? base : `${base} (${seen + 1})`;
    }
    return token;
  });
}

/** Recalcula nomes localizados nas entradas de iniciativa do log (ex.: troca de idioma em combate). */
export function refreshCombatLogInitiativeLabels(state: GameState, data: GameData): GameState {
  if (state.mode !== 'combat' || !state.combat) return state;
  const combat = state.combat;
  const freshLabels = formatTurnOrderLabels(combat.turnOrder, state, combat, data);
  let logChanged = false;
  const log = combat.log.map((entry) => {
    if (entry.kind !== 'info' || !entry.initiativeLabels) return entry;
    logChanged = true;
    return { ...entry, initiativeLabels: freshLabels };
  });
  if (!logChanged) return state;
  return { ...state, combat: { ...combat, log } };
}