import type { GameState } from '../schema/index.ts';

export const SUPPORTER_PERK_IDS = new Set([
  'theme_ember',
  'theme_moonlit',
  'theme_blood_vigil',
  'frame_supporter',
  'title_supporter',
  'credits_badge',
  'save_slot_plus2',
  'save_export',
  'mercy_once',
  'starter_supply',
]);

export function hasSupporterPerk(state: GameState, perkId: string): boolean {
  return (state.legacy.supporter?.unlockedPerks ?? []).includes(perkId);
}
