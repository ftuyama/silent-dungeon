# Act 8 — Dominar o Crisol de Magma

> README para agentes de IA. Resumo do enredo e referências de design — **não** é texto jogável.

## Missão principal

**Dominar o Crisol de Magma** — atravessar garganta, hub do crisol, três missões (rio, forja, altar), boss **Senhor do Magma** (`magma_lord_slain`). **Finale verdadeiro** das profundezas.

## Sinopse

Além do trono, o **eixo não sobe — desce**. A terra abre como mandíbula (`opening_magma_throat`): enxofre, calor, pedra que pulsa vermelho. Quem veio das Cimeiras ou do descampo entra pela garganta; quem já visitou vai direto ao **Crisol** (`hub_magma_crucible`).

O subsolo final é industria infernal: **rio de lava** (golems, pedágio de carne), **forja dos golems** (pedra vira ódio com forma), **altar de enxofre** (último juramento). Sem o amuleto das provas act6, cada cena na descida inicial **cobra HP**. Exploração no mapa `act8_magma` paralela às missões.

Com três missões, meta no mapa e nível 35+, abre **Senhor do Magma** (`magma_lord_intro`) — boss final do eixo. Acampamento na borda (`magma_camp`) e mercador de brasas oferecem alívio mínimo; o calor não dorme.

## Tom e pacing

Hostil, visceral, geológico. Oposto ao gelo (act5) e ao vazio metafísico (act6). Pouca negociação — presença e resistência. Act8 completa o arco iniciado em act4 (`passage_graywind_heights` prometeu o fundo).

## Personagens

| Papel | Notas |
|-------|-------|
| **Senhor do Magma** | Boss final act8 |
| Golems / colosso | Forja e rio |
| Mercador de brasas | `magma_merchant` |

## Arco narrativo (beats)

1. `opening_magma_throat` → `descent_crust` (taxa HP sem amuleto)
2. `hub_magma_crucible` — hub
3. `lava_river` → `act8_lava_river_done`
4. `golem_forge` → `act8_golem_forge_done`
5. `sulfur_altar` → `act8_sulfur_altar_done`
6. `encounters/magma_lord_intro` → `magma_lord_slain`

## Hub e exploração

- **Hub:** `act8/hub_magma_crucible`
- **Mapa:** `act8_magma`
- **Meta:** `act8_explore_goal_reached`
- **Acampamento:** `act8/camp/magma_camp`

## Gates de progressão

| Requisito | Missão |
|-----------|--------|
| Nível 29+ | Rio de lava |
| Rio done + nível 31+ | Forja |
| Forja done + nível 33+ | Altar enxofre |
| Altar + meta + nível 35+ | Senhor do Magma |

## Entrada / saída

- **Entrada:** múltiplas — `act4/passage_graywind_heights`, `act5/frost_hub`, `act7/before_final_horizon`
- **Flag hub:** `act8_hub_reached` (pula opening na reentrada)
- **Saída:** vitória sobre Senhor do Magma + epílogos associados

## Relação com act7

Fechar só act7 (céu) = **incompleto**. Act8 é o fecho do eixo prometido desde o trono. Prosa act8 pode ecoar `storyPath: throne` indiretamente (tom do herói), mas o hub act8 é único — não usar `storyPathGate` salvo se beats distintos forem criados.

## Cenas-chave

| ID | Função |
|----|--------|
| `act8/opening_magma_throat` | Entrada |
| `act8/hub_magma_crucible` | Hub |
| `act8/lava_river` | Missão 1 |
| `act8/golem_forge` | Missão 2 |
| `act8/sulfur_altar` | Missão 3 |
| `act8/encounters/magma_lord_intro` | Boss |

## Notas para novas cenas

- `ambientTheme: act8`
- Calor como recurso narrativo (stress, suprimento, HP)
- Boss exige sequência — não encurtar gates sem revisar balanceamento act8
