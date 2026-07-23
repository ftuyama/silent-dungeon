import type {
  CampaignIndex,
  Character,
  ClassId,
  GameState,
  ItemDef,
  SpellDef,
} from '../engine/schema/index.ts';
import {
  effectiveLeadAttr,
  FACTION_IDS,
  friendshipTier,
  friendshipTierLabel,
  getCompanionFriendshipScore,
  getEffectiveLuck,
  hasFactionPerkUnlocked,
  hasSupporterPerk,
  MAX_LEVEL,
  REPUTATION_MAX,
  REPUTATION_MIN,
  xpToNextLevel,
} from '../engine/progression/index.ts';
import { isLeadPassiveUnlocked } from '../engine/core/index.ts';
import {
  getCharacterArmorClass,
  getEquippedArmorPoints,
  sumEquippedItemBonuses,
} from '../engine/combat/index.ts';
import type { ContentRegistry } from '../content/registry.ts';
import { displayTitleForMark } from '../engine/core/index.ts';
import {
  escHtml,
  friendshipBarMarkup,
  hpBarMarkup,
  manaBarMarkup,
  markBadgeIconSvg,
  passiveSidebarIconSvg,
  spellEmoji,
  spellSidebarMechanicsLine,
  statBonusParen,
  storyPathBadgeIconSvg,
  stressBarMarkup,
} from './gameAppUtils.ts';
import { formatItemEquipmentStatParts } from './formatItemEquipment.ts';
import {
  cycleDayForStreak,
  dailyBonusRewardLabel,
  DAILY_BONUS_CYCLE_LENGTH,
  rewardForCycleDay,
  type DailyBonusMeta,
} from './gameAppDailyBonus.ts';
import {
  dailyTaskLabel,
  dailyTaskRewardLabel,
  type DailyTasksState,
} from './gameAppDailyTasks.ts';
import { collapseTriggerStart, iconWrap, icons } from './icons/index.ts';
import { attachFocusTrap } from './focusTrap.ts';
import { t, getLocale } from '../i18n/index.ts';
import { localeHtmlLang } from '../i18n/locale.ts';
import { factionDisplayName } from '../i18n/factionName.ts';
import {
  canPurchaseLegacyUpgrade,
  isUpgradeUnlocked,
  legacyUpgradeCatalogFromData,
} from '../engine/progression/index.ts';

type SidebarBuilderParams = {
  state: GameState;
  registry: ContentRegistry;
  sidebarSections: Record<string, boolean>;
  onSectionToggle: (key: string, open: boolean) => void;
  playUiClick?: () => void;
  /** Painel colapsável no mobile; desktop ignora e mantém sempre visível. */
  mobileDetailsOpen?: boolean;
  /** Checklist de submissões; aberto por defeito até o jogador colapsar. */
  missionSubsOpen?: boolean;
  /** Chaves de recurso a pulsar (`gold` / `supply` / `faith` / `corruption`). */
  resourcePulseKeys?: ReadonlySet<string>;
  /** Itens adquiridos desde a última abertura do inventário. */
  inventoryNewCount?: number;
  /** Chamado quando o jogador abre o colapso do inventário (limpa o badge). */
  onInventoryOpened?: () => void;
};

type SidebarDisclosure = {
  unlockInventory: boolean;
  unlockFactions: boolean;
  unlockCompanions: boolean;
  nextHint: string | null;
};

let overlayModalLayer: HTMLDivElement | null = null;
let overlayModalOnKey: ((e: KeyboardEvent) => void) | null = null;
let overlayModalFocusTrapRelease: (() => void) | null = null;

/** Fecha qualquer modal de overlay (diário ou ficha) para não empilhar diálogos. */
function closeOverlayModal(): void {
  if (overlayModalFocusTrapRelease) {
    overlayModalFocusTrapRelease();
    overlayModalFocusTrapRelease = null;
  }
  if (overlayModalOnKey) {
    window.removeEventListener('keydown', overlayModalOnKey);
    overlayModalOnKey = null;
  }
  if (overlayModalLayer) {
    overlayModalLayer.remove();
    overlayModalLayer = null;
  }
}

type SheetModalShellOpts = {
  layerClass: string;
  titleId: string;
  kicker: string;
  title: string;
  sub: string;
  backdropAriaLabel: string;
};

function createSheetModalShell(opts: SheetModalShellOpts): {
  layer: HTMLDivElement;
  scroll: HTMLDivElement;
  dismiss: HTMLButtonElement;
  wireClose: (shut: () => void) => void;
} {
  const layer = document.createElement('div');
  layer.className = opts.layerClass;
  layer.setAttribute('role', 'dialog');
  layer.setAttribute('aria-modal', 'true');
  layer.setAttribute('aria-labelledby', opts.titleId);

  const backdrop = document.createElement('button');
  backdrop.type = 'button';
  backdrop.className = 'sheet-modal-backdrop';
  backdrop.setAttribute('aria-label', opts.backdropAriaLabel);

  const panel = document.createElement('div');
  panel.className = 'sheet-modal-panel';

  const header = document.createElement('div');
  header.className = 'sheet-modal-header';

  const kicker = document.createElement('div');
  kicker.className = 'diary-entry-kicker';
  kicker.textContent = opts.kicker;

  const title = document.createElement('h2');
  title.id = opts.titleId;
  title.className = 'sheet-modal-title';
  title.textContent = opts.title;

  const sub = document.createElement('div');
  sub.className = 'diary-entry-subkicker';
  sub.textContent = opts.sub;

  header.appendChild(kicker);
  header.appendChild(title);
  header.appendChild(sub);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'sheet-modal-close';
  closeBtn.setAttribute('aria-label', t('sidebar.close'));
  closeBtn.innerHTML = '&times;';
  header.appendChild(closeBtn);

  const scroll = document.createElement('div');
  scroll.className = 'sheet-modal-scroll';

  const footer = document.createElement('div');
  footer.className = 'sheet-modal-footer';
  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'diary-entry-dismiss';
  dismiss.textContent = t('sidebar.close');
  footer.appendChild(dismiss);

  panel.appendChild(header);
  panel.appendChild(scroll);
  panel.appendChild(footer);

  layer.appendChild(backdrop);
  layer.appendChild(panel);

  const wireClose = (shut: () => void): void => {
    backdrop.addEventListener('click', shut);
    closeBtn.addEventListener('click', shut);
    dismiss.addEventListener('click', shut);
    panel.addEventListener('click', (e) => e.stopPropagation());
  };

  return { layer, scroll, dismiss, wireClose };
}

type DiaryModalOpenParams = {
  state: GameState;
  diary: string[];
  marks: string[];
  registry: ContentRegistry;
};

function buildDiaryProgressSection(state: GameState, registry: ContentRegistry): HTMLElement {
  const sec = document.createElement('section');
  sec.className = 'diary-modal-section';
  const h = document.createElement('h3');
  h.className = 'diary-modal-section-title';
  h.textContent = t('sidebar.progress');
  const body = document.createElement('div');
  body.className = 'diary-modal-section-body diary-modal-progress';

  const chapterPoetic = registry.data.campaign.chapterTitles?.[String(state.chapter)]?.trim();
  const chapterLine = document.createElement('p');
  chapterLine.className = 'diary-modal-progress-line diary-modal-progress-line--chapter';
  chapterLine.title = progressChapterHoverTitle();
  if (chapterPoetic) {
    chapterLine.innerHTML = `${escHtml(t('sidebar.chapter'))} <strong>${state.chapter}</strong> — <em>${escHtml(chapterPoetic)}</em>`;
  } else {
    chapterLine.innerHTML = `${escHtml(t('sidebar.chapter'))} <strong>${state.chapter}</strong>`;
  }
  body.appendChild(chapterLine);

  const dayLine = document.createElement('p');
  dayLine.className = 'diary-modal-progress-line';
  dayLine.title = statHint('day');
  dayLine.innerHTML = `${escHtml(statLabel('day'))} <strong>${state.day}</strong>`;
  body.appendChild(dayLine);

  if (state.legacy.echoes > 0) {
    const echoesLine = document.createElement('p');
    echoesLine.className = 'diary-modal-progress-line';
    echoesLine.title = progressEchoesHoverTitle();
    echoesLine.innerHTML = `${escHtml(t('sidebar.inheritedEchoes'))} <strong>${state.legacy.echoes}</strong>`;
    body.appendChild(echoesLine);
  }
  if (state.legacy.lastRunEchoGain > 0) {
    const gainLine = document.createElement('p');
    gainLine.className = 'diary-modal-progress-line diary-modal-progress-line--muted';
    gainLine.textContent = t('sidebar.lastRestartEchoes', { count: state.legacy.lastRunEchoGain });
    body.appendChild(gainLine);
  }
  if (state.legacy.titles.length > 0) {
    const titleLine = document.createElement('p');
    titleLine.className = 'diary-modal-progress-line diary-modal-progress-line--muted';
    titleLine.innerHTML = `${escHtml(t('sidebar.recentTitle'))} <strong>${escHtml(state.legacy.titles[state.legacy.titles.length - 1]!)}</strong>.`;
    body.appendChild(titleLine);
  }
  const lastSummary = state.legacy.lastRunSummary.trim();
  if (lastSummary.length > 0) {
    const summaryLine = document.createElement('p');
    summaryLine.className = 'diary-modal-progress-line diary-modal-progress-line--muted';
    summaryLine.textContent = lastSummary;
    body.appendChild(summaryLine);
  }

  sec.appendChild(h);
  sec.appendChild(body);
  return sec;
}

