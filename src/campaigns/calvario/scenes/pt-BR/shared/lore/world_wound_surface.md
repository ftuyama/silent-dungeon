---
id: shared/lore/world_wound_surface
title: Antes do verde
chapter: 1
ambientTheme: explore
artKey: world_wound_surface
choices:
  - text: "Seguir lembrando — o que drena o vilarejo"
    next: shared/lore/world_wound_drain
    preview: "A ferida sob a rotina."
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
Antes do **pulso verde**, o vilarejo ainda fingia manhã: pão seco, portas cedo, poços com gosto de ferro. A colheita afinou sem seca — só menos calor nas mãos.

Depois o ar ficou **doce** demais. Alguém fechava a janela e dizia que era vento. Ninguém olhava para baixo.
