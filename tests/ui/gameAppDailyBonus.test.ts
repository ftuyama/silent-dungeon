import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  advanceDailyStreak,
  cycleDayForStreak,
  dailyBonusRewardEffects,
  DAILY_BONUS_CYCLE_LENGTH,
  DAILY_BONUS_REWARDS,
  hasRunDailyBonusToday,
  markRunDailyBonusClaimed,
  previousDateKey,
  rewardForCycleDay,
  runDailyBonusDateKey,
} from '../../src/ui/gameAppDailyBonus.ts';

describe('previousDateKey', () => {
  it('handles month and year boundaries', () => {
    expect(previousDateKey('2026-07-08')).toBe('2026-07-07');
    expect(previousDateKey('2026-07-01')).toBe('2026-06-30');
    expect(previousDateKey('2026-01-01')).toBe('2025-12-31');
    expect(previousDateKey('2028-03-01')).toBe('2028-02-29');
  });
});

describe('advanceDailyStreak', () => {
  it('starts at 1 on first login', () => {
    const r = advanceDailyStreak({ lastLoginDate: null, streak: 0 }, '2026-07-08');
    expect(r.isNewDay).toBe(true);
    expect(r.meta).toEqual({ lastLoginDate: '2026-07-08', streak: 1 });
  });

  it('does not advance twice on the same day', () => {
    const meta = { lastLoginDate: '2026-07-08', streak: 3 };
    const r = advanceDailyStreak(meta, '2026-07-08');
    expect(r.isNewDay).toBe(false);
    expect(r.meta).toEqual(meta);
  });

  it('increments on consecutive days', () => {
    const r = advanceDailyStreak({ lastLoginDate: '2026-07-07', streak: 3 }, '2026-07-08');
    expect(r.isNewDay).toBe(true);
    expect(r.meta).toEqual({ lastLoginDate: '2026-07-08', streak: 4 });
  });

  it('resets to 1 after a missed day', () => {
    const r = advanceDailyStreak({ lastLoginDate: '2026-07-05', streak: 6 }, '2026-07-08');
    expect(r.isNewDay).toBe(true);
    expect(r.meta).toEqual({ lastLoginDate: '2026-07-08', streak: 1 });
  });
});

describe('cycleDayForStreak', () => {
  it('maps streaks onto the 7-day cycle', () => {
    expect(cycleDayForStreak(1)).toBe(1);
    expect(cycleDayForStreak(7)).toBe(7);
    expect(cycleDayForStreak(8)).toBe(1);
    expect(cycleDayForStreak(15)).toBe(1);
    expect(cycleDayForStreak(0)).toBe(1);
  });
});

describe('rewards', () => {
  it('has one reward per cycle day, within engine caps', () => {
    expect(DAILY_BONUS_REWARDS).toHaveLength(DAILY_BONUS_CYCLE_LENGTH);
    for (const r of DAILY_BONUS_REWARDS) {
      expect(r.gold).toBeGreaterThan(0);
      expect(r.supply).toBeLessThanOrEqual(10);
      expect(r.faith).toBeLessThanOrEqual(5);
    }
  });

  it('day 7 pays the biggest prize', () => {
    const day7 = rewardForCycleDay(7);
    for (let d = 1; d <= 6; d++) {
      expect(day7.gold).toBeGreaterThan(rewardForCycleDay(d).gold);
    }
  });

  it('builds addResource effects only for positive amounts', () => {
    const effs = dailyBonusRewardEffects({ gold: 5, supply: 0, faith: 1 });
    expect(effs).toEqual([
      { op: 'addResource', resource: 'gold', delta: 5 },
      { op: 'addResource', resource: 'faith', delta: 1 },
    ]);
  });
});

describe('per-run daily bonus tracking', () => {
  const store = new Map<string, string>();
  const runId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

  beforeEach(() => {
    store.clear();
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
    };
  });

  afterEach(() => {
    delete (globalThis as { localStorage?: unknown }).localStorage;
  });

  it('is unclaimed by default and claimed after marking', () => {
    expect(hasRunDailyBonusToday('calvario', runId, '2026-07-08')).toBe(false);
    markRunDailyBonusClaimed('calvario', runId, '2026-07-08');
    expect(hasRunDailyBonusToday('calvario', runId, '2026-07-08')).toBe(true);
  });

  it('resets on the next day and tracks runs independently', () => {
    markRunDailyBonusClaimed('calvario', runId, '2026-07-08');
    expect(hasRunDailyBonusToday('calvario', runId, '2026-07-09')).toBe(false);
    expect(
      hasRunDailyBonusToday('calvario', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', '2026-07-08')
    ).toBe(false);
  });

  it('uses a key scoped to the run UUID', () => {
    expect(runDailyBonusDateKey('calvario', runId)).toBe(
      `calvario_run_daily_bonus_v1_${runId}`
    );
  });
});
