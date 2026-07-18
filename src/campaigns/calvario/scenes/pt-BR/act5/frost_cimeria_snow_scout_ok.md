---
id: act5/frost_cimeria_snow_scout_ok
title: Mapa de geada
chapter: 5
ambientTheme: act5
artKey: frost_cimeria_snow
choices:
  - text: "Guardar o que viu e seguir"
    next: act5/frost_cimeria_snow
onEnter:
  - { op: setFlag, key: frost_cimeria_scout_done, value: true }
  - { op: addXp, amount: 10 }
  - { op: addDiary, text: "De longe vi Cimeria enterrada: poços selados, telhados sem fumaça, trilha do mercado sumida. O verde não voltou — só neve." }
---
Você reconhece **três** sinais: poços com tampa de gelo, telhados sem fumaça, trilha do mercado apagada. Não é inverno comum — é **Cimeria** inteira coberta de branco, como se alguém tivesse fechado a porta do mundo.

Rumor de **Vetrnax** sobe do vale sem subir a encosta. O **frio** confirma: o dragão não é só história de taverna.
