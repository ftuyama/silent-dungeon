---
id: act5/frost_contrawind/accepted
title: Aluno do Contravento
chapter: 5
ambientTheme: act5
artKey: frost_contrawind_edras
choices:
  - text: "Abrir o grimório de Edras"
    next: act5/frost_contrawind/merchant
    preview: "Três lições, doze moedas por página aprendida."
  - text: "Voltar ao desfiladeiro com o convite"
    next: act5/frost_hub
onEnter:
  - { op: setFlag, key: contrawind_merchant_unlocked, value: true }
  - { op: addMark, mark: contrawind_student }
  - { op: addDiary, text: "Edras aceitou medir minhas intenções e abriu o grimório do Contravento. As lições não são presentes: cada uma custa doze moedas e uma escolha de combate." }
---
Edras fecha os olhos. Quando torna a abri-los, a suspeita perdeu o fio, não o peso.
