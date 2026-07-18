---
id: act1/mirror_entrance
title: Vidro junto à pedra
chapter: 1
ambientTheme: explore
artKey: mirror_entrance
choices:
  - text: "Sair dali e voltar às inscrições"
    next: act1/title_examine
    preview: "Volta às linhas cinzeladas."
onEnter:
  - { op: setFlag, key: act1_entrance_mirror_done, value: true }
  - { op: addMark, mark: act1_entrance_mirror }
  - { op: addDiary, text: "No nicho, metade do meu rosto e metade do túnel — o mesmo corte." }
---
No nicho, um **espelho oval** partido: metade do seu rosto, metade do túnel.

O vidro devolve *{{playerName}}* escolhendo a cidade em silêncio — antes que o silêncio escolha por você.
