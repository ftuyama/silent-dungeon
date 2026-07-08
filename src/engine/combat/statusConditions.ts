import type {
  Character,
  CombatLogEntry,
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

export function hasStatus(ch: Character, kind: StatusConditionKind): boolean {
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
  const existing = ch.statusConditions.find((s) => s.kind === apply.kind);
  let statusConditions: StatusCondition[];
  if (existing) {
    statusConditions = ch.statusConditions.map((s) =>
      s.kind === apply.kind
        ? {
            ...s,
            remainingRounds: Math.max(s.remainingRounds, apply.rounds),
            intensity: Math.max(s.intensity, apply.intensity),
          }
        : s
    );
  } else {
    statusConditions = [
      ...ch.statusConditions,
      { kind: apply.kind, remainingRounds: apply.rounds, intensity: apply.intensity },
    ];
  }
  return { ch: { ...ch, statusConditions }, applied: true };
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
 * Início da fase inimiga: decrementa duração e expira condições com log.
 * Aplicada na fase R, uma condição de 1 rodada cobre a rodada R+1 inteira
 * do jogador e expira antes dos inimigos agirem em R+1.
 */
export function expireStatusesAtEnemyPhaseStart(
  party: Character[],
  log: CombatLogEntry[]
): { party: Character[]; log: CombatLogEntry[] } {
  const outLog = [...log];
  const outParty = party.map((member) => {
    if (member.statusConditions.length === 0) return member;
    const remaining: StatusCondition[] = [];
    for (const s of member.statusConditions) {
      const next = { ...s, remainingRounds: s.remainingRounds - 1 };
      if (next.remainingRounds <= 0) {
        outLog.push({
          kind: 'info',
          message: combatLog.logStatusExpired(member.name, s.kind),
          target: member.name,
        });
      } else {
        remaining.push(next);
      }
    }
    return { ...member, statusConditions: remaining };
  });
  return { party: outParty, log: outLog };
}