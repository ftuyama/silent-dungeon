---
id: act4/throne/throne_nerves
title: Prova de nervos
chapter: 4
ambientTheme: act4
luckCheck:
  id: throne_nerves_steady
  tn: 10
  successNext: act4/throne/throne_nerves_ok
  failNext: act4/throne/throne_nerves_fail
  label: "Manter as mãos firmes quando o chão trai"
choices: []
onEnter:
  - { op: setFlag, key: throne_acted_nerves, value: true }
---
O chão inventa degraus. Se você hesita, o osso sob os pés lembra seu peso — e cobra.
