import type { Stance, StatusConditionKind } from '../engine/schema/index.ts';
import { SUPPORTED_LOCALES } from './locale.ts';
import { t, translateKey } from './translate.ts';

export function matchesAnyLocale(key: string, message: string): boolean {
  for (const locale of SUPPORTED_LOCALES) {
    if (translateKey(key, locale) === message) return true;
  }
  return false;
}

function stanceLabel(stance: Stance): string {
  if (stance === 'aggressive') return t('combat.stanceAggressive');
  if (stance === 'defensive') return t('combat.stanceDefensive');
  return t('combat.stanceFocus');
}

export function logVictory(): string {
  return t('combatLog.victory');
}

export function logGameOver(): string {
  return t('combatLog.gameOver');
}

export function logPanic(): string {
  return t('combatLog.panic');
}

export function logSpecialStrike(): string {
  return t('combatLog.specialStrike');
}

export function logArmorBroken(): string {
  return t('combatLog.armorBroken');
}

export function logArmorBrokenSpell(): string {
  return t('combatLog.armorBrokenSpell');
}

export function logAlmostCrit(): string {
  return t('combatLog.almostCrit');
}

export function logRoundEnemies(round: number): string {
  return t('combatLog.roundEnemies', { round });
}

export function logRoundPlayer(round: number): string {
  return t('combatLog.roundPlayer', { round });
}

export function logStance(name: string, stance: Stance): string {
  return t('combatLog.stance', { name, stance: stanceLabel(stance) });
}

export function logRegenHp(name: string, amount: number): string {
  return t('combatLog.regenHp', { name, amount });
}

export function logRegenMana(name: string, amount: number): string {
  return t('combatLog.regenMana', { name, amount });
}

export function logUsesItem(name: string, item: string): string {
  return t('combatLog.usesItem', { name, item });
}

export function logHealsHp(name: string, amount: number): string {
  return t('combatLog.healsHp', { name, amount });
}

export function logHealsMana(name: string, amount: number): string {
  return t('combatLog.healsMana', { name, amount });
}

export function logRelievesStress(name: string, amount: number): string {
  return t('combatLog.relievesStress', { name, amount });
}

export function logHpFull(): string {
  return t('combatLog.hpFull');
}

export function logManaFull(): string {
  return t('combatLog.manaFull');
}

export function logStressMin(): string {
  return t('combatLog.stressMin');
}

export function logCastsSpell(name: string, spell: string, mana: number): string {
  return t('combatLog.castsSpell', { name, spell, mana });
}

export function logMagicDamage(name: string, amount: number): string {
  return t('combatLog.magicDamage', { name, amount });
}

export function logBuffAttack(name: string): string {
  return t('combatLog.buffAttack', { name });
}

export function logBuffArmor(name: string): string {
  return t('combatLog.buffArmor', { name });
}

export function logBuffStrength(name: string): string {
  return t('combatLog.buffStrength', { name });
}

export function logBuffMind(name: string): string {
  return t('combatLog.buffMind', { name });
}

export function logBuffCritRatio(name: string): string {
  return t('combatLog.buffCritRatio', { name });
}

export function logEnemyAppears(name: string): string {
  return t('combatLog.enemyAppears', { name });
}

export function logDialogueTrap(name: string): string {
  return t('combatLog.dialogueTrap', { name });
}

export function logHostilityDrain(loss: number): string {
  return t('combatLog.hostilityDrain', { loss });
}

export function logHostilityCalm(): string {
  return t('combatLog.hostilityCalm');
}

export function logTestResult(
  attr: string,
  d1: number,
  d2: number,
  mod: number,
  total: number,
  tn: number,
  ok: boolean
): string {
  return t('combatLog.testResult', {
    attr: attr.toUpperCase(),
    d1,
    d2,
    mod,
    total,
    tn,
    result: ok ? t('combatLog.success') : t('combatLog.failure'),
  });
}

export function logLuckResult(
  d1: number,
  d2: number,
  mod: number,
  curseBit: string,
  total: number,
  tn: number,
  ok: boolean
): string {
  return t('combatLog.luckResult', {
    d1,
    d2,
    mod,
    curse: curseBit,
    total,
    tn,
    result: ok ? t('combatLog.success') : t('combatLog.failure'),
  });
}

export function logLuckCursePenalty(penalty: number): string {
  return t('combatLog.cursePenalty', { penalty });
}

