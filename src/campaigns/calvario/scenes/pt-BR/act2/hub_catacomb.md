---
id: act2/hub_catacomb
chapter: 2
type: hub
ambientTheme: act2
artKey: hub
highlight: true
title: Cruzeiro — hub
choices:
  - text: "Voltar ao corredor dos ratos"
    uiSection: "Corredor e troca"
    next: act2/rats_choice
    condition: { noFlag: rats_cleared }
    preview: "Ainda há rangido e fedor a ninho."
  - text: "Ir ao mercador fantasma"
    uiSection: "Corredor e troca"
    next: act2/merchant/merchant_moon
    condition: { day: { gte: 2 } }
    preview: "Comércio estranho; preço em ouro ou em segredo — raramente aparece no primeiro dia."
  - text: "Farol — voz da Vigília no cruzeiro"
    uiSection: "Facções"
    next: act2/faction/vigilia_envoy
    condition:
      all:
        - { noFlag: act2_faction_envoy_vigilia_done }
        - any:
            - { rep: { faction: vigilia, gte: 2 } }
            - { rep: { faction: vigilia, lte: -2 } }
    preview: "Reputação forte com a ordem — ou inimizade aberta. Uma vez só."
  - text: "Símbolos frescos — eco do Círculo"
    uiSection: "Facções"
    next: act2/faction/circulo_envoy
    condition:
      all:
        - { noFlag: act2_faction_envoy_circulo_done }
        - any:
            - { rep: { faction: circulo, gte: 2 } }
            - { rep: { faction: circulo, lte: -2 } }
    preview: "Círculo de confiança ou cinza hostil. Uma vez só."
  - text: "Carne de sino — rumor do Culto"
    uiSection: "Facções"
    next: act2/faction/culto_envoy
    condition:
      all:
        - { noFlag: act2_faction_envoy_culto_done }
        - any:
            - { rep: { faction: culto, gte: 2 } }
            - { rep: { faction: culto, lte: -2 } }
    preview: "Devoção ou ruptura com o Terceiro Sino. Uma vez só."
  - text: "Depósito selado — caminho que o farol mostrou"
    uiSection: "Facções"
    next: act2/faction/vigilia_cache
    condition:
      all:
        - { flag: act2_faction_envoy_vigilia_done }
        - { rep: { faction: vigilia, gte: 2 } }
        - { noFlag: act2_vigilia_cache_looted }
    preview: "Topologia da Vigília · mantimentos atrás da grade."
  - text: "Recanto de cinza — dobra que o Círculo empresta"
    uiSection: "Facções"
    next: act2/faction/circulo_ash_nook
    condition:
      all:
        - { flag: act2_faction_envoy_circulo_done }
        - { rep: { faction: circulo, gte: 2 } }
        - { noFlag: act2_circulo_ash_nook_done }
    preview: "Topologia do Círculo · forma emprestada."
  - text: "Alcove do sino — porta que o culto confessou"
    uiSection: "Facções"
    next: act2/faction/culto_bell_alcove
    condition:
      all:
        - { flag: act2_faction_envoy_culto_done }
        - { rep: { faction: culto, gte: 2 } }
        - { noFlag: act2_culto_bell_alcove_done }
    preview: "Topologia do Culto · fé e sombra."
  - text: "Ouvir proposta de Mira"
    uiSection: "Convites e ritos"
    next: act2/recruit_offer
    condition: { noFlag: mira_recruited }
    preview: "Uma voz na sombra oferece companhia."
  - text: "Ritual do Círculo (evento)"
    uiSection: "Convites e ritos"
    next: act2/circle_ritual/circle_ritual
    visibleWhen: { noFlag: act2_circle_ritual_tribute_done }
    condition:
      all:
        - { level: { gte: 4 } }
        - { dayMod: { mod: 5, eq: 0 } }
    showWhenLocked: true
    lockedHint: "Requer nível 4+ e um dia múltiplo de 5; o Círculo só cobra uma vez."
    preview: "O Círculo cobra presença; a corrupção anota."
  - text: "Acampamento da Vigília"
    uiSection: "Fogo e patrulha"
    next: act2/camp/vigilia_camp
    preview: "Fogo, reza e um sopro de suprimento."
  - text: "Patrulha do perímetro (explorar mapa)"
    uiSection: "Fogo e patrulha"
    next: shared/explore_nav_act2
    preview: "Move-te pelos túneis — stress sobe; encontros possíveis."
    effects:
      - { op: setExploration, graphId: act2_catacomb, nodeId: center_breach }
      - { op: setAsciiMap, mapId: act2_catacomb }
  - text: "Passagem marcada — eco de juramentos"
    uiSection: "Ecos do cruzeiro"
    next: act2/lore/lore_crossroads
    visibleWhen: { day: { lte: 10 } }
    condition: { level: { gte: 7 } }
    showWhenLocked: true
    lockedHint: "Requer nível 7+ e chegar até o dia 10 — depois o eco esfria."
    preview: "Memória antiga; perícia e sorte pesam — o eco enfraquece se demorares demais."
  - text: "Rasto frio — eco que quase se foi"
    uiSection: "Ecos do cruzeiro"
    next: act2/lore/lore_crossroads
    visibleWhen:
      all:
        - { day: { gte: 11 } }
        - { noFlag: act2_lore_crossroads_late }
    condition: { level: { gte: 7 } }
    showWhenLocked: true
    lockedHint: "Requer nível 7+ e dia 11+; uma última vez antes da pedra esquecer."
    preview: "Ainda há um fio; mais fraco, mas presente (uma vez)."
    effects:
      - { op: setFlag, key: act2_lore_crossroads_late, value: true }
      - { op: addDiary, text: "O eco de juramentos quase tinha sumido — toquei o rasto frio antes que a pedra esquecesse." }
  - text: "Observar o cruzeiro: marcas no chão"
    uiSection: "Ecos do cruzeiro"
    next: act2/hub_observe
    preview: "Ler o chão como mapa de quem passou antes."
  - text: "Mexer na cera das velas — moeda presa (uma vez)"
    uiSection: "Ecos do cruzeiro"
    next: act2/cruzeiro_echo_once
    condition:
      all:
        - { noFlag: act2_echo_done }
        - { day: { gte: 10 } }
    preview: "+1 ouro; sem combate."
  - text: "Escutar um eco que sussurra o dia"
    uiSection: "Ecos do cruzeiro"
    next: act2/hub_catacomb
    visibleWhen: { day: { lte: 5 } }
    condition: { level: { gte: 6 } }
    showWhenLocked: true
    lockedHint: "Requer nível 6+ e ainda estar nos primeiros cinco dias."
    preview: "Voz seca no cruzeiro; registro no diário."
    effects:
      - { op: addDiary, text: "Uma voz presa ao teto: \"Já vai no dia {{day}}.\"" }
  - text: "Subir ao último corredor — boca da masmorra"
    uiSection: "Regresso e avançar"
    next: act1/dungeon_mouth
    preview: "Braseiro, sino e batentes; o ar lá fora ainda ouve."
  - text: "Descer mais fundo"
    uiSection: "Regresso e avançar"
    next: act3/descent
    condition:
      all:
        - { level: { gte: 6 } }
        - { flag: act2_explore_goal_reached }
    showWhenLocked: true
    lockedHint: "Requer nível 6+ e alcançar a meta no mapa do cruzeiro (patrulha)."
    preview: "Capítulo 3 — a masmorra aperta o silêncio."
    effects:
      - { op: setChapter, chapter: 3 }
onEnter:
  - { op: addXp, amount: 6 }
---
Velas e **cera** prendem o passo no cruzeiro; *hoje é **dia {{day}}** no subsolo.*

Um **eco** de sino sobe das profundezas e morre antes da cidade — no intervalo, o ar arrasta **Morvayn**.
