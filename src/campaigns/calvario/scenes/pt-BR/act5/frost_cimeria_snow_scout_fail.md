---
id: act5/frost_cimeria_snow_scout_fail
title: Neve sem contorno
chapter: 5
ambientTheme: act5
artKey: frost_cimeria_snow
choices:
  - text: "Afastar o olhar e seguir"
    next: act5/frost_cimeria_snow
onEnter:
  - { op: setFlag, key: frost_cimeria_scout_done, value: true }
  - { op: addResource, resource: supply, delta: -1 }
  - { op: addDiary, text: "Fiquei tempo demais no salto; o frio começou os dedos antes da vista." }
---
A neve **engole** contorno — vilarejo vira mancha, mancha vira dúvida. Você perde tempo e calor tentando ver o que o gelo não quer mostrar.

O **frio** entra pelas luvas. Rumor de **Vetrnax** continua lá embaixo, sem prova.
