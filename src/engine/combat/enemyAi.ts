import type { EnemyAbility, EnemyDef, EnemyInstance } from '../schema/index.ts';

export type EnemyActionChoice =
  | { type: 'attack' }
  | { type: 'ability'; ability: EnemyAbility };

function abilityById(def: EnemyDef, id: string): EnemyAbility | undefined {
  return def.abilities?.find((a) => a.id === id);
}

function resolveToken(def: EnemyDef, token: string): EnemyActionChoice {
  if (token === 'attack') return { type: 'attack' };
  const ability = abilityById(def, token);
  return ability ? { type: 'ability', ability } : { type: 'attack' };
}

/**
 * Decide a ação do inimigo na rodada. Sem `behavior`, comportamento legado
 * (ataque físico). Determinístico por rodada — o padrão é legível/telegráfico.
 */
export function chooseEnemyAction(
  def: EnemyDef,
  inst: EnemyInstance,
  round: number
): EnemyActionChoice {
  const behavior = def.behavior;
  if (!behavior) return { type: 'attack' };

  const desperation = behavior.desperation;
  if (
    desperation &&
    inst.maxHp > 0 &&
    inst.hp / inst.maxHp <= desperation.hpFractionLte
  ) {
    const rot = desperation.rotation;
    return resolveToken(def, rot[(round - 1) % rot.length]!);
  }

  if (round === 1 && behavior.opening) {
    return resolveToken(def, behavior.opening);
  }

  const rot = behavior.rotation;
  if (!rot || rot.length === 0) return { type: 'attack' };
  const offset = behavior.opening ? round - 2 : round - 1;
  const idx = ((offset % rot.length) + rot.length) % rot.length;
  return resolveToken(def, rot[idx]!);
}
