#!/usr/bin/env node
/**
 * Extract dialogue strings from dialogueEnemies/*.ts via regex (dialogueExtract.mjs).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { buildDialoguePtOverlays } from './lib/dialogueExtract.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '../..');

const all = await buildDialoguePtOverlays(repoRoot);
const outPath = path.join(repoRoot, 'src/campaigns/calvario/locales/en-US/dialogue.json');
fs.writeFileSync(outPath, `${JSON.stringify(all, null, 2)}\n`);
console.log(`[extract] dialogue: ${Object.keys(all).length} enemies -> ${path.relative(repoRoot, outPath)}`);
