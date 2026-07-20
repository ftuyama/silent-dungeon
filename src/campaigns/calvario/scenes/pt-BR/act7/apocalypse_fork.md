---
id: act7/apocalypse_fork
title: Onde o fim escolhe boca
chapter: 7
ambientTheme: ash_sky
artKey: ashen_fork
highlight: true
artHighlightSfx: mysterious
choices:
  - text: "Tentar coser o firmamento com pensamento e prece — um fio de cada vez"
    next: act7/path_stitch_sky
    visibleWhen:
      all:
        - { noMark: act7_sky_stitch_true }
        - { noMark: act7_sky_stitch_torn }
    preview: "Prova de Mente; sucesso dá fé e marca; falha rasga fé e suja a pele."
  - text: "Alimentar o fogo com o que ainda queimas por dentro"
    next: act7/path_ember_devour
    visibleWhen: { noMark: act7_ember_witness }
    preview: "−1 suprimento · +2 corrupção · marca de testemunha do fogo."
onEnter: []
---
Não há terceira opção neutra. O apocalipse cobra um verbo: **segurar** o mundo como ferida aberta, ou **servir** de lenha e chamar isso de luz.

O vento para um instante — não para poupar você. Para ouvir qual boca abre.