function openDiaryModal({ state, diary: entries, marks, registry }: DiaryModalOpenParams, playUiClick?: () => void): void {
  closeOverlayModal();
  playUiClick?.();

  const subParts: string[] = [];
  if (entries.length === 1) subParts.push(t('sidebar.diaryRegisteredOne'));
  else if (entries.length > 1) subParts.push(t('sidebar.diaryRegisteredMany', { count: entries.length }));
  if (marks.length === 1) subParts.push(t('sidebar.markOne'));
  else if (marks.length > 1) subParts.push(t('sidebar.marksCount', { count: marks.length }));
  const storyPathEntries = Object.entries(state.storyPaths ?? {}).filter(
    ([, v]) => typeof v === 'string' && v.length > 0
  );
  if (storyPathEntries.length === 1) subParts.push(t('sidebar.storyPathOne'));
  else if (storyPathEntries.length > 1)
    subParts.push(t('sidebar.storyPathsCount', { count: storyPathEntries.length }));

  const { layer, scroll, dismiss, wireClose } = createSheetModalShell({
    layerClass: 'sheet-modal-layer',
    titleId: 'diary-modal-title',
    kicker: t('story.chronicler'),
    title: t('sidebar.diaryCampaignTitle'),
    sub: subParts.join(' · '),
    backdropAriaLabel: t('sidebar.closeDiary'),
  });

  const secMarks = document.createElement('section');
  secMarks.className = 'diary-modal-section diary-modal-section--badges';
  const hMarks = document.createElement('h3');
  hMarks.className = 'diary-modal-section-title';
  hMarks.textContent = t('sidebar.achievements');
  const marksBody = document.createElement('div');
  if (marks.length === 0) {
    marksBody.className = 'diary-modal-section-body';
    const empty = document.createElement('p');
    empty.className = 'diary-modal-empty';
    empty.textContent = t('sidebar.noMarks');
    marksBody.appendChild(empty);
  } else {
    marksBody.className = 'diary-modal-section-body diary-modal-badges-grid';
    for (const mark of marks) {
      const def = registry.data.journeyMarks[mark];
      const displayTitle = def?.name ?? displayTitleForMark(mark, registry.data);
      const displayDesc = def?.description ?? '';

      const badge = document.createElement('article');
      badge.className = 'diary-mark-badge';
      badge.setAttribute('aria-label', displayTitle);

      const rim = document.createElement('div');
      rim.className = 'diary-mark-badge-rim';

      const iconCell = document.createElement('div');
      iconCell.className = 'diary-mark-badge-icon';
      iconCell.innerHTML = iconWrap(markBadgeIconSvg(mark), 'ui-icon-wrap diary-mark-badge-icon-wrap');
      iconCell.setAttribute('aria-hidden', 'true');

      const textBlock = document.createElement('div');
      textBlock.className = 'diary-mark-badge-text';

      const titleEl = document.createElement('p');
      titleEl.className = 'diary-mark-badge-title';
      titleEl.textContent = displayTitle;

      textBlock.appendChild(titleEl);
      if (displayDesc) {
        const descEl = document.createElement('p');
        descEl.className = 'diary-mark-badge-desc';
        descEl.textContent = displayDesc;
        textBlock.appendChild(descEl);
      }

      rim.appendChild(iconCell);
      rim.appendChild(textBlock);
      badge.appendChild(rim);
      marksBody.appendChild(badge);
    }
  }
  secMarks.appendChild(hMarks);
  secMarks.appendChild(marksBody);

  const secPaths = document.createElement('section');
  secPaths.className = 'diary-modal-section diary-modal-section--badges';
  const hPaths = document.createElement('h3');
  hPaths.className = 'diary-modal-section-title';
  hPaths.textContent = t('sidebar.storyPaths');
  const pathsBody = document.createElement('div');
  if (storyPathEntries.length === 0) {
    pathsBody.className = 'diary-modal-section-body';
    const empty = document.createElement('p');
    empty.className = 'diary-modal-empty';
    empty.textContent = t('sidebar.noStoryPaths');
    pathsBody.appendChild(empty);
  } else {
    pathsBody.className = 'diary-modal-section-body diary-modal-badges-grid';
    for (const [pathId, value] of storyPathEntries) {
      const pathDef = registry.data.storyPaths[pathId];
      const valueDef = pathDef?.values[value];
      const decisionName = pathDef?.name ?? pathId;
      const displayTitle = valueDef?.name ?? value;
      const displayDesc = valueDef?.description ?? pathDef?.description ?? '';

      const badge = document.createElement('article');
      badge.className = 'diary-mark-badge diary-path-badge';
      badge.setAttribute('aria-label', `${decisionName}: ${displayTitle}`);

      const rim = document.createElement('div');
      rim.className = 'diary-mark-badge-rim';

      const iconCell = document.createElement('div');
      iconCell.className = 'diary-mark-badge-icon';
      iconCell.innerHTML = iconWrap(
        storyPathBadgeIconSvg(pathId, value),
        'ui-icon-wrap diary-mark-badge-icon-wrap'
      );
      iconCell.setAttribute('aria-hidden', 'true');

      const textBlock = document.createElement('div');
      textBlock.className = 'diary-mark-badge-text';

      const decisionEl = document.createElement('p');
      decisionEl.className = 'diary-path-badge-decision';
      decisionEl.textContent = decisionName;

      const titleEl = document.createElement('p');
      titleEl.className = 'diary-mark-badge-title';
      titleEl.textContent = displayTitle;

      textBlock.appendChild(decisionEl);
      textBlock.appendChild(titleEl);
      if (displayDesc) {
        const descEl = document.createElement('p');
        descEl.className = 'diary-mark-badge-desc';
        descEl.textContent = displayDesc;
        textBlock.appendChild(descEl);
      }

      rim.appendChild(iconCell);
      rim.appendChild(textBlock);
      badge.appendChild(rim);
      pathsBody.appendChild(badge);
    }
  }
  secPaths.appendChild(hPaths);
  secPaths.appendChild(pathsBody);

  const secDiary = document.createElement('section');
  secDiary.className = 'diary-modal-section';
  const hDiary = document.createElement('h3');
  hDiary.className = 'diary-modal-section-title';
  hDiary.textContent = t('sidebar.diaryLines');
  const diaryBody = document.createElement('div');
  diaryBody.className = 'diary-modal-section-body';
  if (entries.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'diary-modal-empty';
    empty.textContent = t('sidebar.noDiary');
    diaryBody.appendChild(empty);
  } else {
    const padW = entries.length >= 10 ? 2 : 1;
    for (let i = 0; i < entries.length; i++) {
      const block = document.createElement('div');
      block.className = 'diary-modal-entry';
      const num = document.createElement('span');
      num.className = 'diary-modal-entry-num';
      num.setAttribute('aria-hidden', 'true');
      num.textContent = String(i + 1).padStart(padW, '0');
      const bodyWrap = document.createElement('div');
      bodyWrap.className = 'diary-modal-entry-body-wrap';
      const p = document.createElement('p');
      p.className = 'diary-entry-body';
      p.textContent = entries[i]!;
      bodyWrap.appendChild(p);
      block.appendChild(num);
      block.appendChild(bodyWrap);
      diaryBody.appendChild(block);
    }
  }
  secDiary.appendChild(hDiary);
  secDiary.appendChild(diaryBody);

  scroll.appendChild(buildDiaryProgressSection(state, registry));
  scroll.appendChild(secMarks);
  scroll.appendChild(secPaths);
  scroll.appendChild(secDiary);

  document.body.appendChild(layer);
  overlayModalLayer = layer;

  const shut = () => {
    playUiClick?.();
    closeOverlayModal();
  };
  wireClose(shut);

  overlayModalOnKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') shut();
  };
  window.addEventListener('keydown', overlayModalOnKey);

  requestAnimationFrame(() => {
    dismiss.focus();
    overlayModalFocusTrapRelease = attachFocusTrap(layer);
  });
}

/** Página de apoio (menu Sobre → Apoiar no Ko-fi). */
export const KOFI_SUPPORT_URL = 'https://ko-fi.com/lelouchiee';
export const FEEDBACK_FORM_URL = 'https://forms.gle/CSE2zg94Eq3LD94S6';

export const CREATOR_NAME = 'Felipe Tuyama';

export type OpenCreditsModalOpts = {
  campaignName: string;
  gameVersion: string;
  state?: GameState;
  playUiClick?: () => void;
};

/** Modal de créditos (menu Sobre) — partilha overlay com diário/ficha. */
export function openCreditsModal({
  campaignName,
  gameVersion,
  state,
  playUiClick,
}: OpenCreditsModalOpts): void {
  closeOverlayModal();
  playUiClick?.();

  const { layer, scroll, dismiss, wireClose } = createSheetModalShell({
    layerClass: 'sheet-modal-layer credits-modal-layer',
    titleId: 'credits-modal-title',
    kicker: 'Silent Dungeon',
    title: t('sidebar.creditsTitle'),
    sub: `${campaignName} · v${gameVersion}`,
    backdropAriaLabel: t('sidebar.closeCredits'),
  });

  const kofiHint = document.createElement('div');
  kofiHint.className = 'credits-modal-kofi-hint';
  const kofiP = document.createElement('p');
  kofiP.textContent = t('sidebar.kofiHint');
  kofiHint.appendChild(kofiP);

  const secAbout = document.createElement('section');
  secAbout.className = 'diary-modal-section';
  const hAbout = document.createElement('h3');
  hAbout.className = 'diary-modal-section-title';
  hAbout.textContent = t('sidebar.aboutProject');
  const aboutBody = document.createElement('div');
  aboutBody.className = 'diary-modal-section-body credits-modal-about';

  const p1 = document.createElement('p');
  p1.textContent = t('sidebar.aboutP1');

  const p2 = document.createElement('p');
  p2.appendChild(document.createTextNode(t('sidebar.aboutP2Start')));
  const strongCamp = document.createElement('strong');
  strongCamp.textContent = campaignName;
  p2.appendChild(strongCamp);
  p2.appendChild(document.createTextNode(t('sidebar.aboutP2End')));

  aboutBody.appendChild(p1);
  aboutBody.appendChild(p2);
  secAbout.appendChild(hAbout);
  secAbout.appendChild(aboutBody);

  const secAuthor = document.createElement('section');
  secAuthor.className = 'diary-modal-section';
  const hAuthor = document.createElement('h3');
  hAuthor.className = 'diary-modal-section-title';
  hAuthor.textContent = t('sidebar.author');
  const pAuthor = document.createElement('p');
  pAuthor.className = 'diary-modal-section-body credits-modal-about';
  pAuthor.textContent = CREATOR_NAME;
  secAuthor.appendChild(hAuthor);
  secAuthor.appendChild(pAuthor);

  const secThanks = document.createElement('section');
  secThanks.className = 'diary-modal-section';
  const hThanks = document.createElement('h3');
  hThanks.className = 'diary-modal-section-title';
  hThanks.textContent = t('sidebar.thanks');
  const pThanks = document.createElement('p');
  pThanks.className = 'diary-modal-section-body credits-modal-thanks';
  pThanks.textContent = t('sidebar.thanksBody');
  secThanks.appendChild(hThanks);
  secThanks.appendChild(pThanks);

  if (
    state &&
    state.legacy.supporter.unlockedPerks.includes('credits_badge')
  ) {
    const pSupporter = document.createElement('p');
    pSupporter.className = 'diary-modal-section-body credits-modal-supporter';
    const name = state.legacy.supporter.supporterName?.trim();
    pSupporter.textContent = name
      ? t('sidebar.creditsSupporterNamed', { name })
      : t('sidebar.creditsSupporter');
    secThanks.appendChild(pSupporter);
  }

  scroll.appendChild(kofiHint);
  scroll.appendChild(secAbout);
  scroll.appendChild(secAuthor);
  scroll.appendChild(secThanks);

  document.body.appendChild(layer);
  overlayModalLayer = layer;

  const shut = (): void => {
    playUiClick?.();
    closeOverlayModal();
  };
  wireClose(shut);

  overlayModalOnKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') shut();
  };
  window.addEventListener('keydown', overlayModalOnKey);

  requestAnimationFrame(() => {
    dismiss.focus();
    overlayModalFocusTrapRelease = attachFocusTrap(layer);
  });
}

