---
id: act5/encounters/frost_encounter_solo_whelp
title: Cria perdida
chapter: 5
ambientTheme: act5
choices:
  - text: "Enfrentar a cria isolada"
    effects:
      - op: startCombat
        encounterId: frost_whelp_solo
        onVictory: shared/explore_nav_act5
        onDefeat: shared/game_over
        onFlee: shared/explore_nav_act5
onEnter: []
---
Uma só **cria** te seguiu pelo eco dos seus passos — curiosidade ou **fome**, o resultado é o mesmo. Olha para você como quem lê **preço** numa vitrine: não há vergonha, só **cálculo** gelado.

Se a deixar ir, ela não te agradece — **aprende** seu cheiro para a próxima vez.
