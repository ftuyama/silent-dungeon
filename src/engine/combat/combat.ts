export {
  DEFAULT_ENEMY_CRIT_CONFIRM,
  DEFAULT_ENEMY_COMBAT_LINE_CHANCE,
  DEFAULT_FOCUS_LEADER_WEIGHT,
  SACRIFICE_MIN_CORRUPTION,
  ARCHER_DODGE_CHANCE,
} from './constants.ts';
export { beginEncounter, refreshCombatLogInitiativeLabels } from './encounter.ts';
export { getCurrentDialogueContext, resolveDialogueChoice } from './dialogueCombatResolve.ts';
export { getCharacterArmorClass, getEquippedArmorPoints, sumEquippedItemBonuses } from './combatStats.ts';
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
  executePlayerTurn,
  fleeCombat,
  fleeDifficultyTn,
  playerAttack,
} from './turn.ts';
export {
  finishCombat,
  finishCombatFaithRescue,
  finishDialogueCombat,
  reducePartyStressAfterCombat,
} from './resolution.ts';
