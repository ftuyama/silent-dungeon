---
id: act5/frost_monk/banished
title: A gruta fecha
chapter: 5
ambientTheme: act5
artKey: frost_monk_sealed
choices:
  - text: "Descer sozinho — a montanha não discute"
    next: act5/frost_hub
onEnter:
  - { op: setFlag, key: monk_cave_banished, value: true }
  - {
      op: addDiary,
      text: "Falhei na gruta do monge. O vento me empurrou para fora — e ouvi a pedra fechar por dentro. Não há segunda entrada.",
    }
---
A gruta **recusa** você — ar estreito, voz seca: *volte para onde ainda pode mentir com conforto. A montanha empurra você para fora.
