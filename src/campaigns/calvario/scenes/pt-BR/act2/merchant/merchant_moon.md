---
id: act2/merchant/merchant_moon
chapter: 2
ambientTheme: merchant
artKey: merchant
title: Mercador sem rosto
choices:
  - text: "Aceitar o mapa rasgado (−1 ouro)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act2/hub_catacomb
    visibleWhen: { noItem: rumor_map }
    condition: { resource: { gold: { gte: 1 } } }
    showWhenLocked: true
    lockedHint: "Você precisa de 1 ouro."
    preview: "Item · mapa de rumor"
    effects:
      - { op: grantItem, itemId: rumor_map }
      - { op: addResource, resource: gold, delta: -1 }
  - text: "Comprar adaga de ferro (−3 ouro)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act2/hub_catacomb
    visibleWhen: { noItem: iron_dagger }
    condition: { resource: { gold: { gte: 3 } } }
    showWhenLocked: true
    lockedHint: "Você precisa de 3 ouro."
    effects:
      - { op: grantItem, itemId: iron_dagger }
      - { op: addResource, resource: gold, delta: -3 }
    preview: "Arma · para o inventário"
  - text: "Comprar Hidromel (−2 ouro)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act2/hub_catacomb
    visibleWhen: { noFlag: act2_merch_moon_stress_1 }
    condition:
      all:
        - { resource: { gold: { gte: 2 } } }
        - { level: { gte: 2 } }
    showWhenLocked: true
    lockedHint: "Requer 2 ouro e nível 2+."
    effects:
      - { op: addResource, resource: gold, delta: -2 }
      - { op: grantItem, itemId: potion_stress }
      - { op: setFlag, key: act2_merch_moon_stress_1, value: true }
    preview: "Consumível · reduz estresse"
  - text: "Comprar Suprimento (−5 ouro)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act2/hub_catacomb
    visibleWhen: { noFlag: act2_merch_moon_supply_1 }
    condition:
      all:
        - { resource: { gold: { gte: 5 } } }
        - { level: { gte: 3 } }
    showWhenLocked: true
    lockedHint: "Requer 5 ouro e nível 3+."
    effects:
      - { op: addResource, resource: gold, delta: -5 }
      - { op: addResource, resource: supply, delta: 1 }
      - { op: setFlag, key: act2_merch_moon_supply_1, value: true }
    preview: "Descansar também é parte da batalha"
  - text: "Comprar Suprimento (−5 ouro)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act2/hub_catacomb
    visibleWhen: { noFlag: act2_merch_moon_supply_2 }
    condition:
      all:
        - { resource: { gold: { gte: 5 } } }
        - { level: { gte: 11 } }
    showWhenLocked: true
    lockedHint: "Requer 5 ouro e nível 11+."
    effects:
      - { op: addResource, resource: gold, delta: -5 }
      - { op: addResource, resource: supply, delta: 1 }
      - { op: setFlag, key: act2_merch_moon_supply_2, value: true }
    preview: "Recurso · estoque único"
  - text: "Comprar Resto de Suprimento (−10 ouro)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act2/hub_catacomb
    visibleWhen: { noFlag: act2_merch_moon_supply_3 }
    condition:
      all:
        - { resource: { gold: { gte: 10 } } }
        - { level: { gte: 20 } }
    showWhenLocked: true
    lockedHint: "Requer 10 ouro e nível 20+."
    effects:
      - { op: addResource, resource: gold, delta: -10 }
      - { op: addResource, resource: supply, delta: 1 }
      - { op: setFlag, key: act2_merch_moon_supply_3, value: true }
    preview: "Um verdadeiro achado"
  - text: "Kit de campo da Vigília (−7 ouro)"
    uiSection: "À venda"
    uiSectionIcon: shop
    next: act2/hub_catacomb
    visibleWhen: { noFlag: act2_merch_vigilia_field_kit }
    condition:
      all:
        - { rep: { faction: vigilia, gte: 5 } }
        - { resource: { gold: { gte: 7 } } }
        - { resource: { supply: { lte: 7 } } }
    showWhenLocked: true
    lockedHint: "Requer rep Vigília ≥5, 7 ouro e suprimento ≤7."
    effects:
      - { op: addResource, resource: gold, delta: -7 }
      - { op: addResource, resource: supply, delta: 3 }
      - { op: setFlag, key: act2_merch_vigilia_field_kit, value: true }
    preview: "Suprimento · selo da Vigília (uma vez nesta banca)"
  - text: "Recusar educadamente"
    uiSection: "Conversa"
    uiSectionIcon: talk
    next: act2/hub_catacomb
    preview: "Volta ao cruzeiro sem compra."
  - text: "Perguntar de onde veio o mapa"
    uiSection: "Conversa"
    uiSectionIcon: talk
    next: act2/merchant/merchant_ask
    preview: "Conversa; sem custo."
  - text: "Mencionar patrulhas da Vigília (aliados)"
    uiSection: "Conversa"
    uiSectionIcon: talk
    next: act2/hub_catacomb
    condition: { rep: { faction: vigilia, gte: 2 } }
    showWhenLocked: true
    lockedHint: "A Vigília só te dá esse gancho quando a reputação com você é forte (≥2)."
    effects:
      - { op: addDiary, text: "O mercador hesitou quando falei da Vigília — interesse compra silêncio." }
    preview: "Diário · rumor de respeito"
  - text: "Mostrar o fedor dos ratos — ele reconhece a ninhada"
    uiSection: "Conversa"
    uiSectionIcon: talk
    next: act2/hub_catacomb
    condition:
      all:
        - { mark: act2_rats_smell }
        - { noFlag: act2_merchant_rats_smell_done }
    preview: "Intel do faro · −1 ouro no mapa se ainda não tiveres (uma vez)."
    effects:
      - { op: setFlag, key: act2_merchant_rats_smell_done, value: true }
      - { op: addDiary, text: "O capuz inclinou: «Três e uma sombra. O ninho sobe quando a Vigilação baixa.»" }
  - text: "Repetir o sussurro da superfície — ele baixa o preço do mapa"
    uiSection: "Conversa"
    uiSectionIcon: talk
    next: act2/hub_catacomb
    visibleWhen:
      all:
        - { noFlag: act2_merchant_whisper_discount_done }
        - { noItem: rumor_map }
    condition: { mark: act1_surface_whisper_intel }
    showWhenLocked: true
    lockedHint: "Você precisa do sussurro da superfície."
    preview: "Mapa rasgado sem cobrar ouro · uma vez."
    effects:
      - { op: setFlag, key: act2_merchant_whisper_discount_done, value: true }
      - { op: grantItem, itemId: rumor_map }
      - { op: addDiary, text: "Repeti o sussurro da superfície; o capuz entregou o mapa sem cobrar o cobre." }
  - text: "Sussurrar símbolos do Círculo"
    uiSection: "Conversa"
    uiSectionIcon: talk
    next: act2/merchant/merchant_circle_bet
    condition: { rep: { faction: circulo, gte: 1 } }
    showWhenLocked: true
    lockedHint: "O Círculo só ouve sussurros de quem já lhes deve atenção (reputação ≥1)."
    preview: "Teste de sorte · aposta amaldiçoada"
  - text: "Deixar o Terceiro Sino nomear o preço"
    uiSection: "Conversa"
    uiSectionIcon: talk
    next: act2/hub_catacomb
    visibleWhen: { noFlag: act2_merchant_moon_cult_price_done }
    condition: { rep: { faction: culto, gte: 1 } }
    showWhenLocked: true
    lockedHint: "Requer rep Culto ≥1."
    effects:
      - { op: setFlag, key: act2_merchant_moon_cult_price_done, value: true }
      - { op: addResource, resource: corruption, delta: 1 }
      - { op: addDiary, text: "Uma risada seca sob o tecido — o culto gosta de quem já ouve o mesmo eco." }
    preview: "+1 corrupção, diário (uma vez)"
onEnter: []
---
Um capuz **sem rosto** estende um mapa com margens roídas. Os dedos por baixo do tecido são longos demais para serem só humanos.

*"Rumores mudam **pesos**"* — se alguém o reconhece nas facções, o preço muda.
