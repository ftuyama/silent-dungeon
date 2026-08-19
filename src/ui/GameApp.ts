import { ContentRegistry } from '../content/registry.ts';
import {
  applyEffects,
  createInitialState,
  deserializeState,
  enterScene,
  EventBus,
  resolveDualAttrSkillCheck,
  resolveLuckCheck,
  resolveSkillCheck,
  serializeState,
  type GameEvent,
  type LoadedScene,
  type StoryDiceRollBreakdown,
} from '../engine/core/index.ts';
import {
  explorationMoveEffects,
  isExplorationGoalReached,
  pickWildOutcome,
  shouldTriggerEncounter,
  startExplorationCombatEffects,
  wildEncounterVictoryOverride,
} from '../engine/world/index.ts';
import {
  CIRCULO_SKILL_REROLL_REP_COST,
  hasFactionPerkUnlocked,
  hasSupporterPerk,
  syncCompanionPartyWithFriendship,
  tickActiveBuffs,
} from '../engine/progression/index.ts';
import { refreshCombatLogInitiativeLabels } from '../engine/combat/index.ts';
import type { Choice, Effect, GameState } from '../engine/schema/index.ts';
import { isDialogueEncounter } from '../engine/schema/index.ts';
import { isSupporterThemeId, type SupporterThemeId } from '../engine/schema/supporter.ts';
import { GameAudio, type AmbientTheme } from './sound/index.ts';
import { buildDevToolsHref, buildScenesGraphHref } from './campaignUrl.ts';
import { escHtml, preserveExplorationNodeForChoiceEffects } from './gameAppUtils.ts';
import {
  findFirstEmptySaveSlot,
  saveSlotLimit,
  saveStateToSlot,
  readRawSlot as readSaveSlotRaw,
} from './gameAppSaveSlots.ts';
import {
  cycleDayForStreak,
  dailyBonusRewardEffects,
  dailyBonusRewardLabel,
  DAILY_BONUS_CYCLE_LENGTH,
  hasRunDailyBonusToday,
  markRunDailyBonusClaimed,
  registerDailyLogin,
  rewardForCycleDay,
  todayDateKey,
  type DailyBonusMeta,
} from './gameAppDailyBonus.ts';
import {
  applyEventToDailyTasks,
  dailyTaskLabel,
  dailyTaskRewardEffects,
  dailyTaskRewardLabel,
  ensureDailyTasks,
  saveDailyTasks,
  type DailyTaskInstance,
  type DailyTasksState,
} from './gameAppDailyTasks.ts';
import {
  DAILY_COMBAT_CHOICE_ID,
  dailyCombatCopyForChapter,
  dailyCombatEncounterForChapter,
  dailyCombatRewardEffects,
  hasSlotDailyCombatWonToday,
  isDailyCombatEncounter,
  isHubScene,
  markSlotDailyCombatWon,
} from './gameAppDailyCombat.ts';
import { appendCombatLogMessageWithBoldNames, renderCombatInto } from './gameAppCombat.ts';
import { renderDialogueCombatInto } from './gameAppDialogueCombat.ts';
import {
  renderStoryInto,
  resolveSceneArt,
  resolveSceneArtHighlightFrames,
  sceneArtHighlightDedupeKey,
  SCENE_ART_HIGHLIGHT_HOLD_MS_DEFAULT,
  resolveSectionTitleReveal,
  snapshotForSectionTitle,
  type SectionTitleReveal,
  type SectionTitlePrevSnapshot,
  type StoryDiceBannerHost,
  type StoryRenderContext,
  type StoryStatusHighlightRow,
} from './gameAppStory.ts';
import { mountSectionTitleOverlay } from './story/sectionTitleOverlay.ts';
import { shouldStayOnMerchantSceneAfterChoice } from './story/merchantSell.ts';
import {
  buildContextPrimerPayload,
  resolveContextPrimerId,
  type ContextPrimerId,
} from './story/sessionPrimer.ts';
import { formatCampaignHeaderTitle } from './campaignHeaderTitle.ts';
import { showAppToast } from './appToast.ts';
import { attachFocusTrap, focusableElementsIn } from './focusTrap.ts';
import { mountAppChrome, syncAppChrome, fullscreenEdgeBtnGlyph, syncLanguageEdgeButton, syncSidebarEdgeButton, syncVolumeEdgeButton, type AppChromeRefs } from './gameAppShell.ts';
import { openCreditsModal, openDailyHubModal, openLegacyModal as openLegacyModalUi } from './gameAppSidebar.ts';
import { openSupporterModal } from './gameAppSupporter.ts';
import {
  ensureSupporterState,
  loadSupporterMeta,
  metaFromState,
  saveSupporterMeta,
  canExportSave,
} from '../engine/supporter/supporterMeta.ts';
import { mergeSupporterMetaIntoState } from '../engine/supporter/redeemCode.ts';
import { dayAdvanceSubtitle, handleGameEvent } from './gameAppEvents.ts';
import {
  buildGameAppStorageKeys,
  loadDevMode,
  loadFontStep,
  loadOnboardingPrimerVisible,
  loadHubLoopPrimerVisible,
  loadCampPrimerVisible,
  loadExplorationPrimerVisible,
  loadSceneArtHighlightEnabled,
  loadSectionTitleEnabled,
  loadCampAutoSaveEnabled,
  loadSidebarSections,
  loadTimedChoiceMode,
  saveDevMode,
  saveFontStep,
  saveOnboardingPrimerVisible,
  saveHubLoopPrimerVisible,
  saveCampPrimerVisible,
  saveExplorationPrimerVisible,
  saveSceneArtHighlightEnabled,
  saveSectionTitleEnabled,
  saveCampAutoSaveEnabled,
  saveSidebarSections,
  saveTimedChoiceMode,
  type GameAppStorageKeys,
} from './gameAppPreferences.ts';
import './css/styles.css';
import { getLocale, onLocaleChange, setLocale, SUPPORTED_LOCALES, t } from '../i18n/index.ts';
import gameVersionRaw from '../../VERSION?raw';

const GAME_VERSION = gameVersionRaw.trim() || '?';

/** Atraso em cascata entre o início do fade+slide de cada cartão (1.º imediato). */
const STORY_BANNER_BETWEEN_DISMISS_MS = 220;
/** Duração do fade-out (animação CSS). Espelha `--story-banner-fade-duration` em `theme-tokens.css`. */
const STORY_BANNER_FADE_MS = 650;
/** Auto-dismiss de banners `good` / `neutral` (debuff/bad ficam manuais com `autoDismissMs: 0`). */
const STATUS_HIGHLIGHT_GOOD_AUTO_DISMISS_MS = 2800;

export class GameApp {
  private readonly campaignId: string;
  private readonly storageKeys: GameAppStorageKeys;
  private registry: ContentRegistry;
  private bus = new EventBus();
  private audio: GameAudio;
  private state: GameState;
  private root: HTMLElement;
  private chromeRefs: AppChromeRefs | null = null;
  /** `mode:sceneId` após último `scrollTop = 0` em `main` — evita reset em re-render da mesma cena. */
  private lastMainScrollResetKey: string | null = null;
  /** Após escolher uma opção em narrativa, força o scroll ao topo (mesmo se a cena não mudar). */
  private pendingStoryMainScrollTop = false;
  private timedTimer: ReturnType<typeof setTimeout> | null = null;
  private menuOpen = false;
  private menuFocusTrapRelease: (() => void) | null = null;
  /** 0 = 100%, 1 = 110%, 2 = 120% */
  private fontStep = 0;
  /** Modo dev (ferramentas de autor). */
  private devMode = false;
  /** Escolhas com `timedMs` + barra / auto-navegação. */
  private timedChoiceMode = false;
  /** Overlay em ecrã inteiro da arte na primeira visita (`highlight: true`). */
  private sceneArtHighlightEnabled = true;
  /** Overlay de título de seção (ato / hub / exploração). */
  private sectionTitleEnabled = true;
  /** Auto-save ao descansar no acampamento. */
  private campAutoSaveEnabled = true;
  /** Dica de primeiros passos (mostrada uma vez por campanha). */
  private onboardingPrimerVisible = false;
  /** Aviso do loop do hub (acampamento + patrulha) — uma vez por browser. */
  private hubLoopPrimerVisible = false;
  /** Aviso do acampamento (descanso, consumíveis) — uma vez por browser. */
  private campPrimerVisible = false;
  /** Aviso da patrulha / mapa — uma vez por browser. */
  private explorationPrimerVisible = false;
  /** Meta da sessão aparece apenas até a primeira mudança de cena. */
  private sessionObjectiveVisible = true;
  private readonly choiceHotkeyHandler: (e: KeyboardEvent) => void;
  /** Secções colapsáveis (recursos, inventário, facções, personagem…) — persistido em sessionStorage */
  private sidebarSections: Record<string, boolean> = {};
  /** Sequência de logins diários (streak) — persistida em localStorage por campanha. */
  private dailyBonus: DailyBonusMeta = { lastLoginDate: null, streak: 0 };
  /** Tarefas do dia (por slot) — persistidas em localStorage; `null` até salvar/carregar um slot. */
  private dailyTasks: DailyTasksState | null = null;
  /** Tarefas concluídas à espera do pagamento — pago no próximo `render` com o estado assentado. */
  private pendingDailyTaskRewards: DailyTaskInstance[] = [];
  /** Evita que XP/level-up do próprio prêmio conte progresso em outra tarefa. */
  private applyingDailyTaskReward = false;
  /** Slot da gravação ativa (último gravado/carregado); null em partida nova sem gravação. */
  private activeSlot: number | null = null;
  /** Vitória no desafio diário detectada em `combat.end`; prêmio aplicado no commit do estado. */
  private pendingDailyCombatReward = false;
  /** Volume restaurado ao desmutar (último valor > 0). */
  private volumeBeforeMute = 1;
  /** Buffs/debuffs/marcas — fila com fade sequencial no `GameApp` */
  private statusHighlightQueue: StoryStatusHighlightRow[] = [];
  /** Itens recém-adquiridos (grantItem) — mostra banner até o jogador fechar */
  private itemAcquireQueue: string[] = [];
  /** Entradas novas de diário (`addDiary`) — banner até fechar */
  private diaryEntryQueue: string[] = [];
  /** Milagre de fé após quase-morte em combate — banner até fechar */
  private faithMiraclePending = false;
  /** Onda de dismiss da stack: um `render` ao iniciar (delays CSS) e um ao limpar a fila. */
  private statusHighlightDismissChainActive = false;
  private statusHighlightDismissEndTimer: ReturnType<typeof setTimeout> | null = null;
  private diaryBannerFadeTimer: ReturnType<typeof setTimeout> | null = null;
  private diaryBannerExiting = false;
  private itemBannerFadeTimer: ReturnType<typeof setTimeout> | null = null;
  private itemAcquireBannerExiting = false;
  /** Timers de auto-dismiss por banner `good`/`neutral`. */
  private statusHighlightAutoDismissTimers = new Map<symbol, ReturnType<typeof setTimeout>>();
  /** Recursos a pulsar na sidebar após `statusHighlight` de recurso. */
  private pendingSidebarResourcePulse = new Set<string>();
  /** Contagem de itens novos desde a última abertura do inventário. */
  private inventoryNewCount = 0;
  /** Índice até onde som do log do confronto verbal já foi consumido. */
  private dialogueCombatLogCursor: { encounterId: string; index: number } = {
    encounterId: '',
    index: 0,
  };