export type OpenChronicleModalOpts = {
  state: GameState;
  campaign: CampaignIndex;
  playUiClick?: () => void;
};

export function legacyMenuVisible(state: GameState): boolean {
  const legacy = state.legacy;
  return (
    legacy.echoes > 0 ||
    (legacy.unlockedUpgrades?.length ?? 0) > 0 ||
    (legacy.discoveredEndings?.length ?? 0) > 0 ||
    (legacy.titles?.length ?? 0) > 0
  );
}

function appendChronicleContent(
  scroll: HTMLElement,
  state: GameState,
  campaign: CampaignIndex
): void {
  const sec = document.createElement('section');
  sec.className = 'diary-modal-section';
  const h = document.createElement('h3');
  h.className = 'diary-modal-section-title';
  h.textContent = t('menu.chronicle');
  sec.appendChild(h);

  const pIntro = document.createElement('p');
  pIntro.className = 'diary-modal-section-body';
  pIntro.textContent = t('sidebar.chronicleIntro');
  sec.appendChild(pIntro);

  const lead = state.party[0];
  if (lead) {
    const pClass = document.createElement('p');
    pClass.className = 'diary-modal-section-body';
    pClass.textContent = t('sidebar.thisRun', { name: lead.name, class: lead.class });
    sec.appendChild(pClass);
  }

  const endingsMeta = campaign.endings ?? {};
  const discovered = state.legacy.discoveredEndings ?? [];
  if (discovered.length > 0) {
    const hEnd = document.createElement('h4');
    hEnd.className = 'diary-modal-section-subtitle';
    hEnd.textContent = t('sidebar.endingsFound');
    sec.appendChild(hEnd);
    const ulEnd = document.createElement('ul');
    ulEnd.className = 'credits-modal-about';
    for (const eid of discovered) {
      const meta = endingsMeta[eid];
      const li = document.createElement('li');
      if (meta) {
        const strong = document.createElement('strong');
        strong.textContent = meta.title;
        li.appendChild(strong);
        if (meta.blurb?.trim()) {
          li.appendChild(document.createElement('br'));
          const span = document.createElement('span');
          span.className = 'chronicle-ending-blurb';
          span.textContent = meta.blurb.trim();
          li.appendChild(span);
        }
      } else {
        li.textContent = eid;
      }
      ulEnd.appendChild(li);
    }
    sec.appendChild(ulEnd);
  }

  if (state.legacy.titles.length === 0) {
    const pEmpty = document.createElement('p');
    pEmpty.className = 'diary-modal-section-body';
    pEmpty.textContent = t('sidebar.chronicleNoTitles');
    sec.appendChild(pEmpty);
  } else {
    const hTitles = document.createElement('h4');
    hTitles.className = 'diary-modal-section-subtitle';
    hTitles.textContent = t('sidebar.titlesSeen');
    sec.appendChild(hTitles);
    const ul = document.createElement('ul');
    ul.className = 'credits-modal-about';
    for (const title of state.legacy.titles) {
      const li = document.createElement('li');
      li.textContent = title;
      ul.appendChild(li);
    }
    sec.appendChild(ul);
  }

  if (state.legacy.lastRunSummary.trim().length > 0) {
    const pSummary = document.createElement('p');
    pSummary.className = 'diary-modal-section-body diary-modal-progress-line--muted';
    pSummary.textContent = state.legacy.lastRunSummary.trim();
    sec.appendChild(pSummary);
  }

  scroll.appendChild(sec);
}

function appendEchoShopContent(
  scroll: HTMLElement,
  state: GameState,
  registry: ContentRegistry,
  onPurchase: (upgradeId: string) => void,
  playUiClick?: () => void
): void {
  const sec = document.createElement('section');
  sec.className = 'diary-modal-section echo-shop-section';
  const h = document.createElement('h3');
  h.className = 'diary-modal-section-title';
  h.textContent = t('menu.echoShop');
  sec.appendChild(h);

  const sub = document.createElement('p');
  sub.className = 'diary-modal-section-body echo-shop-section-intro';
  sub.textContent = t('echoShop.sub');
  sec.appendChild(sub);

  const catalog = legacyUpgradeCatalogFromData(registry.data);
  const upgradeIds = Object.keys(catalog);

  const list = document.createElement('ul');
  list.className = 'echo-shop-list';
  for (const id of upgradeIds) {
    const def = catalog[id]!;
    const owned = isUpgradeUnlocked(state, id);
    const canBuy = canPurchaseLegacyUpgrade(state, id, catalog);
    const li = document.createElement('li');
    li.className = 'echo-shop-item';
    if (owned) li.classList.add('echo-shop-item--owned');

    const head = document.createElement('div');
    head.className = 'echo-shop-item-head';
    const nameEl = document.createElement('div');
    nameEl.className = 'echo-shop-item-name';
    nameEl.textContent = t(def.nameKey);
    head.appendChild(nameEl);
    const costEl = document.createElement('div');
    costEl.className = 'echo-shop-item-cost';
    costEl.textContent = t('echoShop.cost', { cost: String(def.cost) });
    head.appendChild(costEl);
    li.appendChild(head);

    const descEl = document.createElement('div');
    descEl.className = 'echo-shop-item-desc';
    descEl.textContent = t(def.descriptionKey);
    li.appendChild(descEl);

    const actions = document.createElement('div');
    actions.className = 'echo-shop-item-actions';
    if (owned) {
      const ownedLbl = document.createElement('span');
      ownedLbl.className = 'echo-shop-owned-label';
      ownedLbl.textContent = t('echoShop.owned');
      actions.appendChild(ownedLbl);
    } else {
      const buyBtn = document.createElement('button');
      buyBtn.type = 'button';
      buyBtn.className = 'echo-shop-buy-btn';
      buyBtn.textContent = canBuy ? t('echoShop.buyShort') : t('echoShop.insufficient');
      buyBtn.disabled = !canBuy;
      buyBtn.addEventListener('click', () => {
        playUiClick?.();
        onPurchase(id);
      });
      actions.appendChild(buyBtn);
    }
    li.appendChild(actions);
    list.appendChild(li);
  }
  sec.appendChild(list);
  scroll.appendChild(sec);
}

export type OpenLegacyModalOpts = {
  state: GameState;
  campaign: CampaignIndex;
  registry: ContentRegistry;
  playUiClick?: () => void;
  onPurchase: (upgradeId: string) => void;
  onRestart?: () => void;
  showRestart?: boolean;
};

/** Legado unificado: crônica + loja de ecos. */
export function openLegacyModal({
  state,
  campaign,
  registry,
  playUiClick,
  onPurchase,
  onRestart,
  showRestart = false,
}: OpenLegacyModalOpts): void {
  closeOverlayModal();
  playUiClick?.();

  const { layer, scroll, dismiss, wireClose } = createSheetModalShell({
    layerClass: 'sheet-modal-layer credits-modal-layer echo-shop-modal-layer',
    titleId: 'legacy-modal-title',
    kicker: t('sidebar.chronicleKicker'),
    title: t('menu.legacy'),
    sub: t('menu.legacyTitle'),
    backdropAriaLabel: t('sidebar.closeChronicle'),
  });

  const balance = document.createElement('p');
  balance.className = 'echo-shop-balance';
  balance.textContent = t('echoShop.balance', { echoes: String(state.legacy.echoes) });
  scroll.appendChild(balance);

  appendChronicleContent(scroll, state, campaign);
  appendEchoShopContent(scroll, state, registry, onPurchase, playUiClick);

  if (showRestart && onRestart) {
    const hint = document.createElement('p');
    hint.className = 'echo-shop-restart-hint';
    hint.textContent = t('echoShop.restartHint');
    scroll.appendChild(hint);
    dismiss.textContent = t('echoShop.restart');
    dismiss.classList.add('echo-shop-restart-btn');
    const shut = (): void => {
      playUiClick?.();
      closeOverlayModal();
      onRestart();
    };
    document.body.appendChild(layer);
    overlayModalLayer = layer;
    wireClose(shut);
    overlayModalOnKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') shut();
    };
    window.addEventListener('keydown', overlayModalOnKey);
    requestAnimationFrame(() => {
      dismiss.focus();
      overlayModalFocusTrapRelease = attachFocusTrap(layer);
    });
    return;
  }

  document.body.appendChild(layer);
  overlayModalLayer = layer;
  const shut = (): void => {
    playUiClick?.();
    closeOverlayModal();
  };
  wireClose(shut);
  overlayModalOnKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') shut();
  };
  window.addEventListener('keydown', overlayModalOnKey);
  requestAnimationFrame(() => {
    dismiss.focus();
    overlayModalFocusTrapRelease = attachFocusTrap(layer);
  });
}

export type OpenDailyHubModalOpts = {
  meta: DailyBonusMeta;
  /** Tarefas do dia da gravação ativa; sem gravação mostra a dica de carregar um slot. */
  tasks?: DailyTasksState | null;
  playUiClick?: () => void;
};

