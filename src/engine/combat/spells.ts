import { mulberry32, rollD6 } from '../core/rng.ts';
import type { Character, CombatState, GameState, SpellDef } from '../schema/index.ts';
import type { GameData } from '../data/gameData.ts';
import { getTotalMind, statMod } from '../combat/combatStats.ts';
import { effectiveLeadAttr } from '../progression/leadStats.ts';
import type { EventBus } from '../core/eventBus.ts';
import { finishCombat } from './resolution.ts';
import { advanceToEnemyTurn } from './turn.ts';
import { maybeApplyStatusToEnemy } from './statusConditions.ts';
import * as combatLog from '../../i18n/combatLogMessages.ts';

export function getEffectiveSpellManaCost(
  _state: GameState,
  spellId: string,
  data: GameData
): number {
  const sp = data.spells[spellId];
  if (!sp) return Number.POSITIVE_INFINITY;
  return sp.manaCost;
}

export function spellNeedsEnemyTarget(kind: SpellDef['spellKind']): boolean {
  return kind === 'damage' || kind === 'targeted_crit_attack';
}

export function spellNeedsAllyTarget(kind: SpellDef['spellKind']): boolean {
  return kind === 'heal_self';
}

export function canCastSpell(state: GameState, spellId: string, data: GameData): boolean {
  const c = state.combat;
  const lead = state.party[0];
  const sp = data.spells[spellId];
  if (!c || c.phase !== 'choose_stance' || !lead || !sp) return false;
  if (!state.knownSpells.includes(spellId)) return false;
  if (lead.maxMana <= 0) return false;
  const manaCost = getEffectiveSpellManaCost(state, spellId, data);
  if (lead.mana < manaCost) return false;
  if (state.level < sp.minLevel) return false;
  if (sp.classId !== 'any' && sp.classId !== lead.class) return false;
  return true;
}

function getLead(state: GameState): Character {
  return state.party[0]!;
}

function targetingPrepareLog(lead: Character, sp: SpellDef): string {
  if (sp.spellKind === 'targeted_crit_attack') {
    return combatLog.logHeadshotAim(lead.name, sp.name);
  }
  if (sp.spellKind === 'damage') {
    return combatLog.logSpellTargets(lead.name, sp.name);
  }
  return combatLog.logHealTargets(lead.name, sp.name);
}

export function beginTargetedSpell(
  state: GameState,
  spellId: string,
  data: GameData
): GameState {
  const c = state.combat;
  const lead = getLead(state);
  const sp = data.spells[spellId];
  if (!c || c.phase !== 'choose_stance' || !sp) return state;
  if (!spellNeedsEnemyTarget(sp.spellKind) && !spellNeedsAllyTarget(sp.spellKind)) {
    return state;
  }
  if (!canCastSpell(state, spellId, data)) return state;

  return {
    ...state,
    combat: {
      ...c,
      pendingSpellId: spellId,
      pendingStance: 'focus',
      phase: 'choose_target',
      log: [
        ...c.log,
        {
          kind: 'info',
          message: targetingPrepareLog(lead, sp),
          actor: lead.name,
          spellId,
        },
      ],
    },
  };
}

