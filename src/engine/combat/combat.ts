export {
  DEFAULT_ENEMY_CRIT_CONFIRM,
  DEFAULT_ENEMY_COMBAT_LINE_CHANCE,
  DEFAULT_FOCUS_LEADER_WEIGHT,
  SACRIFICE_MIN_CORRUPTION,
  ARCHER_DODGE_CHANCE,
} from './constants.ts';
export { beginEncounter, refreshCombatLogInitiativeLabels } from './encounter.ts';
export { getCurrentDialogueContext, resolveDialogueChoice } from './dialogueCombatResolve.ts';
export { getCharacterArmorClass, getEquippedArmorPoints, sumEquippedItemBonuses, agiToArmorClassMod } from './combatStats.ts';
export {
  HIT_CHANCE_BASE,
  HIT_CHANCE_MAX,
  HIT_CHANCE_MIN,
  HIT_CHANCE_PER_POINT,
  resolveHitChance,
  rollHitAgainstDefense,
} from './hitChance.ts';
export {
  canCastSpell,
  executeSpellTurn,
  getEffectiveSpellManaCost,
  beginTargetedSpell,
  playerSpellOnEnemy,
  playerSpellOnAlly,
  spellNeedsAllyTarget,
  spellNeedsEnemyTarget,
} from './spells.ts';
export { canUseCombatConsumable, useCombatConsumable } from './combatConsumables.ts';
export {
  advanceToEnemyTurn,
  executePlayerTurn,
  fleeCombat,
  fleeDifficultyTn,
  playerAttack,
} from './turn.ts';
export {
  finishCombat,
  finishCombatFaithRescue,
  finishCombatSupporterMercy,
  finishDialogueCombat,
  reducePartyStressAfterCombat,
} from './resolution.ts';
export { chooseEnemyAction, type EnemyActionChoice } from './enemyAi.ts';
export {
  ENEMY_SELF_BUFF_CAP,
  computePartyDefenseScore,
  resolveEnemyAbility,
} from './enemyActions.ts';
export {
  FREEZE_ATTACK_PENALTY,
  FREEZE_DEFENSE_PENALTY,
  PARALYSIS_SKIP_CHANCE,
  expireStatusesAtEnemyPhaseStart,
  hasStatus,
  maybeApplyStatus,
  rollParalysisSkip,
  statusAttackPenalty,
  statusDefensePenalty,
  tickPoisonAtRoundStart,
} from './statusConditions.ts';
