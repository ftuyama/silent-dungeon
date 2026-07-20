---
id: act3/corruption_event
title: Pulso de Corrupção
chapter: 3
ambientTheme: act3
artKey: corruption_event
highlight: true
artHighlightSfx: mysterious
choices:
  - text: "Tocar o cristal"
    preview: "Deixar o pulso entrar — a masmorra assina em você."
    next: act3/hub_depths
    effects:
      - { op: addResource, resource: corruption, delta: 1 }
  - text: "Recuar antes que o pulso o encontre de todo"
    preview: "O corpo fica a zumbir; o preço é nervo, não pele."
    next: act3/hub_depths
    effects:
      - { op: adjustLeadStress, delta: 1 }
  - text: "Ignorar de costas voltadas — fingir que o verde não existe"
    preview: "Nada muda agora; o próximo descanso pode cobrar fé."
    next: act3/hub_depths
    visibleWhen: { noFlag: act3_corruption_ignored }
    effects:
      - { op: setFlag, key: act3_corruption_ignored, value: true }
      - { op: addDiary, text: "Virei as costas ao cristal. O pulso não perdoou — só adiou." }
onEnter:
  - { op: setFlag, key: act3_corruption_event_done, value: true }
---
Um **cristal** verde pulsa. O eco da masmorra responde — um pulso que não pede permissão.

Por um instante, **Morvayn** soa como contagem, não como nome: alguém no fundo mede corações.
