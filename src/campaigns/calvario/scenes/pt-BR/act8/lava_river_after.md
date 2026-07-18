---
id: act8/lava_river_after
title: Margem conquistada
chapter: 8
ambientTheme: act8
artKey: lava_river
choices:
  - text: "Voltar ao Crisol"
    next: act8/hub_magma_crucible
onEnter:
  - { op: setFlag, key: act8_lava_river_done, value: true }
  - { op: addXp, amount: 18 }
  - { op: addDiary, text: "O rio de lava cobrou pedágio. Os golems caíram; a margem ainda arde sob os pés." }
---
A margem fumega. O caminho para a forja dos golems abre entre pedras rachadas — ainda quente, ainda hostil, **seu**.