function resolveDamageAllEnemies(
  state: GameState,
  c: CombatState,
  lead: Character,
  sp: NonNullable<GameData['spells'][string]>,
  data: GameData,
  rng: () => number
): { newLead: Character; newEnemies: CombatState['enemies']; log: CombatState['log'] } {
  const manaCost = getEffectiveSpellManaCost(state, sp.id, data);
  let newLead: Character = { ...lead, mana: lead.mana - manaCost };
  const log = [...c.log];
  log.push({
    kind: 'info',
    message: combatLog.logCastsSpell(lead.name, sp.name, manaCost),
    actor: lead.name,
    spellId: sp.id,
  });

  const diceRolls: number[] = [];
  let sum = 0;
  for (let i = 0; i < sp.dice; i++) {
    const d = rollD6(rng);
    diceRolls.push(d);
    sum += d;
  }

  let perTargetDmg: number;
  if (sp.classId === 'mage') {
    const mindMod = statMod(getTotalMind(data, lead, state));
    perTargetDmg = Math.max(0, sp.base + sum + mindMod);
  } else {
    const agiMod = statMod(effectiveLeadAttr(state, lead, 'agi'));
    perTargetDmg = Math.max(1, Math.floor((sp.base + sum + agiMod) / 2));
  }

  let newEnemies = [...c.enemies];
  for (let enemyIndex = 0; enemyIndex < newEnemies.length; enemyIndex++) {
    const chipTarget = newEnemies[enemyIndex]!;
    if (chipTarget.hp <= 0) continue;
    const def = data.enemies[chipTarget.defId];
    if (!def) continue;

    if (def.type === 'armored' && chipTarget.armorChipsRemaining > 0) {
      newEnemies[enemyIndex] = {
        ...chipTarget,
        armorChipsRemaining: chipTarget.armorChipsRemaining - 1,
      };
      log.push({
        kind: 'armor_break',
        message: combatLog.logArmorBrokenSpell(),
        target: def.name,
        enemyIndex,
      });
      continue;
    }

    const nh = Math.max(0, chipTarget.hp - perTargetDmg);
    newEnemies[enemyIndex] = { ...chipTarget, hp: nh };
    log.push({
      kind: 'damage',
      message:
        sp.classId === 'mage'
          ? combatLog.logMagicDamage(def.name, perTargetDmg)
          : combatLog.logArrowRainDamage(def.name, perTargetDmg),
      dice: diceRolls,
      final: perTargetDmg,
      target: def.name,
      damageKind: 'normal',
      enemyIndex,
      lethal: nh <= 0,
      spellId: sp.id,
    });
  }

  return { newLead, newEnemies, log };
}

function applyMagicDamageToEnemy(
  state: GameState,
  lead: Character,
  sp: SpellDef,
  spellId: string,
  enemyIndex: number,
  data: GameData,
  rng: () => number,
  log: CombatState['log'],
  enemies: CombatState['enemies']
): { enemies: CombatState['enemies']; log: CombatState['log'] } | null {
  const chipTarget = enemies[enemyIndex];
  if (!chipTarget || chipTarget.hp <= 0) return null;
  const def = data.enemies[chipTarget.defId];
  if (!def) return null;

  const mindMod = statMod(getTotalMind(data, lead, state));
  const diceRolls: number[] = [];
  let sum = 0;
  for (let i = 0; i < sp.dice; i++) {
    const d = rollD6(rng);
    diceRolls.push(d);
    sum += d;
  }
  const dmg = Math.max(0, sp.base + sum + mindMod);
  const logOut = [...log];
  let newEnemies = [...enemies];

  if (def.type === 'armored' && chipTarget.armorChipsRemaining > 0) {
    newEnemies[enemyIndex] = {
      ...chipTarget,
      armorChipsRemaining: chipTarget.armorChipsRemaining - 1,
    };
    logOut.push({
      kind: 'armor_break',
      message: combatLog.logArmorBrokenSpell(),
      target: def.name,
      enemyIndex,
    });
  } else {
    const nh = Math.max(0, chipTarget.hp - dmg);
    let updatedInst: typeof chipTarget = { ...chipTarget, hp: nh };
    logOut.push({
      kind: 'damage',
      message: combatLog.logMagicDamage(def.name, dmg),
      dice: diceRolls,
      final: dmg,
      target: def.name,
      damageKind: 'normal',
      enemyIndex,
      lethal: nh <= 0,
      spellId,
    });
    if (sp.applyStatus && nh > 0) {
      const statusRes = maybeApplyStatusToEnemy(updatedInst, sp.applyStatus, rng);
      updatedInst = statusRes.inst;
      if (statusRes.applied) {
        logOut.push({
          kind: 'info',
          message: combatLog.logStatusApplied(
            def.name,
            sp.applyStatus.kind,
            sp.applyStatus.rounds
          ),
          target: def.name,
          enemyIndex,
        });
      }
    }
    newEnemies[enemyIndex] = updatedInst;
  }

  return { enemies: newEnemies, log: logOut };
}

