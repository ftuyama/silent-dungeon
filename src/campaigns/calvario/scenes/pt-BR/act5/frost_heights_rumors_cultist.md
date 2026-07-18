---
id: act5/frost_heights_rumors_cultist
title: Canto na fumaça
chapter: 5
ambientTheme: act5
artKey: frost_heights_rumors
choices:
  - text: "Confrontar quem canta na fumaça fina"
    effects:
      - op: startCombat
        encounterId: frost_cultist_solo
        onVictory: act5/frost_heights_rumors_cultist_win
        onDefeat: shared/game_over
        onFlee: act5/frost_heights_rumors
onEnter: []
---
A **fumaça** não vem de lareira — vem de incenso congelado. Alguém **canta** baixo, ritmo de geada, olhos vendidos a outro sino.

Não é duelo de ideias. É ferro no **frio**.
