---
id: act6/encounters/memory_trial_bleed
title: Hemorragia de Ecos
chapter: 6
ambientTheme: void
artKey: void_well
choices:
  - text: "Lutar enquanto as lembrancas te rasgam"
    effects:
      - { op: addResource, resource: corruption, delta: 1 }
      - { op: addResource, resource: supply, delta: -1 }
      - { op: startCombat, encounterId: act6_echo_chorus, onVictory: act6/memory_after, onDefeat: shared/game_over, onFlee: act6/hub_fractured_nave }
onEnter:
  - { op: addMark, mark: act6_memory_spoiled }
  - { op: addDiary, text: "As memorias vieram em bando e nenhuma pedia permissao." }
---
Você cai no poço sem eixo. Rostos antigos agarram seus pulsos como se cobrassem dívida.

Quando volta a respirar, o Coro já está à sua frente.
