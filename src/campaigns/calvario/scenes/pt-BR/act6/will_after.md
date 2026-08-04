---
id: act6/will_after
title: Juramento sem Testemunhas
chapter: 6
ambientTheme: void
artKey: will_after_altar
choices:
  - text: "Descer para a nave fraturada"
    next: act6/litany_after_will
onEnter:
  - { op: setFlag, key: act6_will_done, value: true }
  - { op: grantItem, itemId: magma_ward_amulet }
  - { op: equipItem, itemId: magma_ward_amulet, partyIndex: 0 }
  - { op: addDiary, text: "Vontade não é força para vencer todos. É disciplina para não obedecer o pior em mim. O amuleto das provas lateja — guarda contra o calor que ainda não vi." }
---
O penitente cai de joelhos, mas não sangra. Espalha um pó negro que escreve um círculo ao redor dos seus pés.
