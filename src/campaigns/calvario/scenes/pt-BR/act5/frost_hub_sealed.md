---
id: act5/frost_hub_sealed
chapter: 5
type: hub
ambientTheme: act5
artKey: frost_peaks
highlight: true
title: Desfiladeiro — acampamento sob o selo
choices:
  - text: "Patrulhar o desfiladeiro (explorar mapa)"
    uiSection: "Explorar"
    next: shared/explore_nav_act5
    preview: "Caminhar pelo gelo com risco de encontro e aumento de stress."
    effects:
      - { op: setExploration, graphId: act5_frost, nodeId: frost_broken_watch }
      - { op: setAsciiMap, mapId: act5_frost }
  - text: "Seguir o rasto de garras na neve (missão)"
    uiSection: "Missões"
    next: act5/frost_ridgeline
    condition:
      all:
        - { level: { gte: 21 } }
        - { flag: act5_explore_goal_reached }
    showWhenLocked: true
    lockedHint: "Precisas de nível 21 e de alcançar primeiro a trilha do templo no mapa do desfiladeiro (patrulha a partir do acampamento)."
    preview: "Rasto, emboscada ou caça — a neve não julga."
  - text: "Rumor do escudeiro — corda e ritual no gelo"
    uiSection: "Missões"
    next: act5/frost_tomas/intro
    visibleWhen:
      all:
        - { noFlag: tomas_rescued }
        - { noFlag: tomas_rescue_missed }
        - { day: { lte: 15 } }
    condition: { level: { gte: 16 } }
    showWhenLocked: true
    lockedHint: "Requer nível 16+ e chegar até o dia 15 — depois o rumor esfria."
    preview: "História de Tomás; corda e gelo — mas o rumor esfria depois do dia 15."
  - text: "Rumor do escudeiro — só eco e corda vazia no gelo"
    uiSection: "Missões"
    next: act5/frost_tomas/missed
    condition:
      all:
        - { noFlag: tomas_rescued }
        - { noFlag: tomas_rescue_missed }
        - { day: { gte: 16 } }
    preview: "Demais tarde; o desfiladeiro já aprendeu outro nome para justiça."
  - text: "Viver o acampamento no gelo"
    uiSection: "Fogo e troca"
    next: act5/camp/frost_camp
    preview: "Descanso, suprimento e conversa ao fogo."
  - text: "Mercador de tenda azul-trovão"
    uiSection: "Fogo e troca"
    next: act5/frost_merchant
    preview: "Troca de ouro e itens; preço do frio."
  - text: "Montanhas de neve — rumor de um monge na gruta"
    uiSection: "Cume e gruta"
    next: act5/frost_snow_mountains_enter
    visibleWhen:
      all:
        - { noFlag: monk_cave_banished }
        - { noFlag: frost_monk_blessing_done }
    condition: { level: { gte: 19 } }
    showWhenLocked: true
    lockedHint: "Requer nível 19+ para achar a gruta do monge no gelo."
    preview: "Gruta e provas do monge; paz ou banimento."
  - text: "Rumo ao cume — templo de pedra negra (caminho perigoso)"
    uiSection: "Cume e gruta"
    next: act5/frost_summit/ascend
    condition:
      all:
        - { level: { gte: 23 } }
        - { flag: act5_explore_goal_reached }
    showWhenLocked: true
    lockedHint: "O cume exige nível 23 e encontrar primeiro a trilha do templo no mapa."
    preview: "Ascensão perigosa ao templo e ao que dorme no cume."
  - text: "Descer às profundezas de magma — o fundo do eixo"
    uiSection: "Eixo"
    next: act8/hub_magma_crucible
    condition:
      all:
        - { hasStoryPath: throne }
        - { flag: act8_hub_reached }
    effects:
      - { op: setChapter, chapter: 8 }
    preview: "Voltar ao Crisol — o calor ainda espera."
  - text: "Descer às profundezas de magma — primeira garganta"
    uiSection: "Eixo"
    next: act8/opening_magma_throat
    condition:
      all:
        - { hasStoryPath: throne }
        - { noFlag: act8_hub_reached }
    preview: "Abrir o caminho do inferno sob a pedra; sem amuleto, cada cena cobra HP."
onEnter:
  - { op: addXp, amount: 14 }
  - { op: setFlag, key: act5_hub_reached, value: true }
---
**Tendas** rangem como dentes velhos; o fogo aquece **menos** do que deveria — como se o calor respeitasse um **selo** que não vê. A neve cobre pegadas, mas o peito ainda **pesa** o que fechaste em baixo.

O mapa aqui é **decisão** em silêncio frágil: rumor, **troca**, ou deixar o vento **escolher**. Abaixo do gelo, o eixo **desce** — e a fé que gastaste no trono ainda **cobre** juros no frio.
