import {
  attackRollSpecial2d6,
  attackRollSpecial3d6dl,
  mulberry32,
  roll2d6,
  roll3d6DropLowest,
  rollD6,
  type AttackRollSpecial,
} from '../core/rng.ts';
import type {
  Character,
  CombatLogEntry,
  CombatState,
  EnemyInstance,
  GameState,
  Stance,
} from '../schema/index.ts';
import type { GameData } from '../data/gameData.ts';
import { isLeadPassiveUnlocked } from '../core/state.ts';
import { effectiveLeadAttr, tickActiveBuffs } from '../progression/leadStats.ts';
import {
  adjustCompanionFriendshipScore,
  getCompanionFriendshipScore,
  KNOCKOUT_FRIENDSHIP_DELTA,
  notifyCompanionFriendshipChange,
  syncCompanionPartyWithFriendship,
} from '../progression/companionFriendship.ts';
import type { EventBus } from '../core/eventBus.ts';
import { getArmorValue, getWeaponDamage, statMod } from '../combat/combatStats.ts';
import { resolveHitChance, rollHitAgainstDefense } from './hitChance.ts';
import { getEffectiveLuck } from '../progression/luck.ts';
import {
  DEFAULT_ENEMY_COMBAT_LINE_CHANCE,
  DEFAULT_ENEMY_CRIT_CONFIRM,
  ARCHER_DODGE_CHANCE,
  getSacrificeValues,
  pickEnemyMeleeTarget,
  toRollOutcome,
} from './constants.ts';
import {
  finishCombat,
  finishCombatFaithRescue,
  finishCombatSupporterMercy,
  reducePartyStressAfterCombat,
} from './resolution.ts';
import { canUseSupporterMercy } from '../progression/supporterPerks.ts';
import { applyBossTwistsAfterEnemyPhase, finishCombatIfAllEnemiesDead } from './bossTwists.ts';
import { chooseEnemyAction } from './enemyAi.ts';
import { computePartyDefenseScore, resolveEnemyAbility } from './enemyActions.ts';
import {
  expireEnemyStatusesAfterEnemyPhase,
  expireStatusesAtEnemyPhaseStart,
  rollParalysisSkip,
  statusAttackPenalty,
  tickBurnAtEnemyPhaseStart,
  tickPoisonAtRoundStart,
} from './statusConditions.ts';
import * as combatLog from '../../i18n/combatLogMessages.ts';

function getLead(state: GameState): Character {
  return state.party[0]!;
}

function enemyDisplayNames(enemies: EnemyInstance[], data: GameData): string[] {
  return enemies.map((e) => data.enemies[e.defId]?.name ?? e.defId);
}

function applyStartOfPlayerTurnPassive(
  state: GameState,
  party: Character[],
  log: CombatLogEntry[]
): { party: Character[]; log: CombatLogEntry[] } {
  const lead = party[0];
  if (!lead || lead.hp <= 0) return { party, log };

  if (!isLeadPassiveUnlocked(state)) return { party, log };

  if (lead.class === 'cleric') {
    const regen = Math.max(1, Math.ceil(lead.maxHp * 0.01));
    const healed = Math.min(regen, Math.max(0, lead.maxHp - lead.hp));
    if (healed > 0) {
      const nextLead = { ...lead, hp: lead.hp + healed };
      const nextParty = party.map((p, i) => (i === 0 ? nextLead : p));
      return {
        party: nextParty,
        log: [
          ...log,
          {
            kind: 'heal',
            message: combatLog.logRegenHp(lead.name, healed),
            final: healed,
            actor: lead.name,
            target: lead.name,
          },
        ],
      };
    }
    return { party, log };
  }

  if (lead.class === 'mage' && lead.maxMana > 0) {
    const regen = Math.max(1, Math.ceil(lead.maxMana * 0.01));
    const restored = Math.min(regen, Math.max(0, lead.maxMana - lead.mana));
    if (restored > 0) {
      const nextLead = { ...lead, mana: lead.mana + restored };
      const nextParty = party.map((p, i) => (i === 0 ? nextLead : p));
      return {
        party: nextParty,
        log: [...log, { kind: 'info', message: combatLog.logRegenMana(lead.name, restored) }],
      };
    }
  }

  return { party, log };
}

