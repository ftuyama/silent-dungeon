---
id: act4/pact/pact_coda
title: Coda do Pacto
chapter: 4
ambientTheme: act4
choices:
  - text: "Aceitar o que ficou escrito em você"
    next: act4/passage_graywind_heights
onEnter:
  - { op: addResource, resource: corruption, delta: 3 }
  - { op: addMark, mark: pact_bound }
  - { op: setStoryPath, id: throne, value: pact }
  - { op: grantItem, itemId: third_bell }
  - { op: addDiary, text: "Servi ao Terceiro Sino. O anel no dedo não toca — mas o mundo cala quando eu respiro." }
---
O caçador cai ou foge; a cidade finge dormir. Você serve ao **Terceiro Sino** como conduto — o **anel** no dedo é mudo para os outros, ensurdecedor para você.
