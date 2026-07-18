---
id: act1/mirror_door
title: Bronze nos batentes
chapter: 1
ambientTheme: explore
choices:
  - text: "Desviar o olhar e voltar aos batentes"
    next: act1/dungeon_door
    preview: "Sem combate; volta às runas."
  - text: "[%] Mirar o espelho até o reflexo ceder"
    condition: { noFlag: act1_mirror_dialogue_done }
    preview: "Combate de diálogo; vitória marca o espelho."
    effects:
      - op: startCombat
        encounterId: act1_mirror_dialogue
        onVictory: act1/mirror_door_resolved
        onDefeat: shared/game_over
        onFlee: act1/mirror_door
onEnter: []
---
Na madeira, **bronze polido** devolve seu rosto **esverdeado** num ângulo só — armadura ou capa parece **emprestada** a outrem.

O corredor e o reflexo **respiram juntos**; por um segundo não sabes quem empurra quem para dentro.
