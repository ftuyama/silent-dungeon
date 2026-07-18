import type { Choice } from '../../engine/schema/index.ts';
import type { StoryChoiceRow } from '../../engine/core/index.ts';
import { icons } from '../icons/index.ts';

/** Colapsa teasers bloqueados quando a secção fica densa demais para o primeiro olhar. */
export const LOCKED_CHOICES_COLLAPSE_THRESHOLD = 4;

export type UiSectionIconId = NonNullable<Choice['uiSectionIcon']>;

/** Mapa estável: valor de schema → SVG já registado em `icons`. */
export const UI_SECTION_ICON_SVG: Record<UiSectionIconId, string> = {
  talk: icons.talk,
  shop: icons.gold,
  consumable: icons.supply,
  rest: icons.heart,
  leave: icons.map,
  camp: icons.supply,
};

export type StoryChoiceSection = {
  label: string | undefined;
  /** Ícone da primeira choice do grupo (se definido). */
  icon: UiSectionIconId | undefined;
  rows: StoryChoiceRow[];
};

export type PartitionedChoiceRows = {
  enabled: StoryChoiceRow[];
  locked: StoryChoiceRow[];
  /** true quando `locked.length >= LOCKED_CHOICES_COLLAPSE_THRESHOLD` */
  collapseLocked: boolean;
};

/**
 * Separar ativas e bloqueadas (ordem relativa preservada em cada conjunto).
 * Enabled primeiro no render; locked colapsam se ≥ limiar.
 */
export function partitionChoiceRowsForDisplay(rows: StoryChoiceRow[]): PartitionedChoiceRows {
  const enabled: StoryChoiceRow[] = [];
  const locked: StoryChoiceRow[] = [];
  for (const row of rows) {
    if (row.kind === 'locked') locked.push(row);
    else enabled.push(row);
  }
  return {
    enabled,
    locked,
    collapseLocked: locked.length >= LOCKED_CHOICES_COLLAPSE_THRESHOLD,
  };
}

/** Rótulo de secção na UI; vazio ou só espaços equivale a ausência. */
export function normalizeChoiceUiSection(choice: Choice): string | undefined {
  const s = choice.uiSection?.trim();
  return s && s.length > 0 ? s : undefined;
}

/**
 * Agrupa linhas consecutivas com o mesmo `uiSection` (após normalizar).
 * Cenas sem nenhuma secção definida produzem um único grupo sem rótulo.
 */
export function groupStoryChoiceRowsByUiSection(rows: StoryChoiceRow[]): StoryChoiceSection[] {
  const sections: StoryChoiceSection[] = [];
  let currentLabel: string | undefined;
  let currentRows: StoryChoiceRow[] = [];

  const flush = (): void => {
    if (currentRows.length > 0) {
      sections.push({
        label: currentLabel,
        icon: currentRows[0]?.choice.uiSectionIcon,
        rows: currentRows,
      });
      currentRows = [];
    }
  };

  for (const row of rows) {
    const label = normalizeChoiceUiSection(row.choice);
    if (currentRows.length > 0 && label !== currentLabel) {
      flush();
    }
    if (currentRows.length === 0) {
      currentLabel = label;
    }
    currentRows.push(row);
  }
  flush();
  return sections;
}

/** Usa layout em blocos só quando há mais do que um grupo ou um grupo com título. */
export function shouldUseChoiceSectionLayout(sections: StoryChoiceSection[]): boolean {
  if (sections.length > 1) return true;
  if (sections.length === 1 && sections[0].label !== undefined) return true;
  return false;
}
