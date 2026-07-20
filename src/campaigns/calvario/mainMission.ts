import type { GameState } from '../../engine/schema/index.ts';
import { t } from '../../i18n/index.ts';

function visited(state: GameState, sceneId: string): boolean {
  return !!state.visitedScenes[sceneId];
}

function hasFlag(state: GameState, key: string): boolean {
  return !!state.flags[key];
}

function hasMark(state: GameState, mark: string): boolean {
  return state.marks.includes(mark);
}

/** Título estável da missão principal — tipicamente um por ato. */
type ActMissionKey =
  | 'act1'
  | 'act2'
  | 'act3'
  | 'act4'
  | 'act5'
  | 'act6'
  | 'act7'
  | 'act8';

export type SubMissionStatus = 'pending' | 'done' | 'failed';

export type MainMissionStep = {
  id: string;
  label: string;
  status: SubMissionStatus;
  /** Dica curta só em itens pending (requisito / onde ir). */
  hint?: string;
};

export type MainMissionView = {
  /** Missão do ato (muda pouco). */
  title: string;
  /** Submissões tickáveis do ato atual. */
  steps: MainMissionStep[];
};

type SubDef = {
  id: string;
  /** true = mostrar na lista (disponível ou já resolvido). */
  visible: boolean;
  status: SubMissionStatus;
  hint?: string;
};

function resolveActKey(state: GameState): ActMissionKey {
  const { chapter, sceneId } = state;
  if (chapter >= 8 || sceneId.startsWith('act8/')) return 'act8';
  if (chapter >= 7 || sceneId.startsWith('act7/')) return 'act7';
  if (chapter >= 6 || sceneId.startsWith('act6/')) return 'act6';
  if (chapter >= 5 || sceneId.startsWith('act5/')) return 'act5';
  if (chapter >= 4 || sceneId.startsWith('act4/') || hasMark(state, 'morvayn_slain')) {
    return 'act4';
  }
  if (chapter >= 3 || sceneId.startsWith('act3/')) return 'act3';
  if (chapter >= 2 || sceneId.startsWith('act2/')) return 'act2';
  return 'act1';
}

function subLabel(id: string): string {
  return t(`mainMission.calvario.subs.${id}`);
}

function pushVisible(out: MainMissionStep[], def: SubDef): void {
  if (!def.visible) return;
  out.push({
    id: def.id,
    label: subLabel(def.id),
    status: def.status,
    ...(def.hint && def.status === 'pending' ? { hint: def.hint } : {}),
  });
}

function flagDone(state: GameState, key: string): SubMissionStatus {
  return hasFlag(state, key) ? 'done' : 'pending';
}

function markDone(state: GameState, mark: string): SubMissionStatus {
  return hasMark(state, mark) ? 'done' : 'pending';
}

function kaelWins(state: GameState): number {
  return (['kr_won_act2', 'kr_won_act4', 'kr_won_act5', 'kr_won_act6'] as const).filter((f) =>
    hasFlag(state, f)
  ).length;
}

function subsForAct1(state: GameState): MainMissionStep[] {
  const out: MainMissionStep[] = [];
  const hasClass = !!state.party[0]?.class;
  pushVisible(out, {
    id: 'chooseOath',
    visible: true,
    status: hasClass ? 'done' : 'pending',
  });
  pushVisible(out, {
    id: 'reachMouth',
    visible: hasClass || visited(state, 'act1/dungeon_mouth'),
    status: visited(state, 'act1/dungeon_mouth') || visited(state, 'act2/catacomb_entry') ? 'done' : 'pending',
  });
  pushVisible(out, {
    id: 'enterCatacomb',
    visible: visited(state, 'act1/dungeon_mouth') || visited(state, 'act2/catacomb_entry') || state.chapter >= 2,
    status: state.chapter >= 2 || visited(state, 'act2/catacomb_entry') ? 'done' : 'pending',
  });
  return out;
}

