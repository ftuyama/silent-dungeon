import {
  attackRollSpecial2d6,
  attackRollSpecial3d6dl,
  roll2d6,
  roll3d6DropLowest,
  rollD6,
  type AttackRollSpecial,
} from '../core/rng.ts';
import type {
  Character,
  CombatLogEntry,
  CombatState,
  EnemyAbility,
  EnemyDef,
  GameState,
} from '../schema/index.ts';
import type { GameData } from '../data/gameData.ts';
import { effectiveLeadAttr } from '../progression/leadStats.ts';
import { agiToArmorClassMod, getArmorValue, statMod } from './combatStats.ts';
import { resolveHitChance, rollHitAgainstDefense } from './hitChance.ts';
import { pickEnemyMeleeTarget, toRollOutcome } from './constants.ts';
import { maybeApplyStatus, statusDefensePenalty } from './statusConditions.ts';
import * as combatLog from '../../i18n/combatLogMessages.ts';

/** Teto do bónus acumulado de `self_buff` no ataque inimigo. */
export const ENEMY_SELF_BUFF_CAP = 3;

/** CA de um membro do grupo vs ataques inimigos (postura, pânico, buffs e status). */
export function computePartyDefenseScore(
  state: GameState,
  c: CombatState,
  party: Character[],
  targetIndex: number,
  data: GameData
): number {
  const target = party[targetIndex]!;
  const panicPenalty = targetIndex === 0 && target.stress >= 4 ? 2 : 0;
  return (
    7 +
    agiToArmorClassMod(effectiveLeadAttr(state, target, 'agi')) +
    getArmorValue(data, target) +
    (c.defenseStanceForEnemyTurn === 'defensive' ? 2 : 0) -
    panicPenalty -
    statusDefensePenalty(target) +
    (targetIndex === 0 ? (c.buffArmorClass ?? 0) : 0)
  );
}

export type EnemyAbilityResolution = {
  party: Character[];
  log: CombatLogEntry[];
  /** Delta efetivo a somar em `enemyBuffAttackRoll` (self_buff, já capado). */
  enemyBuffAttackRollDelta: number;
  /** Companheiros (índice > 0) nocauteados; amizade tratada pelo chamador. */
  koCompanionIndexes: number[];
};

function rollEnemyAttack(
  c: CombatState,
  attrMod: number,
  buffAtk: number,
  rng: () => number
): { dice: number[]; total: number; special: AttackRollSpecial } {
  if (c.enemyAdvantage) {
    const r = roll3d6DropLowest(rng);
    return {
      dice: [...r.dice],
      total: r.sum + attrMod + buffAtk,
      special: attackRollSpecial3d6dl(r.dice),
    };
  }
  const [d1, d2] = roll2d6(rng);
  return {
    dice: [d1, d2],
    total: d1 + d2 + attrMod + buffAtk,
    special: attackRollSpecial2d6(d1, d2),
  };
}

function rollDiceSum(dice: number, rng: () => number): { rolls: number[]; sum: number } {
  const rolls: number[] = [];
  let sum = 0;
  for (let i = 0; i < dice; i++) {
    const d = rollD6(rng);
    rolls.push(d);
    sum += d;
  }
  return { rolls, sum };
}

/** Dano + stress num alvo; devolve o grupo atualizado e se houve KO de companheiro. */
function applyDamageToMember(
  party: Character[],
  targetIndex: number,
  dmg: number
): { party: Character[]; ko: boolean } {
  const target = party[targetIndex]!;
  const nh = Math.max(0, target.hp - dmg);
  const ko = targetIndex > 0 && target.hp > 0 && nh === 0;
  const next = [...party];
  next[targetIndex] = {
    ...target,
    hp: nh,
    stress: Math.min(4, target.stress + 1),
  };
  return { party: next, ko };
}

function maybeApplyAbilityStatus(
  ability: EnemyAbility,
  party: Character[],
  targetIndex: number,
  rng: () => number,
  log: CombatLogEntry[]
): Character[] {
  const apply = ability.applyStatus;
  if (!apply) return party;
  const target = party[targetIndex]!;
  if (target.hp <= 0) return party;
  const res = maybeApplyStatus(target, apply, rng);
  if (!res.applied) return party;
  log.push({
    kind: 'info',
    message: combatLog.logStatusApplied(target.name, apply.kind, apply.rounds),
    target: target.name,
  });
  const next = [...party];
  next[targetIndex] = res.ch;
  return next;
}

/**
 * Resolve uma habilidade inimiga contra o grupo. Mensagens seguem o formato do
 * ataque comum (kinds `attack`/`damage`/`stress`) para reaproveitar FX da UI.
 */
