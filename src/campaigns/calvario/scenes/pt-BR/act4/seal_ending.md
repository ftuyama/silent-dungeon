---
id: act4/seal_ending
title: Final do Selo
chapter: 4
ambientTheme: act4
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
Selas a **Masmorra do Silêncio** com preço. Cicatrizes na alma; paz frágil nas pedras.

O selo pede dois **impulsos** seguidos — primeiro a **mente** a aguentar o sino a rebentar por dentro, depois o **corpo** quando o peso cai como pedra.
