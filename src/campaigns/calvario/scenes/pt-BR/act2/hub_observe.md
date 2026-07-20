---
id: act2/hub_observe
title: Marcas
chapter: 2
ambientTheme: act2
choices:
  - text: "Conversar com Mira sobre o cruzeiro"
    next: act2/hub_mira_banter
    condition:
      all:
        - { flag: mira_recruited }
        - { noMark: mira_cruzeiro_confidencia }
    preview: "Ela já conhece o preço deste chão."
  - text: "Voltar ao hub"
    next: act2/hub_catacomb
    preview: "Volta ao cruzeiro."
onEnter:
  - { op: addMark, mark: act2_cruzeiro_marks }
---
No chão: **três sulcos** paralelos e pegadas que voltam atrás — alguém desistiu no meio.

Entre as marcas, **Morvayn** riscado com seta para baixo; um **sino** enferrujado fincado na pedra.
