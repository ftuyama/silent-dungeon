---
id: act1/title
title: Abertura
chapter: 1
ambientTheme: explore
artKey: title
highlight: true
artHighlightFrames: [title_hl0, title_hl1, title_hl2, title_hl3, title_hl4, title_hl5]
artHighlightSfx: mysterious
highlightHoldMs: 3200
choices:
  - text: "Descer os degraus rumo ao texto gravado na pedra"
    next: act1/crawl_entrada
    preview: "O primeiro passo firme — ou hesitar e olhar antes."
  - text: "Examinar os símbolos na entrada (antes de descer)"
    next: act1/title_examine
    preview: "Lore e um rumor da superfície (sorte)."
  - text: "Respirar fundo e ajustar o equipamento"
    next: act1/title_breath
    condition: { noFlag: act1_title_breath_done }
    preview: "Um instante de calma; diário."
onEnter: []
---
O **pulso verde** sobe pela garganta da cidade; por baixo, a **masmorra** abre boca muda — pedra úmida, ferro velho, e **silêncio** que empurra para dentro.

Em cima fingem rotina; alguém tem de **cortar** isso na raiz — *{{playerName}}*, o primeiro passo é **descer**.
