---
id: act8/golem_forge_after
title: Forja silenciada
chapter: 8
ambientTheme: act8
artKey: golem_forge
choices:
  - text: "Voltar ao Crisol"
    next: act8/hub_magma_crucible
onEnter:
  - { op: setFlag, key: act8_golem_forge_done, value: true }
  - { op: addXp, amount: 24 }
  - { op: addResource, resource: gold, delta: 8 }
  - { op: addDiary, text: "O colosso da forja caiu. Os martelos pararam — o ódio perdeu a bigorna." }
---
A forja esfria um grau. Não o bastante para viver — o bastante para avançar ao altar de enxofre.
