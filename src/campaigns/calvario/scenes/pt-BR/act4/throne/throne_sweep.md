---
id: act4/throne/throne_sweep
title: Última varredura
chapter: 4
ambientTheme: act4
artKey: throne_sweep
choices:
  - text: "Seguir uma fissura atrás do trono (explorar em silêncio)"
    condition: { noItem: morvayn_heart_shard }
    next: act4/throne/throne_sweep_hidden_treasure
  - text: "Catalogar ossos e sombras (teste de Mente)"
    next: act4/throne/throne_sweep_catalog
    condition: { noFlag: throne_sweep_catalog_done }
    effects:
      - { op: setFlag, key: throne_sweep_catalog_done, value: true }
  - text: "Soltar uma sílaba proibida ao vácuo (sorte)"
    next: act4/throne/throne_sweep_word
    condition: { noFlag: throne_sweep_word_done }
    effects:
      - { op: setFlag, key: throne_sweep_word_done, value: true }
  - text: "Não dar mais tempo ao osso — à segunda fase"
    next: act4/encounters/fight_morvayn_2
onEnter: []
---
Antes que o trono **feche** a conta, pode tratar o salão como **mesa** — medições, apostas, **erros** honestos.
