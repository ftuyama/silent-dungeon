/** Chance de acerto quando ataque == CA. */
export const HIT_CHANCE_BASE = 0.5;
/** Variação por ponto de diferença (ataque − CA). */
export const HIT_CHANCE_PER_POINT = 0.08;
export const HIT_CHANCE_MIN = 0.05;
export const HIT_CHANCE_MAX = 0.95;

/** Probabilidade de acerto físico vs CA (clamp 5%–95%). */
export function resolveHitChance(attackTotal: number, defenseScore: number): number {
  const raw = HIT_CHANCE_BASE + (attackTotal - defenseScore) * HIT_CHANCE_PER_POINT;
  return Math.max(HIT_CHANCE_MIN, Math.min(HIT_CHANCE_MAX, raw));
}

/** Resolve acerto percentual: `rng() < resolveHitChance(...)`. */
export function rollHitAgainstDefense(
  rng: () => number,
  attackTotal: number,
  defenseScore: number
): boolean {
  return rng() < resolveHitChance(attackTotal, defenseScore);
}
