import { z } from 'zod';

export const SupporterStateSchema = z.object({
  unlockedPerks: z.array(z.string()).default([]),
  activeTheme: z.string().nullable().default(null),
  activeFrame: z.string().nullable().default(null),
  supporterName: z.string().nullable().default(null),
  mercyUsedThisRun: z.boolean().default(false),
  redeemedCodeIds: z.array(z.string()).default([]),
  purchasedEchoesTotal: z.number().int().min(0).default(0),
});

export type SupporterState = z.infer<typeof SupporterStateSchema>;

export function defaultSupporterState(): SupporterState {
  return {
    unlockedPerks: [],
    activeTheme: null,
    activeFrame: null,
    supporterName: null,
    mercyUsedThisRun: false,
    redeemedCodeIds: [],
    purchasedEchoesTotal: 0,
  };
}

/** Temas cosméticos desbloqueáveis (override de paleta). */
export const SUPPORTER_THEME_IDS = ['ember', 'moonlit', 'blood_vigil'] as const;
export type SupporterThemeId = (typeof SUPPORTER_THEME_IDS)[number];

export function isSupporterThemeId(id: string | null | undefined): id is SupporterThemeId {
  return id === 'ember' || id === 'moonlit' || id === 'blood_vigil';
}
