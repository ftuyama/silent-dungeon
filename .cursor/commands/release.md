---
description: Release — checks de CI, bump de versão (minor por padrão) e pacote itch opcional
---

# Release (`/release`)

Orquestra o fluxo de release do **Silent Dungeon**: validações (paridade com CI), bump semver, commit/tag git e pacote itch.io opcional.

## Interpretar o pedido do usuário

| Entrada do usuário | Bump |
|--------------------|------|
| `/release` | `minor` (padrão) |
| `/release patch` | `patch` |
| `/release minor` | `minor` |
| `/release major` | `major` |
| `/release 1.2.3` | versão explícita `1.2.3` |

Flags opcionais (repasse ao script):

- `--itch` — gera `release/silent-dungeon-itch.zip` após o bump
- `--no-git` — atualiza `VERSION` / `package.json` sem commit nem tag
- `--no-bump` — só roda checks (e `--itch` se pedido)
- `--skip-checks` — pula validações (só se o usuário pedir explicitamente)
- `--dry-run` — mostra os passos sem executar

## Passos obrigatórios

1. **Confirmar o tipo de bump** a partir do prompt (default: `minor`). Se ambíguo, pergunte antes de rodar.

2. **Verificar árvore git** (`git status --short`). Se houver mudanças não relacionadas ao release, avise o usuário: o bump só commita `VERSION`, `package.json` e `package-lock.json`.

3. **Rodar o script** (fonte da verdade):

   ```bash
   npm run release -- <patch|minor|major> [flags]
   ```

   Exemplos:

   ```bash
   npm run release -- minor
   npm run release -- patch --itch
   npm run release -- major --dry-run
   ```

4. **Se o script falhar**, pare e reporte qual check falhou. Não tente bump manual nem commit parcial.

5. **Após sucesso** (sem `--dry-run` e sem `--no-git`):
   - Mostre versão anterior → nova (lida de `VERSION`)
   - Informe os comandos de push: `git push && git push origin vX.Y.Z`
   - Se usou `--itch`, indique o ZIP em `release/silent-dungeon-itch.zip` e que `npm run release:itch:push` exige `BUTLER_API_KEY`

6. **Push git** — só execute `git push` se o usuário pedir explicitamente nesta conversa.

## O que o script valida (espelha `.github/workflows/test.yml`)

- `validate:scenes`, `validate:unreachable`
- `check:pt-br`, `check:ascii-art`
- `validate:i18n`, `validate:i18n:translations`
- `check:engine-boundaries`
- `build`, `test`

Depois: `scripts/bump-version.mjs` atualiza `VERSION`, `package.json`, `package-lock.json` e cria commit `chore: release vX.Y.Z` + tag anotada.

## Limites

- Não altere versão manualmente em ficheiros — use o script.
- Não faça push para remote sem pedido explícito.
- Não use `--skip-checks` por iniciativa própria.
- `release:itch:push` envolve credenciais (`BUTLER_API_KEY`); só rode se o usuário pedir upload ao itch.io.