function subsForAct2(state: GameState): MainMissionStep[] {
  const out: MainMissionStep[] = [];
  const atHub = visited(state, 'act2/hub_catacomb');

  pushVisible(out, {
    id: 'reachHub',
    visible: true,
    status: atHub ? 'done' : 'pending',
  });
  pushVisible(out, {
    id: 'clearRats',
    visible: atHub || hasFlag(state, 'rats_cleared'),
    status: flagDone(state, 'rats_cleared'),
  });
  pushVisible(out, {
    id: 'recruitMira',
    visible: atHub || hasFlag(state, 'mira_recruited'),
    status: flagDone(state, 'mira_recruited'),
  });
  pushVisible(out, {
    id: 'exploreMap',
    visible: atHub || hasFlag(state, 'act2_explore_goal_reached'),
    status: flagDone(state, 'act2_explore_goal_reached'),
    hint: t('mainMission.calvario.hints.patrolHub'),
  });
  pushVisible(out, {
    id: 'meetKael',
    visible:
      visited(state, 'act2/skeleton_room') ||
      hasFlag(state, 'kr_won_act2') ||
      hasFlag(state, 'kaelsworn_recruited'),
    status: hasFlag(state, 'kr_won_act2') || hasFlag(state, 'kaelsworn_recruited') ? 'done' : 'pending',
    hint: t('mainMission.calvario.hints.kaelAct2'),
  });
  pushVisible(out, {
    id: 'reachLevel6',
    visible: hasFlag(state, 'act2_explore_goal_reached') || state.level >= 6,
    status: state.level >= 6 ? 'done' : 'pending',
    hint: t('mainMission.calvario.hints.reachLevel', { need: '6', current: String(state.level) }),
  });
  pushVisible(out, {
    id: 'descendDepths',
    visible: hasFlag(state, 'act2_explore_goal_reached') && state.level >= 6,
    status: state.chapter >= 3 ? 'done' : 'pending',
    hint: t('mainMission.calvario.hints.chooseDescend'),
  });
  return out;
}

function subsForAct3(state: GameState): MainMissionStep[] {
  const out: MainMissionStep[] = [];
  const atHub = visited(state, 'act3/hub_depths');

  pushVisible(out, {
    id: 'exploreMap',
    visible: atHub || hasFlag(state, 'act3_explore_goal_reached'),
    status: flagDone(state, 'act3_explore_goal_reached'),
    hint: t('mainMission.calvario.hints.patrolHub'),
  });
  pushVisible(out, {
    id: 'stoneGuardian',
    visible: atHub || hasFlag(state, 'stone_guard_defeated'),
    status: flagDone(state, 'stone_guard_defeated'),
    hint: t('mainMission.calvario.hints.stoneCorridor'),
  });
  pushVisible(out, {
    id: 'messenger',
    visible: hasFlag(state, 'act3_messenger_done') || (atHub && state.level >= 7),
    status: flagDone(state, 'act3_messenger_done'),
  });
  pushVisible(out, {
    id: 'forgottenShrine',
    visible: hasFlag(state, 'act3_shrine_done') || (atHub && state.level >= 6),
    status: flagDone(state, 'act3_shrine_done'),
  });
  pushVisible(out, {
    id: 'reachLevel11',
    visible:
      (hasFlag(state, 'stone_guard_defeated') && hasFlag(state, 'act3_explore_goal_reached')) ||
      state.level >= 11,
    status: state.level >= 11 ? 'done' : 'pending',
    hint: t('mainMission.calvario.hints.reachLevel', { need: '11', current: String(state.level) }),
  });
  pushVisible(out, {
    id: 'thronePath',
    visible:
      hasFlag(state, 'stone_guard_defeated') &&
      hasFlag(state, 'act3_explore_goal_reached') &&
      state.level >= 11,
    status: state.chapter >= 4 ? 'done' : 'pending',
    hint: t('mainMission.calvario.hints.chooseThrone'),
  });
  return out;
}

function subsForAct4(state: GameState): MainMissionStep[] {
  const out: MainMissionStep[] = [];
  const resolved =
    hasMark(state, 'morvayn_slain') ||
    hasMark(state, 'pact_bound') ||
    hasMark(state, 'calvario_sealed');

  pushVisible(out, {
    id: 'faceMorvayn',
    visible: true,
    status: resolved ? 'done' : 'pending',
  });
  pushVisible(out, {
    id: 'meetKael',
    visible:
      visited(state, 'act4/passage_graywind_heights') ||
      hasFlag(state, 'kr_won_act4') ||
      hasFlag(state, 'kaelsworn_recruited'),
    status: hasFlag(state, 'kr_won_act4') || hasFlag(state, 'kaelsworn_recruited') ? 'done' : 'pending',
  });
  pushVisible(out, {
    id: 'beyondThrone',
    visible: resolved,
    status: state.chapter >= 5 ? 'done' : 'pending',
  });
  return out;
}

