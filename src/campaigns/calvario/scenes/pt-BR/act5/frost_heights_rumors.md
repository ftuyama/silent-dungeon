---
id: act5/frost_heights_rumors
title: Ecos no gelo
chapter: 5
ambientTheme: act5
artKey: frost_heights_rumors
highlight: true
choices:
  - text: "[>] Decifrar as marcas na pedra"
    next: act5/frost_heights_rumors_clues
    visibleWhen: { noFlag: frost_heights_clues_done }
    preview: "Teste de Mente — montar o mapa nas pistas riscadas."
  - text: "[~] Ouvir o vento entre os abrigos"
    next: act5/frost_heights_rumors_listen
    visibleWhen: { noFlag: frost_heights_listen_done }
    preview: "Teste de Sorte — pegar o rumor de Vetrnax antes que cale."
  - text: "[%] Confrontar o canto na fumaça"
    next: act5/frost_heights_rumors_cultist
    visibleWhen: { noFlag: frost_heights_cultist_done }
    preview: "Combate introdutório — cultista da geada no desfiladeiro."
  - text: "Ir até o acampamento improvisado no desfiladeiro"
    next: act5/frost_hub
    preview: "Fogo fraco, abrigo e rumores que viram missão."
onEnter:
  - { op: addDiary, text: "No gelo, vozes cruzadas: escudeiro amarrado, monge numa gruta, garras no cume, tenda azul-trovão. Vetrnax em todo sussurro." }
---
Numa pedra, alguém riscou com prego: *amarraram o escudeiro*. Mais adiante, fumaça fina — **tenda** ou armadilha.

**Pegadas** grandes cruzam a neve rumo ao cume; moradores murmuram **Vetrnax** sem pronunciar. Dizem também um **monge** numa gruta acima da tempestade, e **pedra negra** no topo.

Você não confirma nada. O **frio** carrega as palavras mesmo assim.