export function applyPlayerStance(
  state: GameState,
  stance: Stance,
  _data: GameData,
  opts?: { useSacrifice?: boolean }
): GameState {
  void _data;
  const c = state.combat;
  if (!c || c.phase !== 'choose_stance') return state;
  const lead = getLead(state);
  let party = state.party.map((p) => ({ ...p }));
  let pendingSacrificeDamage = 0;
  let pendingSacrificeCost = 0;
  const log: CombatLogEntry[] = [
    ...c.log,
    {
      kind: 'stance' as const,
      message: combatLog.logStance(lead.name, stance),
      actor: lead.name,
    },
  ];
  if (opts?.useSacrifice) {
    const sacrifice = getSacrificeValues(state);
    if (sacrifice) {
      const currentLead = party[0]!;
      const maxLoss = Math.max(0, currentLead.hp - 1);
      const hpLoss = Math.min(sacrifice.hpCost, maxLoss);
      if (hpLoss > 0) {
        party[0] = { ...currentLead, hp: currentLead.hp - hpLoss };
        pendingSacrificeDamage = sacrifice.damageBonus;
        pendingSacrificeCost = hpLoss;
        log.push({
          kind: 'info',
          message: combatLog.logVoidSealActive(currentLead.name, hpLoss, sacrifice.damageBonus),
          actor: currentLead.name,
        });
      } else {
        log.push({
          kind: 'info',
          message: combatLog.logVoidSealInactive(),
          actor: currentLead.name,
        });
      }
    }
  }
  return {
    ...state,
    party,
    combat: {
      ...c,
      pendingStance: stance,
      phase: 'choose_target',
      log,
      pendingSacrificeDamage,
      pendingSacrificeCost,
    },
  };
}

function headshotManaCost(_state: GameState, data: GameData): number {
  const sp = data.spells.headshot;
  if (!sp) return 16;
  return sp.manaCost;
}

/**
 * Um ataque físico (líder ou companheiro). Na mesma vaga de combate, todos usam a postura escolhida pelo líder.
 * Golpe especial só para o índice 0.
 */