export function logVoidSealActive(name: string, hpLoss: number, damageBonus: number): string {
  return t('combatLog.voidSealActive', { name, hpLoss, damageBonus });
}

export function logVoidSealInactive(): string {
  return t('combatLog.voidSealInactive');
}

export function logPassiveCritOpening(name: string): string {
  return t('combatLog.passiveCritOpening', { name });
}

export function logAmuletBurn(drain: number, extra: number): string {
  return t('combatLog.amuletBurn', { drain, extra });
}

export function logAttackFumble(attacker: string): string {
  return t('combatLog.attackFumble', { attacker });
}

export function logAttackCrit(attacker: string, target: string): string {
  return t('combatLog.attackCrit', { attacker, target });
}

export function logAttackHit(attacker: string, target: string): string {
  return t('combatLog.attackHit', { attacker, target });
}

export function logAttackMiss(attacker: string): string {
  return t('combatLog.attackMiss', { attacker });
}

export function logDamageMessage(
  target: string,
  amount: number,
  isCrit: boolean,
  sacrificeBonus: number
): string {
  const sacrifice =
    sacrificeBonus > 0 ? t('combatLog.sacrificeSuffix', { bonus: sacrificeBonus }) : '';
  const key = isCrit ? 'combatLog.damageCrit' : 'combatLog.damageNormal';
  return t(key, { target, amount, sacrifice });
}

export function logHostilityCool(amount: number): string {
  return t('combatLog.hostilityCool', { amount });
}

export function logHostilitySharpen(amount: number): string {
  return t('combatLog.hostilitySharpen', { amount });
}

export function logEnemyMiss(attacker: string): string {
  return t('combatLog.enemyMiss', { attacker });
}

export function logHeadshotAim(name: string, spell: string): string {
  return t('combatLog.headshotAim', { name, spell });
}

export function logSpellTargets(name: string, spell: string): string {
  return t('combatLog.spellTargets', { name, spell });
}

export function logHealTargets(name: string, spell: string): string {
  return t('combatLog.healTargets', { name, spell });
}

export function logHeadshotCrit(attacker: string, target: string): string {
  return t('combatLog.headshotCrit', { attacker, target });
}

export function logArcherDodge(target: string, attacker: string): string {
  return t('combatLog.archerDodge', { target, attacker });
}

export function logArrowRainDamage(target: string, amount: number): string {
  return t('combatLog.arrowRainDamage', { target, amount });
}

export function logPlayerDamage(target: string, amount: number, isCrit: boolean): string {
  return t(isCrit ? 'combatLog.playerDamageCrit' : 'combatLog.playerDamage', { target, amount });
}

export function logInitiativeOrder(): string {
  return t('combatLog.initiativeOrder');
}

export function logEnemyFallback(n: number): string {
  return t('combatLog.enemyFallback', { n });
}

export function logFleeSuccess(
  name: string,
  total: number,
  tn: number,
  mod: string
): string {
  return t('combatLog.fleeSuccess', { name, total, tn, mod });
}

export function logFleeFailure(
  name: string,
  total: number,
  tn: number,
  mod: string
): string {
  return t('combatLog.fleeFailure', { name, total, tn, mod });
}

function statusLabel(kind: StatusConditionKind): string {
  if (kind === 'paralysis') return t('combatLog.statusParalysis');
  if (kind === 'poison') return t('combatLog.statusPoison');
  if (kind === 'burn') return t('combatLog.statusBurn');
  return t('combatLog.statusFreeze');
}

export function logEnemyAbility(name: string, ability: string): string {
  return t('combatLog.enemyAbility', { name, ability });
}

export function logEnemySelfBuff(name: string, delta: number): string {
  return t('combatLog.enemySelfBuff', { name, delta });
}

export function logEnemyStressWave(name: string): string {
  return t('combatLog.enemyStressWave', { name });
}

export function logStatusApplied(
  target: string,
  kind: StatusConditionKind,
  rounds: number
): string {
  return t('combatLog.statusApplied', { target, status: statusLabel(kind), rounds });
}

export function logStatusExpired(name: string, kind: StatusConditionKind): string {
  return t('combatLog.statusExpired', { name, status: statusLabel(kind) });
}

export function logParalysisSkip(name: string): string {
  return t('combatLog.paralysisSkip', { name });
}

export function logPoisonTick(name: string, amount: number): string {
  return t('combatLog.poisonTick', { name, amount });
}

export function logBurnTick(name: string, amount: number): string {
  return t('combatLog.burnTick', { name, amount });
}
