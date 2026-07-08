---
description: Bump de versão de release (VERSION, package.json, package-lock)
---
Você prepara um **release bump** de *Silent Dungeon* / *A Masmorra do Silêncio*: alinhar a versão do jogo, commitar e criar tag Git antes de build ou publicação no itch.io.

> Se o utilizador pedir fluxo completo com checks de CI + bump + pacote itch opcional, preferir `npm run release -- ...` (ver `.cursor/commands/release.md`).

Leia `.cursor/rules/kiss.mdc` antes de editar. **Não faça push** a menos que o usuário peça explicitamente.

## Fonte da verdade

| Arquivo | Papel |
|---|---|
| `VERSION` | Versão exibida no jogo (`GameApp.ts` importa via `?raw`) |
| `package.json` → `version` | Versão do pacote npm |
| `package-lock.json` → `version` e `packages[""].version` | Lockfile raiz |

**Não altere** `SCHEMA_VERSION` em `src/engine/schema/core.ts` — é versão do schema de save, não do jogo.

## Passo 1 — Definir o bump

Interpretar a mensagem do usuário:

| Pedido | Comando |
|---|---|
| patch (default) | `npm run release:bump -- patch` |
| minor | `npm run release:bump -- minor` |
| major | `npm run release:bump -- major` |
| versão explícita (ex. `0.4.0`) | `npm run release:bump -- 0.4.0` |
| só arquivos, sem git | `npm run release:bump -- --no-git patch` |

Se o usuário não especificar, **pergunte** patch vs minor vs major antes de rodar.

## Passo 2 — Executar o bump

```bash
npm run release:bump -- <patch|minor|major|x.y.z>
```

O script `scripts/bump-version.mjs`:
1. Atualiza `VERSION`, `package.json` e `package-lock.json`
2. Cria commit `chore: release vX.Y.Z` (só esses três arquivos)
3. Cria tag anotada `vX.Y.Z`

Requer repositório git limpo o suficiente para commitar; falha se a tag já existir.

## Passo 3 — Verificar

1. Confirmar versão e tag:
   ```bash
   cat VERSION && git log -1 --oneline && git tag -l 'v*' | tail -3
   ```
2. Se o usuário pediu release completo, rodar build de sanidade:
   ```bash
   npm run build
   ```

## Passo 4 — Resumo para o usuário

Reportar em markdown:

1. **Versão anterior → nova**
2. **Commit e tag criados** (hash do commit, nome da tag)
3. **Próximos passos opcionais** (só executar se pedido):
   - push: `git push && git push origin vX.Y.Z`
   - empacotar itch: `npm run release:itch` ou `npm run release:itch:push`

## Limites

- Não alterar cenas, motor ou UI além das versões listadas.
- Não inventar changelog — pergunte ao usuário se quiser notas de release.
- Se `VERSION` e `package.json` estiverem dessincronizados antes do bump, confiar em `VERSION` como atual (o script lê só `VERSION`).
