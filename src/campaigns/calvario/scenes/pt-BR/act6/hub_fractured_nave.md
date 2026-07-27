---
id: act6/hub_fractured_nave
title: Nave Fraturada
chapter: 6
type: hub
ambientTheme: void
artKey: fractured_nave
highlight: true
artHighlightSfx: mysterious
choices:
  - text: "Patrulhar a nave fraturada (explorar mapa)"
    uiSection: "Explorar"
    next: shared/explore_nav_act6
    preview: "Mover-se entre colunas e ruínas; stress sobe e o vazio pode responder."
    effects:
      - { op: setExploration, graphId: act6_fractured_nave, nodeId: nave_will_altar }
      - { op: setAsciiMap, mapId: act6_fractured_nave }
  - text: "Seguir o corredor dos espelhos partidos (Prova da Realidade)"
    uiSection: "Provas"
    next: act6/reality_trial
    visibleWhen:
      all:
        - { noFlag: act6_reality_done }
        - { level: { gte: 24 } }
    condition: { level: { gte: 26 } }
    showWhenLocked: true
    lockedHint: "Você precisa de nível 26 para o primeiro cordão; uma vez concluída a prova, o corredor deixa de abrir por aqui."
    preview: "Primeiro cordão: realidade; marca permanente conforme o desfecho."
  - text: "Descer ao poço de memórias sem fundo (Prova da Memória)"
    uiSection: "Provas"
    next: act6/memory_trial
    visibleWhen:
      all:
        - { noFlag: act6_memory_done }
        - { flag: act6_reality_done }
        - { level: { gte: 24 } }
    condition:
      all:
        - { flag: act6_reality_done }
        - { level: { gte: 26 } }
    showWhenLocked: true
    lockedHint: "Requer nível 26+ e concluir primeiro a Prova da Realidade."
    preview: "Só depois do real: memória; eco deixa marca."
  - text: "Subir ao altar da vontade nua (Prova da Vontade)"
    uiSection: "Provas"
    next: act6/encounters/will_trial
    visibleWhen:
      all:
        - { noFlag: act6_will_done }
        - { flag: act6_memory_done }
        - { level: { gte: 24 } }
    condition:
      all:
        - { flag: act6_memory_done }
        - { level: { gte: 26 } }
    showWhenLocked: true
    lockedHint: "Requer nível 26+ e concluir a Prova da Memória antes."
    preview: "Última prova antes do espelho; vontade medida ou partida."
  - text: "Atravessar o Portão do Espelho Interior"
    uiSection: "Provas"
    next: act6/mirror_gate
    visibleWhen:
      all:
        - { flag: act6_will_done }
        - { level: { gte: 29 } }
        - { noMark: act6_shadow_faced }
    condition:
      all:
        - { flag: act6_reality_done }
        - { flag: act6_memory_done }
        - { flag: act6_will_done }
        - { level: { gte: 31 } }
        - { flag: act6_explore_goal_reached }
    showWhenLocked: true
    lockedHint: "Três provas, meta do mapa e nível 31 — o espelho não abre cedo."
    preview: "Três provas feitas; o espelho final abre."
  - text: "Acender a fogueira de cinzas espelhadas (acampamento)"
    uiSection: "Acampamento"
    uiSectionIcon: camp
    next: act6/camp/void_camp
    preview: "Um sopro de suprimento e silêncio partido."
  - text: "Negociar com o mercador da banca esquecida"
    uiSection: "Mercador"
    uiSectionIcon: shop
    next: act6/fractured_merchant
    preview: "Remédios e preços em ouro ou em promessa."
  - text: "Buscar o Ferreiro Dimensional"
    uiSection: "Refúgio e troca"
    next: act6/dimensional_smith/forge
    condition:
      all:
        - { flag: act6_reality_done }
        - { flag: act6_dimensional_smith_unlocked }
    preview: "Poucas palavras, muito metal e cobrança exata."
  - text: "Ouvir o sussurro sob as colunas (rota de corrupção)"
    uiSection: "Vazio"
    next: act6/void_secret_entry
    visibleWhen:
      all:
        - { noFlag: act6_void_pact }
        - { flag: act6_reality_done }
        - { level: { gte: 29 } }
    condition:
      all:
        - { flag: act6_reality_done }
        - { resource: { corruption: { gte: 4 } } }
        - { level: { gte: 31 } }
    showWhenLocked: true
    lockedHint: "Requer nível 31+, corrupção 4+ e a Prova da Realidade concluída."
    preview: "Pacto no vazio; exige corrupção alta e nível."
onEnter:
  - { op: addXp, amount: 16 }
---
Três corredores partem da **nave**: realidade, memória, vontade. O **Vazio** só abre um de cada vez.

No teto, rachaduras cortam o escuro. Entre as colunas, uma **fogueira** e uma **banca** sem dono — o pouco que ainda parece humano.
