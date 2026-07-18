---
id: act1/title_breath
title: Um instante
chapter: 1
ambientTheme: explore
artKey: title_breath
choices:
  - text: "Está pronto. Descer."
    next: act1/crawl_entrada
    preview: "Segue para o primeiro degrau."
  - text: "Voltar à entrada"
    next: act1/title
    preview: "Sem custo; hesitar ainda é opção."
onEnter:
  - { op: setFlag, key: act1_title_breath_done, value: true }
  - { op: addDiary, text: "Respirei antes do abismo." }
  - { op: adjustLeadStress, delta: -1 }
---
O ar da superfície parece **doce** por um segundo. Depois, o pulso verde lembra-te que o doce é mentira — só o silêncio de baixo é real.
