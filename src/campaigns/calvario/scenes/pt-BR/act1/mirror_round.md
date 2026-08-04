---
id: act1/mirror_round
title: Espelho na roda
chapter: 1
ambientTheme: explore
artKey: mirror_round
choices:
  - text: "Soltar o fôlego e voltar ao centro da câmara"
    next: act1/class_gate
    condition: { noFlag: act1_class_chosen }
    preview: "Volta ao juramento."
  - text: "Soltar o fôlego e seguir em frente"
    next: act1/dungeon_mouth
    condition: { flag: act1_class_chosen }
    preview: "Juramento feito; o ar lá fora ainda ouve."
onEnter:
  - { op: addMark, mark: act1_hand_mirror }
  - { op: addDiary, text: "No espelho de mão, só eu — sem a água mentindo." }
---
Um **espelho de mão** na corrente enferrujada. Ridículo aqui — mas o vidro treme, e *{{playerName}}* encara *{{playerName}}* sem a água negrmentindo.
