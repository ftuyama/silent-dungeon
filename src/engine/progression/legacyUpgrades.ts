import type { ClassId, GameState } from '../schema/index.ts';
import type { GameData } from '../data/gameData.ts';
import { clampLeadStat } from './leadStats.ts';
import { clampReputation } from './reputation.ts';

export type LegacyUpgradeEffect =
  | { kind: 'stat'; attr: 'str' | 'agi' | 'mind' | 'luck'; delta: number }
  | { kind: 'maxHp'; delta: number }
  | { kind: 'resource'; resource: 'supply' | 'faith' | 'corruption' | 'gold'; delta: number }
  | {
      kind: 'comboFlag';
      flag: string;
      repFromLastFaction?: boolean;
      classPrimaryStat?: boolean;
      faithAndCorruption?: boolean;
    };

export type LegacyUpgradeDef = {
  id: string;
  cost: number;
  nameKey: string;
  descriptionKey: string;
  effect: LegacyUpgradeEffect;
};

export function getUnlockedUpgrades(state: GameState): string[] {
  return state.legacy?.unlockedUpgrades ?? [];
}

export function isUpgradeUnlocked(state: GameState, upgradeId: string): boolean {
  return getUnlockedUpgrades(state).includes(upgradeId);
}

export function canPurchaseLegacyUpgrade(
  state: GameState,
  upgradeId: string,
  catalog: Record<string, LegacyUpgradeDef>
): boolean {
  const def = catalog[upgradeId];
  if (!def) return false;
  if (isUpgradeUnlocked(state, upgradeId)) return false;
  return (state.legacy?.echoes ?? 0) >= def.cost;
}

export function purchaseLegacyUpgradeState(
  state: GameState,
  upgradeId: string,
  catalog: Record<string, LegacyUpgradeDef>
): GameState {
  if (!canPurchaseLegacyUpgrade(state, upgradeId, catalog)) return state;
  const def = catalog[upgradeId]!;
  const legacy = state.legacy;
  return {
    ...state,
    legacy: {
      ...legacy,
      echoes: Math.max(0, legacy.echoes - def.cost),
      unlockedUpgrades: [...legacy.unlockedUpgrades, upgradeId],
    },
  };
}

function primaryClassAttr(cls: ClassId): 'str' | 'agi' | 'mind' | 'luck' {
  if (cls === 'knight' || cls === 'archer') return 'str';
  if (cls === 'mage' || cls === 'cleric') return 'mind';
  return 'str';
}

/** Aplica bónus de recursos e flags de combo comprados (chamar em `resetRun`). */
export function applyLegacyUpgradesToRunState(state: GameState, catalog: Record<string, LegacyUpgradeDef>): GameState {
  const unlocked = getUnlockedUpgrades(state);
  if (unlocked.length === 0) return state;

  let next = state;
  const flags = { ...next.flags };
  let resources = { ...next.resources };

  for (const id of unlocked) {
    const def = catalog[id];
    if (!def) continue;
    const eff = def.effect;
    if (eff.kind === 'resource') {
      const cur = resources[eff.resource] ?? 0;
      const max =
        eff.resource === 'gold' ? 999 : eff.resource === 'corruption' ? 10 : eff.resource === 'faith' ? 5 : 10;
      resources = { ...resources, [eff.resource]: Math.min(max, cur + eff.delta) };
    }
    if (eff.kind === 'comboFlag') {
      flags[eff.flag] = true;
      if (eff.repFromLastFaction && next.legacy.lastRunStats?.topFaction) {
        const f = next.legacy.lastRunStats.topFaction;
        next = {
          ...next,
          reputation: {
            ...next.reputation,
            [f]: clampReputation((next.reputation[f] ?? 0) + 1),
          },
        };
      }
      if (eff.faithAndCorruption) {
        resources = {
          ...resources,
          faith: Math.min(5, (resources.faith ?? 0) + 1),
          corruption: Math.min(10, (resources.corruption ?? 0) + 1),
        };
      }
    }
  }

  return { ...next, flags, resources };
}

/** Aplica bónus de stats/HP ao líder recém-criado (`initClass`). */
export function applyLegacyUpgradesToLeader(
  state: GameState,
  lead: GameState['party'][0],
  catalog: Record<string, LegacyUpgradeDef>
): GameState['party'][0] {
  const unlocked = getUnlockedUpgrades(state);
  if (unlocked.length === 0) return lead;

  let next = { ...lead };
  for (const id of unlocked) {
    const def = catalog[id];
    if (!def) continue;
    const eff = def.effect;
    if (eff.kind === 'stat') {
      const cur = next[eff.attr];
      next = { ...next, [eff.attr]: clampLeadStat(eff.attr, cur + eff.delta) };
    }
    if (eff.kind === 'maxHp') {
      const maxHp = next.maxHp + eff.delta;
      next = { ...next, maxHp, hp: Math.min(next.hp + eff.delta, maxHp) };
    }
    if (eff.kind === 'comboFlag' && eff.classPrimaryStat) {
      const attr = primaryClassAttr(next.class);
      const cur = next[attr];
      next = { ...next, [attr]: clampLeadStat(attr, cur + 1) };
    }
  }
  return next;
}

export function legacyUpgradeCatalogFromData(data: GameData): Record<string, LegacyUpgradeDef> {
  return data.legacyUpgrades ?? {};
}
