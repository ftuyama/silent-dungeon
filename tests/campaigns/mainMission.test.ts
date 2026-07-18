import { beforeEach, describe, expect, it } from 'vitest';
import { getMainMission } from '../../src/campaigns/calvario/mainMission.ts';
import { initI18n } from '../../src/i18n/index.ts';
import { clearStoredLocale } from '../../src/i18n/store.ts';
import type { GameState } from '../../src/engine/schema/index.ts';
import { createStateWithHero } from '../helpers/engineTestData.ts';

function stateWith(partial: Partial<GameState>): GameState {
  return { ...createStateWithHero(), ...partial };
}

describe('getMainMission (calvario)', () => {
  beforeEach(() => {
    clearStoredLocale();
    initI18n('pt-BR');
  });

  it('no início pede para descer na masmorra', () => {
    const state = stateWith({ chapter: 1, sceneId: 'act1/title', party: [] });
    expect(getMainMission(state)).toBe('Descer na masmorra');
  });

  it('após crawl pede juramento', () => {
    const state = stateWith({
      chapter: 1,
      sceneId: 'act1/class_gate',
      party: [],
      visitedScenes: { 'act1/crawl_entrada': true },
    });
    expect(getMainMission(state)).toBe('Escolher o juramento');
  });

  it('no hub do act2 pede explorar a catacumba', () => {
    const state = stateWith({
      chapter: 2,
      sceneId: 'act2/hub_catacomb',
      visitedScenes: { 'act2/hub_catacomb': true },
    });
    expect(getMainMission(state)).toBe('Explorar a catacumba');
  });

  it('com meta act2 completa e nível < 6 pede subir de nível', () => {
    const state = stateWith({
      chapter: 2,
      sceneId: 'act2/hub_catacomb',
      level: 5,
      visitedScenes: { 'act2/hub_catacomb': true },
      flags: { act2_explore_goal_reached: true },
    });
    expect(getMainMission(state)).toBe('Alcançar nível 6 para descer');
  });

  it('com meta act2 completa e nível 6 pede descer', () => {
    const state = stateWith({
      chapter: 2,
      sceneId: 'act2/hub_catacomb',
      level: 6,
      visitedScenes: { 'act2/hub_catacomb': true },
      flags: { act2_explore_goal_reached: true },
    });
    expect(getMainMission(state)).toBe('Descer às profundezas');
  });

  it('no hub das profundezas pede explorar', () => {
    const state = stateWith({
      chapter: 3,
      sceneId: 'act3/hub_depths',
      visitedScenes: { 'act3/hub_depths': true },
      flags: { stone_guard_defeated: true },
    });
    expect(getMainMission(state)).toBe('Explorar as profundezas');
  });

  it('com act3 pronto e nível < 11 pede subir de nível', () => {
    const state = stateWith({
      chapter: 3,
      sceneId: 'act3/hub_depths',
      level: 10,
      visitedScenes: { 'act3/hub_depths': true },
      flags: { stone_guard_defeated: true, act3_explore_goal_reached: true },
    });
    expect(getMainMission(state)).toBe('Alcançar nível 11 para o trono');
  });

  it('com act3 pronto e nível 11 pede caminho ao trono', () => {
    const state = stateWith({
      chapter: 3,
      sceneId: 'act3/hub_depths',
      level: 11,
      visitedScenes: { 'act3/hub_depths': true },
      flags: { stone_guard_defeated: true, act3_explore_goal_reached: true },
    });
    expect(getMainMission(state)).toBe('Preparar o caminho ao Trono de Ossos');
  });

  it('no act4 pede enfrentar Morvayn', () => {
    const state = stateWith({
      chapter: 4,
      sceneId: 'act4/throne/throne_gate',
    });
    expect(getMainMission(state)).toBe('Enfrentar Morvayn');
  });

  it('após matar Morvayn pede seguir além do trono', () => {
    const state = stateWith({
      chapter: 4,
      sceneId: 'act4/victory_peace',
      marks: ['morvayn_slain'],
    });
    expect(getMainMission(state)).toBe('Seguir além do trono');
  });
});
