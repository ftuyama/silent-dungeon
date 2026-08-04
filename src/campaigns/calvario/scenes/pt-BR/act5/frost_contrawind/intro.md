---
id: act5/frost_contrawind/intro
title: O Mago do Contravento
chapter: 5
ambientTheme: act5
artKey: frost_contrawind_horde
choices:
  - text: "Seguir as marcas até a capela soterrada"
    next: act5/frost_contrawind/horde
    visibleWhen: { noFlag: contrawind_horde_defeated }
    preview: "Quatro vultos cercam uma proteção que o vento ainda não rompeu."
  - text: "Retomar o caminho já aberto até a capela"
    next: act5/frost_contrawind/horde_victory
    visibleWhen: { flag: contrawind_horde_defeated }
    preview: "A neve cobre os corpos, não a dívida com quem ficou lá dentro."
  - text: "Voltar ao desfiladeiro"
    next: act5/frost_hub
---
O rumor não vem de uma boca. Vem de **pegadas** que avançam contra o vento e de quatro vozes repetindo a mesma oração ao redor de uma capela quebrada.

Dentro do círculo de neve imóvel, alguém sustenta o ar com um cajado. Os cultistas chamam esse homem de **Mago do Contravento** — e fecham o cerco.
