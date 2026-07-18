import { describe, expect, it } from 'vitest';
import {
  applyEffects,
  createInitialState,
  createPlayerCharacter,
  enterScene,
  evaluateCondition,
  EventBus,
  migrateAct1ClassChosen,
  migrateStoryPathsFromMarks,
  parseSceneMarkdown,
} from '../../src/engine/core/index.ts';
import { createTestData, testCampaign } from '../helpers/engineTestData.ts';

describe('storyPaths', () => {
  it('setStoryPath grava state.storyPaths e não altera party.path', () => {
    let s = createInitialState(testCampaign, 1);
    s = { ...s, party: [createPlayerCharacter('H', 'knight')] };
    const bus = new EventBus();
    const data = {
      ...createTestData(),
      storyPaths: {
        throne: {
          name: 'Trono',
          values: {
            slain: { name: 'Ferro', description: 'Morvayn caiu.' },
          },
        },
      },
    };
    const next = applyEffects(s, [{ op: 'setStoryPath', id: 'throne', value: 'slain' }], {
      sceneId: 'test/scene',
      data,
      bus,
    });
    expect(next.storyPaths.throne).toBe('slain');
    expect(next.party[0]!.path).toBe(null);
  });

  it('evaluateCondition storyPath e hasStoryPath', () => {
    let s = createInitialState(testCampaign, 1);
    s = { ...s, storyPaths: { throne: 'pact' } };
    expect(evaluateCondition({ storyPath: { id: 'throne', eq: 'pact' } }, s)).toBe(true);
    expect(evaluateCondition({ storyPath: { id: 'throne', eq: 'slain' } }, s)).toBe(false);
    expect(evaluateCondition({ hasStoryPath: 'throne' }, s)).toBe(true);
    expect(evaluateCondition({ hasStoryPath: 'other' }, s)).toBe(false);
  });

  it('storyPathGate redireciona e marca o ID estável como visitado', () => {
    const gateScene = parseSceneMarkdown(
      `---
id: act5/frost_hub
chapter: 5
storyPathGate:
  id: throne
  branches:
    slain: act5/frost_hub
    pact: act5/frost_hub_pact
choices: []
onEnter:
  - { op: setFlag, key: should_not_run_on_redirect, value: true }
---
Base.
`,
      'act5/frost_hub'
    );
    let s = createInitialState(testCampaign, 1);
    s = {
      ...s,
      party: [createPlayerCharacter('H', 'knight')],
      storyPaths: { throne: 'pact' },
    };
    const bus = new EventBus();
    const data = createTestData();
    s = enterScene(s, gateScene, data, bus);
    expect(s.sceneId).toBe('act5/frost_hub_pact');
    expect(s.visitedScenes['act5/frost_hub']).toBe(true);
    expect(s.flags.should_not_run_on_redirect).toBeUndefined();
  });

  it('storyPathGate com slain permanece na base e corre onEnter', () => {
    const gateScene = parseSceneMarkdown(
      `---
id: act5/frost_hub
chapter: 5
storyPathGate:
  id: throne
  branches:
    slain: act5/frost_hub
    pact: act5/frost_hub_pact
choices: []
onEnter:
  - { op: setFlag, key: hub_entered, value: true }
---
Base.
`,
      'act5/frost_hub'
    );
    let s = createInitialState(testCampaign, 1);
    s = {
      ...s,
      party: [createPlayerCharacter('H', 'knight')],
      storyPaths: { throne: 'slain' },
    };
    const bus = new EventBus();
    const data = createTestData();
    s = enterScene(s, gateScene, data, bus);
    expect(s.sceneId).toBe('act5/frost_hub');
    expect(s.flags.hub_entered).toBe(true);
  });

  it('migrateStoryPathsFromMarks preenche throne a partir de marks legados', () => {
    let s = createInitialState(testCampaign, 1);
    s = { ...s, marks: ['pact_bound'], storyPaths: {} };
    s = migrateStoryPathsFromMarks(s);
    expect(s.storyPaths.throne).toBe('pact');

    s = createInitialState(testCampaign, 1);
    s = { ...s, marks: ['calvario_sealed', 'morvayn_slain'], storyPaths: {} };
    s = migrateStoryPathsFromMarks(s);
    expect(s.storyPaths.throne).toBe('sealed');

    s = createInitialState(testCampaign, 1);
    s = { ...s, marks: ['morvayn_slain'], storyPaths: { throne: 'pact' } };
    s = migrateStoryPathsFromMarks(s);
    expect(s.storyPaths.throne).toBe('pact');
  });

  it('migrateAct1ClassChosen preenche flag quando o líder já tem classe', () => {
    let s = createInitialState(testCampaign, 1);
    s = { ...s, party: [createPlayerCharacter('H', 'knight')] };
    expect(s.flags.act1_class_chosen).toBeUndefined();
    s = migrateAct1ClassChosen(s);
    expect(s.flags.act1_class_chosen).toBe(true);
  });
});