/** Retorno diário: sequência de login, tarefas do dia e prêmios do ciclo de 7 dias. */
export function openDailyHubModal({ meta, tasks, playUiClick }: OpenDailyHubModalOpts): void {
  closeOverlayModal();
  playUiClick?.();

  const streak = Math.max(1, meta.streak);
  const cycleDay = cycleDayForStreak(streak);
  const total = DAILY_BONUS_CYCLE_LENGTH;

  const { layer, scroll, dismiss, wireClose } = createSheetModalShell({
    layerClass: 'sheet-modal-layer credits-modal-layer daily-bonus-modal-layer',
    titleId: 'daily-bonus-modal-title',
    kicker: t('dailyBonus.kicker'),
    title: t('dailyBonus.title'),
    sub: t('dailyBonus.modalSub', { streak: String(streak) }),
    backdropAriaLabel: t('dailyBonus.close'),
  });

  const secProgress = document.createElement('section');
  secProgress.className = 'diary-modal-section';
  const hProgress = document.createElement('h3');
  hProgress.className = 'diary-modal-section-title';
  hProgress.textContent = t('dailyBonus.progressTitle');
  secProgress.appendChild(hProgress);

  const pct = Math.min(100, Math.round((100 * cycleDay) / total));
  const meter = document.createElement('div');
  meter.className = 'daily-bonus-progress-meter';
  meter.setAttribute('role', 'progressbar');
  meter.setAttribute('aria-valuenow', String(cycleDay));
  meter.setAttribute('aria-valuemin', '1');
  meter.setAttribute('aria-valuemax', String(total));
  meter.setAttribute('aria-label', t('dailyBonus.progressAria'));
  const fill = document.createElement('div');
  fill.className = 'daily-bonus-progress-fill';
  fill.style.width = `${pct}%`;
  meter.appendChild(fill);
  secProgress.appendChild(meter);

  const cap = document.createElement('p');
  cap.className = 'daily-bonus-progress-caption';
  cap.textContent = t('dailyBonus.progressCaption', {
    day: String(cycleDay),
    total: String(total),
  });
  secProgress.appendChild(cap);

  const todayLine = document.createElement('p');
  todayLine.className = 'diary-modal-section-body daily-bonus-today-line';
  todayLine.innerHTML = `${escHtml(t('dailyBonus.todayReward'))} <strong>${escHtml(dailyBonusRewardLabel(rewardForCycleDay(cycleDay)))}</strong>`;
  secProgress.appendChild(todayLine);

  const secTasks = document.createElement('section');
  secTasks.className = 'diary-modal-section';
  const hTasks = document.createElement('h3');
  hTasks.className = 'diary-modal-section-title';
  hTasks.textContent = t('dailyTasks.sectionTitle');
  secTasks.appendChild(hTasks);
  const taskList = document.createElement('div');
  taskList.className = 'diary-modal-section-body daily-bonus-days';
  if (tasks && tasks.tasks.length > 0) {
    for (const task of tasks.tasks) {
      const row = document.createElement('div');
      row.className = `daily-bonus-day-row daily-task-row${task.claimed ? ' daily-bonus-day-row--done daily-task-row--done' : ''}`;

      const progressCell = document.createElement('span');
      progressCell.className = 'daily-bonus-day-label daily-task-progress';
      progressCell.textContent = `${task.progress}/${task.target}`;

      const labelCell = document.createElement('span');
      labelCell.className = 'daily-bonus-day-reward';
      labelCell.textContent = dailyTaskLabel(task);

      const stateCell = document.createElement('span');
      stateCell.className = 'daily-bonus-day-state';
      stateCell.textContent = task.claimed
        ? `✓ ${dailyTaskRewardLabel(task.reward)}`
        : dailyTaskRewardLabel(task.reward);

      row.append(progressCell, labelCell, stateCell);
      taskList.appendChild(row);
    }
  } else {
    const empty = document.createElement('p');
    empty.className = 'diary-modal-section-body daily-tasks-empty';
    empty.textContent = t('dailyTasks.sectionEmpty');
    taskList.appendChild(empty);
  }
  secTasks.appendChild(taskList);

  const secRewards = document.createElement('section');
  secRewards.className = 'diary-modal-section';
  const hRewards = document.createElement('h3');
  hRewards.className = 'diary-modal-section-title';
  hRewards.textContent = t('dailyBonus.rewardsTitle');
  secRewards.appendChild(hRewards);

  const list = document.createElement('div');
  list.className = 'diary-modal-section-body daily-bonus-days';
  for (let d = 1; d <= total; d++) {
    const row = document.createElement('div');
    const mod =
      d === cycleDay ? ' daily-bonus-day-row--current' : d < cycleDay ? ' daily-bonus-day-row--done' : '';
    row.className = `daily-bonus-day-row${mod}`;

    const dayCell = document.createElement('span');
    dayCell.className = 'daily-bonus-day-label';
    dayCell.textContent = t('dailyBonus.dayLabel', { day: String(d) });

    const rewardCell = document.createElement('span');
    rewardCell.className = 'daily-bonus-day-reward';
    rewardCell.textContent = dailyBonusRewardLabel(rewardForCycleDay(d));

    const stateCell = document.createElement('span');
    stateCell.className = 'daily-bonus-day-state';
    stateCell.textContent =
      d === cycleDay ? t('dailyBonus.stateToday') : d < cycleDay ? '✓' : '';

    row.append(dayCell, rewardCell, stateCell);
    list.appendChild(row);
  }
  secRewards.appendChild(list);

  const secRules = document.createElement('section');
  secRules.className = 'diary-modal-section';
  const hRules = document.createElement('h3');
  hRules.className = 'diary-modal-section-title';
  hRules.textContent = t('dailyBonus.rulesTitle');
  const rulesBody = document.createElement('div');
  rulesBody.className = 'diary-modal-section-body credits-modal-about';
  const pRule1 = document.createElement('p');
  pRule1.textContent = t('dailyBonus.ruleStreak');
  const pRule2 = document.createElement('p');
  pRule2.textContent = t('dailyBonus.ruleApply');
  const pRule3 = document.createElement('p');
  pRule3.textContent = t('dailyTasks.ruleReset');
  const pRule4 = document.createElement('p');
  pRule4.textContent = t('dailyTasks.ruleClaim');
  rulesBody.append(pRule1, pRule2, pRule3, pRule4);
  secRules.appendChild(hRules);
  secRules.appendChild(rulesBody);

  scroll.appendChild(secProgress);
  scroll.appendChild(secTasks);
  scroll.appendChild(secRewards);
  scroll.appendChild(secRules);

  document.body.appendChild(layer);
  overlayModalLayer = layer;

  const shut = (): void => {
    playUiClick?.();
    closeOverlayModal();
  };
  wireClose(shut);

  overlayModalOnKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') shut();
  };
  window.addEventListener('keydown', overlayModalOnKey);

  requestAnimationFrame(() => {
    dismiss.focus();
    overlayModalFocusTrapRelease = attachFocusTrap(layer);
  });
}

function countEquippedSlots(c: Character): number {
  return [c.weaponId, c.armorId, c.relicId].filter(Boolean).length;
}

function appendCharacterSheetEquipSection(
  scroll: HTMLElement,
  c: Character,
  registry: ContentRegistry
): void {
  const sec = document.createElement('section');
  sec.className = 'diary-modal-section';
  const h = document.createElement('h3');
  h.className = 'diary-modal-section-title';
  h.textContent = t('sidebar.equipment');
  const grid = document.createElement('div');
  grid.className = 'character-sheet-equip-grid';

  const slotIcon: Record<'weapon' | 'armor' | 'relic', string> = {
    weapon: icons.weapon,
    armor: icons.armor,
    relic: icons.relic,
  };
  const slots: Array<{ key: 'weapon' | 'armor' | 'relic'; id: string | null }> = [
    { key: 'weapon', id: c.weaponId },
    { key: 'armor', id: c.armorId },
    { key: 'relic', id: c.relicId },
  ];

  for (const { key, id } of slots) {
    const label = t(`sidebar.itemSlot.${key}`);
    const card = document.createElement('article');
    card.className = id ? 'character-sheet-slot-card' : 'character-sheet-slot-card character-sheet-slot-card--empty';
    const ic = slotIcon[key];
    const head = document.createElement('div');
    head.className = 'character-sheet-slot-head';
    head.innerHTML = `${iconWrap(ic, 'character-sheet-slot-icon-wrap')}<span class="character-sheet-slot-label">${escHtml(label)}</span>`;
    card.appendChild(head);
    if (!id) {
      const p = document.createElement('p');
      p.className = 'character-sheet-slot-empty';
      p.textContent = t('sidebar.empty');
      card.appendChild(p);
    } else {
      const it = registry.data.items[id];
      const nameEl = document.createElement('p');
      nameEl.className = 'character-sheet-slot-name';
      nameEl.textContent = it?.name ?? id;
      card.appendChild(nameEl);
      if (it) {
        const statParts = formatItemEquipmentStatParts(it);
        if (statParts.length > 0) {
          const stats = document.createElement('p');
          stats.className = 'character-sheet-slot-stats';
          stats.textContent = statParts.join(' · ');
          card.appendChild(stats);
        }
      }
    }
    grid.appendChild(card);
  }

  const hint = document.createElement('p');
  hint.className = 'character-sheet-equip-hint';
  hint.textContent = t('sidebar.equipmentChangeHint');

  sec.appendChild(h);
  sec.appendChild(grid);
  sec.appendChild(hint);
  scroll.appendChild(sec);
}

