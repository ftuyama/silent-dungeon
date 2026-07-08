import { describe, expect, it } from 'vitest';
import {
  applyEventToDailyTasks,
  dailyTaskRewardEffects,
  dailyTasksCompletedCount,
  DAILY_TASKS_PER_DAY,
  DAILY_TASK_TARGETS,
  rollDailyTasks,
  type DailyTaskInstance,
  type DailyTasksState,
} from '../../src/ui/gameAppDailyTasks.ts';
import { MAX_LEVEL } from '../../src/engine/progression/index.ts';
import { createStateWithHero } from '../helpers/engineTestData.ts';

function task(partial: Partial<DailyTaskInstance> & { id: DailyTaskInstance['id'] }): DailyTaskInstance {
  return {
    target: DAILY_TASK_TARGETS[partial.id],
    progress: 0,
    reward: { kind: 'gold', amount: 5 },
    claimed: false,
    ...partial,
  };
}

function tasksState(tasks: DailyTaskInstance[]): DailyTasksState {
  return { dateKey: '2026-07-08', tasks };
}

describe('rollDailyTasks', () => {
  it('is deterministic for the same campaign, date and slot', () => {
    const game = createStateWithHero();
    const a = rollDailyTasks('calvario', 1, '2026-07-08', game);
    const b = rollDailyTasks('calvario', 1, '2026-07-08', game);
    expect(a).toEqual(b);
  });

  it('rolls a different set on another date or slot', () => {
    const game = createStateWithHero();
    const base = rollDailyTasks('calvario', 1, '2026-07-08', game);
    const otherDay = rollDailyTasks('calvario', 1, '2026-07-09', game);
    const otherSlot = rollDailyTasks('calvario', 2, '2026-07-08', game);
    expect(otherDay).not.toEqual(base);
    expect(otherSlot).not.toEqual(base);
  });

  it('rolls 3 distinct tasks with targets from the table and fresh progress', () => {
    const game = createStateWithHero();
    const rolled = rollDailyTasks('calvario', 1, '2026-07-08', game);
    expect(rolled.dateKey).toBe('2026-07-08');
    expect(rolled.tasks).toHaveLength(DAILY_TASKS_PER_DAY);
    expect(new Set(rolled.tasks.map((t) => t.id)).size).toBe(DAILY_TASKS_PER_DAY);
    for (const t of rolled.tasks) {
      expect(t.target).toBe(DAILY_TASK_TARGETS[t.id]);
      expect(t.progress).toBe(0);
      expect(t.claimed).toBe(false);
      expect(t.reward.amount).toBeGreaterThan(0);
    }
  });

  it('never offers levelUp at max level', () => {
    const game = createStateWithHero({ level: MAX_LEVEL });
    for (let d = 1; d <= 28; d++) {
      const dateKey = `2026-07-${String(d).padStart(2, '0')}`;
      const rolled = rollDailyTasks('calvario', 1, dateKey, game);
      expect(rolled.tasks.some((t) => t.id === 'levelUp')).toBe(false);
    }
  });

  it('stores the visited-scenes baseline for visitScenes tasks', () => {
    const game = {
      ...createStateWithHero(),
      visitedScenes: { a: true, b: true },
    };
    for (let d = 1; d <= 28; d++) {
      const dateKey = `2026-07-${String(d).padStart(2, '0')}`;
      const rolled = rollDailyTasks('calvario', 1, dateKey, game);
      for (const t of rolled.tasks) {
        if (t.id === 'visitScenes') expect(t.baseline).toBe(2);
      }
    }
  });
});

