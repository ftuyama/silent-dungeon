---
id: act3/hub_depths
title: Núcleo das Profundezas
chapter: 3
type: hub
ambientTheme: act3
artKey: depths
highlight: true
artHighlightSfx: mysterious
choices:
  - text: "Patrulhar as profundezas"
    uiSection: "Explorar"
    next: shared/explore_nav_act3
    preview: "Mapa — stress e encontros possíveis."
    effects:
      - { op: setExploration, graphId: act3_depths, nodeId: depths_drowned_gallery }
      - { op: setAsciiMap, mapId: act3_depths }
  - text: "Corredor do guardião de pedra"
    uiSection: "Avançar"
    next: act3/stone_corridor
    preview: "Runas, golem e prova antes do trono."
  - text: "Rumo ao trono de ossos"
    uiSection: "Avançar"
    next: act4/throne/throne_gate
    visibleWhen: { level: { gte: 9 } }
    condition:
      all:
        - { level: { gte: 11 } }
        - { flag: stone_guard_defeated }
        - { flag: act3_explore_goal_reached }
    showWhenLocked: true
    lockedHint: "Nível 11, guardião derrotado e meta no mapa."
    preview: "Capítulo 4 — Morvayn."
    effects:
      - { op: setChapter, chapter: 4 }
      - { op: addDiary, text: "O trono chama." }
  - text: "Ouvir os canos sob a pedra"
    uiSection: "Missões"
    next: act3/pipes_whisper
    visibleWhen: { noFlag: act3_pipes_done }
    condition: { level: { gte: 8 } }
    showWhenLocked: true
    lockedHint: "Requer nível 8."
    preview: "Sorte; sucesso dá pista, falha gasta suprimento."
  - text: "Falar com o cultista no corredor"
    uiSection: "Missões"
    next: act3/lore/cult_negotiate
    visibleWhen: { noFlag: act3_negotiate_done }
    condition: { level: { gte: 10 } }
    showWhenLocked: true
    lockedHint: "Requer nível 10."
    preview: "Pacto, recusa ou ferro; reputação muda."
  - text: "Rasto de cinza — mensageiro interrompido"
    uiSection: "Missões"
    next: act3/messenger_cold_trail
    visibleWhen:
      all:
        - { noFlag: act3_messenger_done }
        - { level: { gte: 7 } }
    condition: { level: { gte: 9 } }
    showWhenLocked: true
    lockedHint: "Requer nível 9."
    preview: "Furtividade ou combate; reputação muda."
  - text: "Santuário esquecido"
    uiSection: "Missões"
    next: act3/secret/forgotten_shrine
    visibleWhen:
      all:
        - { noFlag: act3_shrine_done }
        - { level: { gte: 6 } }
    condition: { level: { gte: 8 } }
    showWhenLocked: true
    lockedHint: "Requer nível 8."
    preview: "Selo antigo; classe define a abertura."
  - text: "O verde ignorado chama um mensageiro"
    uiSection: "Missões"
    next: act3/encounters/cult_patrol_scene
    condition:
      all:
        - { flag: act3_corruption_ignored }
        - { noFlag: act3_corruption_ignore_patrol_done }
    preview: "Consequência de ter ignorado o cristal."
    effects:
      - { op: setFlag, key: act3_corruption_ignore_patrol_done, value: true }
  - text: "Voltar ao Cruzeiro"
    uiSection: "Subir"
    uiSectionIcon: ascend
    next: act2/hub_catacomb
    preview: "Sobe ao cruzeiro."
    effects:
      - { op: setChapter, chapter: 2 }
onEnter:
  - { op: addXp, amount: 8 }
  - { op: clearAsciiMap }
---
O **núcleo** é uma galeria afogada: pedra úmida, grelhas de bronze e um corredor que desce até o trono. **Morvayn** não aparece — mas o ar já carrega o cheiro dele. Aqui não há fogo de acampamento.