function finishSpellTurn(
  state: GameState,
  c: CombatState,
  party: Character[],
  enemies: CombatState['enemies'],
  log: CombatState['log'],
  combatBuffs: Pick<CombatState, 'buffAttackRoll' | 'buffArmorClass'>,
  data: GameData,
  bus?: EventBus
): GameState {
  const allDead = enemies.every((e) => e.hp <= 0);
  const rngSeed = (state.rngSeed + 31) >>> 0;
  if (allDead) {
    log.push({ kind: 'info', message: combatLog.logVictory() });
    return finishCombat(
      { ...state, party, rngSeed },
      {
        ...c,
        ...combatBuffs,
        enemies,
        log,
        phase: 'ended',
      },
      true,
      data,
      bus
    );
  }

  return advanceToEnemyTurn(
    { ...state, party, rngSeed },
    {
      ...c,
      ...combatBuffs,
      enemies,
      log,
      phase: 'enemy',
      pendingStance: undefined,
      pendingSpellId: undefined,
      defenseStanceForEnemyTurn: undefined,
    },
    data,
    bus
  );
}

export function playerSpellOnEnemy(
  state: GameState,
  enemyIndex: number,
  data: GameData,
  bus?: EventBus
): GameState {
  const c = state.combat;
  const pendingSpellId = c?.pendingSpellId;
  if (!c || c.phase !== 'choose_target' || !pendingSpellId) return state;

  const sp = data.spells[pendingSpellId];
  if (!sp || sp.spellKind !== 'damage') return state;

  const lead = getLead(state);
  const manaCost = getEffectiveSpellManaCost(state, pendingSpellId, data);
  if (lead.mana < manaCost) return state;

  const rng = mulberry32(state.rngSeed + c.round * 701 + pendingSpellId.length * 13);
  let party = state.party.map((p) => ({ ...p }));
  let newLead: Character = { ...lead, mana: lead.mana - manaCost };
  party[0] = newLead;

  let log = [...c.log];
  log.push({
    kind: 'info',
    message: combatLog.logCastsSpell(lead.name, sp.name, manaCost),
    actor: lead.name,
    spellId: pendingSpellId,
  });

  const combatBuffs: Pick<CombatState, 'buffAttackRoll' | 'buffArmorClass'> = {
    buffAttackRoll: c.buffAttackRoll ?? 0,
    buffArmorClass: c.buffArmorClass ?? 0,
  };

  const resolved = applyMagicDamageToEnemy(
    state,
    newLead,
    sp,
    pendingSpellId,
    enemyIndex,
    data,
    rng,
    log,
    c.enemies
  );
  if (!resolved) return state;

  return finishSpellTurn(
    state,
    c,
    party,
    resolved.enemies,
    resolved.log,
    combatBuffs,
    data,
    bus
  );
}