function physicalAttackForCharacter(
  state: GameState,
  c: CombatState,
  party: Character[],
  enemies: EnemyInstance[],
  attackerIndex: number,
  enemyIndex: number,
  stance: Stance,
  useSpecial: boolean,
  data: GameData,
  rng: () => number,
  log: CombatLogEntry[],
  _bus?: EventBus,
  attackOpts?: { forcedCrit?: boolean; spellId?: string }
): {
  party: Character[];
  enemies: EnemyInstance[];
  log: CombatLogEntry[];
  /** Negativo = gasto de corrupção (apenas líder / relíquia). */
  corruptionDelta?: number;
} | null {
  void _bus;
  let corruptionDelta: number | undefined;
  const attacker = party[attackerIndex];
  if (!attacker || attacker.hp <= 0) return null;
  const inst = enemies[enemyIndex];
  if (!inst || inst.hp <= 0) return null;
  const def = data.enemies[inst.defId];
  if (!def) return null;
  if (useSpecial && attackerIndex !== 0) return null;

  if (rollParalysisSkip(attacker, rng)) {
    return {
      party,
      enemies,
      log: [
        ...log,
        {
          kind: 'info',
          message: combatLog.logParalysisSkip(attacker.name),
          actor: attacker.name,
        },
      ],
    };
  }

  let str = effectiveLeadAttr(state, attacker, 'str');
  let mind = effectiveLeadAttr(state, attacker, 'mind');
  for (const slot of [attacker.weaponId, attacker.armorId, attacker.relicId] as const) {
    if (slot && data.items[slot]) {
      const it = data.items[slot]!;
      str += it.bonusStr;
      mind += it.bonusMind;
    }
  }

  let atkMod = statMod(str);
  if (stance === 'aggressive') {
    atkMod += 1;
  } else if (stance === 'defensive') {
    atkMod -= 1;
  } else if (stance === 'focus') {
    atkMod = statMod(mind) + 1;
  }
  atkMod -= statusAttackPenalty(attacker);

  let dice: number[] = [];
  let total = 0;
  let special: AttackRollSpecial = 'normal';

  if (attackOpts?.forcedCrit) {
    special = 'crit';
  } else if (c.playerAdvantage) {
    const r = roll3d6DropLowest(rng);
    dice = [...r.dice];
    total = r.sum + atkMod;
    special = attackRollSpecial3d6dl(r.dice);
  } else {
    const [d1, d2] = roll2d6(rng);
    dice = [d1, d2];
    total = d1 + d2 + atkMod;
    special = attackRollSpecial2d6(d1, d2);
  }

  const targetDef = def.agi + def.armor;
  const defense = 7 + Math.floor(targetDef / 2) + (c.enemyBuffArmorClass ?? 0);

  const logOut = [...log];
  let newEnemies = [...enemies];
  let newAttacker = { ...attacker };
  let stress = newAttacker.stress;
  let rollTotal = total;
  const spellAtk = c.buffAttackRoll ?? 0;
  if (attackerIndex === 0 && spellAtk > 0) {
    rollTotal += spellAtk;
  }

  if (useSpecial && attackerIndex === 0 && !attacker.specialUsedThisCombat) {
    newAttacker.specialUsedThisCombat = true;
    rollTotal += 2;
    stress = Math.min(4, stress + 1);
    logOut.push({
      kind: 'stress',
      message: combatLog.logSpecialStrike(),
      actor: attacker.name,
    });
  }

  let hit = false;
  let hitChance: number | undefined;
  if (special === 'fumble') {
    hit = false;
  } else if (special === 'crit') {
    hit = true;
  } else {
    hitChance = resolveHitChance(rollTotal, defense);
    hit = rollHitAgainstDefense(rng, rollTotal, defense);
  }

  const rollOutcome = toRollOutcome(special);
  let attackMsg: string;
  if (attackOpts?.forcedCrit) {
    attackMsg = combatLog.logHeadshotCrit(attacker.name, def.name);
  } else if (special === 'fumble') {
    attackMsg = combatLog.logAttackFumble(attacker.name);
  } else if (special === 'crit') {
    attackMsg = combatLog.logAttackCrit(attacker.name, def.name);
  } else if (hit) {
    attackMsg = combatLog.logAttackHit(attacker.name, def.name);
  } else {
    attackMsg = combatLog.logAttackMiss(attacker.name);
  }

  logOut.push({
    kind: 'attack',
    message: attackMsg,
    dice,
    modifier: atkMod,
    final: rollTotal,
    actor: attacker.name,
    target: def.name,
    outcome: hit ? 'hit' : 'miss',
    vsDefense: defense,
    hitChance,
    rollOutcome,
    enemyIndex,
    ...(attackOpts?.spellId ? { spellId: attackOpts.spellId } : {}),
  });

  if (hit) {
    const dDmg = rollD6(rng);
    const effLuck = getEffectiveLuck(attacker, data, state);
    const luckBonus = statMod(effLuck);
    let wd = getWeaponDamage(data, attacker);
    if (wd === 0 && !attacker.weaponId) wd = 1;
    const sacrificeBonus = attackerIndex === 0 ? c.pendingSacrificeDamage ?? 0 : 0;
    const baseFlat = wd + (stance === 'aggressive' ? 1 : 0) + sacrificeBonus;
    const holyBonus = def.type === 'undead' && attacker.class === 'cleric' ? 1 : 0;
    let isPlayerCrit = special === 'crit';
    if (!isPlayerCrit && hit && attacker.critRatio > 0 && rng() < attacker.critRatio) {
      isPlayerCrit = true;
      logOut.push({
        kind: 'info',
        message: combatLog.logPassiveCritOpening(attacker.name),
        actor: attacker.name,
        target: def.name,
      });
    }
    const chipTarget = newEnemies[enemyIndex]!;
    if (def.type === 'armored' && chipTarget.armorChipsRemaining > 0) {
      const ct = {
        ...chipTarget,
        armorChipsRemaining: chipTarget.armorChipsRemaining - 1,
      };
      logOut.push({
        kind: 'armor_break',
        message: combatLog.logArmorBroken(),
        target: def.name,
        enemyIndex,
      });
      newEnemies[enemyIndex] = ct;
    } else {
      let dmg = isPlayerCrit
        ? dDmg * 2 + baseFlat + holyBonus + luckBonus
        : dDmg + baseFlat + holyBonus;
      if (attackerIndex === 0 && attacker.relicId) {
        const relic = data.items[attacker.relicId];
        const cap = relic?.corruptionDrainOnHit ?? 0;
        if (cap > 0 && state.resources.corruption > 0) {
          const drain = Math.min(cap, state.resources.corruption);
          const per = relic?.damageBonusPerCorruptionDrain ?? 2;
          const extra = drain * per;
          dmg += extra;
          corruptionDelta = -drain;
          logOut.push({
            kind: 'info',
            message: combatLog.logAmuletBurn(drain, extra),
            actor: attacker.name,
            target: def.name,
          });
        }
      }
      const nh = Math.max(0, chipTarget.hp - dmg);
      newEnemies[enemyIndex] = { ...chipTarget, hp: nh };
      logOut.push({
        kind: 'damage',
        message: combatLog.logDamageMessage(def.name, dmg, isPlayerCrit, sacrificeBonus),
        dice: [dDmg],
        final: dmg,
        target: def.name,
        damageKind: isPlayerCrit ? 'crit' : 'normal',
        enemyIndex,
        lethal: nh <= 0,
        ...(attackOpts?.spellId ? { spellId: attackOpts.spellId } : {}),
      });
    }
  }

  newAttacker.stress = stress;
  if (attackerIndex === 0 && newAttacker.stress >= 4) {
    logOut.push({
      kind: 'stress',
      message: combatLog.logPanic(),
    });
  }

  const newParty = party.map((p, i) => (i === attackerIndex ? newAttacker : p));

  return {
    party: newParty,
    enemies: newEnemies,
    log: logOut,
    ...(corruptionDelta !== undefined ? { corruptionDelta } : {}),
  };
}

