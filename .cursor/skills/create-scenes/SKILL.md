---
name: criar-cenas-calvario
description: Use quando o usuário pedir para criar, expandir, revisar ou iterar cenas da campanha calvario em Markdown, com frontmatter YAML válido, IDs por ato e escolhas conectadas.
---

# Criar Cenas — A Masmorra do Silêncio

## Objetivo

Gerar cenas `.md` prontas para `src/campaigns/calvario/scenes/...`, válidas no schema e consistentes com o tom da campanha.

## Fluxo curto

1. Entender briefing (ato, objetivo, consequência).
2. Definir `id` e caminho (`actN/...`) em inglês.
3. Escrever frontmatter + corpo narrativo em PT-BR.
4. Revisar conexões, requisitos, efeitos e tom.
5. Sugerir validação (`validate:scenes` e `validate:unreachable`).

## Regras obrigatórias

- Entregar um único arquivo `.md` com frontmatter YAML válido.
- `id` deve bater com caminho relativo em `scenes/` (sem `.md`).
- `chapter` coerente com o ato (`act6/*` -> `chapter: 6`).
- `choices[].next` usa ID de cena, nunca path de arquivo.
- Não criar campos fora do schema.
- IDs/paths/nomes técnicos em inglês; texto do jogador em português brasileiro.

## Recursos e limites

- `supply`: 0-10
- `faith`: 0-5
- `corruption`: 0-10
- `gold`: 0-999
- Em `addResource`, usar deltas curtos e coerentes com risco/recompensa.

## Campos de cena (além de `choices`)

- **Base:** `id`, `title`, `chapter`, `type`, `ambientTheme`
- **Entrada:** `onEnter`, `repeatOnEnter`
- **Checks:** `skillCheck`, `dualAttrSkillCheck`, `luckCheck`
- **Ramo/gate:** `randomBranch`, `chapterGate`, `storyPathGate`
- **Arte/UI:** `art`, `artKey`, `highlight`, `artHighlightFrames`, `highlightHoldMs`, `campCombatHint`
- **Combate:** `encounterId`, `onVictory`, `onFlee`, `onDefeat`, `interleaveAfterCombat`

### Paths narrativos (`storyPaths`)

Decisões **grandes** (ex.: desfecho do trono) gravam um path no jogador — distinto do arquétipo de classe (`setPath` / `party[].path`).

- **Efeito:** `{ op: setStoryPath, id: throne, value: slain }` (junto com `addMark` se a conquista no diário ainda fizer sentido).
- **Condições:** `{ storyPath: { id: throne, eq: pact } }` ou `{ hasStoryPath: throne }`.
- **Catálogo:** `data/storyPaths.ts` + overlay em `entities.json` (nome/descrição da decisão e de cada valor).
- **Cenas variantes:** ficheiros separados; convenção de ID = sufixo do valor (`frost_hub`, `frost_hub_pact`, `frost_hub_sealed`).
- **Gate no ID estável** (callers continuam a apontar para o hub base):

```yaml
storyPathGate:
  id: throne
  branches:
    slain: act5/frost_hub
    pact: act5/frost_hub_pact
    sealed: act5/frost_hub_sealed
```

Corpo da base = ramo default (ex. `slain`); variantes `_pact` / `_sealed` sem `storyPathGate` (evita loops). Prosa/choices/efeitos devem divergir de verdade — não só um inject.
- **i18n:** cada variante = entrada própria no overlay en-US.
- **Quando NÃO usar path:** one-shots locais (`flag`), flavor curto, checks `_ok`/`_fail` — preferir `flag`/`mark`/`condition` na mesma cena.

### `artKey` — política beats-only

- **Beats narrativos distintos** (intro ≠ epílogo, hub ≠ prova, gate ≠ pacto, opening ≠ sealed/pact) → **artKey única** + ficheiro `ascii/scenes/<actN>/<artKey>.txt`.
- **Variantes do mesmo beat** (`_ok` / `_fail` / `_win` / ramos de skill check) → **podem partilhar** a artKey do beat pai.
- Cenas **hub / opening / boss / epilogue** ou com `highlight: true`: nunca reutilizar artKey de outro beat — o overlay dedupeia por `artKey` (`sceneArtHighlightDedupeKey`), e a segunda cena importante não mostra overlay.
- Basename do `.txt` = artKey; chaves duplicadas no glob de `ascii/art.ts` falham no build.
- Novo ficheiro pode começar com `PLACEHOLDER` até arte final.
- Antes de merge de blocos narrativos grandes: `npm run check:ascii-art:relevance` e rever tier S/A com issue `reused` entre beats distintos.

