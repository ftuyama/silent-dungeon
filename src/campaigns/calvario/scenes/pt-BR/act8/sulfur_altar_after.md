---
id: act8/sulfur_altar_after
title: Altar marcado
chapter: 8
ambientTheme: act8
artKey: sulfur_altar
choices:
  - text: "Voltar ao Crisol — o senhor espera"
    next: act8/hub_magma_crucible
onEnter:
  - { op: setFlag, key: act8_sulfur_altar_done, value: true }
  - { op: addXp, amount: 20 }
  - { op: grantItem, itemId: ember_ring }
  - { op: addDiary, text: "O altar de enxofre aceitou o preço. Um anel de brasa ficou no dedo — e o caminho ao Senhor do Magma está aberto, se o mapa do crisol também." }
---
O amarelo recua. No fundo do crisol, algo grande move a lava como se fosse capa.
