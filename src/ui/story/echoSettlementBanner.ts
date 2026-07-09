import type { GameState } from '../../engine/schema/index.ts';
import type { ContentRegistry } from '../../content/registry.ts';
import { t } from '../../i18n/index.ts';

const SETTLEMENT_SCENES = new Set(['shared/game_over', 'endings/epilogue_depths']);

export function shouldShowEchoSettlementBanner(state: GameState): boolean {
  if (!SETTLEMENT_SCENES.has(state.sceneId)) return false;
  return state.legacy.lastRunStats != null;
}

function resolveLocationTitle(stats: NonNullable<GameState['legacy']['lastRunStats']>, registry: ContentRegistry): string {
  const sid = stats.sceneId?.trim();
  if (sid) {
    const sc = registry.getScene(sid);
    if (sc?.frontmatter.title?.trim()) return sc.frontmatter.title.trim();
  }
  return stats.sceneTitle.trim() || sid || '—';
}

export function appendEchoSettlementBanner(
  parent: HTMLElement,
  state: GameState,
  registry: ContentRegistry
): void {
  const stats = state.legacy.lastRunStats;
  if (!stats) return;

  const wrap = document.createElement('div');
  wrap.className = 'echo-settlement-banner';
  wrap.setAttribute('role', 'status');
  if (stats.outcome === 'victory') {
    wrap.classList.add('echo-settlement-banner--victory');
  }

  const kicker = document.createElement('div');
  kicker.className = 'echo-settlement-kicker';
  kicker.textContent =
    stats.outcome === 'victory' ? t('echoSettlement.victoryKicker') : t('echoSettlement.defeatKicker');
  wrap.appendChild(kicker);

  const lines: string[] = [
    t('echoSettlement.chapter', { chapter: String(stats.chapter) }),
    t('echoSettlement.level', { level: String(stats.level) }),
    t('echoSettlement.location', { place: resolveLocationTitle(stats, registry) }),
    t('echoSettlement.marks', { count: String(stats.marksCount) }),
    t('echoSettlement.title', { title: stats.title }),
    t('echoSettlement.gain', { count: String(stats.gain) }),
  ];

  lines.forEach((text, i) => {
    const line = document.createElement('div');
    line.className = 'echo-settlement-line';
    line.style.animationDelay = `${i * 0.4}s`;
    if (i === lines.length - 1) {
      line.classList.add('echo-settlement-line--gain');
    }
    line.textContent = text;
    wrap.appendChild(line);
  });

  const total = document.createElement('div');
  total.className = 'echo-settlement-total';
  total.textContent = t('echoSettlement.bank', { echoes: String(state.legacy.echoes) });
  wrap.appendChild(total);

  parent.appendChild(wrap);
}
