---
id: act4/pact/pact_ascent_fail
title: Eco Fraturado
chapter: 4
ambientTheme: act4
choices:
  - text: "Falhar em silêncio e encarar Morvayn"
    next: act4/encounters/fight_morvayn
onEnter:
  - { op: grantTemporaryBuff, attr: str, delta: -1, remainingScenes: 4 }
  - { op: grantTemporaryBuff, attr: agi, delta: -1, remainingScenes: 4 }
  - { op: grantTemporaryBuff, attr: mind, delta: -1, remainingScenes: 4 }
  - { op: addDiary, text: "Perdi o ritmo do Terceiro Sino. Subi quebrado — e Morvayn ouviu o estalo." }
---
O **Terceiro Sino** acerta por dentro como martelo em vidro.

Por um instante você sobe com joelhos de outro corpo — fôlego curto, mente em faíscas. A rua abre na frente; Morvayn já espera, como se a falha tivesse sido o convite.
