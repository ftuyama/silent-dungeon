import { describe, expect, it, beforeEach } from 'vitest';
import {
  initI18n,
  t,
  setLocale,
  getLocale,
  normalizeLocale,
  translateKey,
  getCatalogKeys,
  getRegisteredCatalog,
} from '../../src/i18n/index.ts';
import { clearStoredLocale } from '../../src/i18n/store.ts';
import { pickLocalized } from '../../src/i18n/localized.ts';
import { loadParsedCampaignContent } from '../../src/campaigns/registry.ts';
import { getHeroLore } from '../../src/campaigns/calvario/classHero.ts';
import { dayAdvanceSubtitle } from '../../src/ui/gameAppEvents.ts';
import type { GameState } from '../../src/engine/schema/index.ts';

describe('i18n locale', () => {
  beforeEach(() => {
    clearStoredLocale();
    initI18n(null);
  });

  it('normalizes browser language tags', () => {
    expect(normalizeLocale('pt')).toBe('pt-BR');
    expect(normalizeLocale('pt-BR')).toBe('pt-BR');
    expect(normalizeLocale('en')).toBe('en-US');
    expect(normalizeLocale('en-GB')).toBe('en-US');
    expect(normalizeLocale('fr')).toBeNull();
  });

  it('defaults to pt-BR when no URL or stored locale', () => {
    clearStoredLocale();
    initI18n(null);
    expect(getLocale()).toBe('pt-BR');
  });

  it('translates menu keys in pt-BR', () => {
    initI18n('pt-BR');
    expect(t('menu.volume')).toBe('Volume');
    expect(t('menu.fontSize', { percent: '110' })).toBe('Tamanho do texto (110%)');
  });

  it('translates menu keys in en-US', () => {
    initI18n('en-US');
    expect(t('menu.volume')).toBe('Volume');
    expect(t('menu.language')).toBe('Language');
  });

  it('falls back to pt-BR for missing en-US keys', () => {
    setLocale('en-US');
    expect(translateKey('menu.volume', 'en-US')).toBe('Volume');
  });

  it('pickLocalized prefers locale value', () => {
    expect(
      pickLocalized({ 'pt-BR': 'Olá', 'en-US': 'Hello' }, 'en-US')
    ).toBe('Hello');
    expect(pickLocalized('Olá', 'en-US')).toBe('Olá');
    expect(pickLocalized({ 'pt-BR': 'Olá' }, 'en-US')).toBe('Olá');
  });

  it('setLocale updates active locale', () => {
    initI18n('pt-BR');
    setLocale('en-US');
    expect(getLocale()).toBe('en-US');
    expect(t('save.save')).toBe('Save');
  });

  it('catalogs share key parity', () => {
    const ptKeys = new Set(getCatalogKeys(getRegisteredCatalog('pt-BR')));
    const enKeys = new Set(getCatalogKeys(getRegisteredCatalog('en-US')));
    for (const key of ptKeys) {
      expect(enKeys.has(key), `missing en-US key ${key}`).toBe(true);
    }
  });

  it('applies English scene overlay for calvario act1', () => {
    const pt = loadParsedCampaignContent('calvario', 'pt-BR');
    const en = loadParsedCampaignContent('calvario', 'en-US');
    const ptScene = pt.scenes.get('act1/dungeon_mouth');
    const enScene = en.scenes.get('act1/dungeon_mouth');
    expect(ptScene?.bodyRaw).toContain('boca de pedra');
    expect(enScene?.bodyRaw).toContain('stone mouth');
    expect(enScene?.bodyRaw).not.toContain('boca de pedra');
    expect(enScene?.frontmatter.title).toBe('Dungeon mouth');
  });

  it('applies English dialogue overlay for calvario', () => {
    initI18n('en-US');
    const en = loadParsedCampaignContent('calvario', 'en-US');
    const twin = en.data.dialogueEnemies.act1_mirror_twin;
    expect(twin?.graph.nodes.root?.line).toContain("doesn't reflect");
    expect(twin?.graph.nodes.root?.line).not.toMatch(/não reflete|batentes/);
  });

  it('applies English entity overlay for enemies', () => {
    const en = loadParsedCampaignContent('calvario', 'en-US');
    expect(en.data.enemies.rat_swarm?.name).toBe('Rat Swarm');
    expect(en.data.spells.warriors_focus?.name).toBe("Warrior's Focus");
  });

  it('applies English overlay for enemy combat abilities', () => {
    const pt = loadParsedCampaignContent('calvario', 'pt-BR');
    const en = loadParsedCampaignContent('calvario', 'en-US');
    const ptMorvayn = pt.data.enemies.morvayn_p1?.abilities?.find((a) => a.id === 'bone_needles');
    const enMorvayn = en.data.enemies.morvayn_p1?.abilities?.find((a) => a.id === 'bone_needles');
    expect(ptMorvayn?.name).toBe('Agulhas de Osso');
    expect(enMorvayn?.name).toBe('Bone Needles');
    expect(enMorvayn?.linePt).toContain('bone shards');
    expect(enMorvayn?.linePt).not.toMatch(/lascas de osso/i);
  });

  it('keeps Portuguese entity names and journey marks in pt-BR', () => {
    const pt = loadParsedCampaignContent('calvario', 'pt-BR');
    expect(pt.data.items.iron_dagger?.name).toBe('Adaga de Ferro');
    expect(pt.data.journeyMarks.act1_surface_whisper_intel?.name).toBe('Rumor que paga');
    expect(pt.data.passives.knight?.name).toBe('Aço Implacável');
  });

  it('applies English hero lore via narrative overlay', () => {
    initI18n('en-US');
    const state = {
      party: [{ class: 'knight', path: null }],
      chapter: 1,
      leadStoryPassives: [],
      marks: [],
      inventory: [],
    } as unknown as GameState;
    const lore = getHeroLore(state, 'knight', null);
    expect(lore).toContain('Galen grew up');
    expect(lore).not.toContain('Galen cresceu');
  });

  it('dayAdvanceSubtitle differs by locale', () => {
    initI18n('pt-BR');
    const ptLine = dayAdvanceSubtitle(15);
    initI18n('en-US');
    const enLine = dayAdvanceSubtitle(15);
    expect(ptLine).toContain('subsolo');
    expect(enLine).toContain('depths');
    expect(ptLine).not.toBe(enLine);
  });

  it('engineNotify strings differ by locale', () => {
    initI18n('pt-BR');
    expect(t('engineNotify.markAdded')).toBe('Nova marca no personagem');
    initI18n('en-US');
    expect(t('engineNotify.markAdded')).toBe('New mark on the character');
  });
});
