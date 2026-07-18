import type { GameState } from '../../engine/schema/index.ts';
import { t } from '../../i18n/index.ts';

function visited(state: GameState, sceneId: string): boolean {
  return !!state.visitedScenes[sceneId];
}

function hasFlag(state: GameState, key: string): boolean {
  return !!state.flags[key];
}

type MissionKey =
  | 'magmaCrucible'
  | 'terminalFate'
  | 'voidTrials'
  | 'enterVoid'
  | 'faceVetrnax'
  | 'surviveFrost'
  | 'beyondThrone'
  | 'faceMorvayn'
  | 'stoneGuardian'
  | 'exploreDepths'
  | 'thronePath'
  | 'reachLevel10'
  | 'reachDepthsHub'
  | 'descendToAct3'
  | 'reachLevel5'
  | 'exploreCatacombs'
  | 'reachHub'
  | 'enterCatacomb'
  | 'reachMouth'
  | 'chooseOath'
  | 'descend';

function resolveMissionKey(state: GameState): MissionKey {
  const { chapter, sceneId, level, marks, party } = state;
  const leadClass = party[0]?.class;

  if (chapter >= 8 || sceneId.startsWith('act8/')) return 'magmaCrucible';
  if (chapter >= 7) return 'terminalFate';
  if (chapter >= 6 && visited(state, 'act6/hub_fractured_nave')) return 'voidTrials';
  if (chapter >= 6) return 'enterVoid';
  if (chapter >= 5 && visited(state, 'act5/frost_hub')) return 'faceVetrnax';
  if (chapter >= 5) return 'surviveFrost';
  if (marks.includes('morvayn_slain')) return 'beyondThrone';
  if (chapter >= 4 || sceneId.startsWith('act4/')) return 'faceMorvayn';
  if (chapter >= 3 && visited(state, 'act3/hub_depths') && !hasFlag(state, 'stone_guard_defeated')) {
    return 'stoneGuardian';
  }
  if (chapter >= 3 && visited(state, 'act3/hub_depths') && !hasFlag(state, 'act3_explore_goal_reached')) {
    return 'exploreDepths';
  }
  if (
    chapter >= 3 &&
    visited(state, 'act3/hub_depths') &&
    hasFlag(state, 'stone_guard_defeated') &&
    hasFlag(state, 'act3_explore_goal_reached') &&
    level >= 11
  ) {
    return 'thronePath';
  }
  if (
    chapter >= 3 &&
    visited(state, 'act3/hub_depths') &&
    hasFlag(state, 'stone_guard_defeated') &&
    hasFlag(state, 'act3_explore_goal_reached')
  ) {
    return 'reachLevel10';
  }
  if (chapter >= 3) return 'reachDepthsHub';
  if (
    chapter >= 2 &&
    visited(state, 'act2/hub_catacomb') &&
    hasFlag(state, 'act2_explore_goal_reached') &&
    level >= 6
  ) {
    return 'descendToAct3';
  }
  if (
    chapter >= 2 &&
    visited(state, 'act2/hub_catacomb') &&
    hasFlag(state, 'act2_explore_goal_reached')
  ) {
    return 'reachLevel5';
  }
  if (chapter >= 2 && visited(state, 'act2/hub_catacomb')) return 'exploreCatacombs';
  if (chapter >= 2) return 'reachHub';
  if (visited(state, 'act1/dungeon_mouth') || visited(state, 'act2/catacomb_entry')) {
    return 'enterCatacomb';
  }
  if (leadClass) return 'reachMouth';
  if (visited(state, 'act1/crawl_entrada')) return 'chooseOath';
  return 'descend';
}

export function getMainMission(state: GameState): string {
  const key = resolveMissionKey(state);
  return t(`mainMission.calvario.${key}`);
}
