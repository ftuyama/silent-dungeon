---
name: ascii-highlight-workflow
description: Use ao iterar arte Braille de cena, quadros artHighlightFrames, overlay highlight, ou quando o utilizador quer alinhar animação ao contorno (arco/porta) em vez de só “piscar” poucos pontos.
---

# Workflow — ASCII / Braille highlight

## O que escolher (Tools vs MCP vs Skill)

| Abordagem | Quando usar |
|-----------|----------------|
| **Skill (este ficheiro)** | O agente segue este fluxo; não pedir anexos ao utilizador para “ver” a arte. |
| **`npm run` + `scripts/`** | Ferramenta ideal: determinístico, versionado. O agente corre no terminal e depois **Read** nos PNGs gerados. |
| **MCP** | Desnecessário para estes utilitários locais. |
| **Anexos do utilizador** | **Evitar.** O agente gera PNGs em `tmp/ascii-preview/` e lê-os com **Read** (imagem). |

## Visão sem anexos (obrigatório para o agente)

**Gatilhos** — sempre que: `highlight` / `artHighlightFrames` / `*_hl*.txt` / pedidos de contorno, arco, porta, boca, silhueta, alinhamento visual da animação, ou após editar quadros.

1. Gerar pré-visualizações (grelha = coords de célula Braille):

   ```bash
   npm run highlight:preview-session -- --base "src/campaigns/calvario/ascii/scenes/<subdir>/<artKey>.txt"
   ```

   Isto escreve PNGs em `tmp/ascii-preview/` para o base e todos os `<artKey>_hl*.txt` na mesma pasta.

2. Na saída do terminal, localizar **`AGENT_READ_PATHS:`** (`path1|path2|…` relativos ao repo).

3. Chamar **Read** em **cada** um desses caminhos (ferramenta de imagem) antes de dizer que o contorno está certo ou de fechar a tarefa.

4. Ficheiro único: `npm run braille:preview -- caminho/arte.txt --grid` (também imprime `AGENT_READ_PATHS:`).

## Dois modos de animação

1. **Micro (respiração):** `npm run lint:highlight-frames` em modo **strict** (defeito). Ver [ascii-highlight-frames-auto](../../commands/ascii-highlight-frames-auto.md).
2. **Macro (abertura / arco):** `npm run lint:highlight-frames -- --mode dims …` — só dimensões + `hl0` = base.

```bash
npm run lint:highlight-frames -- --mode dims --glob "src/campaigns/calvario/ascii/scenes/act1/foo_hl*.txt" --base "src/.../foo.txt"
```

## Ordem típica

1. **highlight:preview-session** + **Read** (antes e depois de mudanças grandes em `.txt`).
2. **Hotspots** (opcional): só se existir imagem de referência no repo ou path dado — `npm run highlight:hotspots -- …`.
3. Editar `*_hlN.txt`.
4. **Lint** (`strict` ou `dims`).
5. `npm run check:ascii-art` e `npm run validate:scenes`.

## Ficheiros relevantes

- Comandos: [ascii-highlight-frames.md](../../commands/ascii-highlight-frames.md), [ascii-highlight-frames-auto.md](../../commands/ascii-highlight-frames-auto.md)
- Scripts: `scripts/highlight-preview-session.mjs`, `scripts/braille-art-preview.mjs`, `scripts/highlight-frames-lint.mjs`, `scripts/highlight-hotspots-from-image.mjs`, `scripts/lib/brailleArtPreviewCore.mjs`, `scripts/lib/brailleRaster.mjs`
