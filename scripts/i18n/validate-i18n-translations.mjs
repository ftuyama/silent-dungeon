#!/usr/bin/env node
/**
 * Detect missing or untranslated en-US strings (still identical to pt-BR source).
 *
 * Complements validate-locale-parity.mjs (structural key/ID parity).
 *
 * Usage:
 *   npm run validate:i18n:translations
 *   npm run validate:i18n:translations -- --warn-heuristic   # also flag likely PT in en-US
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { walkMd, extractSceneIdLine, campaignPaths } from '../lib/campaignFs.mjs';
import { flattenStringLeaves } from './lib/validateHelpers.mjs';
import { buildDialoguePtOverlays } from './lib/dialogueExtract.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '../..');
const calvario = path.join(repoRoot, 'src/campaigns/calvario');

const warnHeuristic = process.argv.includes('--warn-heuristic');

/** @type {{ errors: string[]; warnings: string[] }} */
const report = { errors: [], warnings: [] };

function error(msg) {
  report.errors.push(msg);
}

function warn(msg) {
  report.warnings.push(msg);
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function norm(s) {
  return String(s).replace(/\s+/g, ' ').trim();
}

function identical(a, b) {
  return norm(a) === norm(b);
}

/** Likely Portuguese player-facing copy (heuristic; may false-positive on names). */
function looksPortuguese(text) {
  const s = norm(text);
  if (s.length < 8) return false;
  if (/[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(s)) return true;
  const ptHits = s.match(
    /\b(não|num|numa|para|pelo|pela|tu|tua|teu|teus|tuas|és|estás|estão|ainda|já|quando|porque|como|onde|quem|qual|quais|ser|está|foram|fora|pelos|pelas|uma|umas|uns|dos|das|nos|nas|ao|aos|à|às|disse|escolhe|escolheste|carregas|desceste|sobreviveste)\b/gi
  );
  return (ptHits?.length ?? 0) >= 2;
}

function checkUntranslated(label, enValue, ptValue) {
  if (!enValue?.trim()) {
    error(`[${label}] missing en-US text`);
    return;
  }
  if (ptValue && identical(enValue, ptValue)) {
    const token = norm(enValue);
    const isProperName =
      token.length <= 24 &&
      !/\s/.test(token) &&
      !/[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(token);
    if (!isProperName) {
      error(`[${label}] en-US identical to pt-BR (likely untranslated)`);
    }
    return;
  }
  if (warnHeuristic && looksPortuguese(enValue)) {
    warn(`[${label}] en-US may still be Portuguese (heuristic)`);
  }
}

function splitFrontmatter(raw) {
  const text = raw.replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') return { yaml: '', content: text.trimEnd() };
  const yamlLines = [];
  let i = 1;
  while (i < lines.length) {
    if (lines[i]?.trim() === '---') {
      return { yaml: yamlLines.join('\n'), content: lines.slice(i + 1).join('\n').trimEnd() };
    }
    yamlLines.push(lines[i] ?? '');
    i++;
  }
  return { yaml: '', content: text.trimEnd() };
}

function parseSceneFromMd(raw) {
  const { yaml, content } = splitFrontmatter(raw);
  const titleM = yaml.match(/^title:\s*['"]?([^'"\n]+?)['"]?\s*$/m);
  const title = titleM?.[1]?.trim();
  /** @type {Array<{ text?: string; preview?: string; lockedHint?: string }>} */
  const choices = [];
  const choiceBlocks = yaml.split(/\n\s*-\s+id:/).slice(1);
  for (const block of choiceBlocks) {
    const textM = block.match(/^\s*text:\s*['"]([^'"]+)['"]/m);
    const previewM = block.match(/^\s*preview:\s*['"]([^'"]+)['"]/m);
    const hintM = block.match(/^\s*lockedHint:\s*['"]([^'"]+)['"]/m);
    choices.push({
      text: textM?.[1],
      preview: previewM?.[1],
      lockedHint: hintM?.[1],
    });
  }
  return { title, body: content.trim(), choices };
}

function sceneOverlayById() {
  const dir = path.join(calvario, 'locales/en-US/scenes');
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.json')) continue;
    Object.assign(out, readJson(path.join(dir, name)));
  }
  return out;
}

function checkEntities() {
  const pt = readJson(path.join(calvario, 'locales/pt-BR/entities.json'));
  const en = readJson(path.join(calvario, 'locales/en-US/entities.json'));

  for (const section of ['items', 'spells', 'enemies', 'companions', 'passives', 'leadStoryPassives']) {
    for (const [id, ptEntry] of Object.entries(pt[section] ?? {})) {
      const enEntry = en[section]?.[id] ?? {};
      checkUntranslated(`entities.${section}.${id}.name`, enEntry.name, ptEntry.name);
      if (ptEntry.description) {
        checkUntranslated(
          `entities.${section}.${id}.description`,
          enEntry.description,
          ptEntry.description
        );
      }
      if (ptEntry.lorePt) {
        checkUntranslated(`entities.${section}.${id}.lorePt`, enEntry.lorePt, ptEntry.lorePt);
      }
    }
  }

  for (const [id, ptEntry] of Object.entries(pt.journeyMarks ?? {})) {
    const enEntry = en.journeyMarks?.[id] ?? {};
    checkUntranslated(`entities.journeyMarks.${id}.name`, enEntry.name, ptEntry.name);
    checkUntranslated(
      `entities.journeyMarks.${id}.description`,
      enEntry.description,
      ptEntry.description
    );
  }
}

function checkIndex() {
  const base = readJson(path.join(calvario, 'index.json'));
  const pt = {
    name: base.name,
    chapterTitles: base.chapterTitles,
    endings: base.endings,
  };
  const en = readJson(path.join(calvario, 'locales/en-US/index.json'));

  for (const leaf of flattenStringLeaves(pt)) {
    const enLeaf = flattenStringLeaves(en).find((l) => l.path === leaf.path);
    if (!enLeaf?.value?.trim()) {
      error(`[index.${leaf.path}] missing en-US text`);
      continue;
    }
    checkUntranslated(`index.${leaf.path}`, enLeaf.value, leaf.value);
  }
}

function checkNarrative() {
  const narrativePath = path.join(calvario, 'locales/en-US/narrative.json');
  if (!fs.existsSync(narrativePath)) {
    error('[narrative] locales/en-US/narrative.json missing');
    return;
  }
  const en = readJson(narrativePath);
  for (const { path: p, value } of flattenStringLeaves(en)) {
    if (!value.trim()) error(`[narrative.${p}] empty en-US text`);
    else if (warnHeuristic && looksPortuguese(value)) {
      warn(`[narrative.${p}] en-US may still be Portuguese (heuristic)`);
    }
  }
}

function checkExploration() {
  const en = readJson(path.join(calvario, 'locales/en-US/exploration.json'));
  for (const file of fs.readdirSync(path.join(calvario, 'exploration'))) {
    if (!file.endsWith('.ts') || file === 'graphs.ts') continue;
    const raw = fs.readFileSync(path.join(calvario, 'exploration', file), 'utf8');
    const graphMatch = raw.match(/id:\s*'([^']+)'/);
    if (!graphMatch) continue;
    const graphId = graphMatch[1];
    const edgeRe = /id:\s*'([^']+)',\s*\n\s*text:\s*'([^']+)'/g;
    let m;
    while ((m = edgeRe.exec(raw)) !== null) {
      const [, edgeId, ptText] = m;
      const enText = en[graphId]?.[edgeId]?.text;
      checkUntranslated(`exploration.${graphId}.${edgeId}`, enText, ptText);
    }
  }
}

function checkScenes() {
  const overlays = sceneOverlayById();
  const { scenesDir } = campaignPaths(repoRoot, 'calvario', 'pt-BR');

  for (const file of walkMd(scenesDir)) {
    const raw = fs.readFileSync(file, 'utf8');
    const id = extractSceneIdLine(raw);
    if (!id) continue;
    const { title: ptTitle, body: ptBody, choices: ptChoices } = parseSceneFromMd(raw);
    const ov = overlays[id];
    if (!ov || typeof ov !== 'object') {
      error(`[scene.${id}] missing overlay object`);
      continue;
    }
    const enTitle = ov.title;
    const enBody = ov.body;

    if (ptTitle) checkUntranslated(`scene.${id}.title`, enTitle, ptTitle);
    if (ptBody) {
      if (!enBody?.trim()) error(`[scene.${id}.body] missing en-US body`);
      else checkUntranslated(`scene.${id}.body`, enBody, ptBody);
    }

    const enChoices = Array.isArray(ov.choices) ? ov.choices : [];
    if (ptChoices.length && enChoices.length !== ptChoices.length) {
      error(
        `[scene.${id}.choices] count mismatch pt=${ptChoices.length} en=${enChoices.length}`
      );
    }
    ptChoices.forEach((ch, i) => {
      const eco = enChoices[i];
      if (!eco) {
        error(`[scene.${id}.choices[${i}]] missing overlay choice`);
        return;
      }
      if (ch.text) checkUntranslated(`scene.${id}.choices[${i}].text`, eco.text, ch.text);
      if (ch.preview) checkUntranslated(`scene.${id}.choices[${i}].preview`, eco.preview, ch.preview);
      if (ch.lockedHint) {
        checkUntranslated(`scene.${id}.choices[${i}].lockedHint`, eco.lockedHint, ch.lockedHint);
      }
    });
  }
}

async function checkDialogue() {
  const overlay = readJson(path.join(calvario, 'locales/en-US/dialogue.json'));
  const ptSource = await buildDialoguePtOverlays(repoRoot);

  for (const [enemyId, def] of Object.entries(ptSource)) {
    const enEnemy = overlay[enemyId];
    if (!enEnemy) {
      error(`[dialogue.${enemyId}] missing overlay`);
      continue;
    }
    checkUntranslated(`dialogue.${enemyId}.name`, enEnemy.name, def.name);

    for (const [nodeId, node] of Object.entries(def.nodes ?? {})) {
      const ptLine = typeof node.line === 'string' ? node.line : String(node.line ?? '');
      const enNode = enEnemy.nodes?.[nodeId];
      if (!enNode) {
        error(`[dialogue.${enemyId}.nodes.${nodeId}] missing overlay node`);
        continue;
      }
      checkUntranslated(`dialogue.${enemyId}.nodes.${nodeId}.line`, enNode.line, ptLine);

      const ptChoices = node.choices ?? [];
      const enChoices = enNode.choices ?? [];
      if (ptChoices.length && enChoices.length !== ptChoices.length) {
        error(
          `[dialogue.${enemyId}.nodes.${nodeId}.choices] count mismatch pt=${ptChoices.length} en=${enChoices.length}`
        );
      }
      ptChoices.forEach((ch, i) => {
        const ptText = typeof ch.text === 'string' ? ch.text : String(ch.text ?? '');
        const enText = enChoices[i]?.text;
        checkUntranslated(
          `dialogue.${enemyId}.nodes.${nodeId}.choices[${i}].text`,
          enText,
          ptText
        );
      });
    }
  }
}

function checkUiCatalog() {
  const pt = readJson(path.join(repoRoot, 'src/i18n/locales/pt-BR.json'));
  const en = readJson(path.join(repoRoot, 'src/i18n/locales/en-US.json'));
  for (const { path: p, value } of flattenStringLeaves(pt)) {
    const enLeaf = flattenStringLeaves(en).find((l) => l.path === p);
    if (!enLeaf?.value?.trim()) {
      error(`[ui.${p}] missing en-US text`);
      continue;
    }
    if (identical(enLeaf.value, value)) {
      warn(`[ui.${p}] en-US identical to pt-BR (may be intentional, e.g. "Volume")`);
    }
  }
}

await checkDialogue();
checkEntities();
checkIndex();
checkNarrative();
checkExploration();
checkScenes();
checkUiCatalog();

if (report.warnings.length) {
  console.warn(`\nWarnings (${report.warnings.length}):`);
  for (const w of report.warnings) console.warn(`  ⚠ ${w}`);
}

if (report.errors.length) {
  console.error(`\nErrors (${report.errors.length}):`);
  for (const e of report.errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}

console.log(
  `OK [validate:i18n:translations]: no missing or pt-BR-identical strings detected` +
    (report.warnings.length ? ` (${report.warnings.length} heuristic warning(s))` : '')
);
