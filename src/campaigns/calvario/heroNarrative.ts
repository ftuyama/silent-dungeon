import type { ClassId } from '../../engine/schema/index.ts';
import type { HeroNarrative } from '../../engine/data/index.ts';
import {
  getDefaultHeroName,
  getHeroClassLabel,
  getPathPromotionNarrativePt,
  getPathUnlockBonus,
} from './classHero.ts';

export const calvarioHeroNarrative: HeroNarrative = {
  defaultHeroName(cls: ClassId): string {
    return getDefaultHeroName(cls);
  },
  getHeroClassLabel,
  getPathUnlockBonus,
  getPathPromotionNarrativePt,
};
