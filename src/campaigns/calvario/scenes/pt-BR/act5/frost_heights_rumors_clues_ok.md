---
id: act5/frost_heights_rumors_clues_ok
title: Pistas cruzadas
chapter: 5
ambientTheme: act5
artKey: frost_heights_rumors
choices:
  - text: "Anotar e seguir pelo gelo"
    next: act5/frost_heights_rumors
onEnter:
  - { op: setFlag, key: frost_heights_clues_done, value: true }
  - { op: addXp, amount: 12 }
  - { op: addDiary, text: "Na pedra: escudeiro amarrado a leste, monge acima da tempestade, tenda azul-trovão no desfiladeiro, templo de pedra negra no cume. Vetrnax em cada seta." }
---
Você monta o **mapa** nas marcas: **Tomás** amarrado a leste; **monge** numa gruta acima da tempestade; **tenda azul-trovão** mais adiante; **pedra negra** no cume. Cada seta aponta para **Vetrnax** sem escrever o nome.
