---
id: act5/frost_lair_approach
title: Aproximação ao Covil de Gelo
chapter: 5
ambientTheme: act5
artKey: ice_dragon
highlight: true
choices:
  - text: "Entrar na câmara do hálito branco"
    next: act5/encounters/fight_ice_dragon
  - text: "Voltar o rosto ao vento — o rasto cinzento espera"
    condition:
      all:
        - { noFlag: kaelsworn_recruited }
        - { noFlag: kr_won_act5 }
    preview: "Confronto verbal com Kael (rascunho); falha leva ao ferro."
    effects:
      - op: startCombat
        encounterId: kael_rival_act5_dialogue
        onVictory: shared/kaelsworn_post_act5
        onDefeat: shared/kael_act5_blades
        onFlee: act5/frost_lair_approach
  - text: "Retornar ao acampamento"
    next: act5/frost_hub
onEnter:
  - { op: addDiary, text: "O covil não cheira a enxofre — cheira a tempestade adiada. Vetrnax dorme acordado." }
---
**Gelo** espelha o rosto em fatias — nenhuma inteira. No fundo, dentes de inverno abrem um sorriso que não é para você.

O ar vira agulhas; o céu baixa demais.
