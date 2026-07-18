# English (en-US) campaign locale

English player-facing text for **calvario** lives here as JSON overlays. It is **not** duplicated in `scenes/en-US/**/*.md`.

**Agent rule:** any edit to `scenes/pt-BR/**/*.md` must update the matching overlay here in the same change. Cursor rule: `.cursor/rules/scene-i18n-sync.mdc`. Gate: `npm run validate:i18n:translations`.

## Canonical sources

| Content | pt-BR source | en-US overlay |
|---------|--------------|---------------|
| Scenes (structure + mechanics) | `scenes/pt-BR/**/*.md` | `scenes/*.json` |
| Entities (names) | `data/*.ts` + `locales/pt-BR/entities.json` | `entities.json` |
| Dialogue combat | `data/dialogueEnemies/*.ts` | `dialogue.json` |
| Hero/companion lore | TS constants + `overlayPick.ts` | `narrative.json` |
| Campaign index | `index.json` | `index.json` |

At runtime, [`localeLoad.ts`](../localeLoad.ts) merges these overlays onto pt-BR canonical content when `locale === 'en-US'`.

## Maintenance

- Regenerate entity keys: `npm run i18n:extract-entities` then `npm run i18n:patch-entities`
- Exploration edge labels: `npm run i18n:extract-exploration` then `npm run i18n:patch-exploration`
- Extract scene overlay skeleton: `npm run i18n:extract-scenes`
- Extract dialogue overlay: `npm run i18n:extract-dialogue`
- Parity checks: `npm run validate:i18n` (structure) and `npm run validate:i18n:translations` (untranslated / still pt-BR)
