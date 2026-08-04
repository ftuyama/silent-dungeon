---
id: act5/frost_cimeria_snow_whelp_win
title: Sangue que congela rápido
chapter: 5
ambientTheme: act5
artKey: frost_cimeria_snow
choices:
  - text: "Seguir — o desfiladeiro não espera"
    next: act5/frost_cimeria_snow
onEnter:
  - { op: setFlag, key: frost_intro_whelp_done, value: true }
  - { op: addXp, amount: 8 }
  - { op: addDiary, text: "Primeira cria de gelo no caminho das Cimeiras. O rasto dela apontava para cima — rumo a pegadas maiores." }
---
A **cria** cai; o gelo bebe o calor do combate num instante. No chão, **pegadas** pequenas cruzam outras — muito maiores — rumo ao cume.
