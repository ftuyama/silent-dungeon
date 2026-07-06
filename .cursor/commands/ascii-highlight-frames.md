---
description: Gera quadros ASCII mínimos para animação do overlay highlight (artHighlightFrames).
---

# Quadros ASCII para overlay `highlight`

Para execução **só pelo agente** (algoritmo fixo, cópia literal do base, diffs mínimos, validação em loop com `npm run`), usar [ascii-highlight-frames-auto.md](ascii-highlight-frames-auto.md). Utilitários: `npm run braille:preview` (PNG + `--grid` para medir contornos), `npm run lint:highlight-frames` (`--mode strict` ou `--mode dims`), `npm run highlight:hotspots`. Fluxo geral: skill [ascii-highlight-workflow](../skills/ascii-highlight-workflow/SKILL.md) — o agente corre `highlight:preview-session` + **Read** dos PNG em `tmp/ascii-preview/`, sem pedir anexos.

Objetivo: criar 3–6 ficheiros `.txt` em `src/campaigns/calvario/ascii/scenes/` com variações mínimas da arte base, para usar em `artHighlightFrames` no frontmatter da cena (com `highlight: true`).

## Contexto do motor

- Cada quadro é uma **chave** em `sceneArt` (basename do ficheiro sem `.txt`).
- Na cena: `artHighlightFrames: [chave0, chave1, ...]` (mínimo 2 chaves resolvidas para animar).
- `highlightHoldMs` (400–8000, opcional): duração total do hold antes do fade; o tempo reparte-se igualmente pelos quadros.
- Com `prefers-reduced-motion: reduce`, só o primeiro quadro é mostrado.
- A arte do corpo da cena continua a vir de `art` / `artKey`; convém alinhar o primeiro quadro da animação à mesma composição que o jogador vê no diário.

## Regras de conteúdo (ASCII)

1. Ler o ficheiro base `src/campaigns/calvario/ascii/scenes/<artKey>.txt` (ou o caminho que o utilizador indicar).
2. Gerar ficheiros separados com chaves **únicas**, por convenção: `<artKey>_hl0`, `<artKey>_hl1`, … (sufixo `_hlN` evita colisões).
3. Em **todos** os quadros: **mesmo número de linhas** e **mesma largura** (padding com espaços à direita se necessário).
4. Mudanças **mínimas** entre quadros consecutivos: 1–3 caracteres, ou pequenos shifts de “luz” (`·`, `░`, `▒`), chama, brasas, pestanejo, etc.
5. Não alterar legibilidade da silhueta; não acrescentar narrativa nova em texto longo.
6. Se a arte tiver texto legível, manter idioma e ortografia; preferir só mudanças em símbolos decorativos.

## Passos obrigatórios

1. Confirmar `artKey` na cena `.md` e ler o `.txt` base.
2. Escrever os novos `*_hlN.txt` sob `ascii/scenes/` (ou subpasta existente da mesma campanha).
3. Sugerir (ou aplicar) no frontmatter da cena:

```yaml
highlight: true
artKey: <mesma chave do corpo se aplicável>
artHighlightFrames: [<artKey>_hl0, <artKey>_hl1, <artKey>_hl2]
highlightHoldMs: 2400
```

4. Correr verificação:

```bash
npm run check:ascii-art -- --campaign calvario
npm run validate:scenes -- --campaign calvario
```

5. Novos `artKey` só com `PLACEHOLDER` no ficheiro até arte final — alinhado a `npm run check:ascii-art`.

## Critério de qualidade

A animação deve ler-se como **respiração** ou **vibração** do mesmo desenho, não como cortes entre imagens diferentes.