function appendCharacterSheetPassivesSection(
  scroll: HTMLElement,
  opts: {
    passiveUnlocked: boolean;
    classPassiveHtml: { name: string; description: string; iconSvg: string } | null;
    storyPassives: Array<{ name: string; description: string; iconSvg: string }>;
  }
): void {
  const hasClass = opts.passiveUnlocked && opts.classPassiveHtml;
  const hasStory = opts.storyPassives.length > 0;
  if (!hasClass && !hasStory) return;

  const sec = document.createElement('section');
  sec.className = 'diary-modal-section';
  const h = document.createElement('h3');
  h.className = 'diary-modal-section-title';
  h.textContent = t('sidebar.passives');
  const body = document.createElement('div');
  body.className = 'character-sheet-passives-body';

  if (hasClass && opts.classPassiveHtml) {
    const block = document.createElement('div');
    block.className = 'character-sheet-passive-block';
    const row = document.createElement('div');
    row.className = 'character-sheet-passive-title-row';
    row.innerHTML = `${iconWrap(opts.classPassiveHtml.iconSvg, 'ui-icon-wrap ui-icon-wrap--sm')}<strong class="character-sheet-passive-name">${escHtml(opts.classPassiveHtml.name)}</strong>`;
    const desc = document.createElement('p');
    desc.className = 'character-sheet-passive-desc';
    desc.textContent = opts.classPassiveHtml.description;
    block.appendChild(row);
    block.appendChild(desc);
    body.appendChild(block);
  }

  for (const sp of opts.storyPassives) {
    const block = document.createElement('div');
    block.className = 'character-sheet-passive-block character-sheet-passive-block--story';
    const row = document.createElement('div');
    row.className = 'character-sheet-passive-title-row';
    row.innerHTML = `${iconWrap(sp.iconSvg, 'ui-icon-wrap ui-icon-wrap--sm')}<strong class="character-sheet-passive-name">${escHtml(sp.name)}</strong>`;
    const desc = document.createElement('p');
    desc.className = 'character-sheet-passive-desc';
    desc.textContent = sp.description;
    block.appendChild(row);
    block.appendChild(desc);
    body.appendChild(block);
  }

  sec.appendChild(h);
  sec.appendChild(body);
  scroll.appendChild(sec);
}

function appendCharacterSheetSpellsSection(scroll: HTMLElement, state: GameState, registry: ContentRegistry): void {
  const sec = document.createElement('section');
  sec.className = 'diary-modal-section';
  const h = document.createElement('h3');
  h.className = 'diary-modal-section-title';
  h.textContent = t('sidebar.spellsLearned');
  const body = document.createElement('div');
  body.className = 'character-sheet-spells-body';

  const spellLines = state.knownSpells
    .map((id) => registry.data.spells[id])
    .filter((sp): sp is SpellDef => !!sp);

  if (spellLines.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'diary-modal-empty';
    empty.textContent = t('sidebar.noSpellsLearned');
    body.appendChild(empty);
  } else {
    for (const sp of spellLines) {
      const row = document.createElement('div');
      row.className = 'character-sheet-spell-row';
      const emoji = document.createElement('span');
      emoji.className = 'character-sheet-spell-emoji';
      emoji.setAttribute('aria-hidden', 'true');
      emoji.textContent = spellEmoji(sp.id, sp);
      const text = document.createElement('div');
      text.className = 'character-sheet-spell-text';
      const nameEl = document.createElement('p');
      nameEl.className = 'character-sheet-spell-name';
      nameEl.textContent = sp.name;
      const mech = document.createElement('p');
      mech.className = 'character-sheet-spell-mech';
      mech.textContent = t('sidebar.spellManaLine', {
        cost: String(sp.manaCost),
        mechanics: spellSidebarMechanicsLine(sp),
      });
      text.appendChild(nameEl);
      text.appendChild(mech);
      row.appendChild(emoji);
      row.appendChild(text);
      body.appendChild(row);
    }
  }

  sec.appendChild(h);
  sec.appendChild(body);
  scroll.appendChild(sec);
}

function appendCharacterSheetSpellsSectionCompanion(scroll: HTMLElement): void {
  const sec = document.createElement('section');
  sec.className = 'diary-modal-section';
  const h = document.createElement('h3');
  h.className = 'diary-modal-section-title';
  h.textContent = t('sidebar.spells');
  const body = document.createElement('div');
  body.className = 'character-sheet-spells-body';
  const p = document.createElement('p');
  p.className = 'diary-modal-empty';
  p.textContent = t('sidebar.spellsLeaderOnly');
  body.appendChild(p);
  sec.appendChild(h);
  sec.appendChild(body);
  scroll.appendChild(sec);
}

function appendCharacterSheetLoreSection(
  scroll: HTMLElement,
  paragraphs: string[],
  storyProgress?: { unlocked: number; total: number },
  storyProgressAriaLabel = t('sidebar.story')
): void {
  const sec = document.createElement('section');
  sec.className = 'diary-modal-section';
  const h = document.createElement('h3');
  h.className = 'diary-modal-section-title';
  h.textContent = t('sidebar.story');
  const body = document.createElement('div');
  body.className = 'character-sheet-lore-body';
  const panel = document.createElement('div');
  panel.className = 'character-sheet-lore-panel';
  const loreScroll = document.createElement('div');
  loreScroll.className = 'character-sheet-lore-scroll';
  loreScroll.setAttribute('lang', localeHtmlLang(getLocale()));
  if (paragraphs.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'diary-modal-empty';
    empty.textContent = t('sidebar.noStoryText');
    loreScroll.appendChild(empty);
  } else {
    paragraphs.forEach((para, i) => {
      const p = document.createElement('p');
      p.className =
        i === 0 ? 'character-sheet-lore-p character-sheet-lore-p--lead' : 'character-sheet-lore-p';
      p.textContent = para;
      loreScroll.appendChild(p);
    });
  }
  panel.appendChild(loreScroll);
  body.appendChild(panel);
  sec.appendChild(h);
  if (storyProgress != null && storyProgress.total > 0) {
    const pct = Math.min(100, Math.round((100 * storyProgress.unlocked) / storyProgress.total));
    const wrap = document.createElement('div');
    wrap.className = 'character-sheet-lore-progress';
    const meter = document.createElement('div');
    meter.className = 'character-sheet-lore-progress-meter';
    meter.setAttribute('role', 'progressbar');
    meter.setAttribute('aria-valuenow', String(storyProgress.unlocked));
    meter.setAttribute('aria-valuemin', '0');
    meter.setAttribute('aria-valuemax', String(storyProgress.total));
    meter.setAttribute('aria-label', storyProgressAriaLabel);
    const fill = document.createElement('div');
    fill.className = 'character-sheet-lore-progress-fill';
    fill.style.width = `${pct}%`;
    meter.appendChild(fill);
    const cap = document.createElement('div');
    cap.className = 'character-sheet-lore-progress-caption';
    cap.textContent = t('sidebar.storyFragments', {
      unlocked: String(storyProgress.unlocked),
      total: String(storyProgress.total),
    });
    wrap.appendChild(meter);
    wrap.appendChild(cap);
    sec.appendChild(wrap);
  }
  sec.appendChild(body);
  scroll.appendChild(sec);
}

type CharacterSheetOpenParams =
  | { kind: 'hero'; state: GameState; registry: ContentRegistry; character: Character }
  | { kind: 'companion'; state: GameState; registry: ContentRegistry; character: Character };

