import type { CampaignIndex, GameState, SceneFrontmatter } from '../../engine/schema/index.ts';

export type SectionTitleRevealKind = 'chapter' | 'hub' | 'explore';

export type SectionTitleReveal = {
  dedupeKey: string;
  kind: SectionTitleRevealKind;
  title: string;
  /** Presente quando `kind === 'chapter'` (para o kicker “Ato N”). */
  chapter?: number;
};

export type SectionTitlePrevSnapshot = {
  chapter: number;
  exploration: { graphId: string; nodeId: string } | null;
  visitedScenes: Record<string, boolean>;
};

/** Artigos / preposições / conjunções que ficam em minúsculas (exceto no início). */
const TITLE_CASE_SMALL_WORDS = new Set([
  'a',
  'as',
  'o',
  'os',
  'um',
  'uma',
  'uns',
  'umas',
  'de',
  'da',
  'das',
  'do',
  'dos',
  'e',
  'em',
  'no',
  'na',
  'nos',
  'nas',
  'para',
  'por',
  'com',
  'sem',
  'sob',
  'sobre',
  'entre',
  'até',
  'ao',
  'aos',
  'à',
  'às',
  'ou',
  'mas',
  'que',
  'se',
]);

/**
 * Title Case para títulos de seção: capitaliza palavras importantes;
 * artigos/preposições ficam minúsculos (exceto a primeira palavra).
 */
export function formatSectionTitleCase(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return trimmed;
  const parts = trimmed.split(/(\s+|—|–)/u);
  let wordIndex = 0;
  return parts
    .map((part) => {
      if (part === '' || /^\s+$/u.test(part) || part === '—' || part === '–') return part;
      const lower = part.toLocaleLowerCase('pt-BR');
      const isFirst = wordIndex === 0;
      wordIndex += 1;
      if (!isFirst && TITLE_CASE_SMALL_WORDS.has(lower)) return lower;
      if (lower.length === 0) return part;
      return lower.charAt(0).toLocaleUpperCase('pt-BR') + lower.slice(1);
    })
    .join('');
}

export function snapshotForSectionTitle(state: GameState): SectionTitlePrevSnapshot {
  return {
    chapter: state.chapter,
    exploration: state.exploration,
    visitedScenes: state.visitedScenes,
  };
}

type SceneLike = {
  id: string;
  frontmatter: Pick<SceneFrontmatter, 'type' | 'title' | 'sectionTitle'>;
};

/**
 * Decide se deve revelar título de seção após uma transição.
 * Prioridade: ato > exploração > hub. Não mostra regressão de ato nem revisitas
 * (usa `prev.visitedScenes` / mudança de `graphId` / avanço de `chapter`).
 */
export function resolveSectionTitleReveal(
  prev: SectionTitlePrevSnapshot,
  state: GameState,
  scene: SceneLike,
  campaign: Pick<CampaignIndex, 'chapterTitles'>,
  alreadyShown: Record<string, boolean> = state.sectionTitlesShown ?? {}
): SectionTitleReveal | null {
  if (state.chapter > prev.chapter) {
    const chapter = state.chapter;
    const dedupeKey = `chapter:${chapter}`;
    if (alreadyShown[dedupeKey]) return null;
    const actKey = String(chapter);
    const raw = campaign.chapterTitles?.[actKey] ?? `Ato ${chapter}`;
    return { dedupeKey, kind: 'chapter', title: formatSectionTitleCase(raw), chapter };
  }

  const prevG = prev.exploration?.graphId;
  const newG = state.exploration?.graphId;
  if (newG && prevG !== newG) {
    const dedupeKey = `explore:${newG}`;
    if (alreadyShown[dedupeKey]) return null;
    const raw = scene.frontmatter.title?.trim();
    if (!raw) return null;
    return { dedupeKey, kind: 'explore', title: formatSectionTitleCase(raw) };
  }

  if (scene.frontmatter.type === 'hub' && !prev.visitedScenes[scene.id]) {
    const dedupeKey = `hub:${scene.id}`;
    if (alreadyShown[dedupeKey]) return null;
    const raw =
      scene.frontmatter.sectionTitle?.trim() || scene.frontmatter.title?.trim() || scene.id;
    return { dedupeKey, kind: 'hub', title: formatSectionTitleCase(raw) };
  }

  return null;
}
