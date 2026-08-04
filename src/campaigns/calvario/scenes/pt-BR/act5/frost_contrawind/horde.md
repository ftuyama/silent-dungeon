---
id: act5/frost_contrawind/horde
title: Quatro Contra o Vento
chapter: 5
ambientTheme: act5
artKey: frost_contrawind_horde
choices:
  - text: "Romper o cerco antes que a capela ceda"
    effects:
      - op: startCombat
        encounterId: act5_contrawind_horde
        onVictory: act5/frost_contrawind/horde_victory
        onFlee: act5/frost_hub
        onDefeat: shared/game_over
    preview: "A horda tem número; você tem o primeiro golpe."
  - text: "Recuar enquanto as pegadas ainda levam ao acampamento"
    next: act5/frost_hub
---
Os quatro **cultistas** abrem a formação. Não guardam a capela — querem quebrar o círculo traçado na neve e alcançar quem respira dentro dele.

O contravento traz o cheiro de ferro antes das lâminas. Por um instante, nenhum deles percebe você.