export function playerAttack(
  state: GameState,
  enemyIndex: number,
  data: GameData,
  useSpecial: boolean,
  bus?: EventBus
): GameState {
  const c = state.combat;
  if (!c || c.phase !== 'choose_target' || !c.pendingStance) return state;
  const stance = c.pendingStance;
  const def0 = data.enemies[c.enemies[enemyIndex]?.defId ?? ''];
  if (!def0) return state;

  let rng = mulberry32(state.rngSeed + c.round * 997);
  let log = [...c.log];
  let party = state.party.map((p) => ({ ...p }));
  let enemies = [...c.enemies];

  const pendingSpellId = c.pendingSpellId;
  let attackOpts: { forcedCrit?: boolean; spellId?: string } | undefined;
  if (pendingSpellId) {
    const sp = data.spells[pendingSpellId];
    if (!sp || sp.spellKind !== 'targeted_crit_attack') return state;
    const lead = party[0];
    if (!lead) return state;
    const manaCost = headshotManaCost(state, data);
    if (lead.mana < manaCost) return state;
    party[0] = { ...lead, mana: lead.mana - manaCost };
    log.push({
      kind: 'info',
      message: combatLog.logCastsSpell(lead.name, sp.name, manaCost),
      actor: lead.name,
      spellId: pendingSpellId,
    });
    attackOpts = { forcedCrit: true, spellId: pendingSpellId };
  }

  const st = { ...state, party };
  const r0 = physicalAttackForCharacter(
    st,
    c,
    party,
    enemies,
    0,
    enemyIndex,
    stance,
    useSpecial,
    data,
    rng,
    log,
    bus,
    attackOpts
  );
  if (!r0) return state;
  party = r0.party;
  enemies = r0.enemies;
  log = r0.log;

  let resources = state.resources;
  if (r0.corruptionDelta !== undefined) {
    const nc = Math.max(0, Math.min(10, resources.corruption + r0.corruptionDelta));
    resources = { ...resources, corruption: nc };
  }

  let rngSeed = (state.rngSeed + 31) >>> 0;

  if (enemies.every((e) => e.hp <= 0)) {
    log.push({ kind: 'info', message: combatLog.logVictory() });
    return finishCombat(
      { ...state, party, rngSeed, resources },
      { ...c, enemies, log, phase: 'ended' },
      true,
      data,
      bus
    );
  }

  for (let pi = 1; pi < party.length; pi++) {
    if (party[pi]!.hp <= 0) continue;
    const eIdx = enemies.findIndex((e) => e.hp > 0);
    if (eIdx < 0) break;
    rng = mulberry32(rngSeed + c.round * 997 + pi * 47);
    const rn = physicalAttackForCharacter(
      { ...state, party, rngSeed, resources },
      c,
      party,
      enemies,
      pi,
      eIdx,
      stance,
      false,
      data,
      rng,
      log,
      bus
    );
    if (!rn) break;
    party = rn.party;
    enemies = rn.enemies;
    log = rn.log;
    rngSeed = (rngSeed + 31) >>> 0;

    if (enemies.every((e) => e.hp <= 0)) {
      log.push({ kind: 'info', message: combatLog.logVictory() });
      return finishCombat(
        { ...state, party, rngSeed, resources },
        { ...c, enemies, log, phase: 'ended' },
        true,
        data,
        bus
      );
    }
  }

  return advanceToEnemyTurn(
    {
      ...state,
      party,
      rngSeed,
      resources,
    },
    {
      ...c,
      enemies,
      log,
      phase: 'enemy',
      pendingStance: undefined,
      pendingSpellId: undefined,
      pendingSacrificeDamage: 0,
      pendingSacrificeCost: 0,
      defenseStanceForEnemyTurn: c.pendingStance,
    },
    data,
    bus
  );
}

