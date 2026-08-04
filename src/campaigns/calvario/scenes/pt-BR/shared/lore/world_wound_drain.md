---
id: shared/lore/world_wound_drain
title: O que drena
chapter: 1
ambientTheme: explore
artKey: world_wound_drain
choices:
  - text: "Seguir lembrando — por que você desce"
    next: shared/lore/world_wound_oath
    preview: "O voto na raiz."
  - text: "Parar por agora — voltar ao instante"
    condition: { noFlag: shared_world_lore_from_camp }
    next: act1/title_breath
    preview: "A memória fica pela metade."
  - text: "Parar por agora — voltar ao fogo"
    condition: { flag: shared_world_lore_from_camp }
    next: act2/camp/vigilia_camp
    preview: "A memória fica pela metade."
onEnter: []
---
Não veio exército. Algo **puxa**: calor da lareira, nomes na língua, o som que sobra entre duas frases.