function openCharacterSheetModal(params: CharacterSheetOpenParams, playUiClick?: () => void): void {
  closeOverlayModal();
  playUiClick?.();

  const { state, registry, character: c } = params;
  const cid = c.class as ClassId;
  const clsLabel = registry.ui.getHeroClassLabel(cid, c.path);
  const companionDef = params.kind === 'companion' ? registry.data.companions[c.id] : undefined;
  const sheetTitle = params.kind === 'hero' ? c.name : (companionDef?.name ?? c.name);

  const titleId =
    params.kind === 'hero' ? 'character-sheet-title-hero' : `character-sheet-title-${c.id.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  const subParts: string[] = [clsLabel];
  if (params.kind === 'hero') {
    const nSpells = state.knownSpells.length;
    subParts.push(nSpells === 1 ? t('sidebar.spellOne') : t('sidebar.spellsCount', { count: nSpells }));
    subParts.push(t('sidebar.equippedItems', { filled: String(countEquippedSlots(c)) }));
  } else {
    subParts.push(t('sidebar.equippedItems', { filled: String(countEquippedSlots(c)) }));
  }

  const { layer, scroll, dismiss, wireClose } = createSheetModalShell({
    layerClass: 'sheet-modal-layer character-sheet-modal-layer',
    titleId,
    kicker: params.kind === 'hero' ? t('sidebar.hero') : t('sidebar.companions'),
    title: sheetTitle,
    sub: subParts.join(' · '),
    backdropAriaLabel: t('sidebar.closeSheet'),
  });

  appendCharacterSheetStatsSection(scroll, c, state, registry, {
    showLevelXp: params.kind === 'hero',
  });
  appendCharacterSheetEquipSection(scroll, c, registry);

  if (params.kind === 'hero') {
    const pu = isLeadPassiveUnlocked(state);
    const passiveDef = registry.data.passives[cid];
    const classPassive = pu
      ? {
          name: passiveDef?.name ?? t('sidebar.classPassiveFallback'),
          description: passiveDef?.description ?? t('sidebar.noDescriptionFallback'),
          iconSvg: passiveSidebarIconSvg(passiveDef?.id ?? ''),
        }
      : null;
    const storyPassives: Array<{ name: string; description: string; iconSvg: string }> = [];
    for (const pid of state.leadStoryPassives) {
      const def = registry.data.leadStoryPassives[pid];
      if (def) {
        storyPassives.push({
          name: def.name,
          description: def.description,
          iconSvg: passiveSidebarIconSvg(pid),
        });
      }
    }
    appendCharacterSheetPassivesSection(scroll, {
      passiveUnlocked: pu,
      classPassiveHtml: classPassive,
      storyPassives,
    });
    appendCharacterSheetSpellsSection(scroll, state, registry);
    const loreRaw = registry.ui.getHeroLore(state, cid, c.path);
    const loreParas = loreRaw.split('\n\n').filter(Boolean);
    const storyProgress = registry.ui.getHeroStoryProgress(state, cid, c.path);
    appendCharacterSheetLoreSection(scroll, loreParas, storyProgress, t('sidebar.heroSheet'));
  } else {
    const pu = isLeadPassiveUnlocked(state);
    const passiveDef = registry.data.passives[cid];
    const classPassive = pu
      ? {
          name: passiveDef?.name ?? t('sidebar.classPassiveFallback'),
          description: passiveDef?.description ?? t('sidebar.noDescriptionFallback'),
          iconSvg: passiveSidebarIconSvg(passiveDef?.id ?? ''),
        }
      : null;
    appendCharacterSheetPassivesSection(scroll, {
      passiveUnlocked: pu,
      classPassiveHtml: classPassive,
      storyPassives: [],
    });
    appendCharacterSheetSpellsSectionCompanion(scroll);
    const loreRaw = registry.ui.getCompanionLore(state, c.id);
    const loreParas = loreRaw.split('\n\n').filter(Boolean);
    const storyProgress = registry.ui.getCompanionStoryProgress(state, c.id);
    appendCharacterSheetLoreSection(
      scroll,
      loreParas,
      storyProgress,
      t('sidebar.companionStoryProgress')
    );
  }

  document.body.appendChild(layer);
  overlayModalLayer = layer;

  const shut = () => {
    playUiClick?.();
    closeOverlayModal();
  };
  wireClose(shut);

  overlayModalOnKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') shut();
  };
  window.addEventListener('keydown', overlayModalOnKey);

  requestAnimationFrame(() => {
    dismiss.focus();
    overlayModalFocusTrapRelease = attachFocusTrap(layer);
  });
}

type StatKey = 'level' | 'xp' | 'hp' | 'mana' | 'stress' | 'ac' | 'str' | 'agi' | 'mind' | 'luck' | 'crit' | 'day' | 'bond';

function statHint(key: StatKey): string {
  return t(`sidebar.statHint.${key}`);
}

function statLabel(key: StatKey): string {
  switch (key) {
    case 'ac':
      return t('engine.ac');
    case 'crit':
      return t('engine.crit');
    case 'day':
      return t('engine.day');
    case 'str':
      return t('engine.attrStr');
    case 'agi':
      return t('engine.attrAgi');
    case 'mind':
      return t('engine.attrMind');
    case 'luck':
      return t('engine.attrLuck');
    default:
      return t(`sidebar.${key}`);
  }
}

function hintedStat(key: StatKey): string {
  const label = statLabel(key);
  return `<span class="sidebar-hint-label" title="${escHtml(statHint(key))}">${escHtml(label)}</span>`;
}

function resourceHover(key: 'gold' | 'supply' | 'faith' | 'corruption' | 'extraLife' | 'echoes'): string {
  return t(`sidebar.resourceHover.${key}`);
}

function progressChapterHoverTitle(): string {
  return t('sidebar.progressChapterHint');
}

function progressEchoesHoverTitle(): string {
  return t('sidebar.progressEchoesHint');
}

function factionRepHoverTitle(label: string, value: number): string {
  return t('sidebar.factionRepHint', {
    label,
    value,
    min: REPUTATION_MIN,
    max: REPUTATION_MAX,
  });
}

function activeBuffsLineHtml(state: GameState): string {
  return state.activeBuffs
    .map((b) =>
      t('sidebar.buffLine', {
        attr: b.attr.toUpperCase(),
        delta: `${b.delta >= 0 ? '+' : ''}${b.delta}`,
        scenes: b.remainingScenes,
      })
    )
    .join(' · ');
}

function activeBuffsHoverTitle(state: GameState): string {
  return (
    state.activeBuffs
      .map((b) =>
        t('sidebar.buffLine', {
          attr: b.attr.toUpperCase(),
          delta: `${b.delta >= 0 ? '+' : ''}${b.delta}`,
          scenes: b.remainingScenes,
        })
      )
      .join(' ') + t('sidebar.buffFooter')
  );
}

function itemInventoryHoverTitle(def: ItemDef | undefined): string {
  if (!def) return t('sidebar.itemMissingDef');
  const parts: string[] = [t(`sidebar.itemSlot.${def.slot}`)];
  parts.push(...formatItemEquipmentStatParts(def));
  if (def.restoreHp) parts.push(t('sidebar.itemRestoreHp', { amount: def.restoreHp }));
  if (def.restoreMana) parts.push(t('sidebar.itemRestoreMana', { amount: def.restoreMana }));
  if (def.stressRelief) parts.push(t('sidebar.itemStressRelief', { amount: def.stressRelief }));
  if (def.corruptionDrainOnHit) {
    parts.push(t('sidebar.itemCorruptionDrain', { amount: def.corruptionDrainOnHit }));
  }
  if (def.rumor) parts.push(t('sidebar.itemRumor'));
  return parts.join(' ');
}

function buildSidebarDisclosure(state: GameState): SidebarDisclosure {
  const visitedCount = Object.keys(state.visitedScenes).length;
  const repTouched = FACTION_IDS.some((f) => (state.reputation[f] ?? 0) !== 0);
  const unlockInventory = state.chapter >= 2 || visitedCount >= 6 || state.day >= 4;
  const addRepEver = state.flags['add_rep_ever'] === true;
  const unlockFactions = state.chapter >= 2 || visitedCount >= 10 || repTouched || addRepEver;
  const unlockCompanions = state.chapter >= 2 || visitedCount >= 8 || state.party.length > 2;
  let nextHint: string | null = null;
  if (!unlockInventory) {
    nextHint = null;
  } else if (!unlockCompanions && state.party.length > 1) {
    nextHint = t('sidebar.hintUnlockCompanions');
  } else if (!unlockFactions) {
    nextHint = t('sidebar.hintUnlockFactions');
  }
  return { unlockInventory, unlockFactions, unlockCompanions, nextHint };
}

function formatStatAttrsLineHtml(
  c: Character,
  state: GameState,
  registry: ContentRegistry,
  opts?: { compact?: boolean }
): string {
  const data = registry.data;
  const eq = sumEquippedItemBonuses(data, c);
  const str = effectiveLeadAttr(state, c, 'str') + eq.str;
  const agi = effectiveLeadAttr(state, c, 'agi') + eq.agi;
  const men = effectiveLeadAttr(state, c, 'mind') + eq.mind;
  const sor = getEffectiveLuck(c, data, state);
  const ca = getCharacterArmorClass(data, c, state);
  const caEq = getEquippedArmorPoints(data, c);
  const critRatioPct = Math.round((c.critRatio ?? 0) * 100);
  const cls = opts?.compact ? 'sidebar-line attrs party-member-card-stats' : 'sidebar-line attrs';
  const attrs: Array<{ key: StatKey; value: string; bonus?: string }> = [
    { key: 'ac', value: String(ca), bonus: statBonusParen(caEq) },
    { key: 'str', value: String(str), bonus: statBonusParen(eq.str) },
    { key: 'agi', value: String(agi), bonus: statBonusParen(eq.agi) },
    { key: 'mind', value: String(men), bonus: statBonusParen(eq.mind) },
    { key: 'luck', value: String(sor), bonus: statBonusParen(eq.luck) },
    { key: 'crit', value: `${critRatioPct}%` },
  ];
  return `<div class="${cls}">${attrs
    .map(
      (attr) =>
        `<span class="sidebar-attr-item"><span class="sidebar-attr-label">${hintedStat(attr.key)}</span> <strong>${attr.value}</strong>${attr.bonus ?? ''}</span>`
    )
    .join('')}</div>`;
}

function appendHtmlFragment(parent: HTMLElement, html: string): void {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  parent.appendChild(t.content);
}

function appendCharacterSheetStatsSection(
  scroll: HTMLElement,
  c: Character,
  state: GameState,
  registry: ContentRegistry,
  opts: { showLevelXp: boolean }
): void {
  const sec = document.createElement('section');
  sec.className = 'diary-modal-section';
  const h = document.createElement('h3');
  h.className = 'diary-modal-section-title';
  h.textContent = t('sidebar.summary');
  const body = document.createElement('div');
  body.className = 'character-sheet-stats-body';

  if (opts.showLevelXp) {
    const lv = state.level;
    const need = lv >= MAX_LEVEL ? 0 : xpToNextLevel(lv);
    const xpLine =
      lv >= MAX_LEVEL
        ? `<div class="sidebar-line character-sheet-stat-line">${hintedStat('level')} <strong>${lv}</strong> · <em>${t('engine.max')}</em></div>`
        : `<div class="sidebar-line character-sheet-stat-line">${hintedStat('level')} <strong>${lv}</strong> · ${hintedStat('xp')} <strong>${state.xp}</strong> / <strong>${need}</strong></div>${hpBarMarkup(state.xp, need)}`;
    appendHtmlFragment(body, xpLine);
  }

  appendHtmlFragment(
    body,
    `<div class="sidebar-line character-sheet-stat-line">${hintedStat('hp')} <strong>${c.hp}</strong> / <strong>${c.maxHp}</strong></div>${hpBarMarkup(c.hp, c.maxHp, 'hp-bar-resource', 'hp')}`
  );

  if (c.maxMana > 0) {
    appendHtmlFragment(
      body,
      `<div class="sidebar-line character-sheet-stat-line">${hintedStat('mana')} <strong>${c.mana}</strong> / <strong>${c.maxMana}</strong></div>${manaBarMarkup(c.mana, c.maxMana)}`
    );
  }

  appendHtmlFragment(
    body,
    `<div class="sidebar-line sidebar-stress-label character-sheet-stat-line">${hintedStat('stress')} <strong>${c.stress}</strong> / 4</div>${stressBarMarkup(c.stress)}`
  );

  const compDef = registry.data.companions[c.id];
  if (compDef) {
    const score = getCompanionFriendshipScore(state, c.id);
    const tier = friendshipTier(score);
    const tierLabel = friendshipTierLabel(tier);
    appendHtmlFragment(
      body,
      `<div class="sidebar-line sidebar-bond-label character-sheet-stat-line">${hintedStat('bond')} <strong>${score}</strong> / 100 · ${escHtml(tierLabel)} <span class="sidebar-muted">(${tier}/5)</span></div>${friendshipBarMarkup(score, 100)}`
    );
  }

  if (state.activeBuffs.length > 0) {
    appendHtmlFragment(
      body,
      `<div class="sidebar-line sidebar-buffs character-sheet-stat-line sidebar-line--hint" title="${escHtml(activeBuffsHoverTitle(state))}">${escHtml(activeBuffsLineHtml(state))}</div>`
    );
  }

  appendHtmlFragment(body, formatStatAttrsLineHtml(c, state, registry));

  sec.appendChild(h);
  sec.appendChild(body);
  scroll.appendChild(sec);
}

function inventoryMarkup(state: GameState, registry: ContentRegistry): string {
  const inv = state.inventory;
  if (!inv.length) {
    return `<div class="sidebar-line inventory-empty sidebar-line--with-icon">${iconWrap(icons.inventory)}<span>${escHtml(t('sidebar.noItems'))}</span></div>`;
  }
  const counts = new Map<string, number>();
  for (const id of inv) {
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const lines: string[] = [];
  for (const [id, n] of counts) {
    const def = registry.data.items[id];
    const label = def?.name ?? id;
    const suffix = n > 1 ? ` ×${n}` : '';
    lines.push(
      `<div class="sidebar-line sidebar-inventory-item sidebar-line--with-icon sidebar-line--hint" title="${escHtml(itemInventoryHoverTitle(def))}">${iconWrap(icons.item, 'ui-icon-wrap ui-icon-wrap--sm')}<span>${escHtml(label)}${escHtml(suffix)}</span></div>`
    );
  }
  return lines.join('');
}

function companionCardMarkup(c: Character, state: GameState, registry: ContentRegistry): string {
  const cid = c.class as ClassId;
  const clsLabel = registry.ui.getHeroClassLabel(cid, c.path);
  const def = registry.data.companions[c.id];
  const displayName = def?.name ?? c.name;
  const hasLore = Boolean(def?.lorePt?.trim());
  const filled = countEquippedSlots(c);
  const metaParts: string[] = [
    t('sidebar.equippedItems', { filled }),
    hasLore ? t('sidebar.withStory') : t('sidebar.noStory'),
  ];
  const countLabel = metaParts.join(' · ');
  return `<div class="companion-sidebar-card">
      <div class="companion-sidebar-name">${escHtml(displayName)}</div>
      <div class="companion-sidebar-class">${escHtml(clsLabel)}</div>
      <div class="sidebar-line">${hintedStat('hp')} <strong>${c.hp}</strong> / <strong>${c.maxHp}</strong></div>
      ${hpBarMarkup(c.hp, c.maxHp, 'hp-bar-resource', 'hp')}
      <div class="sidebar-line sidebar-stress-label">${hintedStat('stress')} <strong>${c.stress}</strong> / 4</div>
      ${stressBarMarkup(c.stress)}
      ${formatStatAttrsLineHtml(c, state, registry, { compact: true })}
      <div class="sidebar-collapse character-sheet-sidebar-card">
        <button type="button" class="sidebar-collapse-trigger diary-sidebar-open-btn" data-companion-sheet="${escHtml(c.id)}" aria-haspopup="dialog">
          ${collapseTriggerStart(icons.person, t('sidebar.viewSheet'))}<span class="diary-sidebar-open-meta">${escHtml(countLabel)}<span class="diary-sidebar-open-hint" aria-hidden="true">›</span></span>
        </button>
      </div>
    </div>`;
}

function companionsSectionMarkup(state: GameState, registry: ContentRegistry): string {
  const rest = state.party.slice(1);
  if (!rest.length) {
    return `<div class="sidebar-line sidebar-muted">${escHtml(t('sidebar.noCompanions'))}</div>`;
  }
  return rest.map((ch) => companionCardMarkup(ch, state, registry)).join('');
}

function repBarMarkup(
  label: string,
  value: number,
  variant: 'vigilia' | 'circulo' | 'culto'
): string {
  const span = REPUTATION_MAX - REPUTATION_MIN;
  const pct = Math.min(100, Math.max(0, Math.round(((value - REPUTATION_MIN) / span) * 100)));
  const repHint = escHtml(factionRepHoverTitle(label, value));
  return `<div class="faction-rep-row">
    <div class="sidebar-line faction-rep-label sidebar-line--with-icon sidebar-line--hint" title="${repHint}">${iconWrap(icons.factions)}<span>${escHtml(label)} <strong>${value}</strong></span></div>
    <div class="faction-rep-track faction-rep-track--${variant} sidebar-line--hint" title="${repHint}">
      <div class="faction-rep-fill faction-rep-fill--${variant}" style="width:${pct}%"></div>
    </div>
  </div>`;
}

function factionLoreBlurb(variant: 'vigilia' | 'circulo' | 'culto'): string {
  return `<p class="faction-lore-blurb">${escHtml(t(`sidebar.factionLore.${variant}`))}</p>`;
}

function factionPerkBulletMarkup(
  state: GameState,
  variant: 'vigilia' | 'circulo' | 'culto'
): string {
  const v = state.reputation[variant] ?? 0;
  if (!hasFactionPerkUnlocked(v)) return '';
  return `<ul class="faction-perk-list" aria-label="${escHtml(t('sidebar.factionPerkAria'))}"><li class="faction-perk-item"><span class="faction-perk-bonus">${escHtml(t(`sidebar.factionPerk.${variant}.bonus`))}</span><span class="faction-perk-explainer">${escHtml(t(`sidebar.factionPerk.${variant}.details`))}</span></li></ul>`;
}

function wireSidebarDetails(
  hud: HTMLElement,
  sidebarSections: Record<string, boolean>,
  onSectionToggle: (key: string, open: boolean) => void,
  onInventoryOpened?: () => void
): void {
  hud.querySelectorAll('details[data-section]').forEach((el) => {
    const d = el as HTMLDetailsElement;
    const key = d.dataset.section;
    if (!key) return;
    if (sidebarSections[key] !== undefined) {
      d.open = sidebarSections[key]!;
    }
    d.addEventListener('toggle', () => {
      onSectionToggle(key, d.open);
      if (key === 'inventario' && d.open) {
        onInventoryOpened?.();
      }
    });
  });
}

export function buildGameSidebar({
  state,
  registry,
  sidebarSections,
  onSectionToggle,
  playUiClick,
  mobileDetailsOpen = true,
  missionSubsOpen = true,
  resourcePulseKeys,
  inventoryNewCount = 0,
  onInventoryOpened,
}: SidebarBuilderParams): HTMLElement {
  const hud = document.createElement('div');
  hud.className = 'sidebar-inner';
  const r = state.resources;
  const gold = r.gold ?? 0;
  const p = state.party[0];
  const rep = state.reputation;
  const disclosure = buildSidebarDisclosure(state);
  const missionView = registry.ui.getMainMissionView?.(state);
  const mainMissionText =
    missionView?.title.trim() || registry.ui.getMainMission?.(state)?.trim() || '';
  const visibleSubMissions =
    missionView?.steps.filter((s) => s.status !== 'done') ?? [];
  const hasVisibleSubMissions = visibleSubMissions.length > 0;
  const missionHeader = `<div class="sidebar-mission-card__label">${iconWrap(icons.scroll)}<span>${escHtml(t('sidebar.mainMission'))}</span></div>
          <p class="sidebar-mission-card__text">${escHtml(mainMissionText)}</p>`;
  const missionSubsOpenAttr = missionSubsOpen ? ' open' : '';
  const missionStepsHtml =
    missionView && hasVisibleSubMissions
      ? `<details class="sidebar-mission-subs"${missionSubsOpenAttr} data-section="missao">
          <summary class="sidebar-mission-subs__label">${escHtml(t('sidebar.subMissions'))}</summary>
          <ul class="sidebar-mission-checklist">
          ${visibleSubMissions
            .map((step) => {
              const mark =
                step.status === 'done' ? '✓' : step.status === 'failed' ? '✕' : '☐';
              const hint =
                step.hint && step.hint.trim().length > 0
                  ? `<span class="sidebar-mission-step__hint">${escHtml(step.hint)}</span>`
                  : '';
              return `<li class="sidebar-mission-step sidebar-mission-step--${step.status}">
                <span class="sidebar-mission-step__mark" aria-hidden="true">${mark}</span>
                <span class="sidebar-mission-step__body">
                  <span class="sidebar-mission-step__label">${escHtml(step.label)}</span>
                  ${hint}
                </span>
              </li>`;
            })
            .join('')}
          </ul>
        </details>`
      : '';
  const mainMissionBlock =
    mainMissionText.length > 0
      ? `<div class="sidebar-mission-card">${missionHeader}${missionStepsHtml}</div>`
      : '';

  const openRec = sidebarSections['recursos'] ? ' open' : '';
  const openInv = disclosure.unlockInventory && sidebarSections['inventario'] ? ' open' : '';
  const openFac = disclosure.unlockFactions && sidebarSections['faccoes'] ? ' open' : '';
  const hasCompanionsInParty = state.party.length > 1;
  const hasInventory = state.inventory.length > 0;

  const personagemBlock = (() => {
    if (!p) {
      return `<div class="sidebar-line sidebar-muted">${escHtml(t('sidebar.pickClassInStory'))}</div>
        <div class="sidebar-line">${hintedStat('level')} <strong>${state.level}</strong> · ${hintedStat('xp')} <strong>${state.xp}</strong></div>`;
    }
    const cid = p.class as ClassId;
    const lv = state.level;
    const need = lv >= MAX_LEVEL ? 0 : xpToNextLevel(lv);
    const xpLine =
      lv >= MAX_LEVEL
        ? `<div class="sidebar-line">${hintedStat('level')} <strong>${lv}</strong> · <em>${t('engine.max')}</em></div>`
        : `<div class="sidebar-line">${hintedStat('level')} <strong>${lv}</strong> · ${hintedStat('xp')} <strong>${state.xp}</strong> / <strong>${need}</strong></div>
        ${hpBarMarkup(state.xp, need)}`;
    const buffHint =
      state.activeBuffs.length > 0
        ? `<div class="sidebar-line sidebar-buffs sidebar-line--hint" title="${escHtml(activeBuffsHoverTitle(state))}">${escHtml(activeBuffsLineHtml(state))}</div>`
        : '';
    const nSpells = state.knownSpells.length;
    const filledEquip = countEquippedSlots(p);
    const heroMetaParts: string[] = [
      nSpells === 1 ? t('sidebar.spellOne') : t('sidebar.spellsCount', { count: nSpells }),
      t('sidebar.equippedItems', { filled: filledEquip }),
    ];
    const heroCountLabel = heroMetaParts.join(' · ');
    return `<div class="sidebar-line"><strong>${escHtml(p.name)}</strong></div>
        <div class="sidebar-line sidebar-class-line">${escHtml(registry.ui.getHeroClassLabel(cid, p.path))}</div>
        ${xpLine}
        <div class="sidebar-line">${hintedStat('hp')} <strong>${p.hp}/${p.maxHp}</strong></div>
        ${hpBarMarkup(p.hp, p.maxHp, 'hp-bar-resource', 'hp')}
        ${p.maxMana > 0 ? `<div class="sidebar-line">${hintedStat('mana')} <strong>${p.mana}</strong> / <strong>${p.maxMana}</strong></div>${manaBarMarkup(p.mana, p.maxMana)}` : ''}
        <div class="sidebar-line sidebar-stress-label">${hintedStat('stress')} <strong>${p.stress}</strong> / 4</div>
        ${stressBarMarkup(p.stress)}
        ${buffHint}
        ${formatStatAttrsLineHtml(p, state, registry)}
        <div class="sidebar-collapse character-sheet-sidebar-card">
          <button type="button" class="sidebar-collapse-trigger diary-sidebar-open-btn" data-open-hero-sheet aria-haspopup="dialog">
            ${collapseTriggerStart(icons.scroll, t('sidebar.heroSheet'))}<span class="diary-sidebar-open-meta">${escHtml(heroCountLabel)}<span class="diary-sidebar-open-hint" aria-hidden="true">›</span></span>
          </button>
        </div>`;
  })();

  const mobileSummaryStats = p
    ? `${escHtml(t('sidebar.hp'))} <strong>${p.hp}/${p.maxHp}</strong> · ${escHtml(t('sidebar.stress'))} <strong>${p.stress}/4</strong> · ${escHtml(t('sidebar.gold'))} <strong>${gold}</strong>`
    : escHtml(t('sidebar.pickClassInStory'));

  const characterFrameClass =
    state.legacy.supporter?.activeFrame === 'supporter' && hasSupporterPerk(state, 'frame_supporter')
      ? ' sidebar-static--supporter-frame'
      : '';

  hud.innerHTML = `
      <h2 class="sidebar-title">${escHtml(t('sidebar.title'))}</h2>
      ${mainMissionBlock}
      <details class="sidebar-mobile-details"${mobileDetailsOpen ? ' open' : ''}>
        <summary class="sidebar-mobile-summary">
          <span class="sidebar-mobile-summary__label">${escHtml(t('sidebar.groupStatus'))}</span>
          <span class="sidebar-mobile-summary__stats">${mobileSummaryStats}</span>
        </summary>
        <div class="sidebar-mobile-body">
      <div class="sidebar-static${characterFrameClass}">
        <div class="sidebar-static-title sidebar-static-title--with-icon">${iconWrap(icons.person)}<span>${escHtml(t('sidebar.character'))}</span></div>
        <div class="sidebar-static-body sidebar-stats">
          ${personagemBlock}
        </div>
      </div>
      ${
        hasCompanionsInParty && disclosure.unlockCompanions
          ? `<div class="sidebar-static">
        <div class="sidebar-static-title sidebar-static-title--with-icon">${iconWrap(icons.companions)}<span>${escHtml(t('sidebar.companions'))}</span></div>
        <div class="sidebar-static-body sidebar-stats">
          ${companionsSectionMarkup(state, registry)}
        </div>
      </div>`
          : ''
      }
      ${
        hasCompanionsInParty && !disclosure.unlockCompanions
          ? `<div class="sidebar-line sidebar-muted sidebar-disclosure-hint">${escHtml(t('sidebar.companionsRecruited'))} <strong>${state.party.length - 1}</strong> ${escHtml(t('sidebar.companionsLocked'))}</div>`
          : ''
      }
      ${
        disclosure.nextHint
          ? `<div class="sidebar-line sidebar-muted sidebar-disclosure-hint">${escHtml(disclosure.nextHint)}</div>`
          : ''
      }
      <details class="sidebar-collapse"${openRec} data-section="recursos">
        <summary class="sidebar-collapse-trigger">${collapseTriggerStart(icons.resources, t('sidebar.resources'))}</summary>
        <div class="sidebar-collapse-body">
          <div class="sidebar-line sidebar-line--with-icon sidebar-line--hint${resourcePulseKeys?.has('gold') ? ' sidebar-line--resource-pulse' : ''}" data-resource="gold" title="${escHtml(resourceHover('gold'))}">${iconWrap(icons.gold)}<span>${escHtml(t('sidebar.gold'))} <strong>${gold}</strong></span></div>
          <div class="sidebar-line sidebar-line--with-icon sidebar-line--hint${resourcePulseKeys?.has('supply') ? ' sidebar-line--resource-pulse' : ''}" data-resource="supply" title="${escHtml(resourceHover('supply'))}">${iconWrap(icons.supply)}<span>${escHtml(t('sidebar.supply'))} <strong>${r.supply}</strong></span></div>
          <div class="sidebar-line sidebar-line--with-icon sidebar-line--hint${resourcePulseKeys?.has('faith') ? ' sidebar-line--resource-pulse' : ''}" data-resource="faith" title="${escHtml(resourceHover('faith'))}">${iconWrap(icons.faith)}<span>${escHtml(t('sidebar.faith'))} <strong>${r.faith}</strong></span></div>
          ${state.extraLifeReady ? `<div class="sidebar-line sidebar-line--with-icon sidebar-line--hint" title="${escHtml(resourceHover('extraLife'))}">${iconWrap(icons.heart)}<span>${escHtml(t('sidebar.extraLife'))} <strong>${escHtml(t('sidebar.extraLifeReady'))}</strong> <span class="sidebar-resource-hint">${escHtml(t('sidebar.extraLifeCost'))}</span></span></div>` : ''}
          <div class="sidebar-line sidebar-line--with-icon sidebar-line--hint${resourcePulseKeys?.has('corruption') ? ' sidebar-line--resource-pulse' : ''}" data-resource="corruption" title="${escHtml(resourceHover('corruption'))}">${iconWrap(icons.corruption)}<span>${escHtml(t('sidebar.corruption'))} <strong>${r.corruption}</strong></span></div>
          <div class="sidebar-line sidebar-line--with-icon sidebar-line--hint" title="${escHtml(resourceHover('echoes'))}">${iconWrap(icons.memories)}<span>${escHtml(t('sidebar.echoes'))} <strong>${state.legacy.echoes}</strong></span></div>
        </div>
      </details>
      ${
        hasInventory && disclosure.unlockInventory
          ? `<details class="sidebar-collapse"${openInv} data-section="inventario">
        <summary class="sidebar-collapse-trigger">${collapseTriggerStart(icons.inventory, t('sidebar.inventory'))}${
            inventoryNewCount > 0
              ? `<span class="sidebar-inventory-new-badge" title="${escHtml(t('sidebar.inventoryNew', { count: inventoryNewCount }))}">${inventoryNewCount > 9 ? '9+' : String(inventoryNewCount)}</span>`
              : ''
          }</summary>
        <div class="sidebar-collapse-body sidebar-inventory">
          ${inventoryMarkup(state, registry)}
        </div>
      </details>`
          : ''
      }
      ${
        disclosure.unlockFactions
          ? `<details class="sidebar-collapse"${openFac} data-section="faccoes">
        <summary class="sidebar-collapse-trigger">${collapseTriggerStart(icons.factions, t('sidebar.factions'))}</summary>
        <div class="sidebar-collapse-body sidebar-faccoes">
          ${repBarMarkup(factionDisplayName('vigilia'), rep.vigilia, 'vigilia')}
          ${factionLoreBlurb('vigilia')}
          ${factionPerkBulletMarkup(state, 'vigilia')}
          ${repBarMarkup(factionDisplayName('circulo'), rep.circulo, 'circulo')}
          ${factionLoreBlurb('circulo')}
          ${factionPerkBulletMarkup(state, 'circulo')}
          ${repBarMarkup(factionDisplayName('culto'), rep.culto, 'culto')}
          ${factionLoreBlurb('culto')}
          ${factionPerkBulletMarkup(state, 'culto')}
        </div>
      </details>`
          : ''
      }
      ${
        hasInventory && !disclosure.unlockInventory
          ? `<div class="sidebar-line sidebar-muted sidebar-disclosure-hint">${escHtml(t('sidebar.inventoryLocked'))}</div>`
          : ''
      }
        </div>
      </details>
    `;

  {
    const diaryCard = document.createElement('div');
    diaryCard.className = 'sidebar-collapse diary-sidebar-card';
    const metaParts: string[] = [];
    if (state.diary.length) {
      metaParts.push(state.diary.length === 1 ? t('sidebar.diaryEntryOne') : t('sidebar.diaryEntries', { count: state.diary.length }));
    }
    if (state.marks.length) {
      metaParts.push(state.marks.length === 1 ? t('sidebar.markOne') : t('sidebar.marksCount', { count: state.marks.length }));
    }
    const countLabel = metaParts.join(' · ');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sidebar-collapse-trigger diary-sidebar-open-btn';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.innerHTML = `${collapseTriggerStart(icons.diary, t('sidebar.diary'))}${countLabel ? `<span class="diary-sidebar-open-meta">${escHtml(countLabel)}<span class="diary-sidebar-open-hint" aria-hidden="true">›</span></span>` : '<span class="diary-sidebar-open-hint diary-sidebar-open-hint--solo" aria-hidden="true">›</span>'}`;
    btn.title = t('sidebar.openDiary');
    btn.addEventListener('click', () =>
      openDiaryModal({ state, diary: state.diary, marks: state.marks, registry }, playUiClick)
    );
    diaryCard.appendChild(btn);
    hud.appendChild(diaryCard);
  }

  wireSidebarDetails(hud, sidebarSections, onSectionToggle, onInventoryOpened);

  const heroSheetBtn = hud.querySelector<HTMLButtonElement>('[data-open-hero-sheet]');
  if (heroSheetBtn && p) {
    heroSheetBtn.addEventListener('click', () =>
      openCharacterSheetModal({ kind: 'hero', state, registry, character: p }, playUiClick)
    );
  }
  hud.querySelectorAll<HTMLButtonElement>('[data-companion-sheet]').forEach((btn) => {
    const rawId = btn.getAttribute('data-companion-sheet');
    if (!rawId) return;
    const ch = state.party.slice(1).find((x) => x.id === rawId);
    if (!ch) return;
    btn.addEventListener('click', () =>
      openCharacterSheetModal({ kind: 'companion', state, registry, character: ch }, playUiClick)
    );
  });

  return hud;
}