export function advanceToEnemyTurn(
  state: GameState,
  c: CombatState,
  data: GameData,
  bus?: EventBus
): GameState {
  const rng = mulberry32(state.rngSeed + 999);
  let log: CombatLogEntry[] = [
    ...c.log,
    {
      kind: 'turn_banner' as const,
      message: combatLog.logRoundEnemies(c.round),
    },
  ];
  let enemies = [...c.enemies];
  let party = state.party.map((p) => ({ ...p }));
  let carryState = state;
  let enemyBuffAtk = c.enemyBuffAttackRoll ?? 0;

  const statusExpiry = expireStatusesAtEnemyPhaseStart(party, log);
  party = statusExpiry.party;
  log = statusExpiry.log;

  const enemyNames = enemyDisplayNames(enemies, data);
  const burnTick = tickBurnAtEnemyPhaseStart(enemies, enemyNames, log);
  enemies = burnTick.enemies;
  log = burnTick.log;

  const victoryAfterBurn = finishCombatIfAllEnemiesDead(
    carryState,
    c,
    party,
    enemies,
    log,
    {},
    data,
    bus
  );
  if (victoryAfterBurn) return victoryAfterBurn;

  const handleCompanionKnockout = (idx: number): void => {
    const pid = party[idx]!.id;
    const bondBefore = getCompanionFriendshipScore(carryState, pid);
    carryState = adjustCompanionFriendshipScore(
      { ...carryState, party },
      pid,
      KNOCKOUT_FRIENDSHIP_DELTA
    );
    carryState = syncCompanionPartyWithFriendship(carryState, data);
    notifyCompanionFriendshipChange(
      bus,
      data,
      pid,
      bondBefore,
      getCompanionFriendshipScore(carryState, pid)
    );
    party = carryState.party.map((p) => ({ ...p }));
  };

  for (let i = 0; i < enemies.length; i++) {
    const inst = enemies[i]!;
    if (inst.hp <= 0) continue;
    const def = data.enemies[inst.defId];
    if (!def) continue;
    if (
      def.combatLines &&
      def.combatLines.length > 0 &&
      rng() < DEFAULT_ENEMY_COMBAT_LINE_CHANCE
    ) {
      const idx = Math.floor(rng() * def.combatLines.length);
      const line = def.combatLines[idx];
      if (line) {
        log.push({ kind: 'enemy_line', message: line, enemyIndex: i });
      }
    }

    const action = chooseEnemyAction(def, inst, c.round);
    if (action.type === 'ability') {
      const resolved = resolveEnemyAbility({
        state,
        c,
        data,
        def,
        ability: action.ability,
        enemyIndex: i,
        party,
        enemyBuffAttackRoll: enemyBuffAtk,
        rng,
        log,
      });
      party = resolved.party;
      log = resolved.log;
      enemyBuffAtk += resolved.enemyBuffAttackRollDelta;
      for (const koIdx of resolved.koCompanionIndexes) {
        handleCompanionKnockout(koIdx);
      }
      continue;
    }

    const targetIndex = pickEnemyMeleeTarget(party, def, rng);
    const target = party[targetIndex]!;
    let atk = 0;
    let dice: number[] = [];
    let special: AttackRollSpecial = 'normal';
    if (c.enemyAdvantage) {
      const r = roll3d6DropLowest(rng);
      dice = [...r.dice];
      atk = r.sum + statMod(def.str);
      special = attackRollSpecial3d6dl(r.dice);
    } else {
      const [d1, d2] = roll2d6(rng);
      dice = [d1, d2];
      atk = d1 + d2 + statMod(def.str);
      special = attackRollSpecial2d6(d1, d2);
    }
    atk += enemyBuffAtk;
    const defScore = computePartyDefenseScore(state, c, party, targetIndex, data);

    const critConfirm = def.critConfirm ?? DEFAULT_ENEMY_CRIT_CONFIRM;
    let enemyHit = false;
    let enemyCritDmg = false;
    let hitChance: number | undefined;
    if (special === 'fumble') {
      enemyHit = false;
    } else if (special === 'crit') {
      if (rng() < critConfirm) {
        enemyHit = true;
        enemyCritDmg = true;
      } else {
        hitChance = resolveHitChance(atk, defScore);
        enemyHit = rollHitAgainstDefense(rng, atk, defScore);
      }
    } else {
      hitChance = resolveHitChance(atk, defScore);
      enemyHit = rollHitAgainstDefense(rng, atk, defScore);
    }

    let dodged = false;
    if (
      enemyHit &&
      !enemyCritDmg &&
      targetIndex === 0 &&
      target.class === 'archer' &&
      isLeadPassiveUnlocked(carryState) &&
      rng() < ARCHER_DODGE_CHANCE
    ) {
      enemyHit = false;
      dodged = true;
    }

    const rollOutcome = toRollOutcome(special);
    let enemyAtkMsg: string;
    if (special === 'fumble') {
      enemyAtkMsg = combatLog.logAttackFumble(def.name);
    } else if (enemyHit && enemyCritDmg) {
      enemyAtkMsg = combatLog.logAttackCrit(def.name, target.name);
    } else if (enemyHit) {
      enemyAtkMsg = combatLog.logAttackHit(def.name, target.name);
    } else if (dodged) {
      enemyAtkMsg = combatLog.logArcherDodge(target.name, def.name);
    } else {
      enemyAtkMsg = combatLog.logEnemyMiss(def.name);
    }

    log.push({
      kind: 'attack',
      message: enemyAtkMsg,
      dice,
      modifier: statMod(def.str),
      final: atk,
      actor: def.name,
      target: target.name,
      outcome: enemyHit ? 'hit' : 'miss',
      vsDefense: defScore,
      hitChance,
      rollOutcome,
      enemyIndex: i,
    });

    if (special === 'crit' && !enemyCritDmg && enemyHit) {
      log.push({
        kind: 'info',
        message: combatLog.logAlmostCrit(),
      });
    }

    if (enemyHit) {
      const dDmg = rollD6(rng);
      const reduc = getArmorValue(data, target);
      const strMod = statMod(def.str);
      const dmg = enemyCritDmg
        ? Math.max(1, dDmg * 2 + strMod - reduc)
        : Math.max(1, dDmg + strMod - reduc);
      const nh = Math.max(0, target.hp - dmg);
      const companionKnockout = targetIndex > 0 && target.hp > 0 && nh === 0;
      party[targetIndex] = { ...target, hp: nh };
      log.push({
        kind: 'damage',
        message: combatLog.logPlayerDamage(target.name, dmg, enemyCritDmg),
        dice: [dDmg],
        final: dmg,
        target: target.name,
        damageKind: enemyCritDmg ? 'crit' : 'normal',
      });
      let st = target.stress;
      st = Math.min(4, st + 1);
      party[targetIndex] = { ...party[targetIndex]!, stress: st };
      if (companionKnockout) {
        handleCompanionKnockout(targetIndex);
      }
    }
  }

  /** Fase inimiga concluída: buffs de self_buff persistem no estado do combate. */
  const cLive: CombatState = { ...c, enemyBuffAttackRoll: enemyBuffAtk };

  const leadDead = party[0]!.hp <= 0;
  if (leadDead) {
    const sWithParty = { ...carryState, party };
    if (sWithParty.resources.faith >= 5) {
      return finishCombatFaithRescue(
        sWithParty,
        { ...cLive, enemies, log, phase: 'ended' },
        data,
        bus
      );
    }
    if (canUseSupporterMercy(sWithParty)) {
      return finishCombatSupporterMercy(
        sWithParty,
        { ...cLive, enemies, log, phase: 'ended' },
        data,
        bus
      );
    }
    log.push({ kind: 'info', message: combatLog.logGameOver() });
    return finishCombat(sWithParty, { ...cLive, enemies, log, phase: 'ended' }, false, data, bus);
  }

  const poisonTick = tickPoisonAtRoundStart(party, log);
  party = poisonTick.party;
  log = poisonTick.log;

  const enemyStatusExpiry = expireEnemyStatusesAfterEnemyPhase(enemies, enemyNames, log);
  enemies = enemyStatusExpiry.enemies;
  log = enemyStatusExpiry.log;

  const nextRound = c.round + 1;
  const roundPrep = applyStartOfPlayerTurnPassive(state, party, log);
  party = roundPrep.party;
  let nextLog = [
    ...roundPrep.log,
    {
      kind: 'turn_banner' as const,
      message: combatLog.logRoundPlayer(nextRound),
    },
  ];

  const twistOut = applyBossTwistsAfterEnemyPhase(data, cLive, party, enemies, nextRound);
  party = twistOut.party;
  enemies = twistOut.enemies;
  nextLog = [...nextLog, ...twistOut.twistLog];
  const twistCombatPatch = twistOut.combatPatch;

  const victoryAfterTwist = finishCombatIfAllEnemiesDead(
    carryState,
    cLive,
    party,
    enemies,
    nextLog,
    twistCombatPatch,
    data,
    bus
  );
  if (victoryAfterTwist) return victoryAfterTwist;

  return {
    ...carryState,
    party,
    combat: {
      ...cLive,
      ...twistCombatPatch,
      enemies,
      log: nextLog,
      phase: 'choose_stance',
      round: nextRound,
      pendingStance: undefined,
      defenseStanceForEnemyTurn: undefined,
    },
    rngSeed: (carryState.rngSeed + 17) >>> 0,
  };
}

