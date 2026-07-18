---
id: act4/throne/throne_nerves_ok
title: Firmeza
chapter: 4
ambientTheme: act4
choices:
  - text: "Voltar à ante-sala"
    next: act4/throne/throne_gate
    effects:
      - { op: addResource, resource: faith, delta: 1 }
      - { op: addDiary, text: "O medo veio — e passou sem me roubar o nome." }
onEnter:
  - { op: addXp, amount: 12 }
---
Seu corpo **acredita** em você por uma vez. Não é heroísmo — é **contrato** mínimo com o chão.
