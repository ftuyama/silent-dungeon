import type { GameState } from '../schema/index.ts';
import type { SupporterGrant } from './codeGrants.ts';
import { defaultSupporterState, type SupporterState } from '../schema/supporter.ts';
import { hasSupporterPerk, SUPPORTER_PERK_IDS } from '../progression/supporterPerkIds.ts';

export type SupporterMeta = {
  unlockedPerks: string[];
  redeemedCodeIds: string[];
  activeTheme: string | null;
  activeFrame: string | null;
  supporterName: string | null;
  purchasedEchoesTotal: number;
};

export function emptySupporterMeta(): SupporterMeta {
  return {
    unlockedPerks: [],
    redeemedCodeIds: [],
    activeTheme: null,
    activeFrame: null,
    supporterName: null,
    purchasedEchoesTotal: 0,
  };
}

export function supporterMetaStorageKey(campaignId: string): string {
  return `${campaignId}_supporter_v1`;
}

export function loadSupporterMeta(campaignId: string): SupporterMeta {
  try {
    const raw = localStorage.getItem(supporterMetaStorageKey(campaignId));
    if (!raw?.trim()) return emptySupporterMeta();
    const o = JSON.parse(raw) as Partial<SupporterMeta>;
    return {
      unlockedPerks: Array.isArray(o.unlockedPerks)
        ? o.unlockedPerks.filter((x): x is string => typeof x === 'string' && x.length > 0)
        : [],
      redeemedCodeIds: Array.isArray(o.redeemedCodeIds)
        ? o.redeemedCodeIds.filter((x): x is string => typeof x === 'string' && x.length > 0)
        : [],
      activeTheme: typeof o.activeTheme === 'string' ? o.activeTheme : null,
      activeFrame: typeof o.activeFrame === 'string' ? o.activeFrame : null,
      supporterName: typeof o.supporterName === 'string' ? o.supporterName : null,
      purchasedEchoesTotal:
        typeof o.purchasedEchoesTotal === 'number' && Number.isFinite(o.purchasedEchoesTotal)
          ? Math.max(0, Math.floor(o.purchasedEchoesTotal))
          : 0,
    };
  } catch {
    return emptySupporterMeta();
  }
}

export function saveSupporterMeta(campaignId: string, meta: SupporterMeta): void {
  try {
    localStorage.setItem(supporterMetaStorageKey(campaignId), JSON.stringify(meta));
  } catch {
    /* noop */
  }
}

export function metaFromState(state: GameState): SupporterMeta {
  const s = state.legacy.supporter;
  return {
    unlockedPerks: [...s.unlockedPerks],
    redeemedCodeIds: [...s.redeemedCodeIds],
    activeTheme: s.activeTheme,
    activeFrame: s.activeFrame,
    supporterName: s.supporterName,
    purchasedEchoesTotal: s.purchasedEchoesTotal,
  };
}

export function isCodeRedeemed(meta: SupporterMeta, codeId: string): boolean {
  return meta.redeemedCodeIds.includes(codeId);
}

export function markCodeRedeemed(meta: SupporterMeta, codeId: string): SupporterMeta {
  if (meta.redeemedCodeIds.includes(codeId)) return meta;
  return { ...meta, redeemedCodeIds: [...meta.redeemedCodeIds, codeId] };
}

function mergeUnlockedPerks(current: string[], grants: SupporterGrant[]): string[] {
  const set = new Set(current);
  for (const g of grants) {
    if (g.type === 'perk' && SUPPORTER_PERK_IDS.has(g.id)) set.add(g.id);
  }
  return [...set];
}

export function applyGrantsToState(
  state: GameState,
  grants: SupporterGrant[],
  meta: SupporterMeta
): GameState {
  let echoes = state.legacy.echoes;
  let purchasedEchoesTotal = meta.purchasedEchoesTotal;
  for (const g of grants) {
    if (g.type === 'echo') {
      echoes = Math.max(0, echoes + g.amount);
      purchasedEchoesTotal += g.amount;
    }
  }
  const unlockedPerks = mergeUnlockedPerks(meta.unlockedPerks, grants);
  const supporter: SupporterState = {
    ...state.legacy.supporter,
    unlockedPerks,
    purchasedEchoesTotal,
  };
  return {
    ...state,
    legacy: {
      ...state.legacy,
      echoes,
      supporter,
    },
  };
}

export function updateSupporterPreferences(
  state: GameState,
  patch: Partial<Pick<SupporterState, 'activeTheme' | 'activeFrame' | 'supporterName'>>
): GameState {
  const base = state.legacy.supporter ?? defaultSupporterState();
  return {
    ...state,
    legacy: {
      ...state.legacy,
      supporter: {
        ...base,
        ...patch,
      },
    },
  };
}

export function ensureSupporterState(state: GameState): GameState {
  if (state.legacy.supporter) return state;
  return {
    ...state,
    legacy: {
      ...state.legacy,
      supporter: defaultSupporterState(),
    },
  };
}

export function canExportSave(state: GameState, devMode: boolean): boolean {
  return devMode || hasSupporterPerk(state, 'save_export');
}