/** Postura + ataque ao primeiro inimigo vivo (índice resolvido internamente). */
export function executePlayerTurn(
  state: GameState,
  stance: Stance,
  data: GameData,
  useSpecial: boolean,
  useSacrifice: boolean,
  bus?: EventBus
): GameState {
  let s = applyPlayerStance(state, stance, data, { useSacrifice });
  const c = s.combat;
  if (!c) return s;
  let idx = c.enemies.findIndex((e) => e.hp > 0);
  if (idx < 0) idx = 0;
  return playerAttack(s, idx, data, useSpecial, bus);
}

/** TN de fuga: maior `fleeRate` ⇒ encontro “mais fácil de fugir” (TN mais baixo). Faixa 7–12. */
export function fleeDifficultyTn(fleeRate: number): number {
  const r = Math.max(0, Math.min(1, fleeRate));
  return 7 + Math.round(5 * (1 - r));
}

export function fleeCombat(state: GameState, data: GameData, bus?: EventBus): GameState {
  const c = state.combat;
  if (!c || c.phase !== 'choose_stance') return state;
  const lead = state.party[0];
  if (!lead || lead.hp <= 0) return state;

  const fleeRate = c.fleeRate ?? 0.5;
  const tn = fleeDifficultyTn(fleeRate);
  const agi = effectiveLeadAttr(state, lead, 'agi');
  const mod = statMod(agi);
  const rng = mulberry32(state.rngSeed + c.round * 503 + 91);
  const [d1, d2] = roll2d6(rng);
  const total = d1 + d2 + mod;
  const success = total >= tn;

  const log: CombatLogEntry[] = [
    ...c.log,
    {
      kind: 'info',
      message: success
        ? combatLog.logFleeSuccess(lead.name, total, tn, fmtSignedMod(mod))
        : combatLog.logFleeFailure(lead.name, total, tn, fmtSignedMod(mod)),
      dice: [d1, d2],
      modifier: mod,
      final: total,
      vsDefense: tn,
    },
  ];

  let rngSeed = (state.rngSeed + 31) >>> 0;

  if (success) {
    bus?.emit({ type: 'combat.end', victory: false, fled: true });
    const stateAfterStress = reducePartyStressAfterCombat(state);
    return tickActiveBuffs({
      ...stateAfterStress,
      rngSeed,
      lastCombatXpGain: null,
      lastCombatLevelUps: null,
      lastCombatLootLines: null,
      mode: 'story',
      combat: null,
      sceneId: c.onFlee ?? c.returnScene,
    });
  }

  return advanceToEnemyTurn(
    { ...state, rngSeed },
    {
      ...c,
      log,
      phase: 'enemy',
      pendingStance: undefined,
      pendingSacrificeDamage: 0,
      pendingSacrificeCost: 0,
      defenseStanceForEnemyTurn: undefined,
    },
    data,
    bus
  );
}

function fmtSignedMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}
