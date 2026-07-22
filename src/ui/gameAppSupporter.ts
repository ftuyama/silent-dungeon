import type { GameState } from '../engine/schema/index.ts';
import { hasSupporterPerk } from '../engine/progression/index.ts';
import {
  isSupporterThemeId,
  SUPPORTER_THEME_IDS,
} from '../engine/schema/supporter.ts';
import { redeemSupporterCode } from '../engine/supporter/redeemCode.ts';
import {
  loadSupporterMeta,
  metaFromState,
  saveSupporterMeta,
  updateSupporterPreferences,
  type SupporterMeta,
} from '../engine/supporter/supporterMeta.ts';
import {
  KOFI_SHOP_URL,
  supporterPerkCatalog,
} from '../campaigns/calvario/data/supporterPerks.ts';
import { t } from '../i18n/index.ts';

export type OpenSupporterModalOpts = {
  campaignId: string;
  state: GameState;
  onStateChange: (state: GameState, meta: SupporterMeta) => void;
  playUiClick?: () => void;
};

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function closeSupporterLayer(): void {
  document.querySelector('.supporter-modal-layer')?.remove();
}

export function openSupporterModal(opts: OpenSupporterModalOpts): void {
  closeSupporterLayer();
  opts.playUiClick?.();

  const layer = document.createElement('div');
  layer.className = 'sheet-modal-layer supporter-modal-layer';
  layer.setAttribute('role', 'dialog');
  layer.setAttribute('aria-modal', 'true');
  layer.setAttribute('aria-labelledby', 'supporter-modal-title');

  const backdrop = document.createElement('button');
  backdrop.type = 'button';
  backdrop.className = 'sheet-modal-backdrop';
  backdrop.setAttribute('aria-label', t('supporter.close'));

  const panel = document.createElement('div');
  panel.className = 'sheet-modal-panel';

  const header = document.createElement('div');
  header.className = 'sheet-modal-header';
  const kicker = document.createElement('div');
  kicker.className = 'diary-entry-kicker';
  kicker.textContent = 'Silent Dungeon';
  const title = document.createElement('h2');
  title.id = 'supporter-modal-title';
  title.className = 'sheet-modal-title';
  title.textContent = t('supporter.title');
  const sub = document.createElement('div');
  sub.className = 'diary-entry-subkicker';
  sub.textContent = t('supporter.subtitle');
  header.append(kicker, title, sub);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'sheet-modal-close';
  closeBtn.setAttribute('aria-label', t('supporter.close'));
  closeBtn.innerHTML = '&times;';
  header.appendChild(closeBtn);

  const scroll = document.createElement('div');
  scroll.className = 'sheet-modal-scroll';

  const footer = document.createElement('div');
  footer.className = 'sheet-modal-footer';
  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'diary-entry-dismiss';
  dismiss.textContent = t('supporter.close');
  footer.appendChild(dismiss);

  panel.append(header, scroll, footer);
  layer.append(backdrop, panel);

  const shut = (): void => {
    closeSupporterLayer();
  };
  backdrop.addEventListener('click', shut);
  closeBtn.addEventListener('click', shut);
  dismiss.addEventListener('click', shut);
  panel.addEventListener('click', (e) => e.stopPropagation());

  let localState = opts.state;
  let localMeta = loadSupporterMeta(opts.campaignId);

  const statusEl = document.createElement('p');
  statusEl.className = 'supporter-modal-status';
  statusEl.hidden = true;

  const balanceEl = document.createElement('p');
  balanceEl.className = 'supporter-modal-balance';

  const noteEl = document.createElement('p');
  noteEl.className = 'supporter-modal-note';
  noteEl.textContent = t('supporter.note');

  const redeemSec = document.createElement('section');
  redeemSec.className = 'diary-modal-section';
  const redeemH = document.createElement('h3');
  redeemH.className = 'diary-modal-section-title';
  redeemH.textContent = t('supporter.redeemHeading');
  const redeemRow = document.createElement('div');
  redeemRow.className = 'supporter-redeem-row';
  const codeInput = document.createElement('input');
  codeInput.type = 'text';
  codeInput.className = 'supporter-code-input';
  codeInput.placeholder = t('supporter.codePlaceholder');
  codeInput.autocomplete = 'off';
  codeInput.spellcheck = false;
  const redeemBtn = document.createElement('button');
  redeemBtn.type = 'button';
  redeemBtn.className = 'diary-entry-dismiss supporter-redeem-btn';
  redeemBtn.textContent = t('supporter.redeemBtn');
  redeemRow.append(codeInput, redeemBtn);
  redeemSec.append(redeemH, redeemRow);

  const shopLink = document.createElement('a');
  shopLink.href = KOFI_SHOP_URL;
  shopLink.target = '_blank';
  shopLink.rel = 'noopener noreferrer';
  shopLink.className = 'menu-item supporter-shop-link';
  shopLink.textContent = t('supporter.shopLink');

  const perksSec = document.createElement('section');
  perksSec.className = 'diary-modal-section';
  const perksH = document.createElement('h3');
  perksH.className = 'diary-modal-section-title';
  perksH.textContent = t('supporter.perksHeading');
  const perksList = document.createElement('ul');
  perksList.className = 'supporter-perks-list';
  perksSec.append(perksH, perksList);

  const prefsSec = document.createElement('section');
  prefsSec.className = 'diary-modal-section';
  const prefsH = document.createElement('h3');
  prefsH.className = 'diary-modal-section-title';
  prefsH.textContent = t('supporter.prefsHeading');
  prefsSec.appendChild(prefsH);

  const themeRow = document.createElement('label');
  themeRow.className = 'menu-item menu-sound supporter-pref-row';
  const themeSelect = document.createElement('select');
  themeSelect.className = 'supporter-theme-select';

  function rebuildThemeOptions(): void {
    themeSelect.replaceChildren();
    const themeDefault = document.createElement('option');
    themeDefault.value = '';
    themeDefault.textContent = t('supporter.themeDefault');
    themeSelect.appendChild(themeDefault);
    for (const id of SUPPORTER_THEME_IDS) {
      if (!hasSupporterPerk(localState, `theme_${id}`)) continue;
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = t(`supporter.theme.${id}`);
      themeSelect.appendChild(opt);
    }
  }

  rebuildThemeOptions();
  themeRow.append(themeSelect, document.createTextNode(` ${t('supporter.themeLabel')}`));

  const frameRow = document.createElement('label');
  frameRow.className = 'menu-item menu-sound supporter-pref-row';
  const frameCb = document.createElement('input');
  frameCb.type = 'checkbox';
  frameRow.append(frameCb, document.createTextNode(` ${t('supporter.frameToggle')}`));

  prefsSec.append(themeRow, frameRow);

  scroll.append(statusEl, balanceEl, noteEl, redeemSec, shopLink, perksSec, prefsSec);

  function showStatus(msg: string, isError = false): void {
    statusEl.textContent = msg;
    statusEl.hidden = false;
    statusEl.classList.toggle('supporter-modal-status--error', isError);
  }

  function refreshUi(): void {
    balanceEl.innerHTML = `${escHtml(t('supporter.echoBalance'))} <strong>${localState.legacy.echoes}</strong>`;
    if (localState.legacy.supporter.purchasedEchoesTotal > 0) {
      balanceEl.innerHTML += ` · ${escHtml(t('supporter.echoPurchased', { count: String(localState.legacy.supporter.purchasedEchoesTotal) }))}`;
    }
    perksList.replaceChildren();
    const unlocked = localState.legacy.supporter.unlockedPerks;
    if (unlocked.length === 0) {
      const li = document.createElement('li');
      li.className = 'supporter-perks-empty';
      li.textContent = t('supporter.noPerks');
      perksList.appendChild(li);
    } else {
      for (const id of unlocked) {
        const def = supporterPerkCatalog[id];
        const li = document.createElement('li');
        li.textContent = def ? t(def.nameKey) : id;
        perksList.appendChild(li);
      }
    }
    const themeUnlocked = unlocked.some((id) => id.startsWith('theme_'));
    themeRow.hidden = !themeUnlocked;
    frameRow.hidden = !hasSupporterPerk(localState, 'frame_supporter');
    rebuildThemeOptions();
    const active = localState.legacy.supporter.activeTheme;
    themeSelect.value =
      active && hasSupporterPerk(localState, `theme_${active}`) ? active : '';
    frameCb.checked = localState.legacy.supporter.activeFrame === 'supporter';
  }

  redeemBtn.addEventListener('click', () => {
    void (async () => {
      const code = codeInput.value.trim();
      if (!code) {
        showStatus(t('supporter.error.empty'), true);
        return;
      }
      redeemBtn.disabled = true;
      const result = await redeemSupporterCode(code, localState, localMeta, opts.campaignId);
      redeemBtn.disabled = false;
      if (!result.ok) {
        const key = `supporter.error.${result.error}` as const;
        showStatus(t(key), true);
        return;
      }
      localState = result.state;
      localMeta = result.meta;
      saveSupporterMeta(opts.campaignId, localMeta);
      opts.onStateChange(localState, localMeta);
      codeInput.value = '';
      showStatus(t('supporter.redeemSuccess'));
      refreshUi();
    })();
  });

  themeSelect.addEventListener('change', () => {
    const v = themeSelect.value;
    const activeTheme = isSupporterThemeId(v) ? v : null;
    if (activeTheme && !hasSupporterPerk(localState, `theme_${activeTheme}`)) {
      themeSelect.value =
        localState.legacy.supporter.activeTheme &&
        hasSupporterPerk(localState, `theme_${localState.legacy.supporter.activeTheme}`)
          ? localState.legacy.supporter.activeTheme
          : '';
      return;
    }
    localState = updateSupporterPreferences(localState, { activeTheme });
    localMeta = { ...metaFromState(localState), activeTheme };
    saveSupporterMeta(opts.campaignId, localMeta);
    opts.onStateChange(localState, localMeta);
  });

  frameCb.addEventListener('change', () => {
    if (!hasSupporterPerk(localState, 'frame_supporter')) {
      frameCb.checked = false;
      return;
    }
    const activeFrame = frameCb.checked ? 'supporter' : null;
    localState = updateSupporterPreferences(localState, { activeFrame });
    localMeta = { ...metaFromState(localState), activeFrame };
    saveSupporterMeta(opts.campaignId, localMeta);
    opts.onStateChange(localState, localMeta);
  });

  refreshUi();
  document.body.appendChild(layer);
}
