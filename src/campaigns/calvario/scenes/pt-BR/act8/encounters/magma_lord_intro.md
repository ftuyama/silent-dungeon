---
id: act8/encounters/magma_lord_intro
title: Senhor do Magma
chapter: 8
ambientTheme: boss
artKey: magma_lord
highlight: true
choices:
  - text: "Desafiar o Senhor do Magma"
    effects:
      - op: startCombat
        encounterId: act8_magma_lord
        onVictory: act8/victory_crucible
        onDefeat: shared/game_over
        onFlee: act8/hub_magma_crucible
onEnter:
  - { op: addDiary, text: "No fundo do crisol, o Senhor do Magma ergue-se. Não é rei — é o calor com vontade." }
---
A lava sobe em coluna. Dentro dela, um tronco de pedra e ódio: o **Senhor do Magma**. Olhos de fornalha.
