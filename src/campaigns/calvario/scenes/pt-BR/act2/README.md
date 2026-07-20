# Act 2 — Avançar pelo cruzeiro

> README para agentes de IA. Resumo do enredo e referências de design — **não** é texto jogável.

## Missão principal

**Avançar pelo cruzeiro** — hub da catacumba, limpar ratos, recrutar Mira, explorar o mapa, encontrar Kael, nível 6+, descer às profundezas (cap. 3).

## Sinopse

O herói entra num **cruzeiro de ossos** (`catacomb_entry`): velas derretidas, eco enganoso, cheiro de pedra molhada. O **hub** (`hub_catacomb`) concentra patrulha, acampamento da Vigília, mercador fantasma, rituais do Círculo e **envoys das três facções** (Vigília, Círculo, Culto do Terceiro Sino). Reputação alta ou baixa desbloqueia encontros únicos e depósitos secretos de cada facção.

Missões locais: corredor dos **ratos**, recrutamento de **Mira** (companheira), sala dos ossos onde **Kael** observa ou desafia, lore de juramentos antigos (`lore_crossroads`), pântano da sorte. O nome **Morvayn** cola na língua — necromante do trono, ainda distante. Com nível 6 e meta no mapa, o jogador **desce** (`act3/descent`).

## Tom e pacing

Primeiro ato de **exploração aberta** com mapa ASCII, stress, acampamento e dias contados (`{{day}}`). Hub com 3–5 frases; facções como topologia política do subsolo, não exposição enciclopédica. Combate frequente na patrulha; fogo e conversa no camp.

## Personagens e facções

| Papel | Notas |
|-------|-------|
| **Mira** | Recrutável; fireside, banter, confidências no cruzeiro |
| **Kael** | Rival/escudeiro juramentado; `skeleton_room`, vitória marca `kr_won_act2` |
| **Vigília** | Farol, cache, acampamento |
| **Círculo** | Ritual periódico (dia múltiplo de 5), recanto de cinza |
| **Culto** | Alcova do sino, carne de sino |
| Mercador fantasma | `merchant_moon`; aparece após dia 2 |

## Arco narrativo (beats)

1. `catacomb_entry` — três caminhos iniciais
2. `rats_choice` → limpar ninho (`rats_cleared`)
3. `hub_catacomb` — centro do ato
4. `recruit_offer` → `mira_recruited`
5. `shared/explore_nav_act2` — mapa `act2_catacomb`; meta `act2_explore_goal_reached`
6. `skeleton_room` — Kael
7. `hub_catacomb` → Descer mais fundo → `act3/descent`

## Hub e exploração

- **Hub:** `act2/hub_catacomb`
- **Mapa:** `act2_catacomb` (graph `act2_catacomb`)
- **Meta:** flag `act2_explore_goal_reached`
- **Acampamento:** `act2/camp/vigilia_camp`

## Gates de progressão

| Requisito | Destino |
|-----------|---------|
| Nível 6 + meta mapa | `act3/descent`, cap. 3 |
| Nível 7 + dia ≤10 | `lore_crossroads` (eco de juramentos) |
| Rep ≥2 ou ≤−2 por facção | Envoys únicos |
| Nível 4+, dia % 5 = 0 | Ritual do Círculo |

## Entrada / saída

- **Entrada:** `act2/catacomb_entry` (desde `dungeon_mouth`)
- **Saída:** `act3/descent` ou `act3/hub_depths`
- **Regresso:** hub pode subir a `act1/dungeon_mouth`

## Cenas-chave

| ID | Função |
|----|--------|
| `act2/hub_catacomb` | Hub principal |
| `act2/faction/*` | Arco de reputação |
| `act2/lore/lore_crossroads` | Lore temporal (enfraquece após dia 10) |
| `act2/skeleton_room` | Kael act2 |

## Notas para novas cenas

- Usar `uiSection` no hub para agrupar escolhas
- Efeitos de rep: `{ op: addRep, faction: vigilia|circulo|culto, delta: N }`
- Manter continuidade com ecos de sino e cera no chão
- Sync en-US obrigatório ao editar `.md`
