import type { GameState } from '../engine/schema/index.ts';
import type { ContentRegistry } from '../content/registry.ts';
import { buildGameSidebar, CREATOR_NAME, KOFI_SUPPORT_URL } from './gameAppSidebar.ts';
import { buildMenuSaveSlot, saveSlotLimit } from './gameAppSaveSlots.ts';
import {
  getLocale,
  setLocale,
  SUPPORTED_LOCALES,
  t,
  type Locale,
} from '../i18n/index.ts';

/** Layout persistente: cabeçalho, menu lateral, sidebar do jogador e área principal (`main.story-shell`). */
export type MountAppChromeOptions = {
  /** Texto do título no topo (`{campanha} / {ato}`). */
  headerTitle: string;
  gameVersion: string;
  fontStep: number;
  campaignId: string;
  devMode: boolean;
  timedChoiceEnabled: boolean;
  /** Overlay em ecrã inteiro da arte ASCII na primeira visita (`highlight: true` na cena). */
  sceneArtHighlightEnabled: boolean;
  state: GameState;
  registry: ContentRegistry;
  sidebarSections: Record<string, boolean>;
  onMenuHamburgerClick: (hBtn: HTMLButtonElement) => void;
  onMenuBackdropClick: (hBtn: HTMLButtonElement) => void;
  getVolume: () => number;
  setVolume: (n: number) => void;
  onDevModeChange: (v: boolean) => void;
  onTimedChoiceChange: (v: boolean) => void;
  onSceneArtHighlightChange: (v: boolean) => void;
  onCycleFont: () => void;
  fullscreenSupported: boolean;
  getFullscreenActive: () => boolean;
  onFullscreenChange: (want: boolean) => Promise<void>;
  onExportSave: () => void;
  onImportSave: () => void;
  onCredits: () => void;
  /** Finais / legado (Crónica). */
  onChronicle: () => void;
  onDevTools: () => void;
  onScenesGraph: () => void;
  showImportInPartida: boolean;
  showGraphInSettings: boolean;
  /** Modo desenvolvedor no menu (apenas em localhost). */
  showDevModeToggle: boolean;
  onSaveSlot: (slot: number) => void;
  onLoadSlot: (slot: number) => void;
  onSidebarSectionToggle: (key: string, open: boolean) => void;
  /** Som de clique na UI (ex.: abrir/fechar diário). */
  playUiClick?: () => void;
  /** Preenche o `<main class="story-shell">` (combate ou narrativa). */
  fillMain: (main: HTMLElement) => void;
};

/** Referências estáveis ao chrome montado uma vez (menu + layout). */
export type AppChromeRefs = {
  frame: HTMLElement;
  topBarEl: HTMLElement;
  collapseTopBtn: HTMLButtonElement;
  fullscreenTopBtn: HTMLButtonElement;
  edgeRail: HTMLElement;
  titleEl: HTMLElement;
  sidebarEl: HTMLElement;
  mainEl: HTMLElement;
  hamburgerBtn: HTMLButtonElement;
  volumeRange: HTMLInputElement;
  volumeValue: HTMLElement;
  languageSelect: HTMLSelectElement;
  devCb: HTMLInputElement;
  timedChoiceCb: HTMLInputElement;
  sceneArtHighlightCb: HTMLInputElement;
  fontBtn: HTMLButtonElement;
  fullscreenCb: HTMLInputElement;
  devSaveExtrasEl: HTMLElement;
  devSettingsExtrasEl: HTMLElement;
  chronicleBtn: HTMLButtonElement;
  /** Só os cartões de slot (actualizado em `syncAppChrome` após gravar/importar). */
  saveSlotsWrap: HTMLElement;
  /** Painel `aria-live` para mensagens não bloqueantes (substitui `alert`). */
  toastRegion: HTMLElement;
  /** Menu lateral (`role="dialog"`). */
  menuDrawer: HTMLElement;
};

