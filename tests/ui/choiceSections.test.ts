import { describe, expect, it } from 'vitest';
import {
  groupStoryChoiceRowsByUiSection,
  LOCKED_CHOICES_COLLAPSE_THRESHOLD,
  normalizeChoiceUiSection,
  partitionChoiceRowsForDisplay,
  shouldUseChoiceSectionLayout,
} from '../../src/ui/story/choiceSections.ts';
import type { StoryChoiceRow } from '../../src/engine/core/index.ts';

function enabled(
  text: string,
  uiSection?: string,
  uiSectionIcon?: 'talk' | 'shop' | 'consumable' | 'rest' | 'leave' | 'camp' | 'ascend' | 'descend'
): StoryChoiceRow {
  return {
    kind: 'enabled',
    choice: {
      text,
      effects: [],
      ...(uiSection !== undefined ? { uiSection } : {}),
      ...(uiSectionIcon !== undefined ? { uiSectionIcon } : {}),
    },
  };
}

function locked(text: string, hint = 'locked', uiSection?: string): StoryChoiceRow {
  return {
    kind: 'locked',
    hint,
    choice: { text, effects: [], ...(uiSection !== undefined ? { uiSection } : {}) },
  };
}

describe('choiceSections', () => {
  it('normalizeChoiceUiSection trata vazio como ausência', () => {
    expect(normalizeChoiceUiSection({ text: 'x', effects: [] })).toBeUndefined();
    expect(normalizeChoiceUiSection({ text: 'x', effects: [], uiSection: '  ' })).toBeUndefined();
    expect(normalizeChoiceUiSection({ text: 'x', effects: [], uiSection: 'A' })).toBe('A');
  });

  it('agrupa consecutivos com o mesmo uiSection', () => {
    const rows: StoryChoiceRow[] = [
      enabled('c1', 'À venda', 'shop'),
      enabled('c2', 'À venda', 'shop'),
      enabled('c3', 'Conversa', 'talk'),
    ];
    const g = groupStoryChoiceRowsByUiSection(rows);
    expect(g).toHaveLength(2);
    expect(g[0].label).toBe('À venda');
    expect(g[0].icon).toBe('shop');
    expect(g[0].rows).toHaveLength(2);
    expect(g[1].label).toBe('Conversa');
    expect(g[1].icon).toBe('talk');
    expect(g[1].rows).toHaveLength(1);
  });

  it('secção sem uiSectionIcon fica icon undefined', () => {
    const g = groupStoryChoiceRowsByUiSection([enabled('a', 'Missões')]);
    expect(g[0].icon).toBeUndefined();
  });

  it('shouldUseChoiceSectionLayout: uma lista sem secções fica plana', () => {
    const rows = [enabled('a'), enabled('b')];
    const g = groupStoryChoiceRowsByUiSection(rows);
    expect(shouldUseChoiceSectionLayout(g)).toBe(false);
  });

  it('shouldUseChoiceSectionLayout: vários grupos ou título activa blocos', () => {
    expect(
      shouldUseChoiceSectionLayout(
        groupStoryChoiceRowsByUiSection([enabled('a', 'X'), enabled('b', 'Y')])
      )
    ).toBe(true);
    expect(
      shouldUseChoiceSectionLayout(groupStoryChoiceRowsByUiSection([enabled('a', 'Só eu')]))
    ).toBe(true);
  });
});

describe('partitionChoiceRowsForDisplay', () => {
  it('separa enabled e locked preservando ordem relativa; enabled primeiro', () => {
    const rows: StoryChoiceRow[] = [
      locked('L1'),
      enabled('E1'),
      locked('L2'),
      enabled('E2'),
    ];
    const p = partitionChoiceRowsForDisplay(rows);
    expect(p.enabled.map((r) => r.choice.text)).toEqual(['E1', 'E2']);
    expect(p.locked.map((r) => r.choice.text)).toEqual(['L1', 'L2']);
    expect(p.collapseLocked).toBe(false);
  });

  it('não colapsa abaixo do limiar', () => {
    const rows = Array.from({ length: LOCKED_CHOICES_COLLAPSE_THRESHOLD - 1 }, (_, i) =>
      locked(`L${i}`)
    );
    expect(partitionChoiceRowsForDisplay(rows).collapseLocked).toBe(false);
  });

  it('colapsa com limiar ou mais bloqueadas', () => {
    const rows = [
      enabled('ok'),
      ...Array.from({ length: LOCKED_CHOICES_COLLAPSE_THRESHOLD }, (_, i) => locked(`L${i}`)),
    ];
    const p = partitionChoiceRowsForDisplay(rows);
    expect(p.collapseLocked).toBe(true);
    expect(p.enabled).toHaveLength(1);
    expect(p.locked).toHaveLength(LOCKED_CHOICES_COLLAPSE_THRESHOLD);
  });

  it('permite limiar customizado (mercador colapsa com 1 bloqueada)', () => {
    const rows = [enabled('comprar'), locked('caro')];
    expect(partitionChoiceRowsForDisplay(rows).collapseLocked).toBe(false);
    expect(
      partitionChoiceRowsForDisplay(rows, { collapseThreshold: 1 }).collapseLocked
    ).toBe(true);
  });
});
