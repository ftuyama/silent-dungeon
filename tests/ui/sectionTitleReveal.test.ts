import { describe, expect, it } from 'vitest';
import { createInitialState } from '../../src/engine/core/index.ts';
import {
  resolveSectionTitleReveal,
  snapshotForSectionTitle,
  formatSectionTitleCase,
} from '../../src/ui/story/sectionTitleReveal.ts';
import { testCampaign } from '../helpers/engineTestData.ts';

describe('formatSectionTitleCase', () => {
  it('capitaliza palavras importantes e mantém artigos/preposições', () => {
    expect(formatSectionTitleCase('Catacumbas do eco')).toBe('Catacumbas do Eco');
    expect(formatSectionTitleCase('Profundezas mudas')).toBe('Profundezas Mudas');
    expect(formatSectionTitleCase('Perímetro dos túneis')).toBe('Perímetro dos Túneis');
    expect(formatSectionTitleCase('Cruzeiro — hub')).toBe('Cruzeiro — Hub');
    expect(formatSectionTitleCase('o trono')).toBe('O Trono');
  });
});

describe('resolveSectionTitleReveal', () => {
  const campaign = {
    ...testCampaign,
    chapterTitles: {
      '1': 'Abertura',
      '2': 'Catacumbas do eco',
      '3': 'Profundezas mudas',
    },
  };

  it('revela título de ato ao avançar chapter', () => {
    let state = createInitialState(campaign, 1);
    const prev = snapshotForSectionTitle(state);
    state = { ...state, chapter: 2, sceneId: 'act2/catacomb_entry' };
    const reveal = resolveSectionTitleReveal(
      prev,
      state,
      { id: 'act2/catacomb_entry', frontmatter: { type: 'story', title: 'Entrada' } },
      campaign
    );
    expect(reveal).toEqual({
      dedupeKey: 'chapter:2',
      kind: 'chapter',
      title: 'Catacumbas do Eco',
      chapter: 2,
    });
  });

  it('não revela título de ato em regressão de chapter', () => {
    let state = createInitialState(campaign, 1);
    state = {
      ...state,
      chapter: 3,
      visitedScenes: { 'act2/hub_catacomb': true },
    };
    const prev = snapshotForSectionTitle(state);
    state = { ...state, chapter: 2, sceneId: 'act2/hub_catacomb' };
    const reveal = resolveSectionTitleReveal(
      prev,
      state,
      {
        id: 'act2/hub_catacomb',
        frontmatter: { type: 'hub', title: 'Cruzeiro — hub' },
      },
      campaign
    );
    expect(reveal).toBeNull();
  });

  it('prioridade: ato vence hub no mesmo tick', () => {
    let state = createInitialState(campaign, 1);
    state = { ...state, chapter: 2 };
    const prev = snapshotForSectionTitle(state);
    state = {
      ...state,
      chapter: 3,
      sceneId: 'act3/hub_depths',
      visitedScenes: { ...state.visitedScenes, 'act3/hub_depths': true },
    };
    const reveal = resolveSectionTitleReveal(
      prev,
      state,
      {
        id: 'act3/hub_depths',
        frontmatter: { type: 'hub', title: 'Profundezas — hub' },
      },
      campaign
    );
    expect(reveal?.kind).toBe('chapter');
    expect(reveal?.title).toBe('Profundezas Mudas');
  });

  it('prioridade: ato vence exploração no mesmo tick', () => {
    let state = createInitialState(campaign, 1);
    state = { ...state, chapter: 2 };
    const prev = snapshotForSectionTitle(state);
    state = {
      ...state,
      chapter: 3,
      exploration: { graphId: 'act3_depths', nodeId: 'start' },
      sceneId: 'shared/explore_nav_act3',
    };
    const reveal = resolveSectionTitleReveal(
      prev,
      state,
      {
        id: 'shared/explore_nav_act3',
        frontmatter: { type: 'exploration', title: 'Perímetro das profundezas' },
      },
      campaign
    );
    expect(reveal?.kind).toBe('chapter');
  });

  it('revela exploração quando graphId muda', () => {
    let state = createInitialState(campaign, 1);
    state = { ...state, chapter: 2, exploration: null };
    const prev = snapshotForSectionTitle(state);
    state = {
      ...state,
      exploration: { graphId: 'act2_catacomb', nodeId: 'center_breach' },
      sceneId: 'shared/explore_nav_act2',
    };
    const reveal = resolveSectionTitleReveal(
      prev,
      state,
      {
        id: 'shared/explore_nav_act2',
        frontmatter: { type: 'exploration', title: 'Perímetro dos túneis' },
      },
      campaign
    );
    expect(reveal).toEqual({
      dedupeKey: 'explore:act2_catacomb',
      kind: 'explore',
      title: 'Perímetro dos Túneis',
    });
  });

  it('não revela exploração ao só mudar de nó no mesmo grafo', () => {
    let state = createInitialState(campaign, 1);
    state = {
      ...state,
      chapter: 2,
      exploration: { graphId: 'act2_catacomb', nodeId: 'center_breach' },
    };
    const prev = snapshotForSectionTitle(state);
    state = {
      ...state,
      exploration: { graphId: 'act2_catacomb', nodeId: 'west_shrine' },
    };
    const reveal = resolveSectionTitleReveal(
      prev,
      state,
      {
        id: 'shared/explore_nav_act2',
        frontmatter: { type: 'exploration', title: 'Perímetro dos túneis' },
      },
      campaign
    );
    expect(reveal).toBeNull();
  });

  it('revela hub na primeira visita', () => {
    let state = createInitialState(campaign, 1);
    state = { ...state, chapter: 2 };
    const prev = snapshotForSectionTitle(state);
    state = {
      ...state,
      sceneId: 'act2/hub_catacomb',
      visitedScenes: { ...state.visitedScenes, 'act2/hub_catacomb': true },
    };
    const reveal = resolveSectionTitleReveal(
      prev,
      state,
      {
        id: 'act2/hub_catacomb',
        frontmatter: { type: 'hub', title: 'Cruzeiro — hub', sectionTitle: 'Cruzeiro' },
      },
      campaign
    );
    expect(reveal).toEqual({
      dedupeKey: 'hub:act2/hub_catacomb',
      kind: 'hub',
      title: 'Cruzeiro',
    });
  });

  it('não revela hub revisitado', () => {
    let state = createInitialState(campaign, 1);
    state = {
      ...state,
      chapter: 2,
      visitedScenes: { 'act2/hub_catacomb': true },
    };
    const prev = snapshotForSectionTitle(state);
    state = { ...state, sceneId: 'act2/hub_catacomb' };
    const reveal = resolveSectionTitleReveal(
      prev,
      state,
      {
        id: 'act2/hub_catacomb',
        frontmatter: { type: 'hub', title: 'Cruzeiro — hub' },
      },
      campaign
    );
    expect(reveal).toBeNull();
  });

  it('respeita dedupe alreadyShown', () => {
    let state = createInitialState(campaign, 1);
    const prev = snapshotForSectionTitle(state);
    state = {
      ...state,
      chapter: 2,
      sectionTitlesShown: { 'chapter:2': true },
    };
    const reveal = resolveSectionTitleReveal(
      prev,
      state,
      { id: 'act2/catacomb_entry', frontmatter: { type: 'story', title: 'Entrada' } },
      campaign
    );
    expect(reveal).toBeNull();
  });
});
