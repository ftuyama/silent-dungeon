---
id: act1/crawl_touch
title: A parede
chapter: 1
ambientTheme: explore
choices:
  - text: "Continuar a descida"
    next: act1/class_gate
    condition: { noFlag: act1_class_chosen }
    preview: "Segue para o juramento."
  - text: "Seguir até a boca da masmorra"
    next: act1/dungeon_mouth
    condition: { flag: act1_class_chosen }
    preview: "Juramento feito; o ar lá fora ainda ouve."
  - text: "Voltar um momento"
    next: act1/crawl_entrada
    preview: "Sem custo; um passo atrás."
onEnter:
  - { op: setFlag, key: act1_wall_touched, value: true }
  - { op: addMark, mark: act1_wall_memory }
  - { op: adjustLeadStress, delta: 1 }
  - { op: addDiary, text: "A parede lembrou-me de carne — e a mão tremeu." }
---
**Úmida**, como pele doente. Sob a crosta de salitre, veios mais macios — quase carne fossilizada.
