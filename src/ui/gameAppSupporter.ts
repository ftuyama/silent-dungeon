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
  formatKofiPrice,
  hasSupporterCosmeticPrefs,
  isKofiProductAcquired,
  kofiProductUrl,
  kofiShopGroups,
  kofiShopProducts,
  type KofiShopProduct,
} from '../campaigns/calvario/data/kofiShopCatalog.ts';
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

function scrollModalTo(el: HTMLElement): void {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });
}

function buildShopCard(product: KofiShopProduct, acquired: boolean): HTMLElement {
  const card = document.createElement(acquired ? 'div' : 'a');
  card.className = 'supporter-shop-card';
  if (acquired) {
    card.classList.add('supporter-shop-card--owned');
  } else {
    const link = card as HTMLAnchorElement;
    link.href = kofiProductUrl(product);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.title = t('supporter.shopBuyLink');
  }

  const badge = document.createElement('span');
  badge.className = 'supporter-shop-card-badge';
  badge.textContent = '✓';
  badge.setAttribute('aria-hidden', 'true');

  const thumb = document.createElement('img');
  thumb.className = 'supporter-shop-card-thumb';
  thumb.src = product.previewUrl;
  thumb.alt = '';
  thumb.loading = 'lazy';
  thumb.width = 120;
  thumb.height = 120;

  const body = document.createElement('div');
  body.className = 'supporter-shop-card-body';
  const nameEl = document.createElement('span');
  nameEl.className = 'supporter-shop-card-name';
  nameEl.textContent = t(product.nameKey);
  const summaryEl = document.createElement('span');
  summaryEl.className = 'supporter-shop-card-summary';
  summaryEl.textContent = t(product.summaryKey);
  const priceEl = document.createElement('span');
  priceEl.className = acquired
    ? 'supporter-shop-card-price supporter-shop-card-price--owned'
    : 'supporter-shop-card-price';
  priceEl.textContent = acquired ? t('supporter.acquiredLabel') : formatKofiPrice(product.priceUsd);
  body.append(nameEl, summaryEl, priceEl);

  if (acquired) {
    card.append(badge, thumb, body);
    card.setAttribute('aria-label', `${t(product.nameKey)} — ${t('supporter.acquiredLabel')}`);
  } else {
    card.append(thumb, body);
  }
  return card;
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
  const title = document.createElement('h2');
  title.id = 'supporter-modal-title';
  title.className = 'sheet-modal-title';
  title.textContent = t('supporter.title');
  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'sheet-modal-close';
  closeBtn.setAttribute('aria-label', t('supporter.close'));
  closeBtn.innerHTML = '&times;';
  header.append(title, closeBtn);

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

  const balanceEl = document.createElement('p');
  balanceEl.className = 'supporter-modal-balance';

  const shopSec = document.createElement('section');
  shopSec.className = 'supporter-shop-section';

  const redeemWrap = document.createElement('div');
  redeemWrap.className = 'supporter-redeem-wrap';

  const redeemToggle = document.createElement('button');
  redeemToggle.type = 'button';
  redeemToggle.className = 'diary-entry-dismiss supporter-redeem-toggle';
  redeemToggle.textContent = t('supporter.redeemToggle');
  redeemToggle.setAttribute('aria-expanded', 'false');
  redeemToggle.setAttribute('aria-controls', 'supporter-redeem-panel');

  const redeemPanel = document.createElement('div');
  redeemPanel.id = 'supporter-redeem-panel';
  redeemPanel.className = 'supporter-redeem-panel';
  redeemPanel.hidden = true;

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
  redeemBtn.textContent = t('supporter.redeemConfirm');
  redeemRow.append(codeInput, redeemBtn);
  const redeemStatusEl = document.createElement('p');
  redeemStatusEl.className = 'supporter-modal-status supporter-redeem-status';
  redeemStatusEl.hidden = true;
  redeemPanel.append(redeemRow, redeemStatusEl);
  redeemWrap.append(redeemToggle, redeemPanel);

  redeemToggle.addEventListener('click', () => {
    const open = redeemPanel.hidden;
    redeemPanel.hidden = !open;
    redeemToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      codeInput.focus();
    }
  });

  const prefsWrap = document.createElement('div');
  prefsWrap.className = 'supporter-prefs-wrap';
  prefsWrap.hidden = true;

  const prefsToggle = document.createElement('button');
  prefsToggle.type = 'button';
  prefsToggle.className = 'diary-entry-dismiss supporter-prefs-toggle';
  prefsToggle.textContent = t('supporter.prefsToggle');
  prefsToggle.setAttribute('aria-expanded', 'false');
  prefsToggle.setAttribute('aria-controls', 'supporter-prefs-panel');

  const prefsPanel = document.createElement('div');
  prefsPanel.id = 'supporter-prefs-panel';
  prefsPanel.className = 'supporter-prefs-panel';
  prefsPanel.hidden = true;

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

  prefsPanel.append(themeRow, frameRow);
  prefsWrap.append(prefsToggle, prefsPanel);

  prefsToggle.addEventListener('click', () => {
    const open = prefsPanel.hidden;
    prefsPanel.hidden = !open;
    prefsToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      scrollModalTo(prefsWrap);
    }
  });

  scroll.append(balanceEl, shopSec, redeemWrap, prefsWrap);

  function showRedeemStatus(msg: string, isError = false): void {
    redeemStatusEl.textContent = msg;
    redeemStatusEl.hidden = false;
    redeemStatusEl.classList.toggle('supporter-modal-status--error', isError);
    if (redeemPanel.hidden) {
      redeemPanel.hidden = false;
      redeemToggle.setAttribute('aria-expanded', 'true');
    }
    scrollModalTo(redeemStatusEl);
  }

  function renderShopGrid(): void {
    shopSec.replaceChildren();
    for (const group of kofiShopGroups) {
      const groupEl = document.createElement('section');
      groupEl.className = 'supporter-shop-group';
      if (group.featured) {
        groupEl.classList.add('supporter-shop-group--featured');
      }

      const heading = document.createElement('h3');
      heading.className = 'supporter-shop-group-title';
      heading.textContent = t(group.titleKey);

      const subtitle = document.createElement('p');
      subtitle.className = 'supporter-shop-group-subtitle';
      subtitle.textContent = t(group.subtitleKey);

      const grid = document.createElement('div');
      grid.className = 'supporter-shop-grid';
      if (group.singleColumn) {
        grid.classList.add('supporter-shop-grid--single');
      }

      for (const productId of group.productIds) {
        const product = kofiShopProducts[productId];
        const acquired = isKofiProductAcquired(localState, productId);
        grid.appendChild(buildShopCard(product, acquired));
      }

      groupEl.append(heading, subtitle, grid);
      shopSec.appendChild(groupEl);
    }
  }

  function refreshUi(): void {
    balanceEl.innerHTML = `${escHtml(t('supporter.echoBalance'))} <strong>${localState.legacy.echoes}</strong>`;
    if (localState.legacy.supporter.purchasedEchoesTotal > 0) {
      balanceEl.innerHTML += ` · ${escHtml(t('supporter.echoPurchased', { count: String(localState.legacy.supporter.purchasedEchoesTotal) }))}`;
    }
    renderShopGrid();

    const showPrefs = hasSupporterCosmeticPrefs(localState);
    prefsWrap.hidden = !showPrefs;
    if (!showPrefs) {
      prefsPanel.hidden = true;
      prefsToggle.setAttribute('aria-expanded', 'false');
    }

    const themeUnlocked = localState.legacy.supporter.unlockedPerks.some((id) => id.startsWith('theme_'));
    const hasFrame = hasSupporterPerk(localState, 'frame_supporter');
    themeRow.hidden = !themeUnlocked;
    frameRow.hidden = !hasFrame;
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
        showRedeemStatus(t('supporter.error.empty'), true);
        return;
      }
      redeemBtn.disabled = true;
      redeemStatusEl.hidden = true;
      const result = await redeemSupporterCode(code, localState, localMeta, opts.campaignId);
      redeemBtn.disabled = false;
      if (!result.ok) {
        showRedeemStatus(t(`supporter.error.${result.error}`), true);
        return;
      }
      localState = result.state;
      localMeta = result.meta;
      saveSupporterMeta(opts.campaignId, localMeta);
      opts.onStateChange(localState, localMeta);
      codeInput.value = '';
      showRedeemStatus(t('supporter.redeemSuccess'));
      refreshUi();
    })();
  });

  codeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      redeemBtn.click();
    }
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
