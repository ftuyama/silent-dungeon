---
id: act5/frost_opening_pact
title: Cimeiras do Vento Cinzento — sob o Sino
chapter: 5
ambientTheme: act5
artKey: frost_peaks_pact
highlight: true
choices:
  - text: "Descer do vão — ver como ficou Cimeria"
    next: act5/frost_cimeria_snow
onEnter:
  - { op: setChapter, chapter: 5 }
  - { op: addResource, resource: supply, delta: -1 }
  - { op: addDiary, text: "Depois do trono: Cimeria inteira em neve, ar de masmorra. O Terceiro Sino sobe comigo. Rumor de Vetrnax nas Cimeiras." }
---
Cimeria **inteira** parece coberta de neve — telhados brancos, campos sem contorno. O **frio** entra pelo peito; o **Terceiro Sino** late sob a pele e não aquece nada.

Nas **Cimeiras**, o vento corta a boca. Rumor de **Vetrnax** corre de abrigo em abrigo — dragão no cume, hálito que congela o grito antes do som.

A **corrupção** sobe com cada degrau. O desfiladeiro cala quando você respira alto demais.
