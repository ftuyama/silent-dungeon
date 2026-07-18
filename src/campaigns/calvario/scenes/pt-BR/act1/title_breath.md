---
id: act1/title_breath
title: Um instante
chapter: 1
ambientTheme: explore
artKey: title_breath
choices:
  - text: "Repassar o que aconteceu no vilarejo — por que você desce"
    visibleWhen: { noFlag: shared_world_lore_done }
    preview: "Memória da superfície; uma vez."
    effects:
      - { op: setFlag, key: shared_world_lore_from_camp, value: false }
    next: shared/lore/world_wound_surface
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
O ar da superfície parece **doce** por um segundo. Depois o pulso verde lembra você: o doce é mentira. Só o silêncio de baixo é real.
