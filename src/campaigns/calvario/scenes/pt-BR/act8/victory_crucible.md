---
id: act8/victory_crucible
title: Crisol silenciado
chapter: 8
ambientTheme: act8
artKey: magma_lord
highlight: true
choices:
  - text: "Descer ao último silêncio — o fim verdadeiro"
    next: act8/epilogue_true_depths
onEnter:
  - { op: addMark, mark: magma_lord_slain }
  - { op: addXp, amount: 40 }
  - { op: addDiary, text: "O Senhor do Magma caiu. O crisol ainda arde, mas sem vontade — o eixo finalmente tem fundo." }
---
O senhor **desaba** em pedra negra. A lava baixa um palmo — o bastante para respirar sem pedir licença ao inferno.

O eixo **fecha** o último nome. Resta o epílogo.
