import type { GameState } from '../schema/index.ts';
import { MAX_LEVEL, xpToNextLevel } from '../progression/progression.ts';
import { factionRepTier } from '../progression/reputation.ts';

/** Resumo humano do desfecho do trono (Act 4) para epílogo e abertura do gelo. */
function throneOutcomeLine(state: GameState): string {
  if (state.marks.includes('calvario_sealed')) {
    return 'Selaste o buraco em **fé** — o subsolo cala porque carregaste o **peso** tu mesma.';
  }
  if (state.marks.includes('pact_bound')) {
    return 'O **Terceiro Sino** inscreveu-se na tua pele; a **corrupção** que sobe é o juro.';
  }
  if (state.marks.includes('morvayn_slain')) {
    return '**Ferro** no trono: Morvayn findou, mas o **eixo** segue para baixo.';
  }
  return '';
}

/** Eco de facção sobre o que ficou em baixo (Vigília / Círculo / culto), condicionado a reputação. */
function factionThroneEcho(state: GameState): string {
  const v = state.reputation.vigilia ?? 0;
  const c = state.reputation.circulo ?? 0;
  const k = state.reputation.culto ?? 0;
  const sealed = state.marks.includes('calvario_sealed');
  const pact = state.marks.includes('pact_bound');
  const slain = state.marks.includes('morvayn_slain');

  if (sealed && v >= 1 && v >= c) {
    return 'Um **capeador** na neve: *"Selar é língua da **Vigília**."*';
  }
  if (sealed && c >= 1 && c > v) {
    return 'Alguém desenha um **círculo** na cinza: *"Selo bonito. A **rede** agradece."*';
  }
  if (pact && k >= 0) {
    return 'Um **devoto** sorri sem dentes: *"O **Sino** lembra-te."*';
  }
  if (slain && v >= 1 && v >= c) {
    return 'Um sal da **Vigília**: *"Morvayn era laço. **Cortaste**."*';
  }
  if (slain && c >= 1 && c > v) {
    return 'Voz do **Círculo**: *"Mataram o nome no trono. **Ótimo**."*';
  }
  if (pact && c >= 1 && c > v) {
    return 'Sussurro da **rede**: *"Assinaste o **silêncio**. **Arquivamos**."*';
  }
  return '';
}

export function injectText(text: string, state: GameState): string {
  const lead = state.party[0];
  const companions = state.party.slice(1);
  const companionLine =
    companions.length === 0
      ? ''
      : `${companions.map((c) => c.name).join(' e ')} ${companions.length > 1 ? 'trocam' : 'troca'} um olhar seco contigo.`;
  const lv = state.level;
  const xpNext = lv >= MAX_LEVEL ? 0 : xpToNextLevel(lv);
  return text
    .replace(/\{\{playerName\}\}/g, state.playerName)
    .replace(/\{\{leadName\}\}/g, lead?.name ?? '???')
    .replace(/\{\{day\}\}/g, String(state.day ?? 1))
    .replace(/\{\{chapter\}\}/g, String(state.chapter))
    .replace(/\{\{corruption\}\}/g, String(state.resources.corruption))
    .replace(/\{\{supply\}\}/g, String(state.resources.supply))
    .replace(/\{\{gold\}\}/g, String(state.resources.gold ?? 0))
    .replace(/\{\{faith\}\}/g, String(state.resources.faith))
    .replace(/\{\{level\}\}/g, String(state.level))
    .replace(/\{\{xp\}\}/g, String(state.xp))
    .replace(/\{\{xpToNext\}\}/g, String(xpNext))
    .replace(/\{\{faction\.vigiliaTier\}\}/g, factionRepTier(state.reputation, 'vigilia'))
    .replace(/\{\{faction\.circuloTier\}\}/g, factionRepTier(state.reputation, 'circulo'))
    .replace(/\{\{faction\.cultoTier\}\}/g, factionRepTier(state.reputation, 'culto'))
    .replace(/\{\{companionLine\}\}/g, companionLine)
    .replace(/\{\{companionCount\}\}/g, String(companions.length))
    .replace(/\{\{throneOutcomeLine\}\}/g, throneOutcomeLine(state))
    .replace(/\{\{factionThroneEcho\}\}/g, factionThroneEcho(state));
}
