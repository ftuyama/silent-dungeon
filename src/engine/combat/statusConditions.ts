import type {
  Character,
  CombatLogEntry,
  EnemyInstance,
  EnemyStatusApply,
  StatusCondition,
  StatusConditionKind,
} from '../schema/index.ts';
import * as combatLog from '../../i18n/combatLogMessages.ts';

/** Paralisia: chance de perder a ação física no turno. */
export const PARALYSIS_SKIP_CHANCE = 0.5;
/** Congelamento: penalidade no ataque físico e na defesa enquanto durar. */
export const FREEZE_ATTACK_PENALTY = 2;
export const FREEZE_DEFENSE_PENALTY = 2;

export function hasStatus(
  ch: Pick<Character, 'statusConditions'>,
  kind: StatusConditionKind
): boolean {
  return ch.statusConditions.some((s) => s.kind === kind && s.remainingRounds > 0);
}

export function statusAttackPenalty(ch: Character): number {
  return hasStatus(ch, 'freeze') ? FREEZE_ATTACK_PENALTY : 0;
}

export function statusDefensePenalty(ch: Character): number {
  return hasStatus(ch, 'freeze') ? FREEZE_DEFENSE_PENALTY : 0;
}

export function rollParalysisSkip(ch: Character, rng: () => number): boolean {
  return hasStatus(ch, 'paralysis') && rng() < PARALYSIS_SKIP_CHANCE;
}

function mergeStatusApply(
  statusConditions: StatusCondition[],
  apply: EnemyStatusApply
): StatusCondition[] {
  const existing = statusConditions.find((s) => s.kind === apply.kind);
  if (existing) {
    return statusConditions.map((s) =>
      s.kind === apply.kind
        ? {
            ...s,
            remainingRounds: Math.max(s.remainingRounds, apply.rounds),
            intensity: Math.max(s.intensity, apply.intensity),
          }
        : s
    );
  }
  return [
    ...statusConditions,
    { kind: apply.kind, remainingRounds: apply.rounds, intensity: apply.intensity },
  ];
}

/**
 * Testa a chance e aplica/renova a condição no personagem.
 * Reaplicar não acumula: mantém a maior duração e intensidade (anti perma-lock).
 */
export function maybeApplyStatus(
  ch: Character,
  apply: EnemyStatusApply,
  rng: () => number
): { ch: Character; applied: boolean } {
  if (rng() >= apply.chance) return { ch, applied: false };
  return {
    ch: { ...ch, statusConditions: mergeStatusApply(ch.statusConditions, apply) },
    applied: true,
  };
}

/** Aplica status a instância inimiga (magias do jogador). */
export function maybeApplyStatusToEnemy(
  inst: EnemyInstance,
  apply: EnemyStatusApply,
  rng: () => number
): { inst: EnemyInstance; applied: boolean } {
  if (rng() >= apply.chance) return { inst, applied: false };
  return {
    inst: { ...inst, statusConditions: mergeStatusApply(inst.statusConditions, apply) },
    applied: true,
  };
}

/**
 * Início da rodada do jogador: dano de veneno por condição ativa.
 * Veneno enfraquece mas não mata — nunca reduz abaixo de 1 HP.
 */
export function tickPoisonAtRoundStart(
  party: Character[],
  log: CombatLogEntry[]
): { party: Character[]; log: CombatLogEntry[] } {
  const outLog = [...log];
  const outParty = party.map((member) => {
    if (member.hp <= 1 || !hasStatus(member, 'poison')) return member;
    const s = member.statusConditions.find((x) => x.kind === 'poison')!;
    const dmg = Math.max(1, s.intensity);
    const nh = Math.max(1, member.hp - dmg);
    if (nh >= member.hp) return member;
    outLog.push({
      kind: 'damage',
      message: combatLog.logPoisonTick(member.name, member.hp - nh),
      final: member.hp - nh,
      target: member.name,
      damageKind: 'normal',
    });
    return { ...member, hp: nh };
  });
  return { party: outParty, log: outLog };
}

/**
 * Início da fase inimiga: dano de queimadura por condição ativa.
 */
export function tickBurnAtEnemyPhaseStart(
  enemies: EnemyInstance[],
  enemyNames: string[],
  log: CombatLogEntry[]
): { enemies: EnemyInstance[]; log: CombatLogEntry[] } {
  const outLog = [...log];
  const outEnemies = enemies.map((inst, i) => {
    if (inst.hp <= 0 || !hasStatus(inst, 'burn')) return inst;
    const s = inst.statusConditions.find((x) => x.kind === 'burn')!;
    const dmg = Math.max(1, s.intensity);
    const nh = Math.max(0, inst.hp - dmg);
    if (nh >= inst.hp) return inst;
    outLog.push({
      kind: 'damage',
      message: combatLog.logBurnTick(enemyNames[i] ?? inst.defId, inst.hp - nh),
      final: inst.hp - nh,
      target: enemyNames[i] ?? inst.defId,
      damageKind: 'normal',
      enemyIndex: i,
      lethal: nh <= 0,
    });
    return { ...inst, hp: nh };
  });
  return { enemies: outEnemies, log: outLog };
}

function expireStatuses<T extends { statusConditions: StatusCondition[] }>(
  subject: T,
  log: CombatLogEntry[],
  nameForLog: string
): { subject: T; log: CombatLogEntry[] } {
  if (subject.statusConditions.length === 0) return { subject, log };
  const outLog = [...log];
  const remaining: StatusCondition[] = [];
  for (const s of subject.statusConditions) {
    const next = { ...s, remainingRounds: s.remainingRounds - 1 };
    if (next.remainingRounds <= 0) {
      outLog.push({
        kind: 'info',
        message: combatLog.logStatusExpired(nameForLog, s.kind),
        target: nameForLog,
      });
    } else {
      remaining.push(next);
    }
  }
  return { subject: { ...subject, statusConditions: remaining }, log: outLog };
}

/**
 * Fim da fase inimiga: decrementa duração de status nos inimigos.
 */
export function expireEnemyStatusesAfterEnemyPhase(
  enemies: EnemyInstance[],
  enemyNames: string[],
  log: CombatLogEntry[]
): { enemies: EnemyInstance[]; log: CombatLogEntry[] } {
  let outLog = log;
  const outEnemies = enemies.map((inst, i) => {
    const res = expireStatuses(inst, outLog, enemyNames[i] ?? inst.defId);
    outLog = res.log;
    return res.subject;
  });
  return { enemies: outEnemies, log: outLog };
}

/**
 * Início da fase inimiga: decrementa duração e expira condições com log.
 * Aplicada na fase R, uma condição de 1 rodada cobre a rodada R+1 inteira
 * do jogador e expira antes dos inimigos agirem em R+1.
 */
export function expireStatusesAtEnemyPhaseStart(
  party: Character[],
  log: CombatLogEntry[]
): { party: Character[]; log: CombatLogEntry[] } {
  let outLog = log;
  const outParty = party.map((member) => {
    const res = expireStatuses(member, outLog, member.name);
    outLog = res.log;
    return res.subject;
  });
  return { party: outParty, log: outLog };
}