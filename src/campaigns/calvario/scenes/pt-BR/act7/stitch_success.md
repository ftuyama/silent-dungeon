---
id: act7/stitch_success
title: Costura que segura
chapter: 7
ambientTheme: ash_sky
artKey: stitch_sky
choices:
  - text: "Abaixar as mãos e seguir — o descampo ainda exige pernas"
    next: act7/wasteland_antechamber
onEnter:
  - { op: addMark, mark: act7_sky_stitch_true }
  - { op: addResource, resource: faith, delta: 1 }
  - { op: addXp, amount: 18 }
  - { op: addDiary, text: "Vi o céu como diagrama — por um instante, obedeceu. Paguei com suor frio, não com mentira." }
---
O horizonte estremece e recua meio tom. Não é milagre de praça — é trégua.
