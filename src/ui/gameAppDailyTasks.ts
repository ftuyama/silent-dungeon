import type { Effect, GameState } from '../engine/schema/index.ts';
import type { GameEvent } from '../engine/core/index.ts';
import { mulberry32 } from '../engine/core/rng.ts';
import { MAX_LEVEL } from '../engine/progression/index.ts';
import { todayDateKey } from './gameAppDailyBonus.ts';
import { t } from '../i18n/index.ts';

/** Tarefas sorteadas por dia real (YYYY-MM-DD), por gravação (slot). */
export const DAILY_TASKS_PER_DAY = 3;

export const DAILY_TASK_KINDS = [
  'defeatEnemies',
  'levelUp',
  'campRest',
  'earnXp',
  'visitScenes',
  'advanceDay',
  'diaryEntry',
  'acquireItem',
] as const;

export type DailyTaskKind = (typeof DAILY_TASK_KINDS)[number];

/** Meta de cada tipo de tarefa (quantas vezes o gatilho precisa ocorrer). */
export const DAILY_TASK_TARGETS: Record<DailyTaskKind, number> = {
  defeatEnemies: 3,
  levelUp: 1,
  campRest: 1,
  earnXp: 40,
  visitScenes: 2,
  advanceDay: 1,
  diaryEntry: 1,
  acquireItem: 1,
};

export type DailyTaskReward =
  | { kind: 'gold'; amount: number }
  | { kind: 'xp'; amount: number }
  | { kind: 'supply'; amount: number }
  | { kind: 'faith'; amount: number };

export type DailyTaskInstance = {
  id: DailyTaskKind;
  target: number;
  progress: number;
  reward: DailyTaskReward;
  /** Meta atingida e prêmio pago — nunca paga duas vezes. */
  claimed: boolean;
  /** `visitScenes`: total de cenas visitadas no momento do sorteio (conta só as novas). */
  baseline?: number;
};

export type DailyTasksState = {
  /** Dia real (YYYY-MM-DD) para o qual as tarefas foram sorteadas. */
  dateKey: string;
  tasks: DailyTaskInstance[];
};

