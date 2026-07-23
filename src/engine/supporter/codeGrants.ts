/** Grant expandido após resgate de código ou bundle. */
export type SupporterGrant =
  | { type: 'perk'; id: string }
  | { type: 'echo'; amount: number };

/** Bundles vendidos no Ko-fi Shop (slug → perks/echo; um .txt estático por produto). */
export const SUPPORTER_BUNDLES: Record<string, SupporterGrant[]> = {
  bundle_cosmetic: [
    { type: 'perk', id: 'theme_ember' },
    { type: 'perk', id: 'theme_moonlit' },
    { type: 'perk', id: 'theme_blood_vigil' },
    { type: 'perk', id: 'frame_supporter' },
    { type: 'perk', id: 'title_supporter' },
    { type: 'perk', id: 'credits_badge' },
  ],
  bundle_convenience: [
    { type: 'perk', id: 'save_slot_plus2' },
    { type: 'perk', id: 'save_export' },
  ],
  bundle_gameplay: [
    { type: 'perk', id: 'mercy_once' },
    { type: 'perk', id: 'starter_supply' },
  ],
  echo_5: [{ type: 'echo', amount: 5 }],
  echo_15: [{ type: 'echo', amount: 15 }],
  echo_35: [{ type: 'echo', amount: 35 }],
};

SUPPORTER_BUNDLES.bundle_supporter = [
  ...SUPPORTER_BUNDLES.bundle_cosmetic,
  ...SUPPORTER_BUNDLES.bundle_convenience,
  ...SUPPORTER_BUNDLES.bundle_gameplay,
];

SUPPORTER_BUNDLES.bundle_supporter_echo15 = [
  ...SUPPORTER_BUNDLES.bundle_supporter,
  { type: 'echo', amount: 15 },
];

/** Referência num payload de código: bundle id, `perk:<id>` ou `echo:<n>`. */
export type GrantRef = string;

export function expandGrantRef(ref: GrantRef): SupporterGrant[] {
  const trimmed = ref.trim();
  if (!trimmed) return [];
  const bundle = SUPPORTER_BUNDLES[trimmed];
  if (bundle) return [...bundle];
  if (trimmed.startsWith('perk:')) {
    const id = trimmed.slice('perk:'.length).trim();
    return id ? [{ type: 'perk', id }] : [];
  }
  if (trimmed.startsWith('echo:')) {
    const n = Math.floor(Number(trimmed.slice('echo:'.length)));
    return Number.isFinite(n) && n > 0 ? [{ type: 'echo', amount: n }] : [];
  }
  return [];
}

export function expandGrantRefs(refs: GrantRef[]): SupporterGrant[] {
  const out: SupporterGrant[] = [];
  for (const ref of refs) out.push(...expandGrantRef(ref));
  return out;
}
