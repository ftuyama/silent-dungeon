---
id: act1/mirror_descent
title: Fragmento no degrau
chapter: 1
ambientTheme: explore
artKey: crawl
choices:
  - text: "Baixar os olhos e seguir a descida"
    next: act1/class_gate
    condition: { noFlag: act1_class_chosen }
    preview: "Segue para o juramento."
  - text: "Seguir em frente — boca da masmorra"
    next: act1/dungeon_mouth
    condition: { flag: act1_class_chosen }
    preview: "Juramento feito; o ar lá fora ainda ouve."
  - text: "Afastar-se do brilho e voltar ao degrau anterior"
    next: act1/crawl_entrada
    preview: "Recua sem combate."
onEnter:
  - { op: addMark, mark: act1_mirror_shard }
  - { op: addDiary, text: "Vi-me num caco de espelho: um estranho com o meu nome." }
---
Na argamassa, um **caco de espelho** — borda negra, luz a mentir — devolve *{{playerName}}* **cansado**, boca mais fechada do que lembravas.

Medo velho: **voltar** igual se a sombra **ganhar** em cima antes de você.
