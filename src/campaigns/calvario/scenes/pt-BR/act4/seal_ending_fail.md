---
id: act4/seal_ending_fail
title: Ruptura da Paz
chapter: 4
ambientTheme: act4
choices:
  - text: "O selo quebra. Lutar contra Morvayn"
    next: act4/encounters/fight_morvayn
onEnter:
  - { op: addMark, mark: soul_scarred_by_seal }
  - { op: grantTemporaryBuff, attr: str, delta: -1, remainingScenes: 3 }
  - { op: grantTemporaryBuff, attr: agi, delta: -1, remainingScenes: 3 }
  - { op: grantTemporaryBuff, attr: mind, delta: -1, remainingScenes: 3 }
---
A paz **falha** por um instante que basta. As pedras tremem, o selo abre uma fenda, e você leva no peito a cicatriz do que não conseguiu conter.

**Morvayn** sorri como quem já sabia: agora a luta começa com o mundo contra você.
