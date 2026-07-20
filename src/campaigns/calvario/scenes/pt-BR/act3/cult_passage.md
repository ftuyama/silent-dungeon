---
id: act3/cult_passage
title: Passagem do Culto
chapter: 3
ambientTheme: act3
choices:
  - text: "Atravessar o atalho"
    preview: "Deixar o nicho intacto."
    next: act3/hub_depths
  - text: "Deixar moeda — favor do culto"
    preview: "Ouro e XP; reconhecimento do culto (uma vez)."
    next: act3/hub_depths
    condition:
      all:
        - { rep: { faction: culto, gte: 5 } }
        - { noFlag: act3_cult_passage_culto_favor }
    effects:
      - { op: setFlag, key: act3_cult_passage_culto_favor, value: true }
      - { op: addResource, resource: gold, delta: 6 }
      - { op: addXp, amount: 18 }
      - { op: addDiary, text: "O cobre lambeu a moeda e o ar ficou mais denso — como se o túnel tivesse fechado contabilidade." }
  - text: "O mapa falso puxa para a emboscada"
    preview: "O culto já espera."
    next: act3/encounters/cult_ambush_scene
    condition:
      all:
        - { flag: false_map }
        - { noFlag: act3_false_map_ambush_done }
    effects:
      - { op: setFlag, key: act3_false_map_ambush_done, value: true }
onEnter:
  - { op: addRep, faction: culto, delta: 1 }
---
O mapa rasgado aponta onde dobrar — num nicho, **ossos** amarrados com fio de cobre e um **caco de sino** fincado como cravo. A passagem estreita cheira a sebo queimado.