function subsForAct5(state: GameState): MainMissionStep[] {
  const out: MainMissionStep[] = [];
  const atHub =
    visited(state, 'act5/frost_hub') ||
    visited(state, 'act5/frost_hub_pact') ||
    visited(state, 'act5/frost_hub_sealed');

  pushVisible(out, {
    id: 'exploreMap',
    visible: atHub || hasFlag(state, 'act5_explore_goal_reached'),
    status: flagDone(state, 'act5_explore_goal_reached'),
    hint: t('mainMission.calvario.hints.patrolHub'),
  });

  const tomasDone = hasFlag(state, 'tomas_rescued');
  const tomasMissed = hasFlag(state, 'tomas_rescue_missed');
  pushVisible(out, {
    id: 'rescueTomas',
    visible: tomasDone || tomasMissed || (atHub && state.level >= 14),
    status: tomasDone ? 'done' : tomasMissed ? 'failed' : 'pending',
    hint: tomasMissed ? undefined : t('mainMission.calvario.hints.tomasWindow'),
  });

  pushVisible(out, {
    id: 'frostMonk',
    visible:
      hasFlag(state, 'frost_monk_blessing_done') ||
      hasFlag(state, 'monk_cave_banished') ||
      (atHub && state.level >= 17),
    status:
      hasFlag(state, 'frost_monk_blessing_done') || hasFlag(state, 'monk_cave_banished')
        ? 'done'
        : 'pending',
  });

  pushVisible(out, {
    id: 'meetKael',
    visible:
      visited(state, 'act5/frost_lair_approach') ||
      hasFlag(state, 'kr_won_act5') ||
      hasFlag(state, 'kaelsworn_recruited'),
    status: hasFlag(state, 'kr_won_act5') || hasFlag(state, 'kaelsworn_recruited') ? 'done' : 'pending',
  });

  const wins = kaelWins(state);
  pushVisible(out, {
    id: 'recruitKael',
    visible: wins >= 2 || hasFlag(state, 'kaelsworn_recruited'),
    status: flagDone(state, 'kaelsworn_recruited'),
    hint: t('mainMission.calvario.hints.kaelOath', { wins: String(wins) }),
  });

  pushVisible(out, {
    id: 'faceVetrnax',
    visible: atHub || hasMark(state, 'vetrnax_slain') || hasFlag(state, 'frost_summit_ritual_done'),
    status:
      hasMark(state, 'vetrnax_slain') || hasFlag(state, 'frost_summit_ritual_done') ? 'done' : 'pending',
    hint: t('mainMission.calvario.hints.summitGate'),
  });
  return out;
}

function subsForAct6(state: GameState): MainMissionStep[] {
  const out: MainMissionStep[] = [];
  const atHub = visited(state, 'act6/hub_fractured_nave');

  pushVisible(out, {
    id: 'trialReality',
    visible: atHub || hasFlag(state, 'act6_reality_done'),
    status: flagDone(state, 'act6_reality_done'),
  });
  pushVisible(out, {
    id: 'trialMemory',
    visible: hasFlag(state, 'act6_reality_done') || hasFlag(state, 'act6_memory_done'),
    status: flagDone(state, 'act6_memory_done'),
  });
  pushVisible(out, {
    id: 'trialWill',
    visible: hasFlag(state, 'act6_memory_done') || hasFlag(state, 'act6_will_done'),
    status: flagDone(state, 'act6_will_done'),
  });
  pushVisible(out, {
    id: 'exploreMap',
    visible: atHub || hasFlag(state, 'act6_explore_goal_reached'),
    status: flagDone(state, 'act6_explore_goal_reached'),
  });
  pushVisible(out, {
    id: 'meetKael',
    visible:
      visited(state, 'act6/void_secret_entry') ||
      hasFlag(state, 'kr_won_act6') ||
      hasFlag(state, 'kaelsworn_recruited'),
    status: hasFlag(state, 'kr_won_act6') || hasFlag(state, 'kaelsworn_recruited') ? 'done' : 'pending',
  });
  pushVisible(out, {
    id: 'mirrorGate',
    visible:
      hasFlag(state, 'act6_will_done') ||
      hasMark(state, 'act6_shadow_faced') ||
      (atHub && state.level >= 29),
    status: markDone(state, 'act6_shadow_faced'),
  });
  return out;
}

