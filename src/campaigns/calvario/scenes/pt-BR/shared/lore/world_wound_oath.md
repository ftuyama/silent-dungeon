---
id: shared/lore/world_wound_oath
title: Na raiz
chapter: 1
ambientTheme: explore
artKey: world_wound_oath
choices:
  - text: "Guardar o voto e voltar ao instante"
    condition: { noFlag: shared_world_lore_from_camp }
    next: act1/title_breath
    preview: "A memória fecha; a boca da masmorra espera."
  - text: "Guardar o voto e voltar ao fogo"
    condition: { flag: shared_world_lore_from_camp }
    next: act2/camp/vigilia_camp
    preview: "A memória fecha; o acampamento ainda aquece."
onEnter:
  - { op: setFlag, key: shared_world_lore_done, value: true }
  - { op: addMark, mark: world_wound_remembered }
  - { op: addDiary, text: "Lembrei o vilarejo antes do verde — e por que *{{playerName}}* desce: achar a raiz do que drena." }
---
Alguém tinha de descer. Não por glória — porque em cima só restava mentira doce e poço amargo. *{{playerName}}* fechou a mão no equipamento e escolheu a **masmorra**.

A raiz do mal não está na praça. Está embaixo, onde o **silêncio** engole o resto.
