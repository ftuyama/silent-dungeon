import type { GameEvent } from '../engine/core/index.ts';
import { tArray } from '../i18n/index.ts';

/** Índice em `toast.dayAdvanceLines` por limiar de dia narrativo. */
function dayAdvanceLineIndex(day: number): number {
  if (day >= 30) return 9;
  if (day >= 25) return 8;
  if (day >= 20) return 7;
  if (day >= 15) return 6;
  if (day >= 12) return 5;
  if (day >= 9) return 4;
  if (day >= 6) return 3;
  if (day >= 4) return 2;
  if (day >= 2) return 1;
  return 0;
}

/** Legenda do aviso quando o dia narrativo avança (varia com o tempo sob pedra). */
export function dayAdvanceSubtitle(day: number): string {
  const lines = tArray('toast.dayAdvanceLines');
  const idx = dayAdvanceLineIndex(day);
  return lines[idx] ?? lines[0] ?? '';
}

export type GameEventHandlers = {
  onCombatVictory: () => void;
  onCombatFlee: () => void;
  onCombatDefeat: () => void;
  onFaithMiracle: () => void;
  onItemAcquired: (itemId: string) => void;
  onXpGained: (amount: number) => void;
  onDiaryEntryAdded: (text: string) => void;
  onCampRest: () => void;
  onTimeDayAdvanced: (day: number) => void;
  onStatusHighlight: (event: Extract<GameEvent, { type: 'statusHighlight' }>) => void;
  onLevelUp?: (level: number) => void;
};

export function handleGameEvent(ev: GameEvent, h: GameEventHandlers): void {
  if (ev.type === 'combat.end' && ev.victory) h.onCombatVictory();
  if (ev.type === 'combat.end' && !ev.victory) {
    if (ev.fled) h.onCombatFlee();
    else h.onCombatDefeat();
  }
  if (ev.type === 'faith.miracle') h.onFaithMiracle();
  if (ev.type === 'item.acquired') h.onItemAcquired(ev.itemId);
  // XP de vitória em combate é aplicado antes de `mode` virar `story` no GameApp.
  if (ev.type === 'xp.gained' && ev.amount > 0) h.onXpGained(ev.amount);
  if (ev.type === 'diary.entryAdded') h.onDiaryEntryAdded(ev.text);
  if (ev.type === 'camp.rest') h.onCampRest();
  if (ev.type === 'time.dayAdvanced') h.onTimeDayAdvanced(ev.day);
  if (ev.type === 'statusHighlight') h.onStatusHighlight(ev);
  if (ev.type === 'level.up') h.onLevelUp?.(ev.level);
}
