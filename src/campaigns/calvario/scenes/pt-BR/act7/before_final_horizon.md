---
id: act7/before_final_horizon
title: Antes do último horizonte
chapter: 7
ambientTheme: ash_sky
artKey: last_horizon
highlight: true
artHighlightSfx: mysterious
choices:
  - text: "Descer às profundezas de magma — recusar o final incompleto"
    uiSection: "Descer"
    uiSectionIcon: descend
    next: act8/hub_magma_crucible
    condition:
      all:
        - { hasStoryPath: throne }
        - { flag: act8_hub_reached }
    effects:
      - { op: setChapter, chapter: 8 }
    preview: "O crisol ainda espera — o céu não é vitória."
  - text: "Descer às profundezas de magma — recusar o final incompleto"
    uiSection: "Descer"
    uiSectionIcon: descend
    next: act8/opening_magma_throat
    condition:
      all:
        - { hasStoryPath: throne }
        - { noFlag: act8_hub_reached }
    effects:
      - { op: setChapter, chapter: 8 }
    preview: "Descer agora, antes de fechar o diário no céu mentiroso."
  - text: "Oferecer fé como moeda — comprar silêncio ao céu por um instante"
    next: act7/epilogue_apocalypse
    visibleWhen: { noMark: act7_paid_sky_in_faith }
    condition: { resource: { faith: { gte: 1 } } }
    showWhenLocked: true
    lockedHint: "O céu cobra fé que ainda exista — precisas de pelo menos 1 para abrir este contrato."
    effects:
      - { op: addResource, resource: faith, delta: -2 }
      - { op: addMark, mark: act7_paid_sky_in_faith }
      - { op: addDiary, text: "Paguei o céu com o que ainda tinha de vertical. Sobrou corpo — não sobrou desculpa. O eixo, abaixo, ficou por fechar." }
    preview: "−2 fé · final incompleto — fuga ao céu"
  - text: "Dar o que resta de humano ao rumor — pagar o preço na pele"
    next: act7/epilogue_apocalypse
    visibleWhen: { noMark: act7_sealed_in_ember }
    effects:
      - { op: addResource, resource: corruption, delta: 1 }
      - { op: addResource, resource: supply, delta: -1 }
      - { op: addMark, mark: act7_sealed_in_ember }
      - { op: addDiary, text: "Não negociei com Deus — negociei com o fogo. O resultado é o mesmo: menos pele, mais verdade — e o fundo do eixo por visitar." }
    preview: "+1 corrupção · −1 suprimento · final incompleto"
  - text: "Seguir sem oferta — só o passo nu"
    next: act7/epilogue_apocalypse
    visibleWhen: { noMark: act7_walked_bare }
    effects:
      - { op: addMark, mark: act7_walked_bare }
      - { op: addDiary, text: "Não deixei oferta no altar do fim — deixei pegadas. Se o mundo cobrar depois, já saberá onde me encontrar: ainda acima do verdadeiro fundo." }
    preview: "Marca de recusa — final incompleto"
onEnter: []
---
O horizonte mostra a última linha. Fechar aqui é **incompleto**: o eixo ainda desce para o magma. O vento para outra vez.