function localeShortLabel(locale: Locale): string {
  return locale === 'pt-BR' ? 'PT' : 'EN';
}

function createLanguageSelect(id: string, className: string): HTMLSelectElement {
  const languageSelect = document.createElement('select');
  languageSelect.id = id;
  languageSelect.className = className;
  languageSelect.setAttribute('aria-label', t('menu.language'));
  for (const loc of SUPPORTED_LOCALES) {
    const opt = document.createElement('option');
    opt.value = loc;
    opt.textContent = localeShortLabel(loc);
    languageSelect.appendChild(opt);
  }
  languageSelect.value = getLocale();
  languageSelect.addEventListener('change', () => {
    setLocale(languageSelect.value as Locale);
  });
  return languageSelect;
}

function fillMenuSaveSlots(
  wrap: HTMLElement,
  campaignId: string,
  devMode: boolean,
  onSaveSlot: (slot: number) => void,
  onLoadSlot: (slot: number) => void
): void {
  wrap.replaceChildren();
  for (let s = 1; s <= saveSlotLimit(devMode); s++) {
    wrap.appendChild(
      buildMenuSaveSlot(s, campaignId, {
        onSave: onSaveSlot,
        onLoad: onLoadSlot,
      })
    );
  }
}

function buildChromeDom(opts: MountAppChromeOptions): AppChromeRefs {
  const frame = document.createElement('div');
  frame.className = 'app-frame';
  frame.style.setProperty('--app-font-pct', `${100 + opts.fontStep * 10}%`);

  const skipLink = document.createElement('a');
  skipLink.className = 'skip-link';
  skipLink.href = '#story-main';
  skipLink.textContent = t('menu.skipToStory');
  frame.appendChild(skipLink);

  const toastRegion = document.createElement('div');
  toastRegion.className = 'app-toast-region';
  toastRegion.setAttribute('role', 'status');
  toastRegion.setAttribute('aria-live', 'polite');
  toastRegion.setAttribute('aria-atomic', 'true');
  frame.appendChild(toastRegion);

  const edgeRail = document.createElement('nav');
  edgeRail.className = 'app-edge-rail';
  edgeRail.setAttribute('aria-label', t('menu.compactControls'));
  edgeRail.hidden = true;
  const edgeRailRestoreBtn = document.createElement('button');
  edgeRailRestoreBtn.type = 'button';
  edgeRailRestoreBtn.className = 'app-edge-rail-btn';
  edgeRailRestoreBtn.setAttribute('aria-label', t('menu.showTopBar'));
  edgeRailRestoreBtn.setAttribute('data-app-edge-restore', '');
  edgeRailRestoreBtn.innerHTML = '\u25BC';
  const edgeRailMenuBtn = document.createElement('button');
  edgeRailMenuBtn.type = 'button';
  edgeRailMenuBtn.className = 'app-edge-rail-btn';
  edgeRailMenuBtn.setAttribute('aria-label', t('menu.menu'));
  edgeRailMenuBtn.setAttribute('data-app-edge-menu', '');
  edgeRailMenuBtn.innerHTML = '\u2630';
  edgeRail.appendChild(edgeRailRestoreBtn);
  edgeRail.appendChild(edgeRailMenuBtn);

  const header = document.createElement('header');
  header.className = 'app-top';
  const title = document.createElement('div');
  title.className = 'game-title';
  title.textContent = opts.headerTitle;
  const topActions = document.createElement('div');
  topActions.className = 'app-top-actions';
  const collapseTopBtn = document.createElement('button');
  collapseTopBtn.type = 'button';
  collapseTopBtn.className = 'app-top-collapse';
  collapseTopBtn.setAttribute('aria-label', t('menu.hideTopBar'));
  collapseTopBtn.innerHTML = '\u25B2';
  const fullscreenSupported = opts.fullscreenSupported;
  const fullscreenTopBtn = document.createElement('button');
  fullscreenTopBtn.type = 'button';
  fullscreenTopBtn.className = 'app-top-fullscreen';
  fullscreenTopBtn.innerHTML = '\u2922';
  fullscreenTopBtn.disabled = !fullscreenSupported;
  if (!fullscreenSupported) {
    fullscreenTopBtn.title = t('menu.fullscreenUnavailable');
    fullscreenTopBtn.setAttribute('aria-label', t('menu.fullscreenUnavailable'));
  } else {
    fullscreenTopBtn.setAttribute('aria-label', t('menu.fullscreen'));
    fullscreenTopBtn.title = t('menu.fullscreen');
  }
  const hBtn = document.createElement('button');
  hBtn.type = 'button';
  hBtn.className = 'hamburger';
  hBtn.setAttribute('aria-label', t('menu.menu'));
  hBtn.setAttribute('aria-expanded', 'false');
  hBtn.innerHTML = '\u2630';
  hBtn.addEventListener('click', () => opts.onMenuHamburgerClick(hBtn));
  const languageSelect = createLanguageSelect('app-top-language-select', 'app-top-language-select');
  topActions.appendChild(collapseTopBtn);
  topActions.appendChild(fullscreenTopBtn);
  topActions.appendChild(languageSelect);
  topActions.appendChild(hBtn);
  header.appendChild(title);
  header.appendChild(topActions);
  frame.appendChild(header);

  const backdrop = document.createElement('div');
  backdrop.className = 'menu-backdrop';
  backdrop.addEventListener('click', () => opts.onMenuBackdropClick(hBtn));
  frame.appendChild(backdrop);

  const drawer = document.createElement('aside');
  drawer.className = 'menu-drawer';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-hidden', 'true');
  drawer.setAttribute('aria-labelledby', 'menu-drawer-heading');
  const drawerScroll = document.createElement('div');
  drawerScroll.className = 'menu-drawer-scroll';
  const createMenuSection = (titleText: string, sectionTitleId?: string): HTMLDivElement => {
    const section = document.createElement('section');
    section.className = 'menu-section';
    const titleEl = document.createElement('h3');
    titleEl.className = 'menu-section-title';
    titleEl.textContent = titleText;
    if (sectionTitleId) titleEl.id = sectionTitleId;
    const body = document.createElement('div');
    body.className = 'menu-section-body';
    section.appendChild(titleEl);
    section.appendChild(body);
    drawerScroll.appendChild(section);
    return body;
  };

  const volumeRow = document.createElement('div');
  volumeRow.className = 'menu-item menu-volume';
  const volumeLabelRow = document.createElement('div');
  volumeLabelRow.className = 'menu-volume-label';
  const volumeLabel = document.createElement('label');
  volumeLabel.htmlFor = 'menu-volume-range';
  volumeLabel.textContent = t('menu.volume');
  const volumeValue = document.createElement('span');
  volumeValue.className = 'menu-volume-value';
  const volumeRange = document.createElement('input');
  volumeRange.type = 'range';
  volumeRange.min = '0';
  volumeRange.max = '100';
  volumeRange.step = '1';
  volumeRange.id = 'menu-volume-range';
  const syncVolumeUi = (): void => {
    const pct = Math.round(opts.getVolume() * 100);
    volumeRange.value = String(pct);
    volumeValue.textContent = `${pct}%`;
    volumeRange.setAttribute('aria-valuetext', `${pct}%`);
  };
  syncVolumeUi();
  volumeRange.addEventListener('input', () => {
    opts.setVolume(Number(volumeRange.value) / 100);
    volumeValue.textContent = `${volumeRange.value}%`;
    volumeRange.setAttribute('aria-valuetext', `${volumeRange.value}%`);
  });
  volumeLabelRow.appendChild(volumeLabel);
  volumeLabelRow.appendChild(volumeValue);
  volumeRow.appendChild(volumeLabelRow);
  volumeRow.appendChild(volumeRange);

  const devRow = document.createElement('label');
  devRow.className = 'menu-item menu-sound menu-dev';
  const devCb = document.createElement('input');
  devCb.type = 'checkbox';
  devCb.checked = opts.devMode;
  devCb.addEventListener('change', () => {
    opts.onDevModeChange(devCb.checked);
  });
  devRow.appendChild(devCb);
  devRow.appendChild(document.createTextNode(` ${t('menu.devMode')}`));

  const timedChoiceRow = document.createElement('label');
  timedChoiceRow.className = 'menu-item menu-sound menu-dev';
  const timedChoiceCb = document.createElement('input');
  timedChoiceCb.type = 'checkbox';
  timedChoiceCb.checked = opts.timedChoiceEnabled;
  timedChoiceCb.addEventListener('change', () => {
    opts.onTimedChoiceChange(timedChoiceCb.checked);
  });
  timedChoiceRow.appendChild(timedChoiceCb);
  timedChoiceRow.appendChild(
    document.createTextNode(` ${t('menu.timedChoice')}`)
  );

  const fontBtn = document.createElement('button');
  fontBtn.type = 'button';
  fontBtn.className = 'menu-item';
  fontBtn.textContent = t('menu.fontSize', { percent: String(100 + opts.fontStep * 10) });
  fontBtn.addEventListener('click', () => opts.onCycleFont());

  const fullscreenRow = document.createElement('label');
  fullscreenRow.className = 'menu-item menu-sound';
  if (!fullscreenSupported) {
    fullscreenRow.classList.add('menu-sound--disabled');
    fullscreenRow.title = t('menu.fullscreenUnavailable');
  }
  const fullscreenCb = document.createElement('input');
  fullscreenCb.type = 'checkbox';
  fullscreenCb.dataset.menuFullscreenCb = '';
  fullscreenCb.checked = opts.getFullscreenActive();
  fullscreenCb.disabled = !fullscreenSupported;
  fullscreenCb.addEventListener('change', () => {
    if (!fullscreenSupported) return;
    const goFullscreen = fullscreenCb.checked;
    void (async () => {
      try {
        await opts.onFullscreenChange(goFullscreen);
      } catch {
        fullscreenCb.checked = opts.getFullscreenActive();
      }
    })();
  });
  fullscreenRow.appendChild(fullscreenCb);
  fullscreenRow.appendChild(document.createTextNode(` ${t('menu.fullscreen')}`));

  const sceneArtHighlightRow = document.createElement('label');
  sceneArtHighlightRow.className = 'menu-item menu-sound';
  const sceneArtHighlightCb = document.createElement('input');
  sceneArtHighlightCb.type = 'checkbox';
  sceneArtHighlightCb.checked = opts.sceneArtHighlightEnabled;
  sceneArtHighlightCb.addEventListener('change', () => {
    opts.onSceneArtHighlightChange(sceneArtHighlightCb.checked);
  });
  sceneArtHighlightRow.appendChild(sceneArtHighlightCb);
  sceneArtHighlightRow.appendChild(
    document.createTextNode(` ${t('menu.sceneArtHighlight')}`)
  );

  const exportBtn = document.createElement('button');
  exportBtn.type = 'button';
  exportBtn.className = 'menu-item';
  exportBtn.textContent = t('menu.exportSave');
  exportBtn.addEventListener('click', () => opts.onExportSave());

  const importBtn = document.createElement('button');
  importBtn.type = 'button';
  importBtn.className = 'menu-item';
  importBtn.textContent = t('menu.importSave');
  importBtn.addEventListener('click', () => opts.onImportSave());

  const chronicleBtn = document.createElement('button');
  chronicleBtn.type = 'button';
  chronicleBtn.className = 'menu-item';
  chronicleBtn.textContent = t('menu.chronicle');
  chronicleBtn.title = t('menu.chronicleTitle');
  chronicleBtn.hidden = opts.state.legacy.echoes <= 0;
  chronicleBtn.addEventListener('click', () => opts.onChronicle());

  const creditsBtn = document.createElement('button');
  creditsBtn.type = 'button';
  creditsBtn.className = 'menu-item';
  creditsBtn.textContent = t('menu.credits');
  creditsBtn.addEventListener('click', () => opts.onCredits());

  const devToolsBtn = document.createElement('button');
  devToolsBtn.type = 'button';
  devToolsBtn.className = 'menu-item';
  devToolsBtn.textContent = t('menu.devTools');
  devToolsBtn.title = t('menu.devToolsTitle');
  devToolsBtn.addEventListener('click', () => opts.onDevTools());

  const graphBtn = document.createElement('button');
  graphBtn.type = 'button';
  graphBtn.className = 'menu-item';
  graphBtn.textContent = t('menu.scenesGraph');
  graphBtn.title = t('menu.scenesGraphTitle');
  graphBtn.addEventListener('click', () => opts.onScenesGraph());

  const versionLabel = document.createElement('div');
  versionLabel.className = 'menu-version';
  versionLabel.textContent = t('menu.version', { version: opts.gameVersion, author: CREATOR_NAME });

  const devSaveExtrasEl = document.createElement('div');
  devSaveExtrasEl.className = 'menu-dev-save-extras';
  devSaveExtrasEl.appendChild(exportBtn);
  devSaveExtrasEl.appendChild(importBtn);

  const devSettingsExtrasEl = document.createElement('div');
  devSettingsExtrasEl.className = 'menu-dev-settings-extras';
  devSettingsExtrasEl.appendChild(devToolsBtn);
  devSettingsExtrasEl.appendChild(graphBtn);

  const saveSection = createMenuSection(t('menu.sectionGame'), 'menu-drawer-heading');
  const saveSlotsWrap = document.createElement('div');
  saveSlotsWrap.className = 'menu-save-slots';
  fillMenuSaveSlots(saveSlotsWrap, opts.campaignId, opts.devMode, opts.onSaveSlot, opts.onLoadSlot);
  saveSection.appendChild(saveSlotsWrap);
  saveSection.appendChild(devSaveExtrasEl);

  const settingsSection = createMenuSection(t('menu.sectionSettings'));
  settingsSection.appendChild(volumeRow);
  settingsSection.appendChild(fontBtn);
  settingsSection.appendChild(fullscreenRow);
  settingsSection.appendChild(sceneArtHighlightRow);
  settingsSection.appendChild(timedChoiceRow);

  if (opts.showDevModeToggle || opts.showGraphInSettings) {
    const devSection = createMenuSection(t('menu.sectionDev'));
    if (opts.showDevModeToggle) {
      devSection.appendChild(devRow);
    }
    devSection.appendChild(devSettingsExtrasEl);
  }

  const aboutSection = createMenuSection(t('menu.sectionAbout'));
  aboutSection.appendChild(chronicleBtn);
  aboutSection.appendChild(creditsBtn);

  const kofiLink = document.createElement('a');
  kofiLink.href = KOFI_SUPPORT_URL;
  kofiLink.target = '_blank';
  kofiLink.rel = 'noopener noreferrer';
  kofiLink.className = 'menu-item menu-item--kofi';
  kofiLink.textContent = t('menu.kofi');
  kofiLink.title = t('menu.kofiTitle');
  aboutSection.appendChild(kofiLink);

  const footer = document.createElement('div');
  footer.className = 'menu-drawer-footer';
  footer.appendChild(versionLabel);
  drawer.appendChild(drawerScroll);
  drawer.appendChild(footer);
  frame.appendChild(drawer);

  const bodyRow = document.createElement('div');
  bodyRow.className = 'app-body';

  const sidebarEl = document.createElement('aside');
  sidebarEl.className = 'player-sidebar';
  sidebarEl.appendChild(
    buildGameSidebar({
      state: opts.state,
      registry: opts.registry,
      sidebarSections: opts.sidebarSections,
      onSectionToggle: opts.onSidebarSectionToggle,
      playUiClick: opts.playUiClick,
    })
  );

  const mainEl = document.createElement('main');
  mainEl.className = 'story-shell';
  mainEl.id = 'story-main';
  mainEl.tabIndex = -1;
  opts.fillMain(mainEl);

  bodyRow.appendChild(sidebarEl);
  bodyRow.appendChild(mainEl);
  frame.appendChild(bodyRow);

  return {
    frame,
    topBarEl: header,
    collapseTopBtn,
    fullscreenTopBtn,
    edgeRail,
    titleEl: title,
    sidebarEl,
    mainEl,
    hamburgerBtn: hBtn,
    volumeRange,
    volumeValue,
    languageSelect,
    devCb,
    timedChoiceCb,
    sceneArtHighlightCb,
    fontBtn,
    fullscreenCb,
    devSaveExtrasEl,
    devSettingsExtrasEl,
    chronicleBtn,
    saveSlotsWrap,
    toastRegion,
    menuDrawer: drawer,
  };
}

