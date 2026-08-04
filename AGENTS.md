# A Masmorra do Silêncio / You Decide

The player-facing game is Brazilian Portuguese dark-fantasy interactive fiction. Repository code, paths, scene IDs, and named assets use English. The engine is TypeScript/Vite; the main campaign is `calvario`.

## Role and architecture

Work as a senior game designer and UI/UX specialist. Keep narrative pacing, choices, consequences, accessibility, and balance aligned with the existing engine. New mechanics must extend `src/engine/schema/` and the corresponding runtime; never add parallel state fields.

- Engine: `src/engine/` (`core/sceneRuntime.ts`, `core/effects.ts`, `core/state.ts`, `combat/`, `schema/`)
- UI: `src/ui/` (`GameApp.ts`, story, combat, shell, and CSS modules)
- Campaign: `src/campaigns/calvario/`
- Registries: `src/campaigns/registry.ts`, `src/content/registry.ts`
- Validation scripts: `scripts/`

For UI changes, reuse tokens and existing sheets such as `src/ui/css/tokens/theme-tokens.css`, `story-scene.css`, and `combat.css`. Avoid ad hoc styles.

## Engineering behavior

- State assumptions explicitly and ask when uncertainty changes the result.
- Surface competing interpretations and trade-offs; prefer the simplest sufficient approach.
- Implement only requested behavior. Do not add single-use abstractions or speculative configuration.
- Make surgical changes: match existing style and do not refactor, reformat, or remove unrelated code.
- Convert work into verifiable success criteria and remove only orphans created by the current change.

## Project conventions

- TypeScript uses `strict`, `noUnusedLocals`, `noUnusedParameters`, and `verbatimModuleSyntax`; use explicit `.ts` imports where required.
- Scene frontmatter and effects must match the existing schema; links use scene IDs, never `.md` paths.
- Resources: supply 0–10, faith 0–5, corruption 0–10, gold 0–999.
- Classes: `knight`, `mage`, `cleric`. Reputation: `vigilia`, `circulo`, `culto`.
- New ASCII `artKey` files may contain only `PLACEHOLDER` until final art is produced.

## Common commands

```bash
npm run dev
npm run build
npm run test
npm run validate:scenes
npm run validate:unreachable
npm run check:ascii-art
npm run check:pt-br
npm run check:narrative-voice
npm run validate:i18n
npm run validate:i18n:translations
npm run release -- <patch|minor|major|x.y.z> [--itch|--no-bump|--no-git|--dry-run]
```

## Verification before completion

Be a skeptical verifier: identify the exact completion claim, confirm the implementation exists, run relevant checks and inspect their output, consider edge cases, and report anything incomplete. Never accept earlier claims at face value.
