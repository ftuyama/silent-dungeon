---
id: act5/frost_heights_rumors_listen_fail
title: Vento mudo
chapter: 5
ambientTheme: act5
artKey: frost_heights_rumors
choices:
  - text: "Seguir antes que congele de vez"
    next: act5/frost_heights_rumors
onEnter:
  - { op: setFlag, key: frost_heights_listen_done, value: true }
  - { op: addResource, resource: supply, delta: -1 }
  - { op: addDiary, text: "Fiquei ouvindo até o frio comer calor — e o rumor se perdeu no vento cinzento." }
---
O vento **vira parede**. Você perde calor esperando palavras que não voltam.
