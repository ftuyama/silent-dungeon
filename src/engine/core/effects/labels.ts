import type { LeadStatAttr } from '../../progression/leadStats.ts';
import { t } from '../../../i18n/index.ts';

export function attrLabel(attr: LeadStatAttr): string {
  switch (attr) {
    case 'str':
      return t('engine.attrStr');
    case 'agi':
      return t('engine.attrAgi');
    case 'mind':
      return t('engine.attrMind');
    case 'luck':
      return t('engine.attrLuck');
  }
}

export function humanizeMarkId(mark: string): string {
  return mark
    .split('_')
    .map((w) => (w.length ? w[0]!.toUpperCase() + w.slice(1) : w))
    .join(' ');
}

/** Título de marca para UI: registo da campanha, depois humanização do id. */
export function displayTitleForMark(mark: string, data: import('../../data/gameData.ts').GameData): string {
  return data.journeyMarks[mark]?.name ?? humanizeMarkId(mark);
}

/** Título do valor de um path narrativo para toast / diário. */
export function displayTitleForStoryPath(
  pathId: string,
  value: string,
  data: import('../../data/gameData.ts').GameData
): string {
  const def = data.storyPaths[pathId];
  const valueDef = def?.values[value];
  if (valueDef?.name) return valueDef.name;
  return humanizeMarkId(value);
}

export function resourceLabel(resource: 'gold' | 'supply' | 'faith' | 'corruption'): string {
  switch (resource) {
    case 'gold':
      return t('engine.resourceGold');
    case 'supply':
      return t('engine.resourceSupply');
    case 'faith':
      return t('engine.resourceFaith');
    case 'corruption':
      return t('engine.resourceCorruption');
  }
}

/** @deprecated use resourceLabel */
export const RESOURCE_LABEL: Record<'gold' | 'supply' | 'faith' | 'corruption', string> = {
  get gold() {
    return t('engine.resourceGold');
  },
  get supply() {
    return t('engine.resourceSupply');
  },
  get faith() {
    return t('engine.resourceFaith');
  },
  get corruption() {
    return t('engine.resourceCorruption');
  },
};

/** Caps para `addResource` — alinhar com `schema.ts` `resources`. */
export const RESOURCE_MAX = {
  gold: 999,
  supply: 10,
  faith: 5,
  corruption: 10,
} as const;

export function resourceDebuffSubtitle(resource: keyof typeof RESOURCE_LABEL): string {
  switch (resource) {
    case 'corruption':
      return t('engine.resourceDebuffCorruption');
    case 'faith':
      return t('engine.resourceDebuffFaith');
    case 'supply':
      return t('engine.resourceDebuffSupply');
    case 'gold':
      return t('engine.resourceDebuffGold');
    default:
      return '';
  }
}

export function resourceGainSubtitle(resource: keyof typeof RESOURCE_LABEL): string {
  switch (resource) {
    case 'corruption':
      return t('engine.resourceGainCorruption');
    case 'faith':
      return t('engine.resourceGainFaith');
    case 'supply':
      return t('engine.resourceGainSupply');
    case 'gold':
      return t('engine.resourceGainGold');
    default:
      return '';
  }
}

/** @deprecated use attrLabel */
export const ATTR_LABEL: Record<LeadStatAttr, string> = {
  get str() {
    return t('engine.attrStr');
  },
  get agi() {
    return t('engine.attrAgi');
  },
  get mind() {
    return t('engine.attrMind');
  },
  get luck() {
    return t('engine.attrLuck');
  },
};