export function resolveEnemyAbility(opts: {
  state: GameState;
  c: CombatState;
  data: GameData;
  def: EnemyDef;
  ability: EnemyAbility;
  enemyIndex: number;
  party: Character[];
  enemyBuffAttackRoll: number;
  rng: () => number;
  log: CombatLogEntry[];
}): EnemyAbilityResolution {
  const { state, c, data, def, ability, enemyIndex, rng } = opts;
  let party = opts.party;
  const log = [...opts.log];
  const koCompanionIndexes: number[] = [];

  if (ability.linePt) {
    log.push({ kind: 'enemy_line', message: ability.linePt, enemyIndex });
  }
  log.push({
    kind: 'info',
    message: combatLog.logEnemyAbility(def.name, ability.name),
    actor: def.name,
    enemyIndex,
  });

  if (ability.kind === 'self_buff') {
    const wanted = Math.max(1, ability.base);
    const delta = Math.max(
      0,
      Math.min(ENEMY_SELF_BUFF_CAP, opts.enemyBuffAttackRoll + wanted) -
        opts.enemyBuffAttackRoll
    );
    if (delta > 0) {
      log.push({
        kind: 'info',
        message: combatLog.logEnemySelfBuff(def.name, delta),
        actor: def.name,
        enemyIndex,
      });
    }
    return { party, log, enemyBuffAttackRollDelta: delta, koCompanionIndexes };
  }

  if (ability.kind === 'stress_wave') {
    party = party.map((p) =>
      p.hp > 0 ? { ...p, stress: Math.min(4, p.stress + 1) } : p
    );
    log.push({
      kind: 'stress',
      message: combatLog.logEnemyStressWave(def.name),
      actor: def.name,
      enemyIndex,
    });
    return { party, log, enemyBuffAttackRollDelta: 0, koCompanionIndexes };
  }

  if (ability.kind === 'area_strike') {
    const { rolls, sum } = rollDiceSum(Math.max(1, ability.dice), rng);
    const strMod = statMod(def.str);
    for (let ti = 0; ti < party.length; ti++) {
      if (party[ti]!.hp <= 0) continue;
      const reduc = getArmorValue(data, party[ti]!);
      const dmg = Math.max(1, Math.floor((sum + ability.base + strMod) / 2) - reduc);
      const applied = applyDamageToMember(party, ti, dmg);
      party = applied.party;
      if (applied.ko) koCompanionIndexes.push(ti);
      log.push({
        kind: 'damage',
        message: combatLog.logPlayerDamage(party[ti]!.name, dmg, false),
        dice: rolls,
        final: dmg,
        target: party[ti]!.name,
        damageKind: 'normal',
      });
      party = maybeApplyAbilityStatus(ability, party, ti, rng, log);
    }
    return { party, log, enemyBuffAttackRollDelta: 0, koCompanionIndexes };
  }

  // heavy_strike / spell_damage: um alvo, com rolagem de ataque.
  const targetIndex = pickEnemyMeleeTarget(party, def, rng);
  const target = party[targetIndex]!;
  const isSpell = ability.kind === 'spell_damage';
  const attrMod = isSpell ? statMod(def.mind) : statMod(def.str);
  const roll = rollEnemyAttack(c, attrMod, opts.enemyBuffAttackRoll, rng);
  const defScore = computePartyDefenseScore(state, c, party, targetIndex, data);

  let hit: boolean;
  let hitChance: number | undefined;
  if (roll.special === 'fumble') hit = false;
  else if (roll.special === 'crit') hit = true;
  else {
    hitChance = resolveHitChance(roll.total, defScore);
    hit = rollHitAgainstDefense(rng, roll.total, defScore);
  }

  log.push({
    kind: 'attack',
    message: hit
      ? combatLog.logAttackHit(def.name, target.name)
      : combatLog.logEnemyMiss(def.name),
    dice: roll.dice,
    modifier: attrMod,
    final: roll.total,
    actor: def.name,
    target: target.name,
    outcome: hit ? 'hit' : 'miss',
    vsDefense: defScore,
    hitChance,
    rollOutcome: toRollOutcome(roll.special),
    enemyIndex,
  });

  if (!hit) {
    return { party, log, enemyBuffAttackRollDelta: 0, koCompanionIndexes };
  }

  const { rolls, sum } = rollDiceSum(Math.max(1, ability.dice), rng);
  /** Magia: dano plano (dados + base), sem mod de atributo — Mente alta só facilita acertar. */
  const reduc = isSpell ? 0 : getArmorValue(data, target);
  const dmg = Math.max(1, sum + ability.base + (isSpell ? 0 : attrMod) - reduc);
  const applied = applyDamageToMember(party, targetIndex, dmg);
  party = applied.party;
  if (applied.ko) koCompanionIndexes.push(targetIndex);
  log.push({
    kind: 'damage',
    message: isSpell
      ? combatLog.logMagicDamage(target.name, dmg)
      : combatLog.logPlayerDamage(target.name, dmg, false),
    dice: rolls,
    final: dmg,
    target: target.name,
    damageKind: 'normal',
  });
  party = maybeApplyAbilityStatus(ability, party, targetIndex, rng, log);

  return { party, log, enemyBuffAttackRollDelta: 0, koCompanionIndexes };
}
