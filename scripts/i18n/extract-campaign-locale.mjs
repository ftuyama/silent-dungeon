#!/usr/bin/env node
/**
 * Extract entity display names from calvario data into locales/{locale}/entities.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '../..');
const calvario = path.join(repoRoot, 'src/campaigns/calvario');

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function extractNamesFromTs(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const out = {};
  const idRe = /^\s+(\w+):\s*(?:z\()?\{/gm;
  let m;
  while ((m = idRe.exec(raw)) !== null) {
    const id = m[1];
    const slice = raw.slice(m.index, m.index + 800);
    const nameMatch = slice.match(/name:\s*['"]([^'"]+)['"]/);
    if (nameMatch) out[id] = { name: nameMatch[1] };
  }
  return out;
}

function extractPassivesFromTs(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const out = {};
  const blockRe = /^\s+(knight|cleric|mage):\s*\{/gm;
  let m;
  while ((m = blockRe.exec(raw)) !== null) {
    const id = m[1];
    const slice = raw.slice(m.index, m.index + 400);
    const nameMatch = slice.match(/name:\s*['"]([^'"]+)['"]/);
    const descMatch = slice.match(/description:\s*['"]([^'"]+)['"]/);
    if (nameMatch) {
      out[id] = { name: nameMatch[1] };
      if (descMatch) out[id].description = descMatch[1];
    }
  }
  return out;
}

function extractLeadStoryPassivesFromTs(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const out = {};
  const blockRe = /^\s+(\w+):\s*\{/gm;
  let inLead = false;
  for (const line of raw.split('\n')) {
    if (line.includes('export const leadStoryPassives')) inLead = true;
    if (inLead && line.startsWith('};') && !line.includes('leadStoryPassives')) break;
  }
  const leadSection = raw.split('export const leadStoryPassives')[1]?.split('};')[0] ?? '';
  const idRe = /^\s+(\w+):\s*\{/gm;
  let m;
  while ((m = idRe.exec(leadSection)) !== null) {
    const id = m[1];
    const slice = leadSection.slice(m.index, m.index + 500);
    const nameMatch = slice.match(/name:\s*['"]([^'"]+)['"]/);
    const descMatch = slice.match(/description:\s*['"]([^'"]+)['"]/);
    if (nameMatch) {
      out[id] = { name: nameMatch[1] };
      if (descMatch) out[id].description = descMatch[1];
    }
  }
  return out;
}

function extractJourneyMarksFromTs(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const out = {};
  const idRe = /^\s+(\w+):\s*\{/gm;
  let m;
  while ((m = idRe.exec(raw)) !== null) {
    const id = m[1];
    const slice = raw.slice(m.index, m.index + 1200);
    const nameMatch = slice.match(/name:\s*['"]([^'"]+)['"]/);
    const descMatch = slice.match(/description:\s*\n\s*['"]([^'"]+)['"]/s)
      ?? slice.match(/description:\s*['"]([^'"]+)['"]/);
    if (nameMatch) {
      out[id] = { name: nameMatch[1] };
      if (descMatch) out[id].description = descMatch[1];
    }
  }
  return out;
}

function extractFromCompanionsJson() {
  const data = readJson(path.join(calvario, 'data/companions.json'));
  const out = {};
  for (const [id, def] of Object.entries(data)) {
    out[id] = { name: def.name };
  }
  return out;
}

function buildEntities() {
  const passivesPath = path.join(calvario, 'data/passives.ts');
  return {
    items: extractNamesFromTs(path.join(calvario, 'data/items.ts')),
    spells: extractNamesFromTs(path.join(calvario, 'data/spells.ts')),
    enemies: extractNamesFromTs(path.join(calvario, 'data/enemies.ts')),
    companions: extractFromCompanionsJson(),
    journeyMarks: extractJourneyMarksFromTs(path.join(calvario, 'data/journeyMarks.ts')),
    passives: extractPassivesFromTs(passivesPath),
    leadStoryPassives: extractLeadStoryPassivesFromTs(passivesPath),
  };
}

const entities = buildEntities();
const ptDir = path.join(calvario, 'locales/pt-BR');
const enDir = path.join(calvario, 'locales/en-US');
fs.mkdirSync(ptDir, { recursive: true });
fs.mkdirSync(enDir, { recursive: true });
fs.writeFileSync(path.join(ptDir, 'entities.json'), JSON.stringify(entities, null, 2) + '\n');

const enPath = path.join(enDir, 'entities.json');
const existingEn = fs.existsSync(enPath) ? readJson(enPath) : {};

function mergeEnSection(section, ptRecord, existingRecord = {}) {
  const out = { ...existingRecord };
  for (const [id, ptEntry] of Object.entries(ptRecord)) {
    if (!out[id]) out[id] = { ...ptEntry };
  }
  return out;
}

const enEntities = {
  items: mergeEnSection('items', entities.items, existingEn.items),
  spells: mergeEnSection('spells', entities.spells, existingEn.spells),
  enemies: mergeEnSection('enemies', entities.enemies, existingEn.enemies),
  companions: mergeEnSection('companions', entities.companions, existingEn.companions),
  journeyMarks: mergeEnSection('journeyMarks', entities.journeyMarks, existingEn.journeyMarks),
  passives: mergeEnSection('passives', entities.passives, existingEn.passives),
  leadStoryPassives: mergeEnSection(
    'leadStoryPassives',
    entities.leadStoryPassives,
    existingEn.leadStoryPassives
  ),
};

fs.writeFileSync(enPath, JSON.stringify(enEntities, null, 2) + '\n');
console.log('Wrote entities.json for pt-BR and en-US');
