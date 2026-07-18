---
id: act2/encounters/rats_combat_intro
chapter: 2
ambientTheme: act2
artKey: rats
title: Antes do salto
choices:
  - text: "[%] Lutar!"
    preview: "Dados e garras — vitória abre o hub."
    effects:
      - op: startCombat
        encounterId: rats_cellar
        onVictory: act2/after_rats
        onDefeat: shared/game_over
        onFlee: act2/flee_rats
onEnter: []
---
O chão **vibra** — **garras** a escavar pedra mole. Os ratos **não fogem**; avançam em arco, como se alguém os ensinara **formação**.

Aperta os dentes. Os **dados** vão contar o que a carne não quer admitir. Se cheirou o ar, já sabe quantos dentes o esperam; se escutou, o passo deles já é seu.
