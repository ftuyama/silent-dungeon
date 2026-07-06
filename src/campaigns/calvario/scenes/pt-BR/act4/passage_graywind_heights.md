---
id: act4/passage_graywind_heights
title: Passagem
chapter: 4
ambientTheme: explore
choices:
  - text: "Parar no limiar — armadura cinzenta que não veio do trono"
    condition:
      all:
        - { noFlag: kaelsworn_recruited }
        - { noFlag: kr_won_act4 }
    preview: "Confronto verbal com Kael (rascunho); falha leva ao ferro."
    effects:
      - op: startCombat
        encounterId: kael_rival_act4_dialogue
        onVictory: shared/kaelsworn_post_act4
        onDefeat: shared/kael_act4_blades
        onFlee: act4/passage_graywind_heights
  - text: "Partir rumo às Cimeiras do Vento Cinzento — seguir o rumor do gelo"
    next: act5/frost_opening
    preview: "Capítulo 5. Longe do trono, o frio ainda pergunta quem manda no silêncio."
onEnter:
  - { op: registerEnding, endingId: passage_graywind_heights }
  - { op: addXp, amount: 16 }
---
{{throneOutcomeLine}}

{{factionThroneEcho}}

O trono não fechou o **eixo** — nas **Cimeiras**, a ferida abre um bolso de gelo vasto. **Dívida** com juro em **vento**.
