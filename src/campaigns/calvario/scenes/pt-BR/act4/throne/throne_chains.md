---
id: act4/throne/throne_chains
title: Correntes vivas
chapter: 4
ambientTheme: act4
choices:
  - text: "Recolher um fragmento preso ao metal (−1 suprimento, +2 ouro)"
    next: act4/throne/throne_gate
    condition: { resource: { supply: { gte: 1 } } }
    showWhenLocked: true
    lockedHint: "Você precisa de pelo menos 1 suprimento para forçar o fragmento sem se partir ao meio."
    effects:
      - { op: addResource, resource: supply, delta: -1 }
      - { op: addResource, resource: gold, delta: 2 }
      - { op: addDiary, text: "Arranquei um caco do osso do trono — o metal não perdoou, mas o bolso agradeceu." }
  - text: "Deixar o gotejar tocar na pele (+1 corrupção, −1 fé)"
    next: act4/throne/throne_gate
    condition: { resource: { faith: { gte: 1 } } }
    showWhenLocked: true
    lockedHint: "Sem fé para gastar, o gotejar não encontra pagamento em você — acumule pelo menos 1."
    effects:
      - { op: addResource, resource: corruption, delta: 1 }
      - { op: addResource, resource: faith, delta: -1 }
      - { op: addDiary, text: "Provei o gotejar: doce como promessa — e promessa sempre cobra." }
  - text: "Afastar as mãos e voltar"
    next: act4/throne/throne_gate
onEnter:
  - { op: setFlag, key: throne_acted_chains, value: true }
---
As correntes **querem** dedos. Não prendem só o trono — ensaiam seu nome como corrente nova.