  /** Índice até onde som/FX do log de combate já foram consumidos (som e FX partilham o mesmo cursor). */
  private combatLogCursor: { encounterId: string; index: number } = { encounterId: '', index: 0 };
  /** Filas de mensagens de twist de boss (cada entrada = um lote mostrado de uma vez). */
  private bossTwistRevealQueue: string[][] = [];
  private bossTwistLayer: HTMLElement | null = null;
  private bossTwistFocusRelease: (() => void) | null = null;
  private bossTwistKeydownHandler: ((e: KeyboardEvent) => void) | null = null;
  /** Rola teste de perícia/sorte: estado só aplica após o overlay (dados já resolvidos no motor). */
  private pendingStoryDiceRoll: {
    nextState: GameState;
    breakdown: StoryDiceRollBreakdown;
    reroll?: {
      preRollState: GameState;
      rolledScene: LoadedScene;
      rollKind: 'skill' | 'dualSkill' | 'luck';
    };
  } | null = null;
  private diceRollIntervalTimer: ReturnType<typeof setInterval> | null = null;
  private diceRollEnterHandler: ((e: KeyboardEvent) => void) | null = null;
  /** Overlay `highlight`: cena ativa se o jogador re-renderizar antes do fim da animação. */
  private activeSceneArtHighlight: string | null = null;
  /** Incrementado a cada `render()` para cancelar timeouts do overlay de arte. */
  private sceneArtHighlightGen = 0;
  /** Reveal pendente (detetado após escolha / combate / exploração). */
  private pendingSectionTitle: SectionTitleReveal | null = null;
  /** Chave ativa do título de seção (interrupt / flush). */
  private activeSectionTitleKey: string | null = null;
  /** Incrementado a cada `render()` para cancelar timeouts do overlay de título. */
  private sectionTitleGen = 0;

  constructor(root: HTMLElement, campaignId: string) {
    this.root = root;
    this.campaignId = campaignId;
    this.storageKeys = buildGameAppStorageKeys(campaignId);
    this.registry = new ContentRegistry(campaignId);
    this.audio = new GameAudio(campaignId);
    const initialVolume = this.audio.getVolume();
    if (initialVolume > 0) this.volumeBeforeMute = initialVolume;
    this.fontStep = loadFontStep(this.storageKeys.fontKey);
    this.timedChoiceMode = loadTimedChoiceMode(this.storageKeys.timedChoiceKey);
    this.sceneArtHighlightEnabled = loadSceneArtHighlightEnabled(this.storageKeys.sceneArtHighlightKey);
    this.sectionTitleEnabled = loadSectionTitleEnabled(this.storageKeys.sectionTitleKey);
    this.campAutoSaveEnabled = loadCampAutoSaveEnabled(this.storageKeys.campAutoSaveKey);
    this.devMode = loadDevMode(this.storageKeys.devModeKey);
    this.onboardingPrimerVisible = loadOnboardingPrimerVisible(this.storageKeys.onboardingPrimerKey);
    this.hubLoopPrimerVisible = loadHubLoopPrimerVisible(this.storageKeys.hubLoopPrimerKey);
    this.campPrimerVisible = loadCampPrimerVisible(this.storageKeys.campPrimerKey);
    this.explorationPrimerVisible = loadExplorationPrimerVisible(this.storageKeys.explorationPrimerKey);
    this.choiceHotkeyHandler = (e: KeyboardEvent): void => {
      const el = e.target;
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
        return;
      }
      if (e.key === ' ') {
        let btn: HTMLButtonElement | null = null;
        if (this.pendingStoryDiceRoll) {
          btn = this.root.querySelector<HTMLButtonElement>(
            '.story-dice-banner button[data-quick-nav-continue]:not([disabled])'
          );
        } else {
          // During status-banner exit, the dismiss control is removed from the DOM; a second
          // Space would otherwise hit the next overlay (diary/item). Consume the key until clear.
          if (
            this.statusHighlightQueue.length > 0 &&
            (this.statusHighlightDismissChainActive ||
              this.statusHighlightDismissEndTimer != null ||
              this.statusHighlightQueue.some((h) => h.exiting))
          ) {
            e.preventDefault();
            return;
          }
          btn = this.root.querySelector<HTMLButtonElement>(
            '.story-shell button[data-quick-nav-continue]:not([disabled])'
          );
        }
        if (btn) {
          e.preventDefault();
          btn.click();
        }
        return;
      }
      if (this.pendingStoryDiceRoll) return;
      if (this.state.mode === 'story') {
        if (!/^[1-9]$/.test(e.key)) return;
        const idx = parseInt(e.key, 10) - 1;
        const btns = this.root.querySelectorAll<HTMLButtonElement>(
          '.story-shell .skill-row .choice, .story-shell .choices .choice'
        );
        const btn = btns[idx];
        if (!btn || btn.disabled) return;
        e.preventDefault();
        btn.click();
        return;
      }
      if (this.state.mode === 'combat' || this.state.mode === 'dialogue_combat') {
        const k = e.key.length === 1 ? e.key.toLowerCase() : '';
        const isDigit = /^[1-9]$/.test(e.key);
        const isLetter = /^[a-z]$/.test(k);
        if (!isDigit && !isLetter) return;
        const targetKey = isDigit ? e.key : k;
        const btn = this.root.querySelector<HTMLButtonElement>(
          `.story-shell button[data-quick-nav-combat="${targetKey}"]:not([disabled])`
        );
        if (!btn) return;
        e.preventDefault();
        btn.click();
      }
    };
    document.addEventListener('keydown', this.choiceHotkeyHandler, true);

