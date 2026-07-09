import type { FactionId, GameState } from '../../schema/index.ts';
import { FACTION_NAME_PT } from './reputationUi.ts';

export type LegacyRunOutcome = 'defeat' | 'victory';

export type LegacyRunStats = {
  chapter: number;
  level: number;
  day: number;
  sceneTitle: string;
  sceneId?: string;
  marksCount: number;
  topFaction: FactionId;
  outcome: LegacyRunOutcome;
  gain: number;
  title: string;
};

export function uniqueTitles(input: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of input) {
    const title = raw.trim();
    if (!title || seen.has(title)) continue;
    seen.add(title);
    out.push(title);
  }
  return out.slice(-12);
}

export function topFaction(state: GameState): FactionId {
  const list: FactionId[] = ['vigilia', 'circulo', 'culto'];
  let best: FactionId = 'vigilia';
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const id of list) {
    const score = state.reputation[id] ?? 0;
    if (score > bestScore) {
      best = id;
      bestScore = score;
    }
  }
  return best;
}

export function resolveLegacyTitle(state: GameState): string {
  const lead = state.party[0];
  const faction = topFaction(state);
  const hasMira = state.party.some((p) => p.id === 'mira');
  const hasTomas = state.party.some((p) => p.id === 'tomas');
  const corruption = state.resources.corruption ?? 0;
  const faith = state.resources.faith ?? 0;
  if (faction === 'culto' && corruption >= 6) return 'Arauto do Terceiro Sino';
  if (faction === 'vigilia' && faith >= 3) return 'Sentinela das Cinzas';
  if (faction === 'circulo' && (lead?.mind ?? 0) >= 12) return 'Cartógrafo do Círculo Cinzento';
  if (hasMira && hasTomas) return 'Portador dos Dois Ecos';
  return 'Sobrevivente da Pedra Muda';
}

export function buildLegacySummary(state: GameState): string {
  const faction = topFaction(state);
  const companions = state.party
    .slice(1)
    .map((p) => p.name)
    .slice(0, 2);
  const factionLabel = FACTION_NAME_PT[faction];
  const lead = state.party[0];
  const path = lead?.path?.trim();
  const pathLabel = path && path.length > 0 ? path : 'Sem arquétipo fixo';
  const compLabel = companions.length > 0 ? companions.join(' e ') : 'sem companhia fixa';
  return `Run anterior: ${factionLabel} em destaque, ${compLabel}, trilha ${pathLabel}.`;
}

export function computeLegacyEchoGain(state: GameState, outcome: LegacyRunOutcome = 'defeat'): number {
  const base = Math.floor(Math.max(0, state.chapter - 1) / 2);
  const levelBonus = Math.floor(Math.max(0, state.level - 1) / 3);
  const markBonus = Math.min(3, Math.floor(state.marks.length / 6));
  const victoryBonus = outcome === 'victory' ? 5 : 0;
  const raw = base + levelBonus + markBonus + victoryBonus;
  const scaled = outcome === 'victory' ? Math.round(raw * 1.5) : raw;
  return Math.max(1, scaled);
}

export function buildLegacyRunStats(
  state: GameState,
  outcome: LegacyRunOutcome,
  sceneTitle: string,
  sceneId?: string
): LegacyRunStats {
  const title = resolveLegacyTitle(state);
  const gain = computeLegacyEchoGain(state, outcome);
  const locId = sceneId?.trim() || state.legacy.lastEndSceneId || state.sceneId;
  return {
    chapter: state.chapter,
    level: state.level,
    day: state.day ?? 1,
    sceneTitle: sceneTitle.trim() || locId,
    sceneId: locId,
    marksCount: state.marks.length,
    topFaction: topFaction(state),
    outcome,
    gain,
    title,
  };
}

export function buildCompoundLegacyFlags(state: GameState): Record<string, boolean> {
  const faction = topFaction(state);
  const lead = state.party[0];
  return {
    legacy_combo_faction_companion:
      (faction === 'vigilia' && state.party.some((p) => p.id === 'mira')) ||
      (faction === 'culto' && state.party.some((p) => p.id === 'tomas')),
    legacy_combo_path_faction:
      !!lead?.path &&
      ((faction === 'circulo' && lead.path.includes('arc')) ||
        (faction === 'vigilia' && lead.path.includes('cavaleiro')) ||
        (faction === 'culto' && lead.path.includes('trevas'))),
    legacy_combo_faith_corruption:
      (state.resources.faith ?? 0) >= 3 && (state.resources.corruption ?? 0) >= 4,
  };
}

export const RUN_SETTLED_FLAG = 'run_settled';
