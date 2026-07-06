---
id: act5/frost_opening
title: Cimeiras do Vento Cinzento
chapter: 5
ambientTheme: act5
artKey: frost_peaks
highlight: true
choices:
  - text: "Encontrar abrigo e traçar plano na neve"
    next: act5/frost_hub
onEnter:
  - { op: setChapter, chapter: 5 }
  - { op: addResource, resource: supply, delta: -1 }
  - { op: addDiary, text: "Depois do trono: vão de gelo, ar de masmorra, céu mentiroso. Rumor de dragão nas Cimeiras — só o céu hesita." }
---
O mapa é **sombras** sobre neve — o vento corta quem fala alto. Rumor de **Vetrnax** no horizonte.

{{throneOutcomeLine}}

{{factionThroneEcho}}

O trono ficou atrás. Cada respiração paga **juros** ao frio.