/** FNV-1a 32-bit — seed determinística por campanha+dia+slot. */
function seedFromString(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const REWARD_KINDS = ['gold', 'xp', 'supply', 'faith'] as const;

/** Limites do motor: ouro 0–999, suprimento 0–10, fé 0–5 — valores abaixo dos tetos. */
function rollReward(rng: () => number): DailyTaskReward {
  const kind = REWARD_KINDS[Math.floor(rng() * REWARD_KINDS.length)] ?? 'gold';
  switch (kind) {
    case 'gold':
      return { kind, amount: 4 + Math.floor(rng() * 7) };
    case 'xp':
      return { kind, amount: 30 + Math.floor(rng() * 31) };
    case 'supply':
      return { kind, amount: 1 + Math.floor(rng() * 2) };
    case 'faith':
      return { kind, amount: 1 };
  }
}

function countVisitedScenes(game: GameState): number {
  return Object.values(game.visitedScenes).filter(Boolean).length;
}

/** Sorteio determinístico (mesmo dia+slot ⇒ mesmas tarefas), com prêmio aleatório por tarefa. */
export function rollDailyTasks(
  campaignId: string,
  slot: number,
  dateKey: string,
  game: GameState
): DailyTasksState {
  const rng = mulberry32(seedFromString(`${campaignId}_${dateKey}_s${slot}`));
  const pool = DAILY_TASK_KINDS.filter((k) => k !== 'levelUp' || game.level < MAX_LEVEL);
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  const visitedBaseline = countVisitedScenes(game);
  const tasks = shuffled.slice(0, DAILY_TASKS_PER_DAY).map((id): DailyTaskInstance => {
    const task: DailyTaskInstance = {
      id,
      target: DAILY_TASK_TARGETS[id],
      progress: 0,
      reward: rollReward(rng),
      claimed: false,
    };
    if (id === 'visitScenes') task.baseline = visitedBaseline;
    return task;
  });
  return { dateKey, tasks };
}

/**
 * Avança o progresso das tarefas a partir de um evento do motor (ou `null` para
 * re-sincronizar tarefas derivadas do estado, como `visitScenes`). Tarefas que
 * atingem a meta voltam com `claimed: true` em `completed` — o chamador paga o prêmio.
 */
export function applyEventToDailyTasks(
  tasksState: DailyTasksState,
  event: GameEvent | null,
  game: GameState
): { state: DailyTasksState; completed: DailyTaskInstance[] } {
  const completed: DailyTaskInstance[] = [];
  let changed = false;
  const tasks = tasksState.tasks.map((task) => {
    if (task.claimed) return task;
    let progress = task.progress;
    switch (task.id) {
      case 'defeatEnemies':
        if (event?.type === 'combat.end' && event.victory) progress += 1;
        break;
      case 'levelUp':
        if (event?.type === 'level.up') progress += 1;
        break;
      case 'campRest':
        if (event?.type === 'camp.rest') progress += 1;
        break;
      case 'earnXp':
        if (event?.type === 'xp.gained') progress += event.amount;
        break;
      case 'visitScenes':
        progress = Math.max(progress, countVisitedScenes(game) - (task.baseline ?? 0));
        break;
      case 'advanceDay':
        if (event?.type === 'time.dayAdvanced') progress += 1;
        break;
      case 'diaryEntry':
        if (event?.type === 'diary.entryAdded') progress += 1;
        break;
      case 'acquireItem':
        if (event?.type === 'item.acquired') progress += 1;
        break;
    }
    progress = Math.min(progress, task.target);
    if (progress === task.progress) return task;
    changed = true;
    const next: DailyTaskInstance = { ...task, progress, claimed: progress >= task.target };
    if (next.claimed) completed.push(next);
    return next;
  });
  if (!changed) return { state: tasksState, completed };
  return { state: { ...tasksState, tasks }, completed };
}

export function dailyTaskRewardEffects(reward: DailyTaskReward): Effect[] {
  switch (reward.kind) {
    case 'gold':
      return [{ op: 'addResource', resource: 'gold', delta: reward.amount }];
    case 'xp':
      return [{ op: 'addXp', amount: reward.amount }];
    case 'supply':
      return [{ op: 'addResource', resource: 'supply', delta: reward.amount }];
    case 'faith':
      return [{ op: 'addResource', resource: 'faith', delta: reward.amount }];
  }
}

/** Texto curto do prêmio ("+8 ouro", "+40 XP"). */
export function dailyTaskRewardLabel(reward: DailyTaskReward): string {
  const keys: Record<DailyTaskReward['kind'], string> = {
    gold: 'dailyTasks.rewardGold',
    xp: 'dailyTasks.rewardXp',
    supply: 'dailyTasks.rewardSupply',
    faith: 'dailyTasks.rewardFaith',
  };
  return t(keys[reward.kind], { n: String(reward.amount) });
}

/** Descrição da tarefa ("Vencer 3 combates"). */
export function dailyTaskLabel(task: DailyTaskInstance): string {
  return t(`dailyTasks.${task.id}`, { target: String(task.target) });
}

export function dailyTasksCompletedCount(tasksState: DailyTasksState): number {
  return tasksState.tasks.filter((task) => task.claimed).length;
}

export function dailyTasksKey(campaignId: string, slot: number): string {
  return `${campaignId}_daily_tasks_v1_s${slot}`;
}

function isValidReward(o: unknown): o is DailyTaskReward {
  if (typeof o !== 'object' || o === null) return false;
  const r = o as Partial<DailyTaskReward>;
  return (
    (REWARD_KINDS as readonly string[]).includes(r.kind ?? '') &&
    typeof r.amount === 'number' &&
    r.amount > 0
  );
}

function isValidTask(o: unknown): o is DailyTaskInstance {
  if (typeof o !== 'object' || o === null) return false;
  const task = o as Partial<DailyTaskInstance>;
  return (
    (DAILY_TASK_KINDS as readonly string[]).includes(task.id ?? '') &&
    typeof task.target === 'number' &&
    typeof task.progress === 'number' &&
    typeof task.claimed === 'boolean' &&
    isValidReward(task.reward)
  );
}

export function loadDailyTasks(campaignId: string, slot: number): DailyTasksState | null {
  try {
    const raw = localStorage.getItem(dailyTasksKey(campaignId, slot));
    if (!raw) return null;
    const o = JSON.parse(raw) as unknown;
    if (typeof o !== 'object' || o === null) return null;
    const s = o as Partial<DailyTasksState>;
    if (typeof s.dateKey !== 'string' || !Array.isArray(s.tasks)) return null;
    if (!s.tasks.every(isValidTask)) return null;
    return { dateKey: s.dateKey, tasks: s.tasks };
  } catch {
    return null;
  }
}

export function saveDailyTasks(campaignId: string, slot: number, state: DailyTasksState): void {
  try {
    localStorage.setItem(dailyTasksKey(campaignId, slot), JSON.stringify(state));
  } catch {
    /* noop */
  }
}

/** Tarefas do dia para o slot: reaproveita as persistidas ou sorteia (e grava) novas. */
export function ensureDailyTasks(
  campaignId: string,
  slot: number,
  game: GameState,
  today: string = todayDateKey()
): DailyTasksState {
  const existing = loadDailyTasks(campaignId, slot);
  if (existing && existing.dateKey === today) return existing;
  const rolled = rollDailyTasks(campaignId, slot, today, game);
  saveDailyTasks(campaignId, slot, rolled);
  return rolled;
}
