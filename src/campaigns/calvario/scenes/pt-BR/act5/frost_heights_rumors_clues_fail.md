---
id: act5/frost_heights_rumors_clues_fail
title: Letras congeladas
chapter: 5
ambientTheme: act5
artKey: frost_heights_rumors
choices:
  - text: "Desistir da leitura e seguir"
    next: act5/frost_heights_rumors
onEnter:
  - { op: setFlag, key: frost_heights_clues_done, value: true }
  - { op: addResource, resource: corruption, delta: 1 }
  - { op: addDiary, text: "As marcas na pedra se misturaram com gelo novo; só ficou o medo de errar o caminho." }
---
A geada **repintou** metade das letras. O que resta parece acusação — ou mapa torto.
