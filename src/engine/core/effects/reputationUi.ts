import type { FactionId } from '../../schema/index.ts';
import type { EventBus } from '../eventBus.ts';
import { factionDisplayName } from '../../../i18n/factionName.ts';
import { t, tArray } from '../../../i18n/index.ts';

export { FACTION_NAME_PT, factionDisplayName } from '../../../i18n/factionName.ts';

function toneLines(faction: FactionId, direction: 'up' | 'down'): readonly string[] {
  return tArray(`reputation.tone.${direction}.${faction}`);
}

function pickRandomUiLine(lines: readonly string[]): string {
  if (lines.length === 0) return '';
  const idx = Math.floor(Math.random() * lines.length);
  return lines[idx] ?? '';
}

function pickReputationToneLine(
  lines: readonly string[],
  prev: number,
  next: number,
  faction: FactionId
): string {
  if (lines.length === 0) return '';
  let h = 0;
  for (let i = 0; i < faction.length; i++) {
    h = (h * 31 + faction.charCodeAt(i)!) >>> 0;
  }
  const idx = (h + prev * 17 + next * 13) % lines.length;
  return lines[idx]!;
}

function reputationTone(faction: FactionId, prev: number, next: number): string {
  if (next > prev) {
    return pickReputationToneLine(toneLines(faction, 'up'), prev, next, faction);
  }
  if (next < prev) {
    return pickReputationToneLine(toneLines(faction, 'down'), prev, next, faction);
  }
  return '';
}

export function emitReputationUi(
  bus: EventBus,
  faction: FactionId,
  prev: number,
  next: number,
  kind: 'standing' | 'slowLedger' | 'cappedDirect'
): void {
  const name = factionDisplayName(faction);
  if (kind === 'slowLedger') {
    bus.emit({
      type: 'statusHighlight',
      variant: 'neutral',
      title: t('reputation.titleSlowLedger', { name }),
      subtitle: pickRandomUiLine(tArray('reputation.slowLedger')),
    });
    return;
  }
  if (kind === 'cappedDirect') {
    bus.emit({
      type: 'statusHighlight',
      variant: 'neutral',
      title: t('reputation.titleCapped', { name }),
      subtitle: pickRandomUiLine(tArray('reputation.cappedDirect')),
    });
    return;
  }
  const improved = next > prev;
  const variant: 'good' | 'bad' | 'neutral' = improved ? 'good' : next < prev ? 'bad' : 'neutral';
  const delta = next - prev;
  const deltaStr = delta === 0 ? '' : ` (${delta > 0 ? '+' : ''}${delta})`;
  const titleKey =
    delta === 0
      ? 'reputation.titleAdjust'
      : improved
        ? 'reputation.titleUp'
        : 'reputation.titleDown';
  bus.emit({
    type: 'statusHighlight',
    variant,
    title: t(titleKey, { name, delta: deltaStr }),
    subtitle: t('reputation.subtitleValue', {
      tone: reputationTone(faction, prev, next),
      prev: String(prev),
      next: String(next),
    }),
    ...(variant === 'bad' ? { autoDismissMs: 0 } : {}),
  });
}
