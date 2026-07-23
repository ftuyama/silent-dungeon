import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  findFirstEmptySaveSlot,
  slotStorageKey,
} from '../../src/ui/gameAppSaveSlots.ts';

describe('findFirstEmptySaveSlot', () => {
  const store = new Map<string, string>();
  const campaignId = 'calvario';

  beforeEach(() => {
    store.clear();
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => {
        store.set(k, v);
      },
      removeItem: (k: string) => {
        store.delete(k);
      },
    };
  });

  afterEach(() => {
    delete (globalThis as { localStorage?: unknown }).localStorage;
  });

  it('returns 1 when all slots are empty', () => {
    expect(findFirstEmptySaveSlot(campaignId, 3)).toBe(1);
  });

  it('returns 2 when slot 1 is occupied', () => {
    store.set(slotStorageKey(campaignId, 1), '{invalid}');
    expect(findFirstEmptySaveSlot(campaignId, 3)).toBe(2);
  });

  it('returns null when all slots in limit are occupied', () => {
    store.set(slotStorageKey(campaignId, 1), '{a}');
    store.set(slotStorageKey(campaignId, 2), '{b}');
    store.set(slotStorageKey(campaignId, 3), '{c}');
    expect(findFirstEmptySaveSlot(campaignId, 3)).toBeNull();
  });

  it('respects limit and ignores slots beyond it', () => {
    store.set(slotStorageKey(campaignId, 1), '{a}');
    store.set(slotStorageKey(campaignId, 2), '{b}');
    store.set(slotStorageKey(campaignId, 3), '{c}');
    // Slot 4 empty but outside limit 3
    expect(findFirstEmptySaveSlot(campaignId, 3)).toBeNull();
    expect(findFirstEmptySaveSlot(campaignId, 4)).toBe(4);
  });
});
