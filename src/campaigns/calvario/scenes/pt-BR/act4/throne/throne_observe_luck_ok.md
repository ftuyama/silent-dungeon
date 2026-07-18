---
id: act4/throne/throne_observe_luck_ok
title: Gota cativa
chapter: 4
ambientTheme: act4
choices:
  - text: "Continuar a observar o trono"
    next: act4/throne/throne_observe
    condition: { noFlag: throne_observe_drip_gold_done }
    effects:
      - { op: setFlag, key: throne_observe_drip_gold_done, value: true }
      - { op: addResource, resource: gold, delta: 1 }
      - { op: addDiary, text: "A gota solidificou entre os dedos — gelo pequeno, sorte viva." }
  - text: "Voltar ao momento da decisão"
    next: act4/throne/throne_gate
onEnter:
  - { op: addXp, amount: 10 }
---
No instante certo, a **memória** hesita e você pega a gota. O trono ainda não notou.
