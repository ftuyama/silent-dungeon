---
id: act2/lore/lore_crossroads
chapter: 2
ambientTheme: act2
title: Eco de juramentos
choices:
  - text: "Aceitar o nome de Cavaleiro caído (cavaleiro)"
    uiSection: "Juramento"
    next: act2/encounters/trial_fallen_angel_gate
    condition:
      all:
        - { class: knight }
        - not:
            path: fallen
    preview: "Provação · anjo caído; título só se você vencer"
  - text: "Aceitar o título de Mago das trevas (arcanista)"
    uiSection: "Juramento"
    next: act2/encounters/trial_fallen_angel_gate
    condition:
      all:
        - { class: mage }
        - not:
            path: dark
    preview: "Provação · anjo caído; título só se você vencer"
  - text: "Aceitar o nome de Atirador (arqueiro)"
    uiSection: "Juramento"
    next: act2/encounters/trial_fallen_angel_gate
    condition:
      all:
        - { class: archer }
        - not:
            path: marksman
    preview: "Provação · anjo caído; título só se você vencer"
  - text: "Voltar-se ao Clérigo penitente"
    uiSection: "Juramento"
    next: act2/encounters/trial_fallen_angel_gate
    condition:
      all:
        - { class: cleric }
        - not:
            path: penitent
    preview: "Provação · anjo caído; título só se você vencer"
  - text: "Mergulhar o braço no lodo que sussurra"
    uiSection: "Sorte"
    next: act2/luck_mire
    visibleWhen: { noFlag: act2_luck_mire_done }
    preview: Sorte — 2d6 + SOR · sem decidir, você volta ao cruzeiro.
  - text: "Recordar o cavaleiro caído (eco do path)"
    uiSection: "Memória"
    next: act2/hub_catacomb
    condition:
      all:
        - { path: fallen }
        - { noFlag: act2_lore_recall_fallen_done }
    effects:
      - { op: setFlag, key: act2_lore_recall_fallen_done, value: true }
      - { op: addDiary, text: "O cruzeiro me lembrou o nome que aceitei: caído, mas ainda de pé." }
  - text: "Recordar o arcano sombrio (eco do path)"
    uiSection: "Memória"
    next: act2/hub_catacomb
    condition:
      all:
        - { path: dark }
        - { noFlag: act2_lore_recall_dark_done }
    effects:
      - { op: setFlag, key: act2_lore_recall_dark_done, value: true }
      - { op: addDiary, text: "Sombras não pedem permissão — eu dei mesmo assim." }
  - text: "Recordar o penitente (eco do path)"
    uiSection: "Memória"
    next: act2/lore/lore_penitent_recall_mind
    condition:
      all:
        - { path: penitent }
        - { noFlag: act2_lore_penitent_recall_done }
    preview: "Mente — sustentar a memória (TN 8)"
  - text: "Recordar o atirador (eco do path)"
    uiSection: "Memória"
    next: act2/hub_catacomb
    condition:
      all:
        - { path: marksman }
        - { noFlag: act2_lore_recall_marksman_done }
    effects:
      - { op: setFlag, key: act2_lore_recall_marksman_done, value: true }
      - { op: addDiary, text: "O cruzeiro me lembrou a distância que escolhi: não fuga — mira." }
  - text: "Voltar ao cruzeiro"
    uiSection: "Partir"
    next: act2/hub_catacomb
onEnter: []
---
Uma **voz** sem dono pergunta o que você foi e o que aceita ser. O ar pesa — úmido, denso. As pedras guardam marcas de juramentos quebrados.

Não há mapa neste lugar. Só a escolha que você leva na carne.
