---
id: act3/secret/forgotten_shrine
title: Santuário esquecido
chapter: 3
ambientTheme: act3
artKey: forgotten_shrine
choices:
  - text: "Tocar a runa central — lembrar o silêncio antes do nome"
    uiSection: "Selo"
    next: act3/hub_depths
    condition:
      all:
        - { resource: { faith: { gte: 2 } } }
        - { noFlag: act3_shrine_done }
    preview: "Fé responde à fé; o selo abre e deixa um véu leve."
    effects:
      - { op: setFlag, key: act3_shrine_done, value: true }
      - { op: addXp, amount: 25 }
      - { op: grantItem, itemId: ash_veil }
      - { op: addDiary, text: "O santuário aceitou-me — não como heróica visita, mas como quem fechou a porta antes de partir. O véu de cinzas ficou nas mãos." }
  - text: "[*] Sussurrar a fórmula contida — escutar o que o selo guarda"
    uiSection: "Selo"
    next: act3/hub_depths
    condition:
      all:
        - { class: mage }
        - { noFlag: act3_shrine_done }
    preview: "Mente sobre runa; conhecimento custa um suprimento."
    effects:
      - { op: setFlag, key: act3_shrine_done, value: true }
      - { op: addResource, resource: supply, delta: -1 }
      - { op: addXp, amount: 30 }
      - { op: addDiary, text: "A runa não pediu sangue — pediu atenção. O caderno engordou de uma página que nem sei se foi minha." }
  - text: "[!] Forçar a abertura — quebrar o selo com o ferro"
    uiSection: "Selo"
    next: act3/hub_depths
    condition:
      all:
        - { class: knight }
        - { noFlag: act3_shrine_done }
    preview: "Ferro contra silêncio; ouro e custo."
    effects:
      - { op: setFlag, key: act3_shrine_done, value: true }
      - { op: addResource, resource: corruption, delta: 1 }
      - { op: addResource, resource: gold, delta: 3 }
      - { op: addDiary, text: "Quebrei o que pedia paciência; o eco fechou-se sobre mim como gola." }
  - text: "[*] Mirar a junta da runa — abrir sem tocar no centro"
    uiSection: "Selo"
    next: act3/hub_depths
    condition:
      all:
        - { class: archer }
        - { noFlag: act3_shrine_done }
    preview: "Distância e precisão; stress leve, XP."
    effects:
      - { op: setFlag, key: act3_shrine_done, value: true }
      - { op: adjustLeadStress, delta: 1 }
      - { op: addXp, amount: 28 }
      - { op: addDiary, text: "Não forcei o selo — acertei a junta. O santuário abriu-se como quem respeita quem não se aproxima demais." }
  - text: "Recuar do santuário sem tocar"
    uiSection: "Partir"
    next: act3/hub_depths
    condition: { noFlag: act3_shrine_done }
    preview: "Fingir que não viste."
    effects:
      - { op: setFlag, key: act3_shrine_done, value: true }
      - { op: addDiary, text: "Há santuários que pedem para serem deixados em paz — fingi obediência por hoje." }
  - text: "Lembrar o santuário (já visitado)"
    uiSection: "Partir"
    next: act3/hub_depths
    condition: { flag: act3_shrine_done }
    preview: "O selo lembra você como você lembra dele."
onEnter: []
---
Atrás de um **véu** de pedra rachada abre-se uma antessala que não estava no mapa — lajes baixas, runas seladas com chumbo, água parada que espelha sem refletir. No centro, uma **runa** maior.
