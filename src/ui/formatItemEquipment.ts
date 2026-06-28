import type { ItemDef } from '../engine/schema/index.ts';
import { t } from '../i18n/index.ts';

export function formatItemEquipmentStatParts(it: ItemDef): string[] {
  const parts: string[] = [];
  if (it.damage !== 0) {
    parts.push(
      it.damage > 0
        ? t('formatItem.damagePlus', { n: it.damage })
        : t('formatItem.damageMinus', { n: it.damage })
    );
  }
  if (it.armor !== 0) {
    parts.push(
      it.armor > 0
        ? t('formatItem.armorPlus', { n: it.armor })
        : t('formatItem.armorMinus', { n: it.armor })
    );
  }
  const attrs: [keyof ItemDef, string][] = [
    ['bonusStr', t('engine.attrStr')],
    ['bonusAgi', t('engine.attrAgi')],
    ['bonusMind', t('engine.attrMind')],
    ['bonusLuck', t('engine.attrLuck')],
  ];
  for (const [key, label] of attrs) {
    const v = it[key];
    if (typeof v !== 'number' || v === 0) continue;
    parts.push(`${label} ${v > 0 ? '+' : ''}${v}`);
  }
  if (it.cursed) parts.push(t('sidebar.cursed'));
  return parts;
}
