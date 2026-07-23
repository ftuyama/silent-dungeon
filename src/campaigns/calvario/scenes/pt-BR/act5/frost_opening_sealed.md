---
id: act5/frost_opening_sealed
title: Cimeiras do Vento Cinzento — sob o selo
chapter: 5
ambientTheme: act5
artKey: frost_peaks_sealed
highlight: true
choices:
  - text: "Descer do vão — ver como ficou Cimeria"
    uiSection: "Descer"
    uiSectionIcon: descend
    next: act5/frost_cimeria_snow
onEnter:
  - { op: setChapter, chapter: 5 }
  - { op: addResource, resource: supply, delta: -1 }
  - { op: addDiary, text: "Depois do trono: Cimeria inteira em neve, ar de masmorra. Selei a masmorra com fé. Rumor de Vetrnax nas Cimeiras." }
---
Cimeria **inteira** parece coberta de neve — telhados brancos, campos sem contorno. O **frio** entra pelo peito e lembra o **peso** do selo que você carrega.

Nas **Cimeiras**, o vento corta a boca. Rumor de **Vetrnax** corre de abrigo em abrigo — dragão no cume, hálito que congela o grito antes do som.

Você selou o buraco com **fé**. O subsolo cala; a paz sob o céu é frágil como gelo fino.
