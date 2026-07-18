---
id: act2/rats_smell
title: Cheiro
chapter: 2
ambientTheme: act2
choices:
  - text: "[%] Enfrentar o enxame"
    next: act2/encounters/rats_combat_intro
    preview: "Combate com vantagem de faro (SOR); já pagaste o stress."
    effects:
      - { op: grantTemporaryBuff, attr: luck, delta: 1, remainingScenes: 2 }
  - text: "Voltar ao cruzeiro"
    next: act2/catacomb_entry
    preview: "Recua sem combate — mas o faro fica no diário."
onEnter:
  - { op: addDiary, text: "Cheiro a carne velha e medo: três corpos pequenos, talvez quatro se a sombra maior contar." }
---
**Mofo** primeiro, depois **ferro** — e por fim um doce falso, como **cobre** aquecido.

Não é sangue fresco. É **sangue antigo** que nunca secou por completo. Contas o enxame pelo fedor: **três**, talvez **quatro**.
