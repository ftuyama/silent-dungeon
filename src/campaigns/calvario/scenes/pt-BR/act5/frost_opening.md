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
  - text: "Descer do vão — ver como ficou Cimeria"
    uiSection: "Descer"
    uiSectionIcon: descend
    next: act5/frost_cimeria_snow
onEnter:
  - { op: setChapter, chapter: 5 }
  - { op: addResource, resource: supply, delta: -1 }
  - { op: addDiary, text: "Depois do trono: Cimeria inteira em neve, ar de masmorra. Rumor de Vetrnax nas Cimeiras." }
---
Cimeria **inteira** parece coberta de neve — telhados brancos, campos sem contorno, estradas que sumiram debaixo do gelo. O **frio** entra pelo peito e prende a respiração. Nas **Cimeiras do Vento Cinzento**, o vento corta a boca.