    this.bus.subscribe((ev) => {
      this.progressDailyTasks(ev);
      handleGameEvent(ev, {
        onCombatVictory: () => {
          this.audio.playVictory();
          // `combat.end` dispara durante a resolução: `this.state.combat` ainda tem o encounter.
          const encId = this.state.combat?.encounterId;
          if (encId && isDailyCombatEncounter(encId) && this.activeSlot != null) {
            this.pendingDailyCombatReward = true;
          }
        },
        onCombatFlee: () => this.audio.playFlee(),
        onCombatDefeat: () => this.audio.playDefeat(),
        onFaithMiracle: () => {
          this.faithMiraclePending = true;
          this.unlockAudio();
          this.audio.playFaithMiracle();
        },
        onItemAcquired: (itemId) => {
          this.itemAcquireQueue.push(itemId);
          this.inventoryNewCount += 1;
          this.unlockAudio();
          this.audio.playItemAcquire();
        },
        onCompanionRecruited: () => {
          this.unlockAudio();
          this.audio.playCompanionRecruit();
        },
        onXpGained: (amount) => {
          this.enqueueStatusHighlight({
            type: 'statusHighlight',
            variant: 'good',
            title: t('toast.xpGainedTitle', { amount: String(amount) }),
            subtitle: t('toast.xpReceived'),
          });
          this.unlockAudio();
        },
        onDiaryEntryAdded: (text) => {
          this.diaryEntryQueue.push(text);
          this.unlockAudio();
        },
        onCampRest: () => {
          this.unlockAudio();
          this.audio.playCampRest();
        },
        onTimeDayAdvanced: (day) => {
          this.unlockAudio();
          this.audio.playDayAdvance();
          this.enqueueStatusHighlight({
            type: 'statusHighlight',
            variant: 'good',
            title: t('toast.dayTitle', { day: String(day) }),
            subtitle: dayAdvanceSubtitle(day),
          });
        },
        onStatusHighlight: (event) => {
          this.enqueueStatusHighlight(event);
        },
        onLevelUp: (level) => {
          this.unlockAudio();
          this.audio.playLevelUpCelebration();
          this.enqueueStatusHighlight({
            type: 'statusHighlight',
            variant: 'good',
            title: t('story.levelTitleNoName', { level: String(level) }),
            subtitle: t('toast.levelUpSubtitle'),
          });
        },
      });
    });
    this.state = this.mergeSupporterFromStorage(createInitialState(this.registry.data.campaign));
    this.state = this.stabilize(this.state);
    this.applyLegacyBriefingIfNeeded();
    this.processDailyLoginBonus();
    this.sidebarSections = loadSidebarSections(this.storageKeys.sidebarKey);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.menuOpen) {
        this.closeMenu();
      }
    });
    document.addEventListener('fullscreenchange', () => {
      this.syncFullscreenUi();
      this.syncAppFullscreenLayout();
    });
    /** Primeiro gesto (toque ou tecla) desbloqueia AudioContext (política dos browsers). */
    const unlockOnce = (): void => {
      this.unlockAudio();
      document.removeEventListener('pointerdown', unlockOnce, true);
      document.removeEventListener('keydown', unlockOnce, true);
    };
    document.addEventListener('pointerdown', unlockOnce, true);
    document.addEventListener('keydown', unlockOnce, true);
    this.root.addEventListener('click', this.onAppChromeDelegatedClick);
    onLocaleChange(() => {
      this.registry = new ContentRegistry(this.campaignId, getLocale());
      this.state = syncCompanionPartyWithFriendship(this.state, this.registry.data);
      this.state = refreshCombatLogInitiativeLabels(this.state, this.registry.data);
      this.render();
    });
    this.render();
  }

  /** Controlo do trilho lateral — delegado em `#app` para evitar cliques bloqueados por camadas. */
  private onAppChromeDelegatedClick = (e: MouseEvent): void => {
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.closest('[data-app-edge-menu]')) {
      const hBtn = this.chromeRefs?.hamburgerBtn;
      if (!hBtn) return;
      this.toggleMenu();
      hBtn.setAttribute('aria-expanded', this.menuOpen ? 'true' : 'false');
      return;
    }
    if (t.closest('.app-edge-rail-fullscreen')) {
      const btn = t.closest('.app-edge-rail-fullscreen');
      if (!(btn instanceof HTMLButtonElement) || btn.disabled || !this.isFullscreenSupported()) return;
      const want = this.getFullscreenElement() == null;
      void (async () => {
        try {
          if (want) await this.requestGameFullscreen();
          else await this.exitGameFullscreen();
        } catch {
          /* mantém botão alinhado ao estado real */
        }
        this.syncFullscreenUi();
      })();
      return;
    }
    if (t.closest('.app-edge-rail-language')) {
      this.cycleLocale();
      return;
    }
    if (t.closest('.app-edge-rail-volume')) {
      this.toggleMute();
      return;
    }
    if (t.closest('[data-app-edge-sidebar]')) {
      const btn = this.chromeRefs?.sidebarEdgeBtn ?? this.root.querySelector<HTMLButtonElement>('[data-app-edge-sidebar]');
      const sidebar = this.chromeRefs?.sidebarEl ?? this.root.querySelector<HTMLElement>('.player-sidebar');
      if (!btn || !sidebar) return;
      const open = !sidebar.classList.contains('player-sidebar--mobile-open');
      sidebar.classList.toggle('player-sidebar--mobile-open', open);
      syncSidebarEdgeButton(btn, open);
      return;
    }
  };

  /** Login diário (abertura do jogo): avança a sequência; prêmio só em gravação carregada ou salva. */
  private processDailyLoginBonus(): void {
    const { meta } = registerDailyLogin(this.campaignId);
    this.dailyBonus = meta;
  }

  /** Bônus diário: primeira carga ou gravação do dia por run (UUID) recebe o prêmio do ciclo. */
  private applyDailyBonusIfNeededForRun(): void {
    const today = todayDateKey();
    const runId = this.state.runId;
    if (!runId || hasRunDailyBonusToday(this.campaignId, runId, today)) return;
    const cycleDay = cycleDayForStreak(this.dailyBonus.streak);
    const reward = rewardForCycleDay(cycleDay);
    this.state = this.stabilize(
      applyEffects(this.state, dailyBonusRewardEffects(reward), this.ctx())
    );
    markRunDailyBonusClaimed(this.campaignId, runId, today);
    this.enqueueStatusHighlight({
      type: 'statusHighlight',
      variant: 'good',
      title: t('dailyBonus.slotTitle', {
        day: String(cycleDay),
        total: String(DAILY_BONUS_CYCLE_LENGTH),
      }),
      subtitle: t('dailyBonus.slotSubtitle', { reward: dailyBonusRewardLabel(reward) }),
    });
  }

  /** Define o slot ativo e garante as tarefas do dia dele (persistidas em localStorage). */
  private activateDailyTasksForSlot(slot: number): void {
    this.activeSlot = slot;
    this.dailyTasks = ensureDailyTasks(this.campaignId, slot, this.state);
    this.pendingDailyTaskRewards = [];
  }

  /**
   * Avança o progresso das tarefas do dia. Eventos do bus disparam a meio de
   * transições de estado, por isso só o progresso é registado aqui; o pagamento
   * fica pendente e é aplicado no próximo `render`, com `this.state` assentado.
   */
  private progressDailyTasks(ev: GameEvent | null): void {
    if (!this.dailyTasks || this.applyingDailyTaskReward) return;
    const { state: next, completed } = applyEventToDailyTasks(this.dailyTasks, ev, this.state);
    if (next === this.dailyTasks) return;
    this.dailyTasks = next;
    if (this.activeSlot != null) saveDailyTasks(this.campaignId, this.activeSlot, next);
    this.pendingDailyTaskRewards.push(...completed);
  }

  /** Paga prêmios de tarefas concluídas (fora de combate) e auto-salva o slot ativo. */
  private flushDailyTaskRewards(): void {
    if (this.pendingDailyTaskRewards.length === 0) return;
    if (this.state.mode === 'combat' || this.state.mode === 'dialogue_combat') return;
    const completed = this.pendingDailyTaskRewards;
    this.pendingDailyTaskRewards = [];
    this.applyingDailyTaskReward = true;
    try {
      for (const task of completed) {
        this.state = this.stabilize(
          applyEffects(this.state, dailyTaskRewardEffects(task.reward), this.ctx())
        );
        this.enqueueStatusHighlight({
          type: 'statusHighlight',
          variant: 'good',
          title: t('dailyTasks.completeTitle', { task: dailyTaskLabel(task) }),
          subtitle: t('dailyTasks.completeSubtitle', { reward: dailyTaskRewardLabel(task.reward) }),
        });
      }
    } finally {
      this.applyingDailyTaskReward = false;
    }
    if (this.activeSlot != null) {
      saveStateToSlot(this.campaignId, this.activeSlot, this.state, this.devMode);
    }
  }

  /** Desafio diário disponível? Gravação ativa, cena hub, encounter do capítulo e ainda sem vitória hoje. */
  private dailyCombatAvailable(scene: LoadedScene): boolean {
    return (
      this.activeSlot != null &&
      isHubScene(scene) &&
      dailyCombatEncounterForChapter(this.state.chapter) != null &&
      !hasSlotDailyCombatWonToday(this.campaignId, this.activeSlot)
    );
  }

  /** Inicia o desafio diário a partir do hub atual; vitória e fuga voltam ao hub. */
  private startDailyHubCombat(): void {
    const scene = this.registry.getScene(this.state.sceneId);
    if (!scene || !this.dailyCombatAvailable(scene)) return;
    const encounterId = dailyCombatEncounterForChapter(this.state.chapter);
    if (!encounterId) return;
    const hubSceneId = this.state.sceneId;
    this.unlockAudio();
    const effects: Effect[] = [
      {
        op: 'startCombat',
        encounterId,
        onVictory: hubSceneId,
        onFlee: hubSceneId,
        onDefeat: 'shared/game_over',
      },
    ];
    this.state = this.stabilize(applyEffects(this.state, effects, this.ctx()));
    this.render();
  }

  /** Prêmio fixo do desafio diário — aplicado após `combat.end` com vitória (nunca no clique). */
  private applyDailyCombatRewardIfPending(): void {
    if (!this.pendingDailyCombatReward) return;
    this.pendingDailyCombatReward = false;
    const slot = this.activeSlot;
    if (slot == null) return;
    this.state = this.stabilize(
      applyEffects(this.state, dailyCombatRewardEffects(), this.ctx())
    );
    markSlotDailyCombatWon(this.campaignId, slot);
    const copy = dailyCombatCopyForChapter(this.state.chapter);
    this.enqueueStatusHighlight({
      type: 'statusHighlight',
      variant: 'good',
      title: copy?.victoryTitle ?? '',
      subtitle: copy?.victorySubtitle ?? '',
    });
  }

  private buildSessionObjective(): string {
    const { chapter, day, sceneId } = this.state;
    const supply = this.state.resources.supply;
    const faith = this.state.resources.faith ?? 0;
    const corruption = this.state.resources.corruption ?? 0;
    const gold = this.state.resources.gold ?? 0;
    if (chapter === 1 && day <= 2) {
      return t('session.objectiveEarly');
    }
    if (supply <= 2) {
      return t('session.objectiveSupply');
    }
    if (faith >= 5) {
      return t('session.objectiveFaithHigh');
    }
    if (chapter <= 2) {
      return t('session.objectiveChapter2');
    }
    if (corruption >= 6) {
      return t('session.objectiveCorruption');
    }
    if (faith <= 1) {
      return t('session.objectiveFaithLow');
    }
    if (chapter >= 4 && chapter <= 5 && gold >= 20) {
      return t('session.objectiveGold');
    }
    if (sceneId.startsWith('act2/camp/') || sceneId.startsWith('act5/camp/')) {
      return t('session.objectiveCamp');
    }
    return t('session.objectiveDefault');
  }

  private applyLegacyBriefingIfNeeded(): void {
    const legacy = this.state.legacy;
    if (legacy.echoes <= 0) return;
    const stamp = `${legacy.echoes}:${legacy.lastRunSummary}:${legacy.titles.join('|')}`;
    try {
      if (localStorage.getItem(this.storageKeys.legacyBriefingKey) === stamp) return;
      const topTitle = legacy.titles[legacy.titles.length - 1];
      if (topTitle) {
        this.enqueueStatusHighlight({
          type: 'statusHighlight',
          variant: 'neutral',
          title: t('legacy.activeTitle', { title: topTitle }),
          subtitle:
            legacy.lastRunEchoGain > 0
              ? t('legacy.echoGain', { count: legacy.lastRunEchoGain })
              : t('legacy.echoPreserved'),
        });
      }
      if (legacy.lastRunSummary.trim().length > 0) {
        this.state = this.stabilize(
          applyEffects(
            this.state,
            [{ op: 'addDiary', text: t('legacy.diaryPrefix', { summary: legacy.lastRunSummary }) }],
            this.ctx()
          )
        );
      }
      localStorage.setItem(this.storageKeys.legacyBriefingKey, stamp);
    } catch {
      /* noop */
    }
  }

  private isLocalhostHost(): boolean {
    const host = window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
  }

  private cycleFontSize(): void {
    this.fontStep = (this.fontStep + 1) % 3;
    saveFontStep(this.storageKeys.fontKey, this.fontStep);
    this.closeMenu();
    this.render();
  }

  private showToast(message: string, variant: 'info' | 'error' | 'success' = 'info'): void {
    const el = this.chromeRefs?.toastRegion;
    if (!el) return;
    showAppToast(el, message, variant);
  }

  private focusFirstInMenuDrawer(): void {
    const drawer =
      this.chromeRefs?.menuDrawer ?? this.root.querySelector<HTMLElement>('.menu-drawer');
    if (!drawer) return;
    focusableElementsIn(drawer)[0]?.focus();
  }

  private exportSaveToClipboard(): void {
    this.unlockAudio();
    const json = serializeState(this.state);
    void navigator.clipboard.writeText(json).then(
      () => {
        this.showToast(t('toast.exportSuccessJson'));
        this.closeMenu();
      },
      () => {
        prompt('Copia manualmente o estado:', json);
        this.closeMenu();
      }
    );
  }

  private importSaveFromClipboard(): void {
    this.unlockAudio();
    const applyRawSave = (raw: string): void => {
      const parsed = deserializeState(raw);
      if (parsed.campaignId !== this.campaignId) {
        this.showToast(
          t('toast.wrongCampaign', {
            saveCampaign: parsed.campaignId,
            activeCampaign: this.campaignId,
          }),
          'error'
        );
        return;
      }
      this.state = this.mergeSupporterFromStorage(parsed);
      this.state = this.stabilize(this.state);
      this.render();
      this.closeMenu();
    };
    void navigator.clipboard.readText().then(
      (raw) => {
        if (!raw?.trim()) {
          this.showToast(t('toast.clipboardEmpty'), 'error');
          return;
        }
        try {
          applyRawSave(raw);
        } catch {
          this.showToast(t('toast.importInvalidClipboard'), 'error');
        }
      },
      () => {
        const pasted = prompt(t('menu.importPrompt'));
        if (!pasted?.trim()) {
          this.closeMenu();
          return;
        }
        try {
          applyRawSave(pasted);
        } catch {
          this.showToast(t('toast.importInvalidShort'), 'error');
        }
      }
    );
  }

  private showCredits(): void {
    this.unlockAudio();
    openCreditsModal({
      campaignName: this.registry.data.campaign.name,
      gameVersion: GAME_VERSION,
      state: this.state,
      playUiClick: () => this.audio.playUiClick(),
    });
    this.closeMenu();
  }

  private canOpenSidebarSection(key: string): boolean {
    const visitedCount = Object.keys(this.state.visitedScenes).length;
    if (key === 'inventario') {
      return this.state.chapter >= 2 || visitedCount >= 6;
    }
    if (key === 'faccoes') {
      const rep = this.state.reputation;
      const repTouched = rep.vigilia !== 0 || rep.circulo !== 0 || rep.culto !== 0;
      if (this.state.flags['add_rep_ever']) return true;
      return this.state.chapter >= 2 || visitedCount >= 10 || repTouched;
    }
    return true;
  }

  private syncSidebarDisclosureSections(): void {
    let changed = false;
    for (const key of Object.keys(this.sidebarSections)) {
      if (this.sidebarSections[key] === true && !this.canOpenSidebarSection(key)) {
        this.sidebarSections[key] = false;
        changed = true;
      }
    }
    if (changed) saveSidebarSections(this.storageKeys.sidebarKey, this.sidebarSections);
  }

  private unlockAudio(): void {
    this.audio.startAmbientWhenReady();
    this.syncAmbientTheme();
    this.syncLowHpAudio();
  }

  private removeBossTwistOverlayListeners(): void {
    if (this.bossTwistFocusRelease) {
      this.bossTwistFocusRelease();
      this.bossTwistFocusRelease = null;
    }
    if (this.bossTwistKeydownHandler) {
      window.removeEventListener('keydown', this.bossTwistKeydownHandler, true);
      this.bossTwistKeydownHandler = null;
    }
  }

  private dismissBossTwistOverlay(): void {
    this.audio.playUiClick();
    this.removeBossTwistOverlayListeners();
    if (this.bossTwistLayer) {
      this.bossTwistLayer.remove();
      this.bossTwistLayer = null;
    }
    this.tryShowNextBossTwistOverlay();
  }

  private tryShowNextBossTwistOverlay(): void {
    if (typeof document === 'undefined') return;
    if (this.bossTwistLayer != null || this.bossTwistRevealQueue.length === 0) return;
    const batch = this.bossTwistRevealQueue.shift()!;
    const c = this.state.combat;
    const combatantNames =
      c != null
        ? [
            ...this.state.party.map((m) => m.name),
            ...c.enemies
              .map((e) => {
                const enc = this.registry.data.encounters[c.encounterId];
                if (enc && isDialogueEncounter(enc)) {
                  return this.registry.data.dialogueEnemies[e.defId]?.name;
                }
                return this.registry.data.enemies[e.defId]?.name;
              })
              .filter((n): n is string => Boolean(n)),
          ]
        : this.state.party.map((m) => m.name);

    const layer = document.createElement('div');
    layer.className = 'combat-boss-twist-layer';
    layer.setAttribute('role', 'dialog');
    layer.setAttribute('aria-modal', 'true');
    layer.setAttribute('aria-labelledby', 'combat-boss-twist-title');

    const backdrop = document.createElement('button');
    backdrop.type = 'button';
    backdrop.className = 'combat-boss-twist-backdrop';
    backdrop.setAttribute('aria-label', t('sidebar.close'));

    const panel = document.createElement('div');
    panel.className = 'combat-boss-twist-panel';

    const title = document.createElement('h2');
    title.id = 'combat-boss-twist-title';
    title.className = 'combat-boss-twist-title';
    title.textContent = t('combat.combatTwist');

    const bodyWrap = document.createElement('div');
    bodyWrap.className = 'combat-boss-twist-body';
    for (const msg of batch) {
      const p = document.createElement('p');
      p.className = 'combat-boss-twist-para';
      appendCombatLogMessageWithBoldNames(p, msg, combatantNames);
      bodyWrap.appendChild(p);
    }

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'combat-boss-twist-continue';
    btn.textContent = t('combat.continueDash');
    btn.addEventListener('click', () => this.dismissBossTwistOverlay());
    backdrop.addEventListener('click', () => this.dismissBossTwistOverlay());

    this.bossTwistKeydownHandler = (e: KeyboardEvent) => {
      const dismiss =
        e.key === 'Escape' || e.key === ' ' || e.code === 'Space';
      if (!dismiss) return;
      e.preventDefault();
      this.dismissBossTwistOverlay();
    };
    window.addEventListener('keydown', this.bossTwistKeydownHandler, true);

    layer.appendChild(backdrop);
    panel.appendChild(title);
    panel.appendChild(bodyWrap);
    panel.appendChild(btn);
    layer.appendChild(panel);
    this.root.appendChild(layer);
    this.bossTwistLayer = layer;
    this.bossTwistFocusRelease = attachFocusTrap(layer);
    btn.focus();
  }

  private enqueueBossTwistReveal(messages: string[]): void {
    if (!messages.length) return;
    this.bossTwistRevealQueue.push([...messages]);
    this.tryShowNextBossTwistOverlay();
  }

  private flushBossTwistOverlayOnLeaveCombat(): void {
    this.bossTwistRevealQueue = [];
    this.removeBossTwistOverlayListeners();
    if (this.bossTwistLayer) {
      this.bossTwistLayer.remove();
      this.bossTwistLayer = null;
    }
  }

  private resolveAmbientTheme(): AmbientTheme {
    if (this.state.mode === 'combat' && this.state.combat) {
      const id = this.state.combat.encounterId;
      if (id.startsWith('boss_') || id.includes('boss')) return 'boss';
      if (id.startsWith('kael_rival')) return 'combat_rival';
      return 'combat';
    }
    if (this.state.mode === 'dialogue_combat' && this.state.dialogueCombat) {
      return 'dialogue_combat';
    }
    const sceneTheme = this.registry.getScene(this.state.sceneId)?.frontmatter.ambientTheme;
    if (sceneTheme) {
      return sceneTheme;
    }
    return 'explore';
  }

  private syncAmbientTheme(): void {
    this.audio.setAmbientTheme(this.resolveAmbientTheme());
  }

  private syncLowHpAudio(): void {
    const lead = this.state.party[0];
    if (!lead) {
      this.audio.syncLowHp(0, 1);
      return;
    }
    this.audio.syncLowHp(lead.hp, lead.maxHp);
  }

  private resolveVisualTheme(): SupporterThemeId | 'bone' | 'snow' | 'void' | 'ash' | 'lava' | null {
    const supporterTheme = this.state.legacy.supporter?.activeTheme;
    if (isSupporterThemeId(supporterTheme)) {
      return supporterTheme;
    }
    if (this.state.chapter === 8 || this.state.sceneId.startsWith('act8/')) return 'lava';
    if (this.state.chapter === 6 || this.state.sceneId.startsWith('act6/')) return 'void';
    if (this.state.chapter === 7 || this.state.sceneId.startsWith('act7/')) return 'ash';
    if (this.state.chapter === 5 || this.state.sceneId.startsWith('act5/')) return 'snow';
    if (this.state.chapter === 4 || this.state.sceneId.startsWith('act4/')) return 'bone';
    return null;
  }

  private syncVisualTheme(): void {
    const t = this.resolveVisualTheme();
    if (t == null) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', t);
    }
    this.syncSupporterFrame();
  }

  private syncSupporterFrame(): void {
    const show =
      this.state.legacy.supporter?.activeFrame === 'supporter' &&
      hasSupporterPerk(this.state, 'frame_supporter');
    if (show) {
      document.documentElement.setAttribute('data-supporter-frame', 'true');
    } else {
      document.documentElement.removeAttribute('data-supporter-frame');
    }
  }

  private ctx(): { sceneId: string; data: import('../engine/data/index.ts').GameData; bus: EventBus } {
    return { sceneId: this.state.sceneId, data: this.registry.data, bus: this.bus };
  }

  private cancelStatusHighlightDismissalPipeline(): void {
    if (this.statusHighlightDismissEndTimer != null) {
      clearTimeout(this.statusHighlightDismissEndTimer);
      this.statusHighlightDismissEndTimer = null;
    }
    this.clearStatusHighlightAutoDismissTimers();
    for (const h of this.statusHighlightQueue) {
      if (h.exiting) delete h.exiting;
    }
    this.statusHighlightDismissChainActive = false;
  }

  /**
   * Um clique: marca todos com `exiting`, um único `render` (cada cartão usa
   * `animation-delay` = índice × `STORY_BANNER_BETWEEN_DISMISS_MS`) e limpa a fila
   * após a última animação — sem re-renders intermediários que reiniciavam o CSS.
   */
  private beginStatusHighlightStackDismiss(): void {
    if (this.statusHighlightQueue.length === 0) return;
    // Sob overlays cinemáticos (arte / título de seção), um `render()` mataria a animação.
    if (this.activeSceneArtHighlight != null || this.activeSectionTitleKey != null) {
      this.clearStatusHighlightAutoDismissTimers();
      this.statusHighlightQueue = [];
      this.statusHighlightDismissChainActive = false;
      return;
    }
    if (
      this.statusHighlightDismissChainActive ||
      this.statusHighlightDismissEndTimer != null ||
      this.statusHighlightQueue.some((h) => h.exiting)
    ) {
      return;
    }
    this.clearStatusHighlightAutoDismissTimers();
    const n = this.statusHighlightQueue.length;
    this.statusHighlightDismissChainActive = true;
    for (const h of this.statusHighlightQueue) {
      h.exiting = true;
    }
    this.render();
    const totalMs = Math.max(0, n - 2) * STORY_BANNER_BETWEEN_DISMISS_MS + STORY_BANNER_FADE_MS;
    this.statusHighlightDismissEndTimer = setTimeout(() => {
      this.statusHighlightDismissEndTimer = null;
      if (!this.statusHighlightDismissChainActive) return;
      this.statusHighlightQueue = [];
      this.statusHighlightDismissChainActive = false;
      this.pendingSidebarResourcePulse.clear();
      this.render();
    }, totalMs);
  }

  /**
   * Enfileira banner de status. Banners `good`/`neutral` auto-fecham após
   * `autoDismissMs` (default 2800); `bad`/`debuff` ou `autoDismissMs: 0` ficam manuais.
   */
  private enqueueStatusHighlight(event: Extract<GameEvent, { type: 'statusHighlight' }>): void {
    const row: StoryStatusHighlightRow = { ...event };
    this.statusHighlightQueue.push(row);
    this.queueSidebarResourcePulseFromHighlight(event);
    const manual =
      event.variant === 'bad' ||
      event.variant === 'debuff' ||
      event.autoDismissMs === 0;
    if (manual) return;
    const delay =
      event.autoDismissMs != null && event.autoDismissMs > 0
        ? event.autoDismissMs
        : STATUS_HIGHLIGHT_GOOD_AUTO_DISMISS_MS;
    const token = Symbol('statusHighlight');
    (row as StoryStatusHighlightRow & { _autoToken?: symbol })._autoToken = token;
    const timer = setTimeout(() => {
      this.statusHighlightAutoDismissTimers.delete(token);
      if (this.statusHighlightQueue.length === 0) return;
      if (
        this.statusHighlightDismissChainActive ||
        this.statusHighlightDismissEndTimer != null ||
        this.statusHighlightQueue.some((h) => h.exiting)
      ) {
        return;
      }
      this.beginStatusHighlightStackDismiss();
    }, delay);
    this.statusHighlightAutoDismissTimers.set(token, timer);
  }

  private queueSidebarResourcePulseFromHighlight(
    event: Extract<GameEvent, { type: 'statusHighlight' }>
  ): void {
    const title = event.title;
    const pairs: Array<[string, string]> = [
      [t('engine.resourceGold'), 'gold'],
      [t('engine.resourceSupply'), 'supply'],
      [t('engine.resourceFaith'), 'faith'],
      [t('engine.resourceCorruption'), 'corruption'],
      [t('sidebar.gold'), 'gold'],
      [t('sidebar.supply'), 'supply'],
      [t('sidebar.faith'), 'faith'],
      [t('sidebar.corruption'), 'corruption'],
    ];
    let matched = false;
    for (const [label, key] of pairs) {
      if (label && title.includes(label)) {
        this.pendingSidebarResourcePulse.add(key);
        matched = true;
      }
    }
    if (matched) {
      window.setTimeout(() => {
        this.pendingSidebarResourcePulse.clear();
      }, 900);
    }
  }

  private clearStatusHighlightAutoDismissTimers(): void {
    for (const t of this.statusHighlightAutoDismissTimers.values()) {
      clearTimeout(t);
    }
    this.statusHighlightAutoDismissTimers.clear();
  }

  private cancelDiaryBannerPipeline(): void {
    if (this.diaryBannerFadeTimer != null) {
      clearTimeout(this.diaryBannerFadeTimer);
      this.diaryBannerFadeTimer = null;
    }
    this.diaryBannerExiting = false;
  }

  private beginDiaryBannerDismiss(): void {
    if (this.diaryEntryQueue.length === 0) return;
    if (this.activeSceneArtHighlight != null || this.activeSectionTitleKey != null) {
      this.cancelDiaryBannerPipeline();
      this.diaryEntryQueue = [];
      return;
    }
    if (this.diaryBannerFadeTimer != null || this.diaryBannerExiting) return;
    this.diaryBannerExiting = true;
    this.render();
    this.diaryBannerFadeTimer = setTimeout(() => {
      this.diaryBannerFadeTimer = null;
      this.diaryEntryQueue = [];
      this.diaryBannerExiting = false;
      this.render();
    }, STORY_BANNER_FADE_MS);
  }

  private cancelItemBannerPipeline(): void {
    if (this.itemBannerFadeTimer != null) {
      clearTimeout(this.itemBannerFadeTimer);
      this.itemBannerFadeTimer = null;
    }
    this.itemAcquireBannerExiting = false;
  }

  private beginItemAcquireBannerDismiss(): void {
    if (this.itemAcquireQueue.length === 0) return;
    if (this.activeSceneArtHighlight != null || this.activeSectionTitleKey != null) {
      this.cancelItemBannerPipeline();
      this.itemAcquireQueue = [];
      return;
    }
    if (this.itemBannerFadeTimer != null || this.itemAcquireBannerExiting) return;
    this.itemAcquireBannerExiting = true;
    this.render();
    this.itemBannerFadeTimer = setTimeout(() => {
      this.itemBannerFadeTimer = null;
      this.itemAcquireQueue = [];
      this.itemAcquireBannerExiting = false;
      this.render();
    }, STORY_BANNER_FADE_MS);
  }

  private cancelAllStoryBannerAnimations(): void {
    this.cancelStatusHighlightDismissalPipeline();
    this.cancelDiaryBannerPipeline();
    this.cancelItemBannerPipeline();
  }

  /** `stabilize` runs here once; combat UI must not pre-stabilize or onEnter overlays are trimmed away. */
  private commitCombatState(s: GameState): void {
    const prevSnapshot = snapshotForSectionTitle(this.state);
    const prevScene = this.state.sceneId;
    const prevDiaryQueueLen = this.diaryEntryQueue.length;
    const prevStatusQueueLen = this.statusHighlightQueue.length;
    const prevItemAcquireQueueLen = this.itemAcquireQueue.length;
    const xpGain = s.lastCombatXpGain;
    this.state = this.stabilize(s);
    this.applyDailyCombatRewardIfPending();
    this.trimOverlayQueuesIfSceneChanged(
      prevScene,
      prevDiaryQueueLen,
      prevStatusQueueLen,
      prevItemAcquireQueueLen
    );
    if (xpGain != null && xpGain > 0) {
      const xpTitle = `+${xpGain} XP`;
      if (!this.statusHighlightQueue.some((h) => h.title === xpTitle)) {
        this.enqueueStatusHighlight({
          type: 'statusHighlight',
          variant: 'good',
          title: xpTitle,
          subtitle: t('toast.xpReceived'),
        });
        this.unlockAudio();
      }
    }
    this.queueSectionTitleFromTransition(prevSnapshot);
    this.render();
  }

  /** Mantém só overlays ligados à transição atual (como diário / destaques / itens). */
  private trimOverlayQueuesIfSceneChanged(
    prevScene: string,
    prevDiaryLen: number,
    prevStatusLen: number,
    prevItemAcquireLen: number
  ): void {
    if (this.state.sceneId === prevScene) return;
    this.sessionObjectiveVisible = false;
    this.cancelAllStoryBannerAnimations();

    this.diaryEntryQueue = this.diaryEntryQueue.slice(prevDiaryLen);
    this.statusHighlightQueue = this.statusHighlightQueue.slice(prevStatusLen);
    this.itemAcquireQueue = this.itemAcquireQueue.slice(prevItemAcquireLen);
  }

  private mergeSupporterFromStorage(state: GameState): GameState {
    const meta = loadSupporterMeta(this.campaignId);
    return mergeSupporterMetaIntoState(ensureSupporterState(state), meta);
  }

  private persistSupporterMeta(): void {
    saveSupporterMeta(this.campaignId, metaFromState(this.state));
  }

  /** Não reentrar em cenas narrativas enquanto o combate está ativo (evita sobrescrever mode). */
  private stabilize(state: GameState): GameState {
    state = syncCompanionPartyWithFriendship(state, this.registry.data);
    if (state.mode === 'combat' || state.mode === 'dialogue_combat') return state;
    let s = state;
    for (let i = 0; i < 14; i++) {
      const sc = this.registry.getScene(s.sceneId);
      if (!sc) return s;
      const before = s.sceneId;
      s = enterScene(s, sc, this.registry.data, this.bus);
      if (s.sceneId === before) return s;
    }
    return s;
  }

  private applyExplorationMove(edgeId: string): void {
    const ex = this.state.exploration;
    const getG = this.registry.ui.getExplorationGraph;
    if (!ex || !getG) return;
    const graph = getG(ex.graphId);
    if (!graph) return;
    if (isExplorationGoalReached(this.state, graph)) return;
    const lead = this.state.party[0];
    if (lead !== undefined && lead.stress >= 4) return;
    const prevSnapshot = snapshotForSectionTitle(this.state);
    const resolved = explorationMoveEffects({
      graph,
      fromNodeId: ex.nodeId,
      edgeId,
    });
    if (!resolved.ok) return;
    const { edge, toNode } = resolved;
    const goalFlagKey = toNode.goalFlag ?? 'act2_explore_goal_reached';
    const reachedGoalNow = toNode.isGoal === true && this.state.flags[goalFlagKey] !== true;
    const effs: Effect[] = [
      { op: 'adjustLeadStress', delta: 1 },
      { op: 'setExploration', graphId: ex.graphId, nodeId: edge.to },
    ];
    if (toNode.isGoal) {
      effs.push({
        op: 'setFlag',
        key: goalFlagKey,
        value: true,
      });
    }
    if (toNode.visitFlag) {
      effs.push({
        op: 'setFlag',
        key: toNode.visitFlag,
        value: true,
      });
    }
    let s = applyEffects(this.state, effs, this.ctx());
    s = { ...s, timedChoiceDeadline: null };
    const roll = shouldTriggerEncounter(s, edge.encounterChance);
    s = { ...s, rngSeed: roll.nextSeed };
    if (reachedGoalNow) {
      const exploreGoalSubtitle: Record<string, string> = {
        act2_catacomb: t('toast.exploreGoalAct2'),
        act3_depths: t('toast.exploreGoalAct3'),
        act5_frost: t('toast.exploreGoalAct5'),
        act6_fractured_nave: t('toast.exploreGoalAct6'),
        act8_magma: t('toast.exploreGoalAct8'),
      };
      this.enqueueStatusHighlight({
        type: 'statusHighlight',
        variant: 'good',
        title: t('toast.exploreGoalTitle'),
        subtitle: exploreGoalSubtitle[ex.graphId] ?? t('toast.exploreGoalDefault'),
        autoDismissMs: 0,
      });
      this.unlockAudio();
      this.audio.playCheckSuccess();
    }
    if (!roll.trigger) {
      this.state = this.stabilize(s);
      this.queueSectionTitleFromTransition(prevSnapshot);
      this.pendingStoryMainScrollTop = true;
      this.render();
      return;
    }
    const pick = pickWildOutcome(s, ex.graphId);
    s = { ...s, rngSeed: pick.nextSeed };
    if (pick.kind === 'scene') {
      s = { ...s, sceneId: pick.sceneId };
      s = tickActiveBuffs(s);
      this.state = this.stabilize(s);
      this.queueSectionTitleFromTransition(prevSnapshot);
      this.pendingStoryMainScrollTop = true;
      this.render();
      return;
    }
    const stoneVictory = wildEncounterVictoryOverride(ex.graphId, pick.encounterId);
    s = applyEffects(
      s,
      startExplorationCombatEffects(pick.encounterId, this.state.sceneId, stoneVictory),
      this.ctx()
    );
    this.state = this.stabilize(s);
    this.queueSectionTitleFromTransition(prevSnapshot);
    this.pendingStoryMainScrollTop = true;
    this.render();
  }

  private applyChoice(choice: Choice): void {
    this.unlockAudio();
    const horrific = choice.commitSfx === 'horrific_sacrifice';
    if (horrific) {
      this.audio.playHorrificSacrificeCommit();
    }
    if (this.timedTimer) {
      clearTimeout(this.timedTimer);
      this.timedTimer = null;
    }
    const id = choice.id;
    if (id?.startsWith('explore_move_')) {
      if (!horrific) this.audio.playUiClick();
      this.applyExplorationMove(id.slice('explore_move_'.length));
      return;
    }
    if (id === DAILY_COMBAT_CHOICE_ID) {
      if (!horrific) this.audio.playUiClick();
      this.startDailyHubCombat();
      return;
    }
    const wantsEchoShop = choice.effects.some((e) => e.op === 'openEchoShop');
    const wantsSupporterShop = choice.effects.some((e) => e.op === 'openSupporterShop');
    const engineEffects = choice.effects.filter(
      (e) => e.op !== 'openEchoShop' && e.op !== 'openSupporterShop'
    );
    const prevScene = this.state.sceneId;
    const prevChapter = this.state.chapter;
    const prevSupply = this.state.resources.supply;
    const prevSnapshot = snapshotForSectionTitle(this.state);
    const prevDiaryQueueLen = this.diaryEntryQueue.length;
    const prevStatusQueueLen = this.statusHighlightQueue.length;
    const prevItemAcquireQueueLen = this.itemAcquireQueue.length;
    const effects = preserveExplorationNodeForChoiceEffects(engineEffects, this.state.exploration);
    let s = applyEffects(this.state, effects, this.ctx());
    s = { ...s, timedChoiceDeadline: null };
    if (choice.next && s.mode === 'story') {
      const currentScene = this.registry.getScene(prevScene);
      const stayOnMerchant = shouldStayOnMerchantSceneAfterChoice(
        currentScene?.frontmatter.ambientTheme,
        choice
      );
      if (!stayOnMerchant) {
        s = { ...s, sceneId: choice.next };
      }
    }
    if (s.sceneId !== prevScene) {
      s = tickActiveBuffs(s);
    }
    this.state = this.stabilize(s);
    if (!horrific) {
      if (this.state.chapter > prevChapter) {
        this.audio.playChapterDescent();
      } else {
        this.audio.playUiClick();
      }
    }
    this.trimOverlayQueuesIfSceneChanged(
      prevScene,
      prevDiaryQueueLen,
      prevStatusQueueLen,
      prevItemAcquireQueueLen
    );
    this.queueSectionTitleFromTransition(prevSnapshot);
    this.pendingStoryMainScrollTop = true;
    const campRestRequested = engineEffects.some((e) => e.op === 'campRest');
    if (campRestRequested && prevSupply >= 1) {
      this.autoSaveAfterCampRest();
    }
    this.render();
    if (wantsEchoShop) {
      this.openLegacyModal(this.isSettlementScene());
    }
    if (wantsSupporterShop) {
      this.openSupporterShopModal();
    }
  }

  private isSettlementScene(): boolean {
    const sid = this.state.sceneId;
    return (
      sid === 'shared/game_over' ||
      sid === 'endings/epilogue_depths' ||
      sid === 'endings/epilogue_true_depths'
    );
  }

  private openSupporterShopModal(): void {
    this.unlockAudio();
    openSupporterModal({
      campaignId: this.campaignId,
      state: this.state,
      playUiClick: () => this.audio.playUiClick(),
      onStateChange: (s, meta) => {
        this.state = s;
        saveSupporterMeta(this.campaignId, meta);
        this.syncVisualTheme();
        this.persistSupporterMeta();
        this.render();
      },
    });
  }

  private openLegacyModal(showRestart = false): void {
    this.unlockAudio();
    openLegacyModalUi({
      state: this.state,
      campaign: this.registry.data.campaign,
      registry: this.registry,
      playUiClick: () => this.audio.playUiClick(),
      showRestart,
      onPurchase: (upgradeId) => this.purchaseEchoUpgrade(upgradeId, showRestart),
      onRestart: showRestart ? () => this.restartFromEchoShop() : undefined,
    });
  }

  private purchaseEchoUpgrade(upgradeId: string, showRestart: boolean): void {
    const before = this.state.legacy.unlockedUpgrades.length;
    const s = applyEffects(
      this.state,
      [{ op: 'purchaseLegacyUpgrade', upgradeId }],
      this.ctx()
    );
    if (s.legacy.unlockedUpgrades.length > before) {
      this.unlockAudio();
      this.audio.playEchoShopPurchase();
    }
    this.state = this.stabilize(s);
    this.openLegacyModal(showRestart);
  }

  private restartFromEchoShop(): void {
    const prevScene = this.state.sceneId;
    let s = applyEffects(this.state, [{ op: 'resetRun' }], this.ctx());
    s = { ...s, timedChoiceDeadline: null };
    this.state = this.stabilize(s);
    if (this.state.sceneId !== prevScene) {
      this.sessionObjectiveVisible = false;
      this.cancelAllStoryBannerAnimations();
    }
    this.pendingStoryMainScrollTop = true;
    this.render();
    this.applyLegacyBriefingIfNeeded();
  }

  private onSkillRoll(scene: LoadedScene): void {
    if (this.pendingStoryDiceRoll) return;
    if (this.timedTimer) {
      clearTimeout(this.timedTimer);
      this.timedTimer = null;
    }
    this.state = { ...this.state, timedChoiceDeadline: null };
    this.unlockAudio();
    this.audio.playDice();
    const r = resolveSkillCheck(this.state, scene);
    if (!r.breakdown) return;
    const fail = !r.breakdown.success;
    const circulo = this.state.reputation.circulo ?? 0;
    const canReroll =
      fail &&
      hasFactionPerkUnlocked(circulo) &&
      this.state.circuloSkillRerollReady &&
      !!scene.frontmatter.skillCheck;
    const preRollState: GameState = { ...r.state, sceneId: scene.id };
    const reroll = canReroll
      ? { preRollState, rolledScene: scene, rollKind: 'skill' as const }
      : undefined;
    this.pendingStoryDiceRoll = { nextState: r.state, breakdown: r.breakdown, reroll };
    this.render();
  }

  private onDualAttrSkillRoll(scene: LoadedScene): void {
    if (this.pendingStoryDiceRoll) return;
    if (this.timedTimer) {
      clearTimeout(this.timedTimer);
      this.timedTimer = null;
    }
    this.state = { ...this.state, timedChoiceDeadline: null };
    this.unlockAudio();
    this.audio.playDice();
    const r = resolveDualAttrSkillCheck(this.state, scene);
    if (!r.breakdown) return;
    const afterRoll: GameState = {
      ...r.state,
      visitedScenes: { ...r.state.visitedScenes, [scene.id]: true },
    };
    const fail = !r.breakdown.success;
    const circulo = this.state.reputation.circulo ?? 0;
    const canReroll =
      fail &&
      hasFactionPerkUnlocked(circulo) &&
      this.state.circuloSkillRerollReady &&
      !!scene.frontmatter.dualAttrSkillCheck;
    const preRollState: GameState = { ...r.state, sceneId: scene.id };
    const reroll = canReroll
      ? { preRollState, rolledScene: scene, rollKind: 'dualSkill' as const }
      : undefined;
    this.pendingStoryDiceRoll = { nextState: afterRoll, breakdown: r.breakdown, reroll };
    this.render();
  }

  private onCirculoSkillDiceReroll(): void {
    const p = this.pendingStoryDiceRoll;
    if (!p?.reroll) return;
    this.clearDiceRollTimers();
    if (this.diceRollEnterHandler) {
      window.removeEventListener('keydown', this.diceRollEnterHandler);
      this.diceRollEnterHandler = null;
    }
    this.unlockAudio();
    this.audio.playUiClick();
    this.audio.playDice();
    const ctx = this.ctx();
    const { preRollState, rolledScene, rollKind } = p.reroll;
    let s = applyEffects(preRollState, [{ op: 'addRep', faction: 'circulo', delta: CIRCULO_SKILL_REROLL_REP_COST }], ctx);
    s = { ...s, circuloSkillRerollReady: false };
    if (rollKind === 'skill') {
      const r = resolveSkillCheck(s, rolledScene);
      if (!r.breakdown) {
        this.pendingStoryDiceRoll = null;
        this.state = this.stabilize(s);
        this.render();
        return;
      }
      this.pendingStoryDiceRoll = { nextState: r.state, breakdown: r.breakdown };
    } else if (rollKind === 'dualSkill') {
      const r = resolveDualAttrSkillCheck(s, rolledScene);
      if (!r.breakdown) {
        this.pendingStoryDiceRoll = null;
        this.state = this.stabilize(s);
        this.render();
        return;
      }
      const afterRoll: GameState = {
        ...r.state,
        visitedScenes: { ...r.state.visitedScenes, [rolledScene.id]: true },
      };
      this.pendingStoryDiceRoll = { nextState: afterRoll, breakdown: r.breakdown };
    } else {
      const r = resolveLuckCheck(s, rolledScene, this.registry.data);
      if (!r.breakdown) {
        this.pendingStoryDiceRoll = null;
        this.state = this.stabilize(s);
        this.render();
        return;
      }
      const afterRoll: GameState = {
        ...r.state,
        visitedScenes: { ...r.state.visitedScenes, [rolledScene.id]: true },
      };
      this.pendingStoryDiceRoll = { nextState: afterRoll, breakdown: r.breakdown };
    }
    this.render();
  }

  private onLuckRoll(scene: LoadedScene): void {
    if (this.pendingStoryDiceRoll) return;
    if (this.timedTimer) {
      clearTimeout(this.timedTimer);
      this.timedTimer = null;
    }
    this.state = { ...this.state, timedChoiceDeadline: null };
    this.unlockAudio();
    this.audio.playDice();
    const r = resolveLuckCheck(this.state, scene, this.registry.data);
    if (!r.breakdown) return;
    const fail = !r.breakdown.success;
    const circulo = this.state.reputation.circulo ?? 0;
    const canReroll =
      fail &&
      hasFactionPerkUnlocked(circulo) &&
      this.state.circuloSkillRerollReady &&
      !!scene.frontmatter.luckCheck;
    const preRollState: GameState = { ...r.state, sceneId: scene.id };
    const reroll = canReroll
      ? { preRollState, rolledScene: scene, rollKind: 'luck' as const }
      : undefined;
    const afterRoll: GameState = {
      ...r.state,
      visitedScenes: { ...r.state.visitedScenes, [scene.id]: true },
    };
    this.pendingStoryDiceRoll = { nextState: afterRoll, breakdown: r.breakdown, reroll };
    this.render();
  }

  private clearDiceRollTimers(): void {
    if (this.diceRollIntervalTimer != null) {
      clearInterval(this.diceRollIntervalTimer);
      this.diceRollIntervalTimer = null;
    }
    if (this.diceRollEnterHandler) {
      window.removeEventListener('keydown', this.diceRollEnterHandler);
      this.diceRollEnterHandler = null;
    }
  }

  private saveToSlot(slot: number): void {
    this.unlockAudio();
    this.applyDailyBonusIfNeededForRun();
    saveStateToSlot(this.campaignId, slot, this.state, this.devMode);
    this.activateDailyTasksForSlot(slot);
    this.applyDailyBonusIfNeededForRun();
    this.closeMenu();
    this.render();
  }

  /** Após descanso de acampamento: atualiza o slot ativo ou escolhe o primeiro vazio. */
  private autoSaveAfterCampRest(): void {
    if (!this.campAutoSaveEnabled) return;
    const limit = saveSlotLimit(this.devMode, this.state);
    if (this.activeSlot == null) {
      const slot = findFirstEmptySaveSlot(this.campaignId, limit);
      if (slot == null) {
        this.enqueueStatusHighlight({
          type: 'statusHighlight',
          variant: 'bad',
          title: t('toast.autoSaveFailedTitle'),
          subtitle: t('toast.autoSaveFailedSlotsFullSubtitle'),
        });
        return;
      }
      this.activateDailyTasksForSlot(slot);
    }
    this.applyDailyBonusIfNeededForRun();
    const slot = this.activeSlot!;
    const ok = saveStateToSlot(this.campaignId, slot, this.state, this.devMode);
    if (ok) {
      this.enqueueStatusHighlight({
        type: 'statusHighlight',
        variant: 'good',
        title: t('toast.autoSaveSuccessTitle'),
        subtitle: t('toast.autoSaveSuccessSubtitle', { slot: String(slot) }),
      });
    } else {
      this.enqueueStatusHighlight({
        type: 'statusHighlight',
        variant: 'bad',
        title: t('toast.autoSaveFailedTitle'),
        subtitle: t('toast.autoSaveFailedWriteSubtitle'),
      });
    }
  }

  private loadFromSlot(slot: number): void {
    this.unlockAudio();
    if (slot < 1 || slot > saveSlotLimit(this.devMode, this.state)) return;
    try {
      const raw = readSaveSlotRaw(this.campaignId, slot);
      if (!raw?.trim()) {
        this.showToast(t('toast.slotEmpty'), 'error');
        return;
      }
      const parsed = deserializeState(raw);
      if (parsed.campaignId !== this.campaignId) {
        this.showToast(
          t('toast.wrongCampaign', {
            saveCampaign: parsed.campaignId,
            activeCampaign: this.campaignId,
          }),
          'error'
        );
        this.closeMenu();
        return;
      }
      this.state = this.mergeSupporterFromStorage(parsed);
      this.state = this.stabilize(this.state);
      this.applyDailyBonusIfNeededForRun();
      this.activateDailyTasksForSlot(slot);
      this.render();
    } catch {
      this.showToast(t('toast.loadFailed'), 'error');
    }
    this.closeMenu();
  }

  private closeMenu(): void {
    if (this.menuFocusTrapRelease) {
      this.menuFocusTrapRelease();
      this.menuFocusTrapRelease = null;
    }
    const wasOpen = this.menuOpen;
    this.menuOpen = false;
    this.syncMenuScrollLock();
    const drawer =
      this.chromeRefs?.menuDrawer ?? this.root.querySelector<HTMLElement>('.menu-drawer');
    const backdrop = this.root.querySelector<HTMLElement>('.menu-backdrop');
    const hBtn =
      this.chromeRefs?.hamburgerBtn ?? this.root.querySelector<HTMLButtonElement>('.hamburger');
    drawer?.classList.remove('open');
    drawer?.setAttribute('aria-hidden', 'true');
    backdrop?.classList.remove('open');
    hBtn?.setAttribute('aria-expanded', 'false');
    if (wasOpen) {
      hBtn?.focus();
    }
  }

  private syncMenuScrollLock(): void {
    const lock = this.menuOpen;
    document.body.style.overflow = lock ? 'hidden' : '';
    document.documentElement.style.overflow = lock ? 'hidden' : '';
  }


  private toggleMenu(): void {
    if (this.menuOpen) {
      this.closeMenu();
      return;
    }
    this.menuOpen = true;
    this.syncMenuScrollLock();
    const drawer =
      this.chromeRefs?.menuDrawer ?? this.root.querySelector<HTMLElement>('.menu-drawer');
    const backdrop = this.root.querySelector<HTMLElement>('.menu-backdrop');
    const hBtn =
      this.chromeRefs?.hamburgerBtn ?? this.root.querySelector<HTMLButtonElement>('.hamburger');
    drawer?.classList.add('open');
    drawer?.setAttribute('aria-hidden', 'false');
    backdrop?.classList.add('open');
    hBtn?.setAttribute('aria-expanded', 'true');
    this.unlockAudio();
    window.requestAnimationFrame(() => {
      this.focusFirstInMenuDrawer();
      if (drawer) {
        if (this.menuFocusTrapRelease) this.menuFocusTrapRelease();
        this.menuFocusTrapRelease = attachFocusTrap(drawer);
      }
    });
  }

  private getFullscreenElement(): Element | null {
    const doc = document as Document & { webkitFullscreenElement?: Element | null };
    return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
  }

  private isFullscreenSupported(): boolean {
    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    };
    return typeof el.requestFullscreen === 'function' || typeof el.webkitRequestFullscreen === 'function';
  }

  private syncFullscreenEdgeButton(): void {
    const btn = this.chromeRefs?.fullscreenEdgeBtn;
    if (!btn) return;
    if (btn.disabled || !this.isFullscreenSupported()) {
      btn.removeAttribute('aria-pressed');
      return;
    }
    const active = this.getFullscreenElement() != null;
    btn.innerHTML = fullscreenEdgeBtnGlyph(active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    btn.setAttribute('aria-label', active ? t('menu.fullscreenExit') : t('menu.fullscreenActive'));
    btn.title = active ? t('menu.fullscreenExitEsc') : t('menu.fullscreenActive');
  }

  private cycleLocale(): void {
    const locale = getLocale();
    const idx = SUPPORTED_LOCALES.indexOf(locale);
    const next = SUPPORTED_LOCALES[(idx + 1) % SUPPORTED_LOCALES.length]!;
    setLocale(next);
    this.audio.playUiClick();
  }

  private toggleMute(): void {
    const v = this.audio.getVolume();
    if (v > 0) {
      this.volumeBeforeMute = v;
      this.audio.setVolume(0);
    } else {
      this.audio.setVolume(this.volumeBeforeMute > 0 ? this.volumeBeforeMute : 1);
    }
    this.syncVolumeEdgeButton();
    this.syncMenuVolumeUi();
    this.audio.playUiClick();
  }

  private syncMenuVolumeUi(): void {
    const refs = this.chromeRefs;
    if (!refs) return;
    const pct = Math.round(this.audio.getVolume() * 100);
    refs.volumeRange.value = String(pct);
    refs.volumeValue.textContent = `${pct}%`;
    refs.volumeRange.setAttribute('aria-valuetext', `${pct}%`);
  }

  private syncVolumeEdgeButton(): void {
    const btn = this.chromeRefs?.volumeEdgeBtn;
    if (!btn) return;
    syncVolumeEdgeButton(btn, this.audio.getVolume());
  }

  private syncLanguageEdgeButton(): void {
    const btn = this.chromeRefs?.languageEdgeBtn;
    if (!btn) return;
    syncLanguageEdgeButton(btn);
  }

  private syncFullscreenUi(): void {
    this.syncFullscreenEdgeButton();
    this.syncLanguageEdgeButton();
    this.syncVolumeEdgeButton();
  }

  private syncAppFullscreenLayout(): void {
    this.root.classList.toggle('app-fullscreen', this.getFullscreenElement() != null);
  }

  private async requestGameFullscreen(): Promise<void> {
    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    };
    if (typeof el.requestFullscreen === 'function') {
      await el.requestFullscreen();
      return;
    }
    if (typeof el.webkitRequestFullscreen === 'function') {
      await el.webkitRequestFullscreen();
    }
  }

  private async exitGameFullscreen(): Promise<void> {
    const doc = document as Document & { webkitExitFullscreen?: () => Promise<void> };
    if (typeof document.exitFullscreen === 'function') {
      await document.exitFullscreen();
      return;
    }
    if (typeof doc.webkitExitFullscreen === 'function') {
      await doc.webkitExitFullscreen();
    }
  }

  private storyDiceHostBinding(): StoryDiceBannerHost {
    return {
      clearDiceRollTimers: () => this.clearDiceRollTimers(),
      setDiceRollIntervalTimer: (t) => {
        this.diceRollIntervalTimer = t;
      },
      setDiceRollEnterHandler: (h) => {
        this.diceRollEnterHandler = h;
      },
      dismissStoryDiceRoll: (nextState) => {
        this.clearDiceRollTimers();
        this.pendingStoryDiceRoll = null;
        const prevScene = this.state.sceneId;
        const prevDiaryQueueLen = this.diaryEntryQueue.length;
        const prevStatusQueueLen = this.statusHighlightQueue.length;
        const prevItemAcquireQueueLen = this.itemAcquireQueue.length;
        let s: GameState = { ...nextState, timedChoiceDeadline: null };
        if (s.sceneId !== prevScene) {
          s = tickActiveBuffs(s);
        }
        this.state = this.stabilize(s);
        this.trimOverlayQueuesIfSceneChanged(
          prevScene,
          prevDiaryQueueLen,
          prevStatusQueueLen,
          prevItemAcquireQueueLen
        );
        this.audio.playUiClick();
        this.render();
      },
      playCheckSuccess: () => this.audio.playCheckSuccess(),
      playCheckFail: () => this.audio.playCheckFail(),
      onCirculoDiceReroll: () => this.onCirculoSkillDiceReroll(),
    };
  }

  private flushSceneArtHighlightIfInterrupted(): void {
    const hlKey = this.activeSceneArtHighlight;
    if (hlKey == null) return;
    this.activeSceneArtHighlight = null;
    if (this.state.sceneArtHighlightShown[hlKey]) return;
    this.state = {
      ...this.state,
      sceneArtHighlightShown: { ...this.state.sceneArtHighlightShown, [hlKey]: true },
    };
  }

  private flushSectionTitleIfInterrupted(): void {
    const key = this.activeSectionTitleKey;
    if (key == null) return;
    this.activeSectionTitleKey = null;
    // Keep `pendingSectionTitle` only if we never started the overlay; once active, clear it.
    this.pendingSectionTitle = null;
    if (this.state.sectionTitlesShown[key]) return;
    this.state = {
      ...this.state,
      sectionTitlesShown: { ...this.state.sectionTitlesShown, [key]: true },
    };
  }

  private queueSectionTitleFromTransition(prev: SectionTitlePrevSnapshot): void {
    const scene = this.registry.getScene(this.state.sceneId);
    if (!scene) {
      this.pendingSectionTitle = null;
      return;
    }
    this.pendingSectionTitle = resolveSectionTitleReveal(
      prev,
      this.state,
      scene,
      this.registry.data.campaign,
      this.state.sectionTitlesShown
    );
  }

  private sectionTitleKicker(reveal: SectionTitleReveal): string {
    if (reveal.kind === 'chapter' && reveal.chapter != null) {
      return t('story.sectionKickerAct', { n: String(reveal.chapter) });
    }
    if (reveal.kind === 'explore') return t('story.sectionKickerExplore');
    return t('story.sectionKickerHub');
  }

  private buildSectionTitlePayload(
    deferForArtHighlight: boolean
  ): StoryRenderContext['sectionTitle'] {
    const pending = this.pendingSectionTitle;
    if (!pending) return null;
    if (this.state.sectionTitlesShown[pending.dedupeKey]) {
      this.pendingSectionTitle = null;
      return null;
    }
    if (!this.sectionTitleEnabled) {
      this.state = {
        ...this.state,
        sectionTitlesShown: { ...this.state.sectionTitlesShown, [pending.dedupeKey]: true },
      };
      this.pendingSectionTitle = null;
      return null;
    }
    // Art highlight first; title monta no `onEnd` da arte (sem segundo `render`).
    if (deferForArtHighlight) return null;

    const gen = this.sectionTitleGen;
    const key = pending.dedupeKey;
    return {
      kicker: this.sectionTitleKicker(pending),
      title: pending.title,
      onSfx:
        pending.kind === 'chapter'
          ? undefined
          : () => {
              this.unlockAudio();
              this.audio.playMysteriousHighlight();
            },
      onBegin: () => {
        this.activeSectionTitleKey = key;
      },
      onEnd: () => {
        this.activeSectionTitleKey = null;
        this.pendingSectionTitle = null;
        this.state = {
          ...this.state,
          sectionTitlesShown: { ...this.state.sectionTitlesShown, [key]: true },
        };
        this.render();
      },
      isCurrentGeneration: () => this.sectionTitleGen === gen,
    };
  }

  /** Monta o título de seção após o highlight ASCII, sem `render()` intermédio. */
  private mountPendingSectionTitleAfterArt(): boolean {
    const payload = this.buildSectionTitlePayload(false);
    if (!payload) return false;
    mountSectionTitleOverlay(document.body, payload);
    return true;
  }

  private buildSceneArtHighlightPayload(scene: LoadedScene): StoryRenderContext['sceneArtHighlight'] {
    const fm = scene.frontmatter;
    if (fm.highlight !== true) return null;
    const s = this.state;
    const hlKey = sceneArtHighlightDedupeKey(scene);
    if (s.sceneArtHighlightShown[hlKey]) return null;
    const artText = resolveSceneArt(this.registry, scene);
    if (!artText) return null;
    if (!this.sceneArtHighlightEnabled) {
      this.state = {
        ...this.state,
        sceneArtHighlightShown: { ...this.state.sceneArtHighlightShown, [hlKey]: true },
      };
      return null;
    }
    const multi = resolveSceneArtHighlightFrames(scene.frontmatter, this.registry.ui.sceneArt);
    const frames = multi ?? [artText];
    const holdMs = fm.highlightHoldMs ?? SCENE_ART_HIGHLIGHT_HOLD_MS_DEFAULT;
    const gen = this.sceneArtHighlightGen;
    const sid = scene.id;
    const unlockAnd = (play: () => void): (() => void) => () => {
      this.unlockAudio();
      play();
    };
    let onHighlightSfx: (() => void) | undefined;
    switch (fm.artHighlightSfx) {
      case 'door_open':
        onHighlightSfx = unlockAnd(() => this.audio.playDoorOpen());
        break;
      case 'mysterious':
        onHighlightSfx = unlockAnd(() => this.audio.playMysteriousHighlight());
        break;
      case 'class_knight':
        onHighlightSfx = unlockAnd(() => this.audio.playClassCommitKnight());
        break;
      case 'class_cleric':
        onHighlightSfx = unlockAnd(() => this.audio.playClassCommitCleric());
        break;
      case 'class_mage':
        onHighlightSfx = unlockAnd(() => this.audio.playClassCommitMage());
        break;
      case 'class_archer':
        onHighlightSfx = unlockAnd(() => this.audio.playClassCommitArcher());
        break;
      default:
        onHighlightSfx = undefined;
    }
    return {
      sceneId: sid,
      frames,
      holdMs,
      onHighlightSfx,
      onBegin: () => {
        this.activeSceneArtHighlight = hlKey;
      },
      onEnd: () => {
        this.activeSceneArtHighlight = null;
        this.state = {
          ...this.state,
          sceneArtHighlightShown: { ...this.state.sceneArtHighlightShown, [hlKey]: true },
        };
        // Encadeia título de seção sem `render()` — evita matar o highlight / saltar a arte.
        if (!this.mountPendingSectionTitleAfterArt()) {
          this.render();
        }
      },
      isCurrentGeneration: () => this.sceneArtHighlightGen === gen,
    };
  }

  private buildContextPrimer(scene: LoadedScene): StoryRenderContext['contextPrimer'] {
    const dismissed: Record<ContextPrimerId, boolean> = {
      hub_loop: !this.hubLoopPrimerVisible,
      camp: !this.campPrimerVisible,
      exploration: !this.explorationPrimerVisible,
    };
    const id = resolveContextPrimerId(scene, dismissed);
    if (id == null) return null;
    return buildContextPrimerPayload(id, () => {
      switch (id) {
        case 'hub_loop':
          this.hubLoopPrimerVisible = false;
          saveHubLoopPrimerVisible(this.storageKeys.hubLoopPrimerKey, this.hubLoopPrimerVisible);
          break;
        case 'camp':
          this.campPrimerVisible = false;
          saveCampPrimerVisible(this.storageKeys.campPrimerKey, this.campPrimerVisible);
          break;
        case 'exploration':
          this.explorationPrimerVisible = false;
          saveExplorationPrimerVisible(this.storageKeys.explorationPrimerKey, this.explorationPrimerVisible);
          break;
      }
    });
  }

  private buildStoryRenderContext(scene: LoadedScene): StoryRenderContext {
    const sceneArtHighlight = this.buildSceneArtHighlightPayload(scene);
    const sectionTitle = this.buildSectionTitlePayload(sceneArtHighlight != null);
    return {
      campaignId: this.campaignId,
      devMode: this.devMode,
      timedChoiceEnabled: this.timedChoiceMode,
      state: this.state,
      registry: this.registry,
      scene,
      sceneArtHighlight,
      sectionTitle,
      sessionObjective: this.sessionObjectiveVisible ? this.buildSessionObjective() : null,
      dailyCombat: this.dailyCombatAvailable(scene) ? { chapter: this.state.chapter } : null,
      onboardingPrimer:
        this.onboardingPrimerVisible && this.state.chapter === 1 && this.state.day <= 2
          ? {
              onDismiss: () => {
                this.onboardingPrimerVisible = false;
                saveOnboardingPrimerVisible(this.storageKeys.onboardingPrimerKey, this.onboardingPrimerVisible);
              },
            }
          : null,
      contextPrimer: this.buildContextPrimer(scene),
      overlay: {
        pendingStoryDiceRoll: this.pendingStoryDiceRoll,
        storyDiceHost: this.storyDiceHostBinding(),
        faithMiraclePending: this.faithMiraclePending,
        setFaithMiraclePending: (v) => {
          this.faithMiraclePending = v;
        },
        statusHighlightQueue: this.statusHighlightQueue,
        statusHighlightExitStaggerMs: STORY_BANNER_BETWEEN_DISMISS_MS,
        requestStatusHighlightStackDismiss: () => {
          this.beginStatusHighlightStackDismiss();
        },
        itemAcquireQueue: this.itemAcquireQueue,
        diaryEntryQueue: this.diaryEntryQueue,
        diaryBannerExiting: this.diaryBannerExiting,
        itemAcquireBannerExiting: this.itemAcquireBannerExiting,
        requestDiaryBannerDismiss: () => {
          this.beginDiaryBannerDismiss();
        },
        requestItemAcquireBannerDismiss: () => {
          this.beginItemAcquireBannerDismiss();
        },
      },
      audio: {
        unlockAudio: () => this.unlockAudio(),
        playUiClick: () => this.audio.playUiClick(),
        playLevelUpCelebration: () => this.audio.playLevelUpCelebration(),
        playPathPromotion: () => this.audio.playPathPromotion(),
      },
      render: () => this.render(),
      navigation: {
        applyChoice: (ch) => this.applyChoice(ch),
        onSkillRoll: (sc) => this.onSkillRoll(sc),
        onDualAttrSkillRoll: (sc) => this.onDualAttrSkillRoll(sc),
        onLuckRoll: (sc) => this.onLuckRoll(sc),
      },
      campCallbacks: {
        unlockAudio: () => this.unlockAudio(),
        playUiClick: () => this.audio.playUiClick(),
        commitEquipEffects: (effects) => {
          const prevScene = this.state.sceneId;
          const prevDiaryQueueLen = this.diaryEntryQueue.length;
          const prevStatusQueueLen = this.statusHighlightQueue.length;
          const prevItemAcquireQueueLen = this.itemAcquireQueue.length;
          this.state = this.stabilize({
            ...applyEffects(this.state, effects, this.ctx()),
            timedChoiceDeadline: null,
          });
          this.trimOverlayQueuesIfSceneChanged(
            prevScene,
            prevDiaryQueueLen,
            prevStatusQueueLen,
            prevItemAcquireQueueLen
          );
          this.render();
        },
      },
      setTimedChoiceTimer: (t) => {
        this.timedTimer = t;
      },
      onTimedChoiceScheduled: (deadlineEpochMs) => {
        this.state = { ...this.state, timedChoiceDeadline: deadlineEpochMs };
      },
    };
  }

  private render(): void {
    this.progressDailyTasks(null);
    this.flushDailyTaskRewards();
    this.flushSceneArtHighlightIfInterrupted();
    this.flushSectionTitleIfInterrupted();
    this.sceneArtHighlightGen += 1;
    this.sectionTitleGen += 1;
    if (this.state.mode === 'combat' || this.state.mode === 'dialogue_combat' || !this.timedChoiceMode) {
      if (this.state.timedChoiceDeadline != null) {
        this.state = { ...this.state, timedChoiceDeadline: null };
      }
    }
    if (this.timedTimer) {
      clearTimeout(this.timedTimer);
      this.timedTimer = null;
    }
    this.clearDiceRollTimers();
    this.syncSidebarDisclosureSections();
    if (this.state.mode !== 'combat') {
      this.combatLogCursor = { encounterId: '', index: 0 };
    }
    if (this.state.mode !== 'dialogue_combat') {
      this.dialogueCombatLogCursor = { encounterId: '', index: 0 };
    }
    if (this.state.mode !== 'combat' && this.state.mode !== 'dialogue_combat') {
      this.flushBossTwistOverlayOnLeaveCombat();
    }

    const headerTitle = formatCampaignHeaderTitle(this.registry.data.campaign, this.state.chapter);
    document.title = headerTitle;

    const chromeOpts = {
      headerTitle,
      gameVersion: GAME_VERSION,
      fontStep: this.fontStep,
      campaignId: this.campaignId,
      devMode: this.devMode,
      timedChoiceEnabled: this.timedChoiceMode,
      sceneArtHighlightEnabled: this.sceneArtHighlightEnabled,
      sectionTitleEnabled: this.sectionTitleEnabled,
      campAutoSaveEnabled: this.campAutoSaveEnabled,
      state: this.state,
      registry: this.registry,
      sidebarSections: this.sidebarSections,
      onMenuBackdropClick: (hBtn: HTMLButtonElement) => {
        this.closeMenu();
        hBtn.setAttribute('aria-expanded', 'false');
      },
      getVolume: () => this.audio.getVolume(),
      setVolume: (n: number) => {
        this.audio.setVolume(n);
        if (n > 0) this.volumeBeforeMute = n;
        this.syncVolumeEdgeButton();
      },
      onDevModeChange: (v: boolean) => {
        this.devMode = v;
        saveDevMode(this.storageKeys.devModeKey, this.devMode);
        this.closeMenu();
        this.render();
      },
      onTimedChoiceChange: (v: boolean) => {
        this.timedChoiceMode = v;
        saveTimedChoiceMode(this.storageKeys.timedChoiceKey, this.timedChoiceMode);
        this.closeMenu();
        this.render();
      },
      onSceneArtHighlightChange: (v: boolean) => {
        this.sceneArtHighlightEnabled = v;
        saveSceneArtHighlightEnabled(this.storageKeys.sceneArtHighlightKey, this.sceneArtHighlightEnabled);
        this.closeMenu();
        this.render();
      },
      onSectionTitleChange: (v: boolean) => {
        this.sectionTitleEnabled = v;
        saveSectionTitleEnabled(this.storageKeys.sectionTitleKey, this.sectionTitleEnabled);
        this.closeMenu();
        this.render();
      },
      onCampAutoSaveChange: (v: boolean) => {
        this.campAutoSaveEnabled = v;
        saveCampAutoSaveEnabled(this.storageKeys.campAutoSaveKey, this.campAutoSaveEnabled);
        this.closeMenu();
        this.render();
      },
      onCycleFont: () => this.cycleFontSize(),
      fullscreenSupported: this.isFullscreenSupported(),
      onExportSave: () => this.exportSaveToClipboard(),
      onImportSave: () => this.importSaveFromClipboard(),
      onCredits: () => this.showCredits(),
      onSupporter: () => {
        this.unlockAudio();
        openSupporterModal({
          campaignId: this.campaignId,
          state: this.state,
          playUiClick: () => this.audio.playUiClick(),
          onStateChange: (s, meta) => {
            this.state = s;
            saveSupporterMeta(this.campaignId, meta);
            this.syncVisualTheme();
            this.persistSupporterMeta();
            this.render();
          },
        });
        this.closeMenu();
      },
      onLegacy: () => {
        this.unlockAudio();
        this.openLegacyModal(this.isSettlementScene());
        this.closeMenu();
      },
      onDevTools: () => {
        window.location.href = buildDevToolsHref(this.campaignId, 'scenes');
      },
      onScenesGraph: () => {
        window.location.href = buildScenesGraphHref(this.campaignId);
      },
      showImportInPartida: this.devMode || canExportSave(this.state, this.devMode),
      showGraphInSettings: this.devMode,
      showDevModeToggle: this.isLocalhostHost(),
      onSaveSlot: (slot: number) => this.saveToSlot(slot),
      onLoadSlot: (slot: number) => this.loadFromSlot(slot),
      dailyBonus: this.dailyBonus,
      dailyTasks: this.dailyTasks,
      onDailyBonus: () => {
        this.unlockAudio();
        openDailyHubModal({
          meta: this.dailyBonus,
          tasks: this.dailyTasks,
          playUiClick: () => this.audio.playUiClick(),
        });
        this.closeMenu();
      },
      onSidebarSectionToggle: (key: string, open: boolean) => {
        if (open && !this.canOpenSidebarSection(key)) {
          return;
        }
        this.sidebarSections[key] = open;
        saveSidebarSections(this.storageKeys.sidebarKey, this.sidebarSections);
      },
      playUiClick: () => this.audio.playUiClick(),
      resourcePulseKeys: this.pendingSidebarResourcePulse,
      inventoryNewCount: this.inventoryNewCount,
      onInventoryOpened: () => {
        if (this.inventoryNewCount === 0) return;
        this.inventoryNewCount = 0;
        this.render();
      },
      fillMain: (main: HTMLElement) => {
        if (this.state.mode === 'combat') {
          main.classList.add('main--combat');
          renderCombatInto(main, {
            state: this.state,
            registry: this.registry,
            bus: this.bus,
            audio: this.audio,
            combatLog: {
              soundCursor: this.combatLogCursor,
              fxCursor: this.combatLogCursor,
              setSoundCursor: (v) => {
                this.combatLogCursor = v;
              },
            },
            lifecycle: {
              unlockAudio: () => this.unlockAudio(),
              stabilize: (s) => this.stabilize(s),
              commitState: (s) => this.commitCombatState(s),
            },
            onBossTwistReveal: (messages) => this.enqueueBossTwistReveal(messages),
          });
        } else if (this.state.mode === 'dialogue_combat') {
          main.classList.add('main--combat');
          renderDialogueCombatInto(main, {
            state: this.state,
            registry: this.registry,
            bus: this.bus,
            audio: this.audio,
            dialogueLog: {
              soundCursor: this.dialogueCombatLogCursor,
              setSoundCursor: (v) => {
                this.dialogueCombatLogCursor = v;
              },
            },
            lifecycle: {
              unlockAudio: () => this.unlockAudio(),
              stabilize: (s) => this.stabilize(s),
              commitState: (s) => this.commitCombatState(s),
            },
          });
        } else {
          const scene = this.registry.getScene(this.state.sceneId);
          if (!scene) {
            main.innerHTML = `<div class="shell error">${escHtml(t('game.sceneNotFound', { id: this.state.sceneId }))}</div>`;
          } else {
            renderStoryInto(main, this.buildStoryRenderContext(scene));
          }
        }
        const scrollKey = `${this.state.mode}:${this.state.sceneId}`;
        const storyScrollToTop =
          this.state.mode === 'story' &&
          (this.pendingStoryMainScrollTop || scrollKey !== this.lastMainScrollResetKey);
        const nonStoryScrollToTop =
          this.state.mode !== 'story' && scrollKey !== this.lastMainScrollResetKey;
        if (storyScrollToTop || nonStoryScrollToTop) {
          main.scrollTop = 0;
          this.lastMainScrollResetKey = scrollKey;
          this.pendingStoryMainScrollTop = false;
        }
        // `story-main` tem `tabIndex=-1` (atalho “Ir para a história”); ao substituir o DOM, o foco pode ficar no `<main>`.
        if (document.activeElement === main) {
          main.blur();
        }
      },
    };

    if (this.chromeRefs == null) {
      this.chromeRefs = mountAppChrome(this.root, chromeOpts);
    } else {
      syncAppChrome(this.chromeRefs, chromeOpts);
    }

    if (
      this.state.lastCombatXpGain != null ||
      this.state.lastCombatLevelUps != null ||
      this.state.lastCombatLootLines != null ||
      this.state.lastPathPromotion != null
    ) {
      this.state = {
        ...this.state,
        lastCombatXpGain: null,
        lastCombatLevelUps: null,
        lastCombatLootLines: null,
        lastPathPromotion: null,
      };
    }
    this.syncAmbientTheme();
    this.syncLowHpAudio();
    this.syncAppFullscreenLayout();
    this.syncFullscreenUi();
    this.syncVisualTheme();
  }

}
