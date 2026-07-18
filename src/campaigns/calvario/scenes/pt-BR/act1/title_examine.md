---
id: act1/title_examine
title: Inscrições
chapter: 1
ambientTheme: explore
artKey: crawl
choices:
  - text: "Reparar num espelho partido num nicho — encarar o reflexo"
    next: act1/mirror_entrance
    condition: { noFlag: act1_entrance_mirror_done }
    preview: "Só olhar; o abismo devolve o seu rosto."
  - text: "[%] Escutar vozes que descem da cidade (sorte)"
    next: act1/surface_whisper
    condition: { noFlag: act1_surface_whisper_done }
    preview: "Ouro ou corrupção — rumor da superfície."
  - text: "Voltar à entrada"
    next: act1/title
    preview: "Sem risco; volta ao limiar."
onEnter: []
---
Alguém cinzelou **três linhas** antes que a ferrugem comesse a pedra:

> *"Aqui não há perdão — há eco."* Por cima, uma **espiral** riscada aponta para baixo.
