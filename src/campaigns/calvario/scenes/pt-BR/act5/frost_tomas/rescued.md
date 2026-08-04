---
id: act5/frost_tomas/rescued
title: O Escudo Levanta
chapter: 5
ambientTheme: act5
artKey: frost_tomas_rescued
choices:
  - text: "Voltar ao desfiladeiro"
    next: act5/frost_hub
onEnter:
  - { op: setFlag, key: tomas_rescued, value: true }
  - { op: recruit, companionId: squire_tomas }
  - { op: grantItem, itemId: frost_pass_map }
  - { op: addDiary, text: "Arranquei Tomás da corda e do ritual. O escudo dele ainda treme — mas jurou-se a seguir quem não fugir de primeiro." }
---
A corda **parte**; **Tomás** cai de joelhos na neve e levanta o escudo antes do rosto — não para esconder, para **jurar**. > *"Ordena levantar, levanto.
