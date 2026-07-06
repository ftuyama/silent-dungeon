---
id: act7/event_last_train
title: Último trem de pó
chapter: 7
ambientTheme: ash_sky
artKey: ghost_train
choices:
  - text: "Subir ao vagão e deixar o vento roubar o que sobrou"
    next: act7/before_final_horizon
onEnter:
  - { op: addMark, mark: act7_last_train_rider }
  - { op: addResource, resource: gold, delta: -3 }
  - { op: addResource, resource: faith, delta: 1 }
  - { op: addDiary, text: "Vi um trem sem trilhos — só caixotes e pó. Paguei passagem com ouro que já não comprava nada em lugar nenhum; ganhei um instante de fé como quem ganha soneca antes do teto cair." }
---
Um **vagão** aberto, cheio de **pó** que já foi gente. O maquinista é um **relógio** parado — sorri como quem sabe que **atraso** e **fim** são a mesma palavra.

**Três moedas** compram um lugar na beira — não para fugir: para **lembrar** que fugir também é **orar**.
