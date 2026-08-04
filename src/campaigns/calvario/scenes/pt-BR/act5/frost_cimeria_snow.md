---
id: act5/frost_cimeria_snow
title: Cimeria em branco
chapter: 5
ambientTheme: act5
artKey: frost_cimeria_snow
highlight: true
choices:
  - text: "[>] Escanear Cimeria de longe"
    next: act5/frost_cimeria_snow_scout
    visibleWhen: { noFlag: frost_cimeria_scout_done }
    preview: "Teste de Mente — ler o que a neve escondeu."
  - text: "[%] Seguir o balanço na neve"
    next: act5/frost_cimeria_snow_whelp
    visibleWhen: { noFlag: frost_intro_whelp_done }
    preview: "Combate introdutório — cria de gelo curiosa."
  - text: "Seguir o desfiladeiro — rumo às Cimeiras"
    next: act5/frost_heights_rumors
onEnter:
  - { op: addDiary, text: "Subi do trono e Cimeria era outra: neve até onde a vista alcança. O vilarejo sumiu num borrão branco." }
---
Você sai do **vão** de gelo. **Cimeria** inteira parece coberta de neve agora — telhados sem fumaça, poços selados, colheita enterrada. O **frio** entra pelas frestas da armadura.
