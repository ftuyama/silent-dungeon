import { describe, expect, it } from 'vitest';
import {
  isMerchantSellSection,
  MERCHANT_SELL_CHOICE_PREFIX,
  shouldStayOnMerchantSceneAfterChoice,
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

describe('shouldStayOnMerchantSceneAfterChoice', () => {
  it('true para compra/venda com uiSectionIcon shop em cena merchant', () => {
    expect(
      shouldStayOnMerchantSceneAfterChoice('merchant', {
        uiSectionIcon: 'shop',
        id: 'buy_potion',
      })
    ).toBe(true);
    expect(
      shouldStayOnMerchantSceneAfterChoice('merchant', {
        uiSectionIcon: 'shop',
        id: `${MERCHANT_SELL_CHOICE_PREFIX}dagger`,
      })
    ).toBe(true);
  });

  it('false fora de merchant ou secções que saem da banca', () => {
    expect(shouldStayOnMerchantSceneAfterChoice('merchant', { uiSectionIcon: 'talk' })).toBe(
      false
    );
    expect(shouldStayOnMerchantSceneAfterChoice('merchant', { uiSectionIcon: 'leave' })).toBe(
      false
    );
    expect(shouldStayOnMerchantSceneAfterChoice('camp', { uiSectionIcon: 'shop' })).toBe(false);
    expect(shouldStayOnMerchantSceneAfterChoice(undefined, { uiSectionIcon: 'shop' })).toBe(
      false
    );
  });
});
