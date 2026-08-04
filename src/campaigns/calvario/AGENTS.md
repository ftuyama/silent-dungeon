# Calvario campaign instructions

## Narrative voice

Apply to `scenes/**/*.md`, `data/dialogueEnemies/**/*.ts`, and player-facing locale JSON.

- Write dark fantasy in Brazilian Portuguese, second person (`você`, `seu`, `sua`), present tense.
- Keep beat/combat/transition prose to 1–2 sentences; exploration/lore to 2–4; hubs to 3–5.
- Use bold only for meaningful anchors and at most about one em dash per paragraph.
- Prefer one concrete sensory detail and a strong opening verb. Choices are player actions, not poems.
- Avoid repeated “não é X — é Y”, triplets, stacked metaphors, thinking scenery, meta language, rhetorical italic endings, and PT-PT vocabulary.
- Validate with `npm run check:pt-br` and `npm run check:narrative-voice`.

## Scene and en-US synchronization

When creating or editing `scenes/pt-BR/**/*.md`, update the English overlay in the same task. English lives only in `locales/en-US/scenes/*.json`; do not create English scene Markdown.

- Sync `title`, body, and each choice's `text`, `preview`, `lockedHint`, and `uiSection` by index.
- Sync diary text and check labels into their overlay fields.
- New `addMark` entries require `data/journeyMarks.ts` and both locale `entities.json` files.
- Overlay bucket is the first scene-ID segment (`act1`–`act8`), otherwise `misc.json`.
- Remove overlay fields that no longer exist in the canonical scene.

Run `npm run validate:scenes -- --campaign calvario`, `npm run check:pt-br`, `npm run validate:i18n`, and `npm run validate:i18n:translations`.

## `artKey` policy

- Distinct narrative beats require unique `artKey` values and matching `ascii/scenes/<actN>/<artKey>.txt` files.
- Variants of one beat (`_ok`, `_fail`, `_win`) may reuse the parent key.
- Important or `highlight: true` scenes must not reuse another beat's key because seen-state is shared by `artKey`.
- New final-art placeholders contain only `PLACEHOLDER`.
- Run `npm run check:ascii-art -- --campaign calvario`; for large narrative changes also run `npm run check:ascii-art:relevance` and review S/A-tier reuse.
