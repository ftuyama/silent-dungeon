import type { SupporterGrant } from '../../../engine/supporter/codeGrants.ts';

export type SupporterPerkUiDef = {
  id: string;
  tier: 'cosmetic' | 'convenience' | 'gameplay';
  nameKey: string;
  descriptionKey: string;
};

export const supporterPerkCatalog: Record<string, SupporterPerkUiDef> = {
  theme_ember: {
    id: 'theme_ember',
    tier: 'cosmetic',
    nameKey: 'supporter.perk.theme_ember.name',
    descriptionKey: 'supporter.perk.theme_ember.description',
  },
  theme_moonlit: {
    id: 'theme_moonlit',
    tier: 'cosmetic',
    nameKey: 'supporter.perk.theme_moonlit.name',
    descriptionKey: 'supporter.perk.theme_moonlit.description',
  },
  theme_blood_vigil: {
    id: 'theme_blood_vigil',
    tier: 'cosmetic',
    nameKey: 'supporter.perk.theme_blood_vigil.name',
    descriptionKey: 'supporter.perk.theme_blood_vigil.description',
  },
  frame_supporter: {
    id: 'frame_supporter',
    tier: 'cosmetic',
    nameKey: 'supporter.perk.frame_supporter.name',
    descriptionKey: 'supporter.perk.frame_supporter.description',
  },
  title_supporter: {
    id: 'title_supporter',
    tier: 'cosmetic',
    nameKey: 'supporter.perk.title_supporter.name',
    descriptionKey: 'supporter.perk.title_supporter.description',
  },
  credits_badge: {
    id: 'credits_badge',
    tier: 'cosmetic',
    nameKey: 'supporter.perk.credits_badge.name',
    descriptionKey: 'supporter.perk.credits_badge.description',
  },
  save_slot_plus2: {
    id: 'save_slot_plus2',
    tier: 'convenience',
    nameKey: 'supporter.perk.save_slot_plus2.name',
    descriptionKey: 'supporter.perk.save_slot_plus2.description',
  },
  save_export: {
    id: 'save_export',
    tier: 'convenience',
    nameKey: 'supporter.perk.save_export.name',
    descriptionKey: 'supporter.perk.save_export.description',
  },
  mercy_once: {
    id: 'mercy_once',
    tier: 'gameplay',
    nameKey: 'supporter.perk.mercy_once.name',
    descriptionKey: 'supporter.perk.mercy_once.description',
  },
  starter_supply: {
    id: 'starter_supply',
    tier: 'gameplay',
    nameKey: 'supporter.perk.starter_supply.name',
    descriptionKey: 'supporter.perk.starter_supply.description',
  },
};

export { KOFI_SHOP_URL } from './kofiShopCatalog.ts';

export function describeGrant(grant: SupporterGrant): string {
  if (grant.type === 'echo') return `+${grant.amount} Ecos`;
  const def = supporterPerkCatalog[grant.id];
  return def?.id ?? grant.id;
}
