---
id: act2/faction/culto_envoy_verbal_win
title: Carne de sino — palavra
chapter: 2
ambientTheme: act2
choices:
  - text: "Afastar-se do rumor"
    next: act2/hub_catacomb
onEnter:
  - { op: addRep, faction: culto, delta: 1 }
  - { op: addDiary, text: "O rumor recuou — o Sino anotou sem sangrar o corredor." }
---
A sombra inclina a cabeça. Não perdoa. Só reconhece a dívida — e cobra outro silêncio.
