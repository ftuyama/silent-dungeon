---
name: release-silent-dungeon
description: Use quando o usuário pedir release, bump de versão, tag, pacote itch.io ou validações completas de publicação.
---

# Release Silent Dungeon

Choose one mode:

- Full release: `npm run release -- <patch|minor|major|x.y.z> [flags]`; default bump is `minor`.
- Version-only bump: `npm run release:bump -- <patch|minor|major|x.y.z>`; ask if bump type is omitted.

Supported full-release flags: `--itch`, `--no-git`, `--no-bump`, `--skip-checks`, `--dry-run`. Use `--skip-checks` only when explicitly requested.

Before running, inspect `git status --short` and warn about unrelated changes. The scripts are the source of truth: never edit `VERSION`, `package.json`, or `package-lock.json` manually, and never change save `SCHEMA_VERSION` for a game release. If the script fails, stop; do not create a partial bump.

After success, verify `VERSION`, the latest commit, and the annotated `vX.Y.Z` tag as applicable. Report old → new version and any itch ZIP at `release/silent-dungeon-itch.zip`. Do not push or run credentialed itch upload without an explicit request.
