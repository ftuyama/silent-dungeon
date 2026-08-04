---
id: act5/frost_tomas/missed
title: Corda Vazia
chapter: 5
ambientTheme: act5
artKey: frost_tomas_missed
choices:
  - text: "Voltar ao desfiladeiro"
    next: act5/frost_hub
onEnter:
  - { op: setFlag, key: tomas_rescue_missed, value: true }
  - { op: addDiary, text: "Cheguei tarde ao rumor do escudeiro: só corda batendo no poste. Sem Tomás." }
---
A corda **bate** no poste; não há Tomás — só ausência e um sinal na neve que não é seu. Um eco murmura que quem demora no subsolo paga em carne alheia.
