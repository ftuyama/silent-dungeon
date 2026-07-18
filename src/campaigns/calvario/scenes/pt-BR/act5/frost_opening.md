---
id: act5/frost_opening
title: Cimeiras do Vento Cinzento
chapter: 5
ambientTheme: act5
artKey: frost_peaks
highlight: true
storyPathGate:
  id: throne
  branches:
    slain: act5/frost_opening
    pact: act5/frost_opening_pact
    sealed: act5/frost_opening_sealed
choices:
  - text: "Encontrar abrigo e traçar plano na neve"
    next: act5/frost_hub
onEnter:
  - { op: setChapter, chapter: 5 }
  - { op: addResource, resource: supply, delta: -1 }
  - { op: addDiary, text: "Depois do trono: vão de gelo, ar de masmorra, céu mentiroso. Rumor de dragão nas Cimeiras — só o céu hesita." }
---
O mapa é **sombras** sobre neve — o vento corta quem fala alto. Rumor de **Vetrnax** no horizonte.

**Ferro** no trono: Morvayn findou, mas o **eixo** segue para baixo. A vitória chegou magra; o frio não absolve.

O trono ficou atrás. Cada respiração paga **juros** ao frio.
