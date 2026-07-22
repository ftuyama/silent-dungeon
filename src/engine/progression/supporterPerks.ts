import type { GameState } from '../schema/index.ts';
import { hasSupporterPerk as hasPerk } from './supporterPerkIds.ts';

export { SUPPORTER_PERK_IDS, hasSupporterPerk } from './supporterPerkIds.ts';

export function canUseSupporterMercy(state: GameState): boolean {
  return hasPerk(state, 'mercy_once') && !state.legacy.supporter.mercyUsedThisRun;
}

export function markSupporterMercyUsed(state: GameState): GameState {
  return {
    ...state,
    legacy: {
      ...state.legacy,
      supporter: {
        ...state.legacy.supporter,
        mercyUsedThisRun: true,
      },
    },
  };
}

/** Chamado após `resetRun` / início de run — supply bónus + reset misericórdia. */
export function applySupporterPerksOnResetRun(state: GameState): GameState {
  let next = {
    ...state,
    legacy: {
      ...state.legacy,
      supporter: {
        ...state.legacy.supporter,
        mercyUsedThisRun: false,
      },
    },
  };
  if (hasPerk(next, 'starter_supply')) {
    const supply = Math.min(10, (next.resources.supply ?? 0) + 1);
    next = { ...next, resources: { ...next.resources, supply } };
  }
  return next;
}

export function saveSlotCountBonus(state: GameState): number {
  return hasPerk(state, 'save_slot_plus2') ? 2 : 0;
}
