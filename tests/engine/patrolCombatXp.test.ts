import { describe, expect, it } from 'vitest';
import { finishCombat } from '../../src/engine/combat/index.ts';
import { applyEffects, createInitialState, createPlayerCharacter, enterScene, EventBus, parseSceneMarkdown } from '../../src/engine/core/index.ts';
import type { EnemyDef, GameState } from '../../src/engine/schema/index.ts';
import { EncounterSchema } from '../../src/engine/schema/index.ts';
import { emptyGameData } from '../../src/engine/data/index.ts';
import { computeCombatXp } from '../../src/engine/progression/index.ts';
import { testCampaign } from '../helpers/engineTestData.ts';
import encountersJson from '../../src/campaigns/calvario/data/encounters.json';
import { enemies as calvarioEnemies } from '../../src/campaigns/calvario/data/enemies.ts';

const exploreNavScene = parseSceneMarkdown(
  `---
id: shared/explore_nav_act3
title: Perímetro
chapter: 3
type: exploration
onEnter: []
choices: []
---
Corredor.
`,
  'shared/explore_nav_act3'
);

function calvarioTestData() {
  const data = emptyGameData(testCampaign, {
    defaultHeroName: () => 'H',
    getHeroClassLabel: () => '—',
    getPathUnlockBonus: () => null,
    getPathPromotionNarrativePt: () => null,
  });
  data.enemies = calvarioEnemies as Record<string, EnemyDef>;
  data.encounters = Object.fromEntries(
    Object.entries(encountersJson).map(([id, raw]) => [id, EncounterSchema.parse(raw)])
  );
  return data;
}

function stabilizeLikeGameApp(state: GameState, data: ReturnType<typeof calvarioTestData>): GameState {
  if (state.mode === 'combat' || state.mode === 'dialogue_combat') return state;
  const bus = new EventBus();
  let s = state;
  for (let i = 0; i < 4; i++) {
    if (s.sceneId !== 'shared/explore_nav_act3') return s;
    const before = s.sceneId;
    s = enterScene(s, exploreNavScene, data, bus);
    if (s.sceneId === before) return s;
  }
  return s;
}

describe('patrol wild encounter XP', () => {
  it('computeCombatXp is positive for act3 patrol pool encounters', () => {
    const data = calvarioTestData();
    const ids = [
      'cult_ambush',
      'cultist_patrol',
      'cult_horde',
      'act3_depths_cultist_quartet',
      'act3_depths_lone_skeleton',
    ];
    for (const id of ids) {
      const enc = data.encounters[id];
      expect(enc, id).toBeDefined();
      expect(computeCombatXp(enc!, data), id).toBeGreaterThan(0);
    }
  });

  it('startWildEncounterFromGraph + victory awards XP and returns to explore nav', () => {
    const data = calvarioTestData();
    const bus = new EventBus();
    let state = createInitialState(testCampaign, 12_345);
    state = {
      ...state,
      sceneId: 'shared/explore_nav_act3',
      party: [createPlayerCharacter('Hero', 'knight')],
      exploration: { graphId: 'act3_depths', nodeId: 'depths_drowned_gallery' },
      visitedScenes: { 'shared/explore_nav_act3': true },
    };

    state = applyEffects(
      state,
      [{ op: 'startWildEncounterFromGraph', graphId: 'act3_depths' }],
      { sceneId: state.sceneId, data, bus }
    );
    expect(state.mode).toBe('combat');
    expect(state.combat?.encounterId).toBeTruthy();

    const encId = state.combat!.encounterId;
    const enc = data.encounters[encId];
    expect(enc).toBeDefined();
    const expectedXp = computeCombatXp(enc!, data);
    expect(expectedXp).toBeGreaterThan(0);

    const c = state.combat!;
    const afterVictory = finishCombat(
      state,
      {
        ...c,
        enemies: c.enemies.map((e) => ({ ...e, hp: 0 })),
        log: [...c.log, { kind: 'info', message: 'Vitória.' }],
        phase: 'ended',
      },
      true,
      data,
      bus
    );

    expect(afterVictory.mode).toBe('story');
    expect(afterVictory.sceneId).toBe('shared/explore_nav_act3');
    expect(afterVictory.xp).toBe(expectedXp);
    expect(afterVictory.lastCombatXpGain).toBe(expectedXp);

    const afterStabilize = stabilizeLikeGameApp(afterVictory, data);
    expect(afterStabilize.xp).toBe(expectedXp);
    expect(afterStabilize.lastCombatXpGain).toBe(expectedXp);
  });
});
