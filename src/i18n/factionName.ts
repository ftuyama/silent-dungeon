import type { FactionId } from '../engine/schema/index.ts';
import { t } from './index.ts';

export function factionDisplayName(faction: FactionId): string {
  switch (faction) {
    case 'vigilia':
      return t('engine.factionVigilia');
    case 'circulo':
      return t('engine.factionCirculo');
    case 'culto':
      return t('engine.factionCulto');
  }
}

/** @deprecated use factionDisplayName */
export const FACTION_NAME_PT: Record<FactionId, string> = {
  get vigilia() {
    return t('engine.factionVigilia');
  },
  get circulo() {
    return t('engine.factionCirculo');
  },
  get culto() {
    return t('engine.factionCulto');
  },
};
