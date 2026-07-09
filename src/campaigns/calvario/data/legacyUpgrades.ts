import type { LegacyUpgradeDef } from '../../../engine/progression/index.ts';

export const legacyUpgrades: Record<string, LegacyUpgradeDef> = {
  legacy_stat_str: {
    id: 'legacy_stat_str',
    cost: 5,
    nameKey: 'echoShop.upgrade.legacy_stat_str.name',
    descriptionKey: 'echoShop.upgrade.legacy_stat_str.description',
    effect: { kind: 'stat', attr: 'str', delta: 1 },
  },
  legacy_stat_agi: {
    id: 'legacy_stat_agi',
    cost: 5,
    nameKey: 'echoShop.upgrade.legacy_stat_agi.name',
    descriptionKey: 'echoShop.upgrade.legacy_stat_agi.description',
    effect: { kind: 'stat', attr: 'agi', delta: 1 },
  },
  legacy_stat_mind: {
    id: 'legacy_stat_mind',
    cost: 5,
    nameKey: 'echoShop.upgrade.legacy_stat_mind.name',
    descriptionKey: 'echoShop.upgrade.legacy_stat_mind.description',
    effect: { kind: 'stat', attr: 'mind', delta: 1 },
  },
  legacy_stat_luck: {
    id: 'legacy_stat_luck',
    cost: 5,
    nameKey: 'echoShop.upgrade.legacy_stat_luck.name',
    descriptionKey: 'echoShop.upgrade.legacy_stat_luck.description',
    effect: { kind: 'stat', attr: 'luck', delta: 1 },
  },
  legacy_max_hp: {
    id: 'legacy_max_hp',
    cost: 8,
    nameKey: 'echoShop.upgrade.legacy_max_hp.name',
    descriptionKey: 'echoShop.upgrade.legacy_max_hp.description',
    effect: { kind: 'maxHp', delta: 2 },
  },
  legacy_start_supply: {
    id: 'legacy_start_supply',
    cost: 4,
    nameKey: 'echoShop.upgrade.legacy_start_supply.name',
    descriptionKey: 'echoShop.upgrade.legacy_start_supply.description',
    effect: { kind: 'resource', resource: 'supply', delta: 1 },
  },
  legacy_start_faith: {
    id: 'legacy_start_faith',
    cost: 5,
    nameKey: 'echoShop.upgrade.legacy_start_faith.name',
    descriptionKey: 'echoShop.upgrade.legacy_start_faith.description',
    effect: { kind: 'resource', resource: 'faith', delta: 1 },
  },
  legacy_start_gold: {
    id: 'legacy_start_gold',
    cost: 3,
    nameKey: 'echoShop.upgrade.legacy_start_gold.name',
    descriptionKey: 'echoShop.upgrade.legacy_start_gold.description',
    effect: { kind: 'resource', resource: 'gold', delta: 5 },
  },
  legacy_combo_faction_companion: {
    id: 'legacy_combo_faction_companion',
    cost: 12,
    nameKey: 'echoShop.upgrade.legacy_combo_faction_companion.name',
    descriptionKey: 'echoShop.upgrade.legacy_combo_faction_companion.description',
    effect: {
      kind: 'comboFlag',
      flag: 'legacy_combo_faction_companion',
      repFromLastFaction: true,
    },
  },
  legacy_combo_path_faction: {
    id: 'legacy_combo_path_faction',
    cost: 12,
    nameKey: 'echoShop.upgrade.legacy_combo_path_faction.name',
    descriptionKey: 'echoShop.upgrade.legacy_combo_path_faction.description',
    effect: {
      kind: 'comboFlag',
      flag: 'legacy_combo_path_faction',
      classPrimaryStat: true,
    },
  },
  legacy_combo_faith_corruption: {
    id: 'legacy_combo_faith_corruption',
    cost: 14,
    nameKey: 'echoShop.upgrade.legacy_combo_faith_corruption.name',
    descriptionKey: 'echoShop.upgrade.legacy_combo_faith_corruption.description',
    effect: {
      kind: 'comboFlag',
      flag: 'legacy_combo_faith_corruption',
      faithAndCorruption: true,
    },
  },
};
