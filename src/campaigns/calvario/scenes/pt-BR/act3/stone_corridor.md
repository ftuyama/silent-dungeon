---
id: act3/stone_corridor
title: Corredor das Runas
chapter: 3
ambientTheme: act3
artKey: stone_corridor
choices:
  - text: "Despertar o guardião"
    next: act3/encounters/stone_combat_intro
    condition: { noFlag: stone_guard_defeated }
  - text: "Ler as runas de contenção"
    next: act3/stone_rune_trial
    condition: { noFlag: stone_rune_trial_done }
  - text: "Vasculhar o nicho votivo"
    next: act3/stone_niche_loot
    condition: { noFlag: stone_niche_looted }
  - text: "Seguir o caminho que o poço mostrou (esquerda)"
    preview: "A memória do espelho evita a armadilha do nicho — uma vez."
    next: act3/stone_niche_loot
    condition:
      all:
        - { mark: act3_well_truth }
        - { noFlag: stone_niche_looted }
        - { noFlag: act3_well_path_used }
    effects:
      - { op: setFlag, key: act3_well_path_used, value: true }
      - { op: grantTemporaryBuff, attr: mind, delta: 1, remainingScenes: 3 }
      - { op: addDiary, text: "O espelho do poço não mentiu: a esquerda evita o dente de pedra." }
  - text: "Voltar ao núcleo das profundezas"
    next: act3/hub_depths
onEnter: []
---
Runas acendem. Um **golem** funerário bloqueia o trono.
