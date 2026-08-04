import { beforeEach, describe, expect, it } from 'vitest';
import { createPlayerCharacter } from '../../src/engine/core/index.ts';
import { combatPartyCardsMarkup } from '../../src/ui/gameAppCombat.ts';

describe('combatPartyCardsMarkup', () => {
  it('renderiza nome, HP e mana para todos os membros do grupo', () => {
    const hero = {
      ...createPlayerCharacter('Frei Oris', 'cleric'),
      hp: 3,
      maxHp: 10,
      mana: 5,
      maxMana: 10,
    };
    const companion = {
      ...createPlayerCharacter('Mira <Sombra>', 'knight'),
      id: 'mira',
      hp: 0,
      maxHp: 14,
      mana: 0,
      maxMana: 0,
    };
    const markup = combatPartyCardsMarkup([hero, companion]);

    expect(
      markup.match(/class="combat-party-card(?: combat-party-card--downed)?"/g)
    ).toHaveLength(2);
    expect(markup.match(/combat-party-card--downed/g) ?? []).toHaveLength(1);
    expect(markup).toContain('Frei Oris');
    expect(markup).toContain('Mira &lt;Sombra&gt;');
    expect(markup).toContain('<span>HP</span><strong>3/10</strong>');
    expect(markup).toContain('hp-bar-track--critical');
    expect(markup).toContain('<span>Mana</span><strong>5/10</strong>');
    expect(markup).toContain('width:50%');
    expect(markup).toContain('<span>Mana</span><strong>0/0</strong>');
    expect(markup).toContain('mana-bar-track empty');
  });
});

import { describe, expect, it } from 'vitest';
import { spells as calvarioSpells } from '../../src/campaigns/calvario/data/spells.ts';
import { initI18n, translateKey } from '../../src/i18n/index.ts';
import { activeCombatBuffTexts } from '../../src/ui/gameAppCombat.ts';
import { spellSidebarMechanicsLine } from '../../src/ui/gameAppUtils.ts';

beforeEach(() => {
  initI18n('pt-BR');
});

describe('activeCombatBuffTexts', () => {
  it('lists each Contravento buff while it remains active', () => {
    expect(
      activeCombatBuffTexts({
        buffAttackRoll: 0,
        buffArmorClass: 0,
        buffStrength: 2,
        buffMind: 2,
        buffCritRatio: 0.1,
      })
    ).toEqual(['+2 FOR', '+2 MEN', '+10% crítico']);
  });
});

describe('Contravento spell descriptions', () => {
  it('renders the non-stacking rule in sidebar mechanics and combat hover text', () => {
    const cases = [
      ['colossus_pulse', 'combat.spellHoverBuffStrength'],
      ['inner_lumen', 'combat.spellHoverBuffMind'],
      ['apex_eye', 'combat.spellHoverBuffCritRatio'],
    ] as const;

    for (const [locale, nonStackingText] of [
      ['pt-BR', 'não acumula'],
      ['en-US', 'does not stack'],
    ] as const) {
      initI18n(locale);
      for (const [spellId, hoverKey] of cases) {
        expect(spellSidebarMechanicsLine(calvarioSpells[spellId]!)).toContain(nonStackingText);
        expect(translateKey(hoverKey, locale)).toContain(nonStackingText);
      }
    }
  });
});
