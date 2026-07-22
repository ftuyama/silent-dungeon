import { deserializeState, serializeState } from '../engine/core/index.ts';
import type { GameState } from '../engine/schema/index.ts';
import { saveSlotCountBonus } from '../engine/progression/index.ts';
import { t } from '../i18n/index.ts';

/** Slots visíveis e graváveis fora do modo desenvolvedor. */
export const SAVE_SLOT_COUNT_PLAYER = 3;
/** Limite de slots com modo desenvolvedor (e teto de `localStorage`). */
export const SAVE_SLOT_COUNT_DEV = 10;

export function saveSlotLimit(devMode: boolean, state?: GameState): number {
  const bonus = state ? saveSlotCountBonus(state) : 0;
  if (devMode) return SAVE_SLOT_COUNT_DEV;
  return SAVE_SLOT_COUNT_PLAYER + bonus;
}

export function slotStorageKey(campaignId: string, slot: number): string {
  return `${campaignId}_save_v1_s${slot}`;
}

export function readRawSlot(campaignId: string, slot: number): string | null {
  if (slot < 1 || slot > SAVE_SLOT_COUNT_DEV) return null;
  try {
    return localStorage.getItem(slotStorageKey(campaignId, slot));
  } catch {
    return null;
  }
}

export type SlotPreview =
  | { kind: 'empty' }
  | { kind: 'invalid' }
  | { kind: 'wrongCampaign' }
  | { kind: 'ok'; chapter: number; level: number; playerName: string };

export function getSlotPreview(campaignId: string, slot: number): SlotPreview {
  const raw = readRawSlot(campaignId, slot);
  if (!raw?.trim()) return { kind: 'empty' };
  try {
    const s = deserializeState(raw);
    if (s.campaignId !== campaignId) return { kind: 'wrongCampaign' };
    return { kind: 'ok', chapter: s.chapter, level: s.level, playerName: s.playerName };
  } catch {
    return { kind: 'invalid' };
  }
}

function previewTitle(slot: number, p: SlotPreview): string {
  switch (p.kind) {
    case 'empty':
      return `${t('save.slotTitle', { slot: String(slot) })} — ${t('save.empty')}`;
    case 'invalid':
      return `${t('save.slotTitle', { slot: String(slot) })} — ${t('save.invalid')}`;
    case 'wrongCampaign':
      return `${t('save.slotTitle', { slot: String(slot) })} — ${t('save.wrongCampaign')}`;
    case 'ok':
      return `${t('save.slotTitle', { slot: String(slot) })} — ${p.playerName} · ${t('save.level', { level: String(p.level) })} · ${t('save.chapter', { chapter: String(p.chapter) })}`;
  }
}

export type SaveSlotMenuCallbacks = {
  onSave: (slot: number) => void;
  onLoad: (slot: number) => void;
};

export function buildMenuSaveSlot(
  slot: number,
  campaignId: string,
  cbs: SaveSlotMenuCallbacks
): HTMLElement {
  const preview = getSlotPreview(campaignId, slot);

  const wrap = document.createElement('div');
  wrap.className = 'menu-save-slot';
  wrap.setAttribute('role', 'group');
  wrap.setAttribute('aria-label', previewTitle(slot, preview));

  const row = document.createElement('div');
  row.className = 'menu-save-slot-row';

  const badge = document.createElement('span');
  badge.className = 'menu-save-slot-badge';
  badge.textContent = String(slot);
  badge.setAttribute('aria-hidden', 'true');

  const details = document.createElement('div');
  details.className = 'menu-save-slot-details';
  if (preview.kind === 'ok') {
    const nameEl = document.createElement('div');
    nameEl.className = 'menu-save-slot-name';
    nameEl.textContent = preview.playerName;
    const stats = document.createElement('div');
    stats.className = 'menu-save-slot-stats';
    const lv = document.createElement('span');
    lv.textContent = t('save.level', { level: String(preview.level) });
    const sep = document.createElement('span');
    sep.className = 'menu-save-slot-stats-sep';
    sep.textContent = '·';
    const cap = document.createElement('span');
    cap.textContent = t('save.chapter', { chapter: String(preview.chapter) });
    stats.append(lv, sep, cap);
    details.append(nameEl, stats);
  } else {
    const msg = document.createElement('div');
    msg.className = 'menu-save-slot-message';
    if (preview.kind === 'empty') {
      wrap.classList.add('menu-save-slot--empty');
      wrap.classList.remove('menu-save-slot--warn');
      msg.textContent = t('save.empty');
    } else {
      wrap.classList.remove('menu-save-slot--empty');
      wrap.classList.add('menu-save-slot--warn');
      msg.textContent =
        preview.kind === 'invalid' ? t('save.invalid') : t('save.wrongCampaign');
    }
    details.appendChild(msg);
  }

  row.append(badge, details);
  wrap.title = previewTitle(slot, preview);

  const actions = document.createElement('div');
  actions.className = 'menu-save-slot-actions';

  const saveBtn = document.createElement('button');
  saveBtn.type = 'button';
  saveBtn.className = 'menu-item menu-save-slot-btn menu-save-slot-btn--secondary';
  saveBtn.textContent = t('save.save');
  saveBtn.setAttribute('aria-label', `${t('save.save')} ${slot}`);
  saveBtn.addEventListener('click', () => cbs.onSave(slot));

  const loadBtn = document.createElement('button');
  loadBtn.type = 'button';
  const raw = readRawSlot(campaignId, slot);
  const hasSave = raw != null && raw.trim().length > 0;
  loadBtn.className = hasSave
    ? 'menu-item menu-save-slot-btn menu-save-slot-btn--primary'
    : 'menu-item menu-save-slot-btn menu-save-slot-btn--ghost';
  loadBtn.disabled = !hasSave;
  loadBtn.textContent = t('save.load');
  loadBtn.setAttribute(
    'aria-label',
    hasSave
      ? t('save.loadAria', { slot: String(slot) })
      : t('save.loadUnavailableAria', { slot: String(slot) })
  );
  loadBtn.addEventListener('click', () => {
    if (!hasSave) return;
    cbs.onLoad(slot);
  });

  actions.append(saveBtn, loadBtn);
  wrap.append(row, actions);
  return wrap;
}

export function saveStateToSlot(
  campaignId: string,
  slot: number,
  state: GameState,
  devMode: boolean
): void {
  if (slot < 1 || slot > saveSlotLimit(devMode, state)) return;
  try {
    localStorage.setItem(slotStorageKey(campaignId, slot), serializeState(state));
  } catch {
    /* noop */
  }
}
