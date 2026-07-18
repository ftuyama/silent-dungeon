---
id: act6/encounters/mirror_boss_intro
title: O Outro Nome
chapter: 6
ambientTheme: void
artKey: act6_mirror_final
highlight: true
artHighlightSfx: mysterious
choices:
  - text: "Tirar palavra ao reflexo antes do ferro (rascunho)"
    effects:
      - op: startCombat
        encounterId: act6_mirror_sovereign_dialogue
        onVictory: act6/encounters/mirror_boss_resolve
        onDefeat: act6/encounters/mirror_boss_blades
        onFlee: act6/hub_fractured_nave
    preview: "Confronto verbal; falha leva ao combate físico."
  - text: "Lutar contra o meu reflexo soberano"
    effects:
      - op: startCombat
        encounterId: act6_shadow_self
        onVictory: act6/encounters/mirror_boss_resolve
        onDefeat: shared/game_over
        onFlee: act6/hub_fractured_nave
onEnter: []
---
Do espelho sai alguém com seu rosto e sua postura, sem hesitação. Ele sorri como quem já ganhou a discussão.

> *"Eu sou você sem medo. Você é eu sem coragem."* Se ele vencer, você continua vivo — só deixa de **ser**.
