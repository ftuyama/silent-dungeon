import type { StoryChoiceRow } from '../../engine/core/index.ts';
import type { GameState, ItemDef } from '../../engine/schema/index.ts';
import type { GameData } from '../../engine/data/gameData.ts';
import { t } from '../../i18n/index.ts';

export const MERCHANT_SELL_CHOICE_PREFIX = 'merchant_sell_';

export function isSellableItem(def: ItemDef | undefined): def is ItemDef & { sellPrice: number } {
  return def != null && def.sellPrice != null && def.sellPrice >= 1;
}

/** Inventário ∪ slots do party (dedupe), só itens com `sellPrice`. */
export function collectOwnedSellableItemIds(state: GameState, items: GameData['items']): string[] {
  const ids = new Set<string>();
  for (const id of state.inventory) {
    if (isSellableItem(items[id])) ids.add(id);
  }
  for (const member of state.party) {
    for (const id of [member.weaponId, member.armorId, member.relicId]) {
      if (id && isSellableItem(items[id])) ids.add(id);
    }
  }
  return [...ids].sort((a, b) => {
    const na = items[a]?.name ?? a;
    const nb = items[b]?.name ?? b;
    return na.localeCompare(nb, 'pt');
  });
}

export function buildMerchantSellRows(
  state: GameState,
  data: GameData,
  returnSceneId: string
): StoryChoiceRow[] {
  const section = t('story.sellSection');
  const rows: StoryChoiceRow[] = [];
  for (const itemId of collectOwnedSellableItemIds(state, data.items)) {
    const def = data.items[itemId];
    if (!isSellableItem(def)) continue;
    const name = def.name;
    rows.push({
      kind: 'enabled',
      choice: {
        id: `${MERCHANT_SELL_CHOICE_PREFIX}${itemId}`,
        text: t('story.sellItem', { name, gold: def.sellPrice }),
        preview: t('story.sellItemPreview'),
        uiSection: section,
        uiSectionIcon: 'shop',
        next: returnSceneId,
        effects: [{ op: 'sellItem', itemId }],
      },
    });
  }
  return rows;
}
