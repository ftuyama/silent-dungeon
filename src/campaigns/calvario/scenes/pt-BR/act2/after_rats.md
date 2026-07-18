---
id: act2/after_rats
title: Após os Ratos
chapter: 2
ambientTheme: act2
choices:
  - text: "Continuar"
    next: act2/hub_catacomb
  - text: "Mira comenta o ritmo que ouviste no chiar"
    next: act2/hub_catacomb
    condition:
      all:
        - { companionInParty: rogue_mira }
        - { mark: act2_rats_listen }
        - { noFlag: act2_mira_rats_listen_done }
    preview: "Ela respeita quem conta passos (uma vez)."
    effects:
      - { op: setFlag, key: act2_mira_rats_listen_done, value: true }
      - { op: adjustCompanionFriendship, companionId: rogue_mira, delta: 2, onceFlag: ff_cf_mira_rats_listen }
      - { op: addDiary, text: "Mira: «Contaste o chiar. Quem ouve antes de saltar vive mais no subsolo.»" }
  - text: "Mira comenta o fedor que ainda tens nos dedos"
    next: act2/hub_catacomb
    condition:
      all:
        - { companionInParty: rogue_mira }
        - { mark: act2_rats_smell }
        - { noFlag: act2_mira_rats_smell_done }
    preview: "Ela reconhece o faro — amizade leve (uma vez)."
    effects:
      - { op: setFlag, key: act2_mira_rats_smell_done, value: true }
      - { op: adjustCompanionFriendship, companionId: rogue_mira, delta: 2, onceFlag: ff_cf_mira_rats_smell }
      - { op: addDiary, text: "Mira: «Contaste-os pelo cheiro. Eu faço o mesmo — menos dentes, mais fuga.»" }
  - text: "Mira nota que ainda cheiras a fuga"
    next: act2/hub_catacomb
    condition:
      all:
        - { companionInParty: rogue_mira }
        - { mark: fled_rats }
        - { noFlag: act2_mira_fled_rats_done }
    preview: "Sem julgamento — só um aviso (uma vez)."
    effects:
      - { op: setFlag, key: act2_mira_fled_rats_done, value: true }
      - { op: addDiary, text: "Mira: «Fugir não é vergonha. Deixar rasto é. Limpa as botas.»" }
onEnter:
  - { op: addResource, resource: supply, delta: 1 }
  - { op: setFlag, key: rats_cleared, value: true }
---
Viscos escuros no calcanhar. Uma **vitória pequena** — mas suficiente para respirar.