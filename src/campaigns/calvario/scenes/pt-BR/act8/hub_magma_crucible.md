---
id: act8/hub_magma_crucible
title: Crisol de Magma
chapter: 8
type: hub
ambientTheme: act8
artKey: magma_crucible
highlight: true
choices:
  - text: "Patrulhar as veias de lava (explorar mapa)"
    uiSection: "Explorar"
    next: shared/explore_nav_act8
    preview: "Mover-se entre pontes de pedra negra; stress sobe e o calor responde."
    effects:
      - { op: setExploration, graphId: act8_magma, nodeId: crucible_rim }
      - { op: setAsciiMap, mapId: act8_magma }
  - text: "Seguir o rio de lava (missão)"
    uiSection: "Missões"
    next: act8/lava_river
    visibleWhen:
      all:
        - { noFlag: act8_lava_river_done }
        - { level: { gte: 27 } }
    condition: { level: { gte: 29 } }
    showWhenLocked: true
    lockedHint: "Requer nível 29; o rio só aceita quem já aguenta o calor."
    preview: "Corrente vermelha; golems e pedágio de carne."
  - text: "Descer à forja dos golems (missão)"
    uiSection: "Missões"
    next: act8/golem_forge
    visibleWhen:
      all:
        - { noFlag: act8_golem_forge_done }
        - { flag: act8_lava_river_done }
        - { level: { gte: 29 } }
    condition:
      all:
        - { flag: act8_lava_river_done }
        - { level: { gte: 31 } }
    showWhenLocked: true
    lockedHint: "Requer nível 31+ e concluir o rio de lava antes."
    preview: "Onde a pedra vira ódio com forma."
  - text: "Ajoelhar no altar de enxofre (missão)"
    uiSection: "Missões"
    next: act8/sulfur_altar
    visibleWhen:
      all:
        - { noFlag: act8_sulfur_altar_done }
        - { flag: act8_golem_forge_done }
        - { level: { gte: 31 } }
    condition:
      all:
        - { flag: act8_golem_forge_done }
        - { level: { gte: 33 } }
    showWhenLocked: true
    lockedHint: "Requer nível 33+ e concluir a forja dos golems antes."
    preview: "Último juramento antes do senhor do crisol."
  - text: "Desafiar o Senhor do Magma"
    uiSection: "Missões"
    next: act8/encounters/magma_lord_intro
    visibleWhen:
      all:
        - { noMark: magma_lord_slain }
        - { flag: act8_sulfur_altar_done }
        - { level: { gte: 33 } }
    condition:
      all:
        - { flag: act8_sulfur_altar_done }
        - { flag: act8_explore_goal_reached }
        - { level: { gte: 35 } }
    showWhenLocked: true
    lockedHint: "Três missões, meta do mapa e nível 35 — o crisol não abre cedo."
    preview: "Boss final das profundezas. Finale verdadeiro."
  - text: "Acender o acampamento na borda do crisol"
    uiSection: "Acampamento"
    uiSectionIcon: camp
    next: act8/camp/magma_camp
    preview: "Descanso curto; o calor não dorme de verdade."
  - text: "Negociar com o mercador de brasas"
    uiSection: "Mercador"
    uiSectionIcon: shop
    next: act8/magma_merchant
    condition: { flag: act8_merchant_found }
    showWhenLocked: true
    lockedHint: "Você ainda não encontrou a banca nas veias de lava — patrulhe o mapa."
    preview: "Preços em ouro e em pele queimada."
  - text: "Subir rumo à superfície — Cimeiras do Vento Cinzento"
    uiSection: "Subir"
    uiSectionIcon: ascend
    next: act5/frost_hub
    condition:
      all:
        - { hasStoryPath: throne }
        - { flag: act5_hub_reached }
    effects:
      - { op: setChapter, chapter: 5 }
    preview: "Voltar ao gelo — o eixo ainda liga os dois lados."
  - text: "Subir rumo à superfície — primeira neve após o trono"
    uiSection: "Subir"
    uiSectionIcon: ascend
    next: act5/frost_opening
    condition:
      all:
        - { hasStoryPath: throne }
        - { noFlag: act5_hub_reached }
    effects:
      - { op: setChapter, chapter: 5 }
    preview: "Abrir o caminho das cimeiras se você ainda não acampou no gelo."
  - text: "Seguir para as cinzas do céu (act7)"
    uiSection: "Cinzas"
    next: act7/wasteland_antechamber
    condition:
      all:
        - { hasStoryPath: throne }
        - { flag: act7_hub_reached }
    effects:
      - { op: setChapter, chapter: 7 }
    preview: "O final incompleto ainda espera quem foge do calor."
onEnter:
  - { op: addXp, amount: 12 }
  - { op: setFlag, key: act8_hub_reached, value: true }
---
O **Crisol** é fornalha com nome. Pontes de pedra negra cruzam um mar de lava; o ar arde na garganta. Aqui você desce para **acabar** o eixo — ou sobe de volta à superfície, se ainda aguenta fingir frio.
