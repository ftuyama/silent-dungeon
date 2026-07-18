import type { ExplorationGraph } from '../../../engine/world/index.ts';

/** Grafo do crisol de magma (act8). */
export const ACT8_MAGMA_GRAPH: ExplorationGraph = {
  id: 'act8_magma',
  mapId: 'act8_magma',
  startNodeId: 'crucible_rim',
  nodes: [
    {
      id: 'crucible_rim',
      mapCell: { x: 3, y: 8 },
      edges: [
        {
          id: 'd8_rim_to_slag',
          text: 'Seguir a margem de escória',
          to: 'slag_shelf',
          encounterChance: 0.58,
        },
        {
          id: 'd8_rim_to_merchant',
          text: 'Descer ao nicho de brasas',
          to: 'ember_stall',
          encounterChance: 0.45,
        },
      ],
    },
    {
      id: 'slag_shelf',
      mapCell: { x: 6, y: 5 },
      edges: [
        {
          id: 'd8_slag_to_rim',
          text: 'Voltar à borda do crisol',
          to: 'crucible_rim',
          encounterChance: 0.52,
        },
        {
          id: 'd8_slag_to_bridge',
          text: 'Cruzar a ponte de pedra negra',
          to: 'obsidian_bridge',
          encounterChance: 0.62,
        },
      ],
    },
    {
      id: 'ember_stall',
      mapCell: { x: 7, y: 10 },
      visitFlag: 'act8_merchant_found',
      edges: [
        {
          id: 'd8_merchant_to_rim',
          text: 'Subir de volta à borda',
          to: 'crucible_rim',
          encounterChance: 0.4,
        },
        {
          id: 'd8_merchant_to_bridge',
          text: 'Seguir o cheiro de metal quente',
          to: 'obsidian_bridge',
          encounterChance: 0.55,
        },
      ],
    },
    {
      id: 'obsidian_bridge',
      mapCell: { x: 11, y: 7 },
      edges: [
        {
          id: 'd8_bridge_to_slag',
          text: 'Recuar à prateleira de escória',
          to: 'slag_shelf',
          encounterChance: 0.56,
        },
        {
          id: 'd8_bridge_to_heart',
          text: 'Avançar ao coração do crisol',
          to: 'crucible_heart',
          encounterChance: 0.68,
        },
      ],
    },
    {
      id: 'crucible_heart',
      mapCell: { x: 14, y: 3 },
      isGoal: true,
      goalFlag: 'act8_explore_goal_reached',
      edges: [
        {
          id: 'd8_heart_to_bridge',
          text: 'Recuar pela ponte',
          to: 'obsidian_bridge',
          encounterChance: 0.5,
        },
      ],
    },
  ],
};
