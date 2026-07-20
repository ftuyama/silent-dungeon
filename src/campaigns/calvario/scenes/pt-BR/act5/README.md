# Act 5 — Dominar as Cimeiras

> README para agentes de IA. Resumo do enredo e referências de design — **não** é texto jogável.

## Missão principal

**Dominar as Cimeiras** — hub no desfiladeiro, explorar gelo, resgatar Tomás (janela temporal), monge na gruta, recrutar Kael (2+ vitórias), enfrentar **Vetrnax** / ritual do cume, depois Vazio (cap. 6) ou magma (cap. 8).

## Sinopse

Após Morvayn, **Cimeria** aparece coberta de neve — vilarejo sem contorno, frio que prende o peito. O opening (`frost_opening` + variantes por `storyPath: throne`) contextualiza o tom pós-trono. O **hub** (`frost_hub` / `_pact` / `_sealed`) é acampamento improvisado: patrulha no mapa `act5_frost`, mercador, fogueira.

Arcos paralelos:
- **Tomás** — escudeiro amarrado no gelo; missão até **dia 15** (`tomas_rescued` ou `tomas_rescue_missed`)
- **Monge** — gruta nas montanhas; bênção ou banimento
- **Kael** — terceiro encontro (`frost_lair_approach`); recrutamento exige 2 vitórias nos atos anteriores (`kaelsworn_recruited`)
- **Cume** — templo de pedra negra, ascensão perigosa, ritual ou combate contra **Vetrnax** (`vetrnax_slain`, `frost_summit_ritual_done`)

Morvayn caiu; o **eixo ainda desce**. O gelo não celebra. Epílogo (`frost_epilogue`) leva ao Vazio (cap. 6). Quem tem `storyPath: throne` pode também descer ao magma (cap. 8) a partir do hub.

## Tom e pacing

Superfície gelada após claustrofobia subterrânea. Vento, fumaça de fogueira fraca, pegadas que somem. Hub variantes devem **divergir de verdade** (pacto = corrupção visível; selo = fé frágil). Janela de Tomás cria urgência temporal.

## Personagens

| Papel | Notas |
|-------|-------|
| **Tomás** | Escudeiro; resgate time-gated |
| **Vetrnax** | Dragão / entidade do cume |
| **Monge do gelo** | Provas AGI/Mind/Luck |
| **Kael** | `kr_won_act5`; juramento ao grupo |
| Mira / Tomás | Fireside no `frost_camp` |

## Arco narrativo (beats)

1. `frost_opening` (+ variantes throne) — Cimeria sob neve
2. `frost_cimeria_snow` — vilarejo congelado
3. `frost_hub` — hub (storyPathGate)
4. Exploração + missões paralelas
5. `frost_summit/ascend` → ritual ou `vetrnax_slain`
6. `frost_epilogue` → `act6/opening_void_threshold`

## Hub e exploração

- **Hub:** `act5/frost_hub` (ramifica por `throne`)
- **Mapa:** `act5_frost`
- **Meta:** `act5_explore_goal_reached`
- **Acampamento:** `act5/camp/frost_camp`

## Gates de progressão

| Requisito | Conteúdo |
|-----------|----------|
| Nível 16+, dia ≤15 | Resgate Tomás |
| Nível 19+ | Gruta do monge |
| Nível 21–23 + meta | Rasto Vetrnax / cume |
| 2+ `kr_won_act*` | Recrutar Kael |
| `hasStoryPath: throne` | Descida ao magma (act8) |

## Story path (`throne`)

Hub, opening e prosa devem refletir `slain` | `pact` | `sealed`. Ver `frost_hub_pact`, `frost_hub_sealed`, `frost_opening_pact`, etc.

## Entrada / saída

- **Entrada:** `act5/frost_opening` (desde `passage_graywind_heights`)
- **Saída principal:** `act6/opening_void_threshold` (`frost_epilogue`)
- **Atalho eixo:** `act8/opening_magma_throat` ou `act8/hub_magma_crucible`

## Cenas-chave

| ID | Função |
|----|--------|
| `act5/frost_hub` | Hub com storyPathGate |
| `act5/frost_tomas/*` | Arco Tomás |
| `act5/frost_summit/*` | Cume e boss |
| `act5/frost_epilogue` | Transição act6 |

## Notas para novas cenas

- Respeitar janela dia 15 para Tomás — falha permanente (`failed` na UI de missão)
- `ambientTheme: act5`
- Cimeiras ≠ masmorra: sensorialidade de vento, gelo, hálito curto
