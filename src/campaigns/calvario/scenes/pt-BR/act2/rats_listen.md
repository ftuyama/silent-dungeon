---
id: act2/rats_listen
title: Escuta
chapter: 2
ambientTheme: act2
choices:
  - text: "[%] Preparar-se e enfrentar"
    next: act2/encounters/rats_combat_intro
    preview: "Combate com vantagem de escuta (AGI)."
    effects:
      - { op: grantTemporaryBuff, attr: agi, delta: 1, remainingScenes: 2 }
  - text: "Voltar ao cruzeiro"
    next: act2/catacomb_entry
    preview: "Recua sem combate."
onEnter:
  - { op: addDiary, text: "O chiar dos ratos quase falava — contei passos antes de avançar." }
---
O chiar **quebra** em padrão — quase linguagem. Por um instante parecem sussurros a contar quantos passos faltam.

Algo maior range mais fundo, mas não se move.