export function playerSpellOnAlly(
  state: GameState,
  partyIndex: number,
  data: GameData,
  bus?: EventBus
): GameState {
  const c = state.combat;
  const pendingSpellId = c?.pendingSpellId;
  if (!c || c.phase !== 'choose_target' || !pendingSpellId) return state;

  const sp = data.spells[pendingSpellId];
  if (!sp || sp.spellKind !== 'heal_self') return state;

  const lead = getLead(state);
  const target = state.party[partyIndex];
  if (!target || target.hp <= 0) return state;

  const manaCost = getEffectiveSpellManaCost(state, pendingSpellId, data);
  if (lead.mana < manaCost) return state;

  const rng = mulberry32(state.rngSeed + c.round * 701 + pendingSpellId.length * 13);
  const mindMod = statMod(getTotalMind(data, lead, state));

  let log = [...c.log];
  log.push({
    kind: 'info',
    message: combatLog.logCastsSpell(lead.name, sp.name, manaCost),
    actor: lead.name,
    spellId: pendingSpellId,
  });

  const diceRolls: number[] = [];
  let sum = 0;
  for (let i = 0; i < sp.dice; i++) {
    const d = rollD6(rng);
    diceRolls.push(d);
    sum += d;
  }
  const healTotal = Math.max(0, sp.base + sum + mindMod);
  const healed = Math.min(target.maxHp - target.hp, healTotal);
  const nh = target.hp + healed;

  let newLead: Character = { ...lead, mana: lead.mana - manaCost };
  if (partyIndex === 0) {
    newLead = { ...newLead, hp: nh };
  }

  if (healed > 0) {
    log.push({
      kind: 'heal',
      message: combatLog.logHealsHp(target.name, healed),
      dice: diceRolls,
      final: healed,
      actor: lead.name,
      target: target.name,
      spellId: pendingSpellId,
    });
  } else {
    log.push({ kind: 'info', message: combatLog.logHpFull() });
  }

  const party = state.party.map((p, i) => {
    if (i === 0) return newLead;
    if (i === partyIndex) return { ...p, hp: nh };
    return p;
  });

  const combatBuffs: Pick<CombatState, 'buffAttackRoll' | 'buffArmorClass'> = {
    buffAttackRoll: c.buffAttackRoll ?? 0,
    buffArmorClass: c.buffArmorClass ?? 0,
  };

  return finishSpellTurn(state, c, party, c.enemies, log, combatBuffs, data, bus);
}

export function castSpell(
  state: GameState,
  spellId: string,
  data: GameData,
  bus?: EventBus
): GameState {
  const c = state.combat;
  const lead = getLead(state);
  const sp = data.spells[spellId];
  if (!c || c.phase !== 'choose_stance' || !sp) return state;
  if (!canCastSpell(state, spellId, data)) return state;

  if (spellNeedsEnemyTarget(sp.spellKind) || spellNeedsAllyTarget(sp.spellKind)) {
    return beginTargetedSpell(state, spellId, data);
  }

  const rng = mulberry32(state.rngSeed + c.round * 701 + spellId.length * 13);
  const manaCost = getEffectiveSpellManaCost(state, spellId, data);
  let newLead: Character = { ...lead, mana: lead.mana - manaCost };
  let log = [...c.log];
  log.push({
    kind: 'info',
    message: combatLog.logCastsSpell(lead.name, sp.name, manaCost),
    actor: lead.name,
    spellId,
  });

  let newEnemies = [...c.enemies];
  let combatBuffs: Pick<CombatState, 'buffAttackRoll' | 'buffArmorClass'> = {
    buffAttackRoll: c.buffAttackRoll ?? 0,
    buffArmorClass: c.buffArmorClass ?? 0,
  };

  if (sp.spellKind === 'damage_all_enemies') {
    const resolved = resolveDamageAllEnemies(state, c, lead, sp, data, rng);
    newLead = resolved.newLead;
    newEnemies = resolved.newEnemies;
    log = resolved.log;
  } else if (sp.spellKind === 'buff_attack_roll') {
    combatBuffs = { ...combatBuffs, buffAttackRoll: 1 };
    log.push({
      kind: 'info',
      message: combatLog.logBuffAttack(lead.name),
      actor: lead.name,
      spellId,
    });
  } else {
    combatBuffs = { ...combatBuffs, buffArmorClass: 1 };
    log.push({
      kind: 'info',
      message: combatLog.logBuffArmor(lead.name),
      actor: lead.name,
      spellId,
    });
  }

  const party = state.party.map((p) => (p.id === lead.id ? newLead : p));

  return finishSpellTurn(
    state,
    c,
    party,
    newEnemies,
    log,
    combatBuffs,
    data,
    bus
  );
}

export function executeSpellTurn(
  state: GameState,
  spellId: string,
  data: GameData,
  bus?: EventBus
): GameState {
  return castSpell(state, spellId, data, bus);
}
