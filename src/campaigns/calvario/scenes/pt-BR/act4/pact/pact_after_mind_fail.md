---
id: act4/pact/pact_after_mind_fail
title: Mordida do Eco
chapter: 4
ambientTheme: act4
choices:
  - text: "Atravessar mesmo assim — à força"
    next: act4/encounters/pact_vigil_skirmish
onEnter:
  - { op: addResource, resource: corruption, delta: 1 }
  - { op: addDiary, text: "O eco escorreu pela garganta. Algo partiu na atenção — e o Terceiro Sino riu baixo." }
---
O eco **morde**. Uma faísca atravessa seus pensamentos como ferro na língua.

Você ainda serve — mas o preço cola no céu da boca, doce e errado.