### Overlay `highlight` com animação (ASCII)

- Com `highlight: true` e `artHighlightFrames` com **duas ou mais** chaves válidas em `sceneArt`, o overlay em tela cheia **cicla** esses ficheiros durante o hold.
- `highlightHoldMs` (opcional, 400–8000): duração total do hold em ms antes do fade (omissão = 1000). O tempo divide-se em partes iguais entre quadros.
- Sem `artHighlightFrames` ou com menos de duas chaves resolvidas: comportamento de um único quadro (`art` / `artKey`).
- Cada chave = basename de `ascii/scenes/**/*.txt`; convém o primeiro quadro coincidir com a arte do corpo da cena.
- Workflow de criação dos `.txt` de variação: comando Cursor `ascii-highlight-frames`. Novo ficheiro pode começar com `PLACEHOLDER` até arte final (`npm run check:ascii-art`).

## Campos de `choices`

- `text`, `next`, `condition`, `effects`
- `preview`, `uiSection`, `uiSectionIcon` (opcional: `talk` \| `shop` \| `consumable` \| `rest` \| `leave` \| `camp` — ícone no título do grupo; não vai ao overlay en-US)
- `timedMs`, `fallbackNext`, `fallbackEffects`
- `showWhenLocked`, `lockedHint`, `visibleWhen`

## Requirements e hints

- Não há `requirements` no schema: use `condition`.
- Para mostrar opção bloqueada: `condition` + `showWhenLocked: true` + `lockedHint`.
- `preview` explica consequência; `lockedHint` explica bloqueio.
- **Quando usar teaser (`showWhenLocked`):** progresso narrativo (próxima missão, boss, porta de fé/rep), custo de recurso visível (ouro/suprimento na loja ou descanso), descoberta de mercador.
- **Sempre** usar `showWhenLocked: true` + `lockedHint` quando a `condition` incluir requisito de **nível** (`level: { gte: N }`). O jogador precisa ver o que falta subir.
- **One-shot + nível:** `visibleWhen: { noFlag: … }` (some após feito) + `condition: { level: … }` + `showWhenLocked`. Não meter o `noFlag` no mesmo `all` que o nível — senão o teaser continua após concluir.
- **Teaser gradual por nível (hubs):** `visibleWhen` controla *quando o teaser entra no menu*; `condition` controla *quando fica clicável*. Convenção: teaser aparece **2 níveis antes** do unlock (`visibleWhen: { level: { gte: unlock − 2 } }`, mínimo 1). Em cadeias (provas / missões sequenciais), incluir também a flag do elo anterior no `visibleWhen` para não teasar o próximo passo cedo demais.
- **Quando omitir (só `condition`):** inventário vazio (`hasItem` poção), sem companheiro (`companionCount`), opções “já fizeste” sem teaser de nível, e outros “não tens X” que só poluem o menu do iniciante.
- A UI colapsa automaticamente secções com **≥ 4** linhas bloqueadas (ex.: loja densa); hubs com 1–3 teasers ficam inline.

### Exemplo (bloqueada com hint)

```yaml
choices:
  - text: "[>] Abrir o relicário selado"
    condition: { resource: faith, gte: 3 }
    showWhenLocked: true
    lockedHint: "Requer Fé 3+."
    next: act3/relicario_aberto
```

### Exemplo (teaser gradual por nível — hub)

```yaml
choices:
  - text: "Descer mais fundo"
    visibleWhen: { level: { gte: 4 } }   # teaser entra cedo
    condition:
      all:
        - { level: { gte: 6 } }          # clicável mais tarde
        - { flag: act2_explore_goal_reached }
    showWhenLocked: true
    lockedHint: "Requer nível 6+ e alcançar a meta no mapa."
    next: act3/descent
```

### Exemplo (omitir quando bloqueada — inventário)

```yaml
choices:
  - text: "Usar consumível"
    condition:
      any:
        - { hasItem: potion_hp }
        - { hasItem: potion_mana }
    next: act2/camp/use_consumable
    # sem showWhenLocked — some do menu se não houver poção
```

### Exemplos rápidos de `condition`

```yaml
condition: { resource: supply, gte: 2 }
condition: { class: cleric }
condition: { rep: { faction: vigilia, gte: 1 } }
condition: { hasStoryPath: throne }
condition: { storyPath: { id: throne, eq: pact } }
condition:
  all:
    - { flag: vigilia_oath }
    - { resource: faith, gte: 2 }
```

## Escolhas temporizadas