function subsForAct7(state: GameState): MainMissionStep[] {
  const out: MainMissionStep[] = [];
  pushVisible(out, {
    id: 'wastelandEvents',
    visible: true,
    status:
      hasMark(state, 'act7_heard_ash_sermon') ||
      hasMark(state, 'act7_broke_hollow_line') ||
      hasMark(state, 'act7_last_train_rider') ||
      hasMark(state, 'act7_sky_stitch_true') ||
      hasMark(state, 'act7_sky_stitch_torn') ||
      hasMark(state, 'act7_ember_witness')
        ? 'done'
        : 'pending',
    hint: t('mainMission.calvario.hints.wasteland'),
  });
  pushVisible(out, {
    id: 'terminalFate',
    visible: true,
    status:
      hasMark(state, 'act7_paid_sky_in_faith') ||
      hasMark(state, 'act7_sealed_in_ember') ||
      hasMark(state, 'act7_walked_bare')
        ? 'done'
        : 'pending',
  });
  return out;
}

function subsForAct8(state: GameState): MainMissionStep[] {
  const out: MainMissionStep[] = [];
  const atHub = visited(state, 'act8/hub_magma_crucible');

  pushVisible(out, {
    id: 'exploreMap',
    visible: atHub || hasFlag(state, 'act8_explore_goal_reached'),
    status: flagDone(state, 'act8_explore_goal_reached'),
  });
  pushVisible(out, {
    id: 'lavaRiver',
    visible: atHub || hasFlag(state, 'act8_lava_river_done') || state.level >= 27,
    status: flagDone(state, 'act8_lava_river_done'),
  });
  pushVisible(out, {
    id: 'golemForge',
    visible: hasFlag(state, 'act8_lava_river_done') || hasFlag(state, 'act8_golem_forge_done'),
    status: flagDone(state, 'act8_golem_forge_done'),
  });
  pushVisible(out, {
    id: 'sulfurAltar',
    visible: hasFlag(state, 'act8_golem_forge_done') || hasFlag(state, 'act8_sulfur_altar_done'),
    status: flagDone(state, 'act8_sulfur_altar_done'),
  });
  pushVisible(out, {
    id: 'magmaLord',
    visible:
      hasFlag(state, 'act8_sulfur_altar_done') ||
      hasMark(state, 'magma_lord_slain') ||
      (atHub && state.level >= 33),
    status: markDone(state, 'magma_lord_slain'),
  });
  return out;
}

function buildSubMissions(state: GameState, act: ActMissionKey): MainMissionStep[] {
  switch (act) {
    case 'act1':
      return subsForAct1(state);
    case 'act2':
      return subsForAct2(state);
    case 'act3':
      return subsForAct3(state);
    case 'act4':
      return subsForAct4(state);
    case 'act5':
      return subsForAct5(state);
    case 'act6':
      return subsForAct6(state);
    case 'act7':
      return subsForAct7(state);
    case 'act8':
      return subsForAct8(state);
  }
}

/** Ordena: pending primeiro, depois failed, depois done. */
function sortSubs(steps: MainMissionStep[]): MainMissionStep[] {
  const rank = (s: SubMissionStatus): number =>
    s === 'pending' ? 0 : s === 'failed' ? 1 : 2;
  return [...steps].sort((a, b) => rank(a.status) - rank(b.status));
}

export function getMainMissionView(state: GameState): MainMissionView {
  const act = resolveActKey(state);
  const title = t(`mainMission.calvario.acts.${act}`);
  const steps = sortSubs(buildSubMissions(state, act));
  return { title, steps };
}

export function getMainMission(state: GameState): string {
  return getMainMissionView(state).title;
}
