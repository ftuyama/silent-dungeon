---
id: act3/cult_passage
title: Passagem do Culto
chapter: 3
ambientTheme: act3
choices:
  - text: "Deixar uma moeda no nicho — pedir passagem ao ouvido do Sino"
    preview: "Ouro e aprendizado · marca de confiança do culto (uma vez)."
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
  - text: "Confiar no espelho do poço — atravessar sem tocar no nicho"
    preview: "Verdade do poço · passagem limpa e XP (uma vez)."
    next: act3/hub_depths
    condition:
      all:
        - { flag: well_truth }
        - { noFlag: act3_cult_passage_well_truth_used }
    effects:
      - { op: setFlag, key: act3_cult_passage_well_truth_used, value: true }
      - { op: addXp, amount: 12 }
      - { op: addDiary, text: "O atalho bateu certo com o que o poço mostrou — o nicho ficou para trás, intacto." }
  - text: "Seguir o atalho sem profanar o nicho"
    preview: "Deixar o ritual alheio no lugar — o mapa já mentiu por você."
    next: act3/hub_depths
  - text: "Arrancar o caco e o fio — o culto nota, a Vigília também"
    preview: "Símbolo e prova no bolso; pressa e inimizade."
    next: act3/hub_depths
    condition: { noFlag: act3_cult_passage_desecrated }
    effects:
      - { op: setFlag, key: act3_cult_passage_desecrated, value: true }
      - { op: addResource, resource: supply, delta: -1 }
      - { op: addRep, faction: vigilia, delta: -1, directGain: true }
      - { op: addDiary, text: "Roubei o caco do Terceiro Sino ao nicho — o silêncio da ordem vai custar caro." }
  - text: "O falso mapa ainda puxa — escutar o sino no nicho"
    preview: "Engano do poço · o culto já espera (combate)."
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
