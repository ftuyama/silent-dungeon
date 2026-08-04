---
id: act5/frost_heights_rumors_cultist_win
title: Incenso que congela
chapter: 5
ambientTheme: act5
artKey: frost_heights_rumors
choices:
  - text: "Seguir rumo ao acampamento"
    next: act5/frost_heights_rumors
onEnter:
  - { op: setFlag, key: frost_heights_cultist_done, value: true }
  - { op: addXp, amount: 10 }
  - { op: addDiary, text: "Cultista da geada no desfiladeiro — cantava antes do ferro. Sob a túnica, mapa riscado apontando leste: escudeiro amarrado." }
---
O **cultista** cai; o incenso vira cristal no ar. Na túnica, mapa riscado: seta **leste**, palavra *escudeiro*.
