import { describe, expect, it } from 'vitest';
import { EnemyDefSchema } from '../../src/engine/schema/entities.ts';
import { enemies } from '../../src/campaigns/calvario/data/enemies.ts';

describe('calvario enemies: schema e integridade de behavior', () => {
  it('todos os defs passam no EnemyDefSchema', () => {
    for (const [id, def] of Object.entries(enemies)) {
      const parsed = EnemyDefSchema.safeParse(def);
      expect(parsed.success, `enemy ${id}: ${parsed.error?.message ?? ''}`).toBe(true);
    }
  });

  it('tokens de behavior referenciam abilities existentes ou "attack"', () => {
    for (const [id, def] of Object.entries(enemies)) {
      if (!def.behavior) continue;
      const abilityIds = new Set((def.abilities ?? []).map((a) => a.id));
      const tokens = [
        ...(def.behavior.opening ? [def.behavior.opening] : []),
        ...(def.behavior.rotation ?? []),
        ...(def.behavior.desperation?.rotation ?? []),
      ];
      expect(tokens.length, `enemy ${id}: behavior sem tokens`).toBeGreaterThan(0);
      for (const token of tokens) {
        expect(
          token === 'attack' || abilityIds.has(token),
          `enemy ${id}: token "${token}" não corresponde a nenhuma ability`
        ).toBe(true);
      }
    }
  });

  it('ids de abilities são únicos por inimigo', () => {
    for (const [id, def] of Object.entries(enemies)) {
      const ids = (def.abilities ?? []).map((a) => a.id);
      expect(new Set(ids).size, `enemy ${id}: ability ids duplicados`).toBe(ids.length);
    }
  });
});
