# Act 4 — Enfrentar Morvayn

> README para agentes de IA. Resumo do enredo e referências de design — **não** é texto jogável.

## Missão principal

**Enfrentar Morvayn** — Trono de Ossos, combate em duas fases, **decisão permanente** (`storyPath: throne`), seguir além do trono (cap. 5 ou 8).

## Sinopse

**Morvayn**, necromante do trono, governa uma ante-sala de ossos e correntes (`throne_gate`). O jogador pode negociar (`morvayn_parley`), atacar de imediato, explorar o salão (runas, nervos, correntes, bênção de classe) ou comprar do mercador sombrio antes do confronto.

Combate em **duas fases** com interlúdio (`morvayn_interlude`) onde o jogador prepara mente/corpo. O desfecho grava um **story path** permanente:

| Valor | Marca | Significado |
|-------|-------|-------------|
| `slain` | `morvayn_slain` | Ferro no trono; vitória magra |
| `pact` | `pact_bound` | Pacto do Terceiro Sino; corrupção como juro |
| `sealed` | `calvario_sealed` | Selo do Calvário; fé carrega o peso |

Após a resolução, `passage_graywind_heights` abre o **eixo**: subir às Cimeiras (cap. 5) ou descer à garganta de magma (cap. 8). Kael pode ser encontrado de novo (`kr_won_act4`).

## Tom e pacing

Boss act; teatro gótico, ar doce de “doença de catedral”. Salão permite preparação — cada ensaio gasta tempo narrativo. Trégua do interlúdio é mentira calculada de Morvayn, não fraqueza real.

## Personagens

| Papel | Notas |
|-------|-------|
| **Morvayn** | Antagonista central; parley, combate, pacto ou selo |
| **Kael** | Passagem Graywind; diálogo ou lâminas |
| Mercador tardio | `late_merchant` — itens antes do boss |

## Arco narrativo (beats)

1. `act4/throne/throne_gate` — hub do trono
2. Preparação opcional: `throne_observe`, `throne_arcane`, `throne_nerves`, `throne_chains`, `throne_class_blessing`
3. `fight_morvayn` → interlúdio → `fight_morvayn_2`
4. Desfecho: `victory_peace` / `pact/pact_coda` / `seal_ending`
5. `passage_graywind_heights` — bifurcação eixo

## Story path (`throne`)

Definido em `data/storyPaths.ts`. Ramifica textos e hubs em act5 (`frost_hub`, `frost_hub_pact`, `frost_hub_sealed` via `storyPathGate`). **Não** usar flag one-shot para substituir — decisão grande = `setStoryPath`.

## Gates de progressão

- Resolver trono (qualquer dos três finais) → `passage_graywind_heights`
- Subir: `act5/frost_opening` (variantes `_pact`, `_sealed`)
- Descer: `act8/opening_magma_throat` (atalho ao magma)

## Entrada / saída

- **Entrada:** `act4/throne/throne_gate` (desde `hub_depths`)
- **Saída principal:** `act5/frost_opening` ou `act8/opening_magma_throat`
- **Regresso:** trono pode voltar a `act3/hub_depths`

## Cenas-chave

| ID | Função |
|----|--------|
| `act4/throne/throne_gate` | Hub boss |
| `act4/encounters/fight_morvayn` | Fase 1 |
| `act4/morvayn_interlude` | Preparação fase 2 |
| `act4/victory_peace` | Path `slain` |
| `act4/pact/pact_coda` | Path `pact` |
| `act4/seal_ending` | Path `sealed` |
| `act4/passage_graywind_heights` | Pós-trono / eixo |

## Notas para novas cenas

- Variantes por `storyPath` = arquivos separados (`_pact`, `_sealed`), não só inject no corpo
- `registerEnding` em passagens finais quando aplicável
- Prosa pós-trono deve ecoar facções (`{{factionThroneEcho}}` em passagem)
