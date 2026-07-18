import { describe, expect, it } from 'vitest';
import {
  isMerchantSellSection,
  MERCHANT_SELL_CHOICE_PREFIX,
} from '../../src/ui/story/merchantSell.ts';
import type { StoryChoiceRow } from '../../src/engine/core/index.ts';

function enabled(id: string, uiSection = 'Vender'): StoryChoiceRow {
  return {
    kind: 'enabled',
    choice: {
      id,
      text: 'sell',
      effects: [],
      uiSection,
      uiSectionIcon: 'shop',
    },
  };
}

describe('isMerchantSellSection', () => {
  it('true quando todas as linhas são vendas dinâmicas', () => {
    expect(
      isMerchantSellSection({
        rows: [
          enabled(`${MERCHANT_SELL_CHOICE_PREFIX}dagger`),
          enabled(`${MERCHANT_SELL_CHOICE_PREFIX}herb`),
        ],
      })
    ).toBe(true);
  });

  it('false para secções de cena ou mistas', () => {
    expect(isMerchantSellSection({ rows: [enabled('buy_potion', 'À venda')] })).toBe(false);
    expect(
      isMerchantSellSection({
        rows: [
          enabled(`${MERCHANT_SELL_CHOICE_PREFIX}dagger`),
          enabled('talk_merchant', 'Conversa'),
        ],
      })
    ).toBe(false);
  });
});