- `timedMs` exige `fallbackNext` ou `fallbackEffects`.
- Use para urgência real (emboscada, colapso, ritual).

```yaml
choices:
  - text: "[!] Saltar antes da ponte ruir"
    timedMs: 4500
    fallbackNext: act4/bridge_fall
    fallbackEffects:
      - { op: addResource, resource: corruption, delta: 1 }
    preview: "Se hesitar, a ponte cede."
    next: act4/bridge_jump
```

## Marcadores em `choices[].text` (opcional)

- `[#]` knight, `[*]` mage, `[+]` cleric
- `[!]` risco, `[@]` camp, `[>]` exploração, `[~]` descanso, `[%]` combate
- Com `startCombat`, a UI tende a enfatizar combate automaticamente.

## Qualidade narrativa

Ver regra completa: `.cursor/rules/narrative-voice.mdc`.

- Gancho forte na abertura; prosa **curta e humana** (não mood-board de metáforas).
- 2 a 4 escolhas relevantes; pelo menos 1 trade-off claro.
- Continuidade com ato/campanha.
- Classes: `knight`, `mage`, `cleric`, `archer`.
- Facções: `vigilia`, `circulo`, `culto`.
- **Negrito** e **travessão (`—`)** OK — com moderação (ênfase real, não ritmo de template).
- Evitar: *"não é X — é Y"* em série, tripletos, metáforas económicas empilhadas, cenário que “pensa”, meta (*o jogo…*), PT-PT (*Precisas*, *Regressar*, *até ao*).
- Preferir: um detalhe sensorial concreto; escolhas como ações do jogador.
- Validar: `npm run check:pt-br` e `npm run check:narrative-voice`.

## Template base

```markdown
---
id: actX/slug_da_cena
title: Título da Cena
chapter: X
ambientTheme: explore
choices:
  - text: "Escolha A"
    next: actX/proxima_cena
  - text: "Escolha B (com custo)"
    effects:
      - { op: addResource, resource: corruption, delta: 1 }
    next: actX/outra_cena
onEnter: []
---
Texto narrativo da cena em fantasia sombria.
```

## Formato de resposta recomendado

Quando o usuário pedir cena nova sem editar arquivo automaticamente:

1. `Caminho sugerido: ...`
2. Bloco Markdown completo da cena
3. `Checklist de validação` (5-8 itens)

## Checklist antes de finalizar

- `id` confere com o caminho sugerido/arquivo.
- Frontmatter YAML válido.
- `chapter` coerente com o ato.
- `choices` com destinos plausíveis.
- Sem campos fora do schema.
- Tom consistente com a campanha (português brasileiro, fantasia sombria, masmorra e silêncio como fio condutor).
- Se aplicável, checks/effects/condições compatíveis com engine.

## pt-BR — evitar PT-PT

Texto do jogador em **português brasileiro**. Tratamento padrão: **você / seu / sua** (nunca tu/teu/tua).

Termos proibidos (usar coluna pt-BR):

| Evitar (PT-PT) | Usar (pt-BR) |
|----------------|--------------|
| telemóvel | celular |
| húmido/a | úmido/a |
| ecrã | tela |
| bónus | bônus |
| Crónica | Crônica |
| facto | fato |
| miúda/o | pequena/o |
| comboio | trem |
| carris | trilhos |
| em lado nenhum | em lugar nenhum |
| demasiado (excesso) | demais |
| num PC / num computador | em um PC / em um computador |
| portátil (laptop) | notebook |
| separador (browser) | aba |

**Nota:** *portátil* no sentido transportável (ex.: altar portátil) é válido em pt-BR.

Validar com `npm run check:pt-br` antes de entregar cenas novas.

## Sync en-US (obrigatório)

Cenas canônicas ficam em `scenes/pt-BR/`. Texto inglês vive em `locales/en-US/scenes/*.json` (overlay), **não** em `.md` duplicado.

Ao criar ou editar uma cena nesta skill, **na mesma entrega** atualize o overlay en-US:

- `title`, `body`, `choices[].text|preview|lockedHint|uiSection`
- `diaryTexts` / `onEnterDiaryTexts` se houver `addDiary`
- `skillCheckLabel` / `luckCheckLabel` / `dualAttrSkillCheckLabel` se houver label no check
- Novo `addMark` → `data/journeyMarks.ts` + `locales/{pt-BR,en-US}/entities.json`

Antes de concluir:

```bash
npm run validate:scenes -- --campaign calvario
npm run check:pt-br
npm run validate:i18n
npm run validate:i18n:translations
```
