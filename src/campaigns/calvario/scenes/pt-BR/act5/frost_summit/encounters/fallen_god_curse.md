---
id: act5/frost_summit/encounters/fallen_god_curse
title: Maldição do trono
chapter: 5
ambientTheme: ancient_macabre
artKey: frost_summit_fallen
choices:
  - text: "Arrastar-me para fora do templo — vivo, mas oco"
    next: act5/frost_summit/temple_gate
onEnter:
  - { op: setFlag, key: frost_summit_ritual_cursed, value: true }
  - { op: grantTemporaryBuff, attr: str, delta: -4, remainingScenes: 14 }
  - { op: grantTemporaryBuff, attr: agi, delta: -4, remainingScenes: 14 }
  - { op: grantTemporaryBuff, attr: mind, delta: -4, remainingScenes: 14 }
  - { op: addDiary, text: "Perdi para o ecos — e o templo deixou-me uma maldição que não se confessa, só se carrega." }
---
A derrota não vem só em **ferida**. Vem em forma — uma mão no espelho interior que puxa você para baixo em três frentes: corpo, reflexo, vontade.
