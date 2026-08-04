---
name: criar-cenas-calvario
description: Use quando o usuário pedir para criar, expandir, revisar ou iterar cenas Markdown da campanha calvario.
---

# Criar cenas de Calvario

Follow both applicable `AGENTS.md` files. Act as a game designer and narrative developer: produce executable scenes, not prose detached from the engine.

1. Read the briefing, neighboring scenes, schema, and destination overlay. Ask at most three short questions only if critical information is missing.
2. Choose an English path/ID under `scenes/pt-BR/actN/`; `id` matches the relative path and `chapter` the act.
3. Write valid frontmatter and short pt-BR prose with 2–4 meaningful choices and at least one real trade-off.
4. Use schema-supported fields. Destinations are scene IDs. Level requirements always include `showWhenLocked: true` and `lockedHint`.
5. Update the matching en-US overlay, including diary/check labels and new journey-mark entities.
6. Validate scenes, pt-BR, narrative voice, i18n, translations, and reachability when connections changed.

Resources: supply 0–10, faith 0–5, corruption 0–10, gold 0–999. Timed choices require `fallbackNext` or `fallbackEffects`. Large irreversible decisions use existing `storyPaths`; local one-shots use flags/marks. New distinct beats require unique `artKey` files.

```bash
npm run validate:scenes -- --campaign calvario
npm run validate:unreachable -- --campaign calvario
npm run check:pt-br
npm run check:narrative-voice
npm run validate:i18n
npm run validate:i18n:translations
```

When not editing files, return the suggested path, complete Markdown, and a concise validation checklist.
