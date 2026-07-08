import type { Effect } from '../engine/schema/index.ts';
import { slotReturnRewardDateKey } from './gameAppSaveSlots.ts';
import { t } from '../i18n/index.ts';

/** Ciclo fixo de recompensas: dia 1..7; ao completar, recomeça no dia 1. */
export const DAILY_BONUS_CYCLE_LENGTH = 7;

export type DailyBonusReward = {
  gold: number;
  supply: number;
  faith: number;
};

/** Recompensas por dia do ciclo (índice 0 = dia 1). Limites do motor: ouro 0–999, suprimento 0–10, fé 0–5. */
export const DAILY_BONUS_REWARDS: readonly DailyBonusReward[] = [
  { gold: 3, supply: 1, faith: 0 },
  { gold: 4, supply: 1, faith: 0 },
  { gold: 5, supply: 1, faith: 0 },
  { gold: 6, supply: 2, faith: 0 },
  { gold: 8, supply: 2, faith: 0 },
  { gold: 10, supply: 2, faith: 0 },
  { gold: 15, supply: 3, faith: 1 },
];

/** Progresso global de login da campanha (independente do slot). */
export type DailyBonusMeta = {
  /** Último dia (YYYY-MM-DD) em que o login contou. */
  lastLoginDate: string | null;
  /** Dias seguidos, incluindo o dia registado em `lastLoginDate`. */
  streak: number;
};

export function todayDateKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function previousDateKey(dateKey: string): string {
  const d = new Date(`${dateKey}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Mesmo dia mantém; dia seguinte soma 1; lacuna reinicia a sequência em 1. */
export function advanceDailyStreak(
  meta: DailyBonusMeta,
  today: string
): { meta: DailyBonusMeta; isNewDay: boolean } {
  if (meta.lastLoginDate === today) return { meta, isNewDay: false };
  const streak = meta.lastLoginDate === previousDateKey(today) ? meta.streak + 1 : 1;
  return { meta: { lastLoginDate: today, streak }, isNewDay: true };
}

/** Dia dentro do ciclo (1..7) para uma sequência de N dias. */
export function cycleDayForStreak(streak: number): number {
  return ((Math.max(1, streak) - 1) % DAILY_BONUS_CYCLE_LENGTH) + 1;
}

export function rewardForCycleDay(cycleDay: number): DailyBonusReward {
  return DAILY_BONUS_REWARDS[cycleDay - 1] ?? DAILY_BONUS_REWARDS[0]!;
}

export function dailyBonusRewardEffects(reward: DailyBonusReward): Effect[] {
  const effs: Effect[] = [];
  if (reward.gold > 0) effs.push({ op: 'addResource', resource: 'gold', delta: reward.gold });
  if (reward.supply > 0) effs.push({ op: 'addResource', resource: 'supply', delta: reward.supply });
  if (reward.faith > 0) effs.push({ op: 'addResource', resource: 'faith', delta: reward.faith });
  return effs;
}

/** Texto curto do prêmio ("+4 ouro · +1 suprimento"). */
export function dailyBonusRewardLabel(reward: DailyBonusReward): string {
  const parts: string[] = [];
  if (reward.gold > 0) parts.push(t('dailyBonus.rewardGold', { n: String(reward.gold) }));
  if (reward.supply > 0) parts.push(t('dailyBonus.rewardSupply', { n: String(reward.supply) }));
  if (reward.faith > 0) parts.push(t('dailyBonus.rewardFaith', { n: String(reward.faith) }));
  return parts.join(' · ');
}

export function dailyBonusMetaKey(campaignId: string): string {
  return `${campaignId}_daily_bonus_meta_v1`;
}

export function loadDailyBonusMeta(campaignId: string): DailyBonusMeta {
  const empty: DailyBonusMeta = { lastLoginDate: null, streak: 0 };
  try {
    const raw = localStorage.getItem(dailyBonusMetaKey(campaignId));
    if (!raw) return empty;
    const o = JSON.parse(raw) as unknown;
    if (typeof o !== 'object' || o === null) return empty;
    const m = o as Partial<DailyBonusMeta>;
    const lastLoginDate = typeof m.lastLoginDate === 'string' ? m.lastLoginDate : null;
    const streak = typeof m.streak === 'number' && m.streak >= 0 ? Math.floor(m.streak) : 0;
    return { lastLoginDate, streak };
  } catch {
    return empty;
  }
}

export function saveDailyBonusMeta(campaignId: string, meta: DailyBonusMeta): void {
  try {
    localStorage.setItem(dailyBonusMetaKey(campaignId), JSON.stringify(meta));
  } catch {
    /* noop */
  }
}

/** Regista o login diário (abertura do jogo) e persiste; devolve o estado atualizado. */
export function registerDailyLogin(
  campaignId: string,
  today: string = todayDateKey()
): { meta: DailyBonusMeta; isNewDay: boolean } {
  const result = advanceDailyStreak(loadDailyBonusMeta(campaignId), today);
  if (result.isNewDay) saveDailyBonusMeta(campaignId, result.meta);
  return result;
}

/** Slot já recebeu o bônus diário hoje? (reaproveita a chave de retorno por slot). */
export function hasSlotDailyBonusToday(
  campaignId: string,
  slot: number,
  today: string = todayDateKey()
): boolean {
  try {
    return localStorage.getItem(slotReturnRewardDateKey(campaignId, slot)) === today;
  } catch {
    return false;
  }
}

export function markSlotDailyBonusClaimed(
  campaignId: string,
  slot: number,
  today: string = todayDateKey()
): void {
  try {
    localStorage.setItem(slotReturnRewardDateKey(campaignId, slot), today);
  } catch {
    /* noop */
  }
}
