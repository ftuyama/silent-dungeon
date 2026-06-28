#!/usr/bin/env node
/**
 * Extract exploration edge labels from calvario/exploration/*.ts into locales JSON.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '../..');
const explorationDir = path.join(repoRoot, 'src/campaigns/calvario/exploration');
const outPath = path.join(repoRoot, 'src/campaigns/calvario/locales/en-US/exploration.json');

/** @type {Record<string, Record<string, { text: string }>>} */
const out = {};

for (const file of fs.readdirSync(explorationDir)) {
  if (!file.endsWith('.ts') || file === 'graphs.ts') continue;
  const raw = fs.readFileSync(path.join(explorationDir, file), 'utf8');
  const graphMatch = raw.match(/id:\s*'([^']+)'/);
  if (!graphMatch) continue;
  const graphId = graphMatch[1];
  out[graphId] ??= {};
  const edgeRe = /id:\s*'([^']+)',\s*\n\s*text:\s*'([^']+)'/g;
  let m;
  while ((m = edgeRe.exec(raw)) !== null) {
    out[graphId][m[1]] = { text: m[2] };
  }
}

const existing = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, 'utf8')) : {};
for (const [graphId, edges] of Object.entries(out)) {
  existing[graphId] ??= {};
  for (const [edgeId, entry] of Object.entries(edges)) {
    if (!existing[graphId][edgeId]?.text) {
      existing[graphId][edgeId] = entry;
    }
  }
}

fs.writeFileSync(outPath, JSON.stringify(existing, null, 2) + '\n');
console.log(`Wrote ${outPath}`);
