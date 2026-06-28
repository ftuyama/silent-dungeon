#!/usr/bin/env node
/**
 * Assert pt-BR canonical content has matching en-US JSON overlays and UI key parity.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { walkMd, extractSceneIdLine } from '../lib/campaignFs.mjs';
import { flattenStringKeys } from './lib/validateHelpers.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '..', '..');
const calvario = path.join(repoRoot, 'src/campaigns/calvario');

function sceneIdsFromPtMd() {
  const scenesDir = path.join(calvario, 'scenes/pt-BR');
  const ids = new Set();
  for (const f of walkMd(scenesDir)) {
    const raw = fs.readFileSync(f, 'utf8');
    const id = extractSceneIdLine(raw);
    if (id) ids.add(id);
  }
  return ids;
}

function sceneOverlayIds() {
  const dir = path.join(calvario, 'locales/en-US/scenes');
  const ids = new Set();
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.json')) continue;
    const data = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
    for (const id of Object.keys(data)) ids.add(id);
  }
  return ids;
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function dialogueEnemyIdsFromTs() {
  const indexPath = path.join(calvario, 'data/dialogueEnemies/index.ts');
  const raw = fs.readFileSync(indexPath, 'utf8');
  const ids = new Set();
  const re = /^\s+(\w+):\s*\w+/gm;
  let m;
  while ((m = re.exec(raw)) !== null) ids.add(m[1]);
  return ids;
}

function assertEntitySection(section, ptEntities, enEntities, requireDescription = false) {
  let ok = true;
  const ptSection = ptEntities[section] ?? {};
  const enSection = enEntities[section] ?? {};
  for (const id of Object.keys(ptSection)) {
    if (!enSection[id]?.name?.trim()) {
      ok = false;
      console.error(`[entities] missing en-US ${section}.${id}.name`);
    }
    if (requireDescription && !enSection[id]?.description?.trim()) {
      ok = false;
      console.error(`[entities] missing en-US ${section}.${id}.description`);
    }
  }
  return ok;
}

let failed = false;
const fail = () => {
  failed = true;
};

const ptIds = sceneIdsFromPtMd();
const overlayIds = sceneOverlayIds();

for (const id of ptIds) {
  if (!overlayIds.has(id)) {
    fail();
    console.error(`[scene-overlay] missing en-US overlay: ${id}`);
  }
}
for (const id of overlayIds) {
  if (!ptIds.has(id)) {
    fail();
    console.error(`[scene-overlay] extra en-US overlay (no pt-BR scene): ${id}`);
  }
}

const ptUi = readJson(path.join(repoRoot, 'src/i18n/locales/pt-BR.json'));
const enUi = readJson(path.join(repoRoot, 'src/i18n/locales/en-US.json'));
const ptUiKeys = new Set(flattenStringKeys(ptUi));
const enUiKeys = new Set(flattenStringKeys(enUi));

for (const key of ptUiKeys) {
  if (!enUiKeys.has(key)) {
    fail();
    console.error(`[ui] missing en-US key: ${key}`);
  }
}

const ptEntities = readJson(path.join(calvario, 'locales/pt-BR/entities.json'));
const enEntities = readJson(path.join(calvario, 'locales/en-US/entities.json'));

for (const section of ['items', 'spells', 'enemies', 'companions', 'passives', 'leadStoryPassives']) {
  if (!assertEntitySection(section, ptEntities, enEntities)) fail();
}
if (!assertEntitySection('journeyMarks', ptEntities, enEntities, true)) fail();

const explorationPath = path.join(calvario, 'locales/en-US/exploration.json');
if (fs.existsSync(explorationPath)) {
  const explorationOverlay = readJson(explorationPath);
  for (const file of fs.readdirSync(path.join(calvario, 'exploration'))) {
    if (!file.endsWith('.ts') || file === 'graphs.ts') continue;
    const raw = fs.readFileSync(path.join(calvario, 'exploration', file), 'utf8');
    const graphMatch = raw.match(/id:\s*'([^']+)'/);
    if (!graphMatch) continue;
    const graphId = graphMatch[1];
    const edgeRe = /id:\s*'([^']+)',\s*\n\s*text:/g;
    let m;
    while ((m = edgeRe.exec(raw)) !== null) {
      const edgeId = m[1];
      if (!explorationOverlay[graphId]?.[edgeId]?.text?.trim()) {
        fail();
        console.error(`[exploration] missing en-US ${graphId}.${edgeId}.text`);
      }
    }
  }
}

const dialogueIds = dialogueEnemyIdsFromTs();
const dialogueOverlay = readJson(path.join(calvario, 'locales/en-US/dialogue.json'));
for (const id of dialogueIds) {
  if (!dialogueOverlay[id]?.name?.trim()) {
    fail();
    console.error(`[dialogue] missing en-US name: ${id}`);
  }
  if (!dialogueOverlay[id]?.nodes || !Object.keys(dialogueOverlay[id].nodes).length) {
    fail();
    console.error(`[dialogue] missing en-US nodes: ${id}`);
  }
}

if (failed) process.exit(1);
console.log(
  `OK [validate:i18n]: ${ptIds.size} scene overlays, ${ptUiKeys.size} UI keys, entities + dialogue parity.`
);
