---
id: act5/frost_contrawind/duel
title: A Medida pelo Aço
chapter: 5
ambientTheme: act5
artKey: frost_contrawind_edras
choices:
  - text: "Entrar no círculo e exigir a medida pela força"
    effects:
      - op: startCombat
        encounterId: act5_edras_duel
        onVictory: act5/frost_contrawind/duel_victory
        onDefeat: act5/frost_contrawind/duel_defeat
---
Edras finca o cajado na neve, fecha o **círculo** com um escudo de gelo e manda o contravento aprender o seu nome antes de arrancá-lo.