/** Monta frame, menu, sidebar e `main` uma vez; anexa a `root`. */
export function mountAppChrome(root: HTMLElement, opts: MountAppChromeOptions): AppChromeRefs {
  const refs = buildChromeDom(opts);
  root.appendChild(refs.edgeRail);
  root.appendChild(refs.frame);
  return refs;
}

/** Atualiza título, tipografia, sidebar, área principal e estado do menu sem destruir listeners. */
export function syncAppChrome(refs: AppChromeRefs, opts: MountAppChromeOptions): void {
  refs.frame.style.setProperty('--app-font-pct', `${100 + opts.fontStep * 10}%`);
  refs.titleEl.textContent = opts.headerTitle;

  refs.devSaveExtrasEl.hidden = !opts.showImportInPartida;
  refs.devSettingsExtrasEl.hidden = !opts.showGraphInSettings;
  refs.chronicleBtn.hidden = opts.state.legacy.echoes <= 0;

  const pct = Math.round(opts.getVolume() * 100);
  refs.volumeRange.value = String(pct);
  refs.volumeValue.textContent = `${pct}%`;
  refs.volumeRange.setAttribute('aria-valuetext', `${pct}%`);

  refs.devCb.checked = opts.devMode;
  refs.timedChoiceCb.checked = opts.timedChoiceEnabled;
  refs.sceneArtHighlightCb.checked = opts.sceneArtHighlightEnabled;
  refs.fontBtn.textContent = t('menu.fontSize', { percent: String(100 + opts.fontStep * 10) });
  refs.languageSelect.setAttribute('aria-label', t('menu.language'));
  refs.languageSelect.value = getLocale();
  for (const optEl of refs.languageSelect.options) {
    optEl.textContent = localeShortLabel(optEl.value as Locale);
  }
  refs.fullscreenCb.checked = opts.getFullscreenActive();
  refs.fullscreenTopBtn.disabled = !opts.fullscreenSupported;
  if (!opts.fullscreenSupported) {
    refs.fullscreenTopBtn.title = t('menu.fullscreenUnavailable');
    refs.fullscreenTopBtn.setAttribute('aria-label', `${t('menu.fullscreen')} (${t('menu.fullscreenUnavailable')})`);
  }

  while (refs.sidebarEl.firstChild) {
    refs.sidebarEl.removeChild(refs.sidebarEl.firstChild);
  }
  refs.sidebarEl.appendChild(
    buildGameSidebar({
      state: opts.state,
      registry: opts.registry,
      sidebarSections: opts.sidebarSections,
      onSectionToggle: opts.onSidebarSectionToggle,
      playUiClick: opts.playUiClick,
    })
  );

  refs.mainEl.classList.remove('main--combat');
  refs.mainEl.replaceChildren();
  opts.fillMain(refs.mainEl);

  fillMenuSaveSlots(refs.saveSlotsWrap, opts.campaignId, opts.devMode, opts.onSaveSlot, opts.onLoadSlot);
}
