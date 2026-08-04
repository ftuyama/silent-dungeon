---
id: act4/seal_ending
title: Final do Selo
chapter: 4
ambientTheme: act4
artKey: seal_ending
dualAttrSkillCheck:
  id: seal_calvario
  attrs: [mind, str]
  tn: 13
  rounds: 2
  successNext: act4/passage_graywind_heights
  failNext: act4/seal_ending_fail
  label: "Dois batimentos do selo — mente e ferro"
choices: []
onEnter:
  - { op: addResource, resource: faith, delta: -2 }
  - { op: addMark, mark: calvario_sealed }
  - { op: setStoryPath, id: throne, value: sealed }
---
Você sela a **Masmorra do Silêncio** com preço. Cicatrizes na alma; paz frágil nas pedras.
