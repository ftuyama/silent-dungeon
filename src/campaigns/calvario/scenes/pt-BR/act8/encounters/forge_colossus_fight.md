---
id: act8/encounters/forge_colossus_fight
title: Colosso da forja
chapter: 8
ambientTheme: boss
choices:
  - text: "Desafiar o colosso"
    effects:
      - op: startCombat
        encounterId: act8_forge_colossus
        onVictory: act8/golem_forge_after
        onDefeat: shared/game_over
        onFlee: act8/golem_forge
onEnter: []
---
O colosso ergue-se da bigorna. Cada passo derrama escória. Não é guarda — é o produto final da forja.
