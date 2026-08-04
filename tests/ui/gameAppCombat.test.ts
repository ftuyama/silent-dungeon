import { describe, expect, it } from 'vitest';
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