describe('applyEventToDailyTasks', () => {
  const game = createStateWithHero();

  it('counts only victorious combats for defeatEnemies', () => {
    const initial = tasksState([task({ id: 'defeatEnemies' })]);
    const win = applyEventToDailyTasks(initial, { type: 'combat.end', victory: true }, game);
    expect(win.state.tasks[0]!.progress).toBe(1);

    const flee = applyEventToDailyTasks(win.state, { type: 'combat.end', victory: false, fled: true }, game);
    expect(flee.state).toBe(win.state);

    const defeat = applyEventToDailyTasks(win.state, { type: 'combat.end', victory: false }, game);
    expect(defeat.state).toBe(win.state);
  });

  it('completes the task at the target and reports it once', () => {
    let s = tasksState([task({ id: 'defeatEnemies', progress: 2 })]);
    const r = applyEventToDailyTasks(s, { type: 'combat.end', victory: true }, game);
    expect(r.completed).toHaveLength(1);
    expect(r.state.tasks[0]!.claimed).toBe(true);

    const again = applyEventToDailyTasks(r.state, { type: 'combat.end', victory: true }, game);
    expect(again.completed).toHaveLength(0);
    expect(again.state).toBe(r.state);
  });

  it('accumulates XP for earnXp and caps progress at the target', () => {
    const s = tasksState([task({ id: 'earnXp' })]);
    const r1 = applyEventToDailyTasks(s, { type: 'xp.gained', amount: 25 }, game);
    expect(r1.state.tasks[0]!.progress).toBe(25);
    expect(r1.completed).toHaveLength(0);

    const r2 = applyEventToDailyTasks(r1.state, { type: 'xp.gained', amount: 100 }, game);
    expect(r2.state.tasks[0]!.progress).toBe(DAILY_TASK_TARGETS.earnXp);
    expect(r2.completed).toHaveLength(1);
  });

  it('derives visitScenes progress from the baseline, even without an event', () => {
    const s = tasksState([task({ id: 'visitScenes', baseline: 2 })]);
    const before = { ...game, visitedScenes: { a: true, b: true } };
    expect(applyEventToDailyTasks(s, null, before).state).toBe(s);

    const after = { ...game, visitedScenes: { a: true, b: true, c: true, d: true, e: true } };
    const r = applyEventToDailyTasks(s, null, after);
    expect(r.state.tasks[0]!.progress).toBe(DAILY_TASK_TARGETS.visitScenes);
    expect(r.completed).toHaveLength(1);
  });

  it('maps single-shot events to their tasks', () => {
    const s = tasksState([
      task({ id: 'levelUp' }),
      task({ id: 'campRest' }),
      task({ id: 'advanceDay' }),
      task({ id: 'diaryEntry' }),
      task({ id: 'acquireItem' }),
    ]);
    const cases = [
      { ev: { type: 'level.up', level: 2 }, idx: 0 },
      { ev: { type: 'camp.rest' }, idx: 1 },
      { ev: { type: 'time.dayAdvanced', day: 2 }, idx: 2 },
      { ev: { type: 'diary.entryAdded', text: 'x' }, idx: 3 },
      { ev: { type: 'item.acquired', itemId: 'torch' }, idx: 4 },
    ] as const;
    for (const c of cases) {
      const r = applyEventToDailyTasks(s, c.ev, game);
      expect(r.state.tasks[c.idx]!.claimed).toBe(true);
      expect(r.completed.map((t) => t.id)).toEqual([s.tasks[c.idx]!.id]);
    }
  });
});

describe('rewards', () => {
  it('builds the right engine effect per reward kind', () => {
    expect(dailyTaskRewardEffects({ kind: 'gold', amount: 8 })).toEqual([
      { op: 'addResource', resource: 'gold', delta: 8 },
    ]);
    expect(dailyTaskRewardEffects({ kind: 'xp', amount: 40 })).toEqual([
      { op: 'addXp', amount: 40 },
    ]);
    expect(dailyTaskRewardEffects({ kind: 'supply', amount: 2 })).toEqual([
      { op: 'addResource', resource: 'supply', delta: 2 },
    ]);
    expect(dailyTaskRewardEffects({ kind: 'faith', amount: 1 })).toEqual([
      { op: 'addResource', resource: 'faith', delta: 1 },
    ]);
  });

  it('keeps rolled reward amounts within engine caps', () => {
    const game = createStateWithHero();
    for (let d = 1; d <= 28; d++) {
      const dateKey = `2026-07-${String(d).padStart(2, '0')}`;
      for (const t of rollDailyTasks('calvario', 1, dateKey, game).tasks) {
        if (t.reward.kind === 'gold') expect(t.reward.amount).toBeLessThanOrEqual(10);
        if (t.reward.kind === 'xp') expect(t.reward.amount).toBeLessThanOrEqual(60);
        if (t.reward.kind === 'supply') expect(t.reward.amount).toBeLessThanOrEqual(2);
        if (t.reward.kind === 'faith') expect(t.reward.amount).toBe(1);
      }
    }
  });

  it('counts claimed tasks', () => {
    const s = tasksState([
      task({ id: 'campRest', progress: 1, claimed: true }),
      task({ id: 'defeatEnemies' }),
    ]);
    expect(dailyTasksCompletedCount(s)).toBe(1);
  });
});
