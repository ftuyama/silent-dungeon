#!/usr/bin/env node
/**
 * Extract translatable scene strings from pt-BR markdown into locales/en-US/scenes/*.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { walkMd, extractSceneIdLine, campaignPaths } from '../lib/campaignFs.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, '../..');

function splitFrontmatter(raw) {
  const text = raw.replace(/^\uFEFF/, '');
  const lines = text.split(/\r?\n/);
  if (lines[0]?.trim() !== '---') return { data: {}, content: text };
  const yamlLines = [];
  let i = 1;
  while (i < lines.length) {
    if (lines[i]?.trim() === '---') {
      return {
        data: parseYaml(yamlLines.join('\n')) ?? {},
        content: lines.slice(i + 1).join('\n').trimEnd(),
      };
    }
    yamlLines.push(lines[i] ?? '');
    i++;
  }
  return { data: {}, content: text };
}

function extractDiaryTexts(effects) {
  if (!Array.isArray(effects)) return [];
  return effects.filter((e) => e?.op === 'addDiary' && typeof e.text === 'string').map((e) => e.text);
}

function extractChoiceOverlay(choice) {
  const out = {
    text: choice.text,
  };
  if (choice.preview) out.preview = choice.preview;
  if (choice.lockedHint) out.lockedHint = choice.lockedHint;
  if (choice.uiSection) out.uiSection = choice.uiSection;
  const diary = extractDiaryTexts(choice.effects);
  if (diary.length) out.diaryTexts = diary;
  return out;
}

function extractSceneOverlay(data, body) {
  const out = {};
  if (data.title) out.title = data.title;
  if (body.trim()) out.body = body.trim();
  if (Array.isArray(data.choices) && data.choices.length) {
    out.choices = data.choices.map(extractChoiceOverlay);
  }
  const diaryOnEnter = extractDiaryTexts(data.onEnter);
  if (diaryOnEnter.length) out.onEnterDiaryTexts = diaryOnEnter;
  const diaryRepeat = extractDiaryTexts(data.repeatOnEnter);
  if (diaryRepeat.length) out.repeatOnEnterDiaryTexts = diaryRepeat;
  if (data.skillCheck?.label) out.skillCheckLabel = data.skillCheck.label;
  if (data.dualAttrSkillCheck?.label) out.dualAttrSkillCheckLabel = data.dualAttrSkillCheck.label;
  if (data.luckCheck?.label) out.luckCheckLabel = data.luckCheck.label;
  return out;
}

function actBucket(sceneId) {
  const seg = sceneId.split('/')[0];
  if (seg === 'act1' || seg === 'act2' || seg === 'act3' || seg === 'act4' || seg === 'act5' || seg === 'act6' || seg === 'act7') {
    return seg;
  }
  return 'misc';
}

function runCampaign(campaignId) {
  const { scenesDir } = campaignPaths(repoRoot, campaignId, 'pt-BR');
  const outDir = path.join(repoRoot, 'src/campaigns', campaignId, 'locales/en-US/scenes');
  fs.mkdirSync(outDir, { recursive: true });
  const buckets = new Map();

  for (const file of walkMd(scenesDir)) {
    const raw = fs.readFileSync(file, 'utf8');
    const id = extractSceneIdLine(raw);
    if (!id) continue;
    const { data, content } = splitFrontmatter(raw);
    const bucket = actBucket(id);
    if (!buckets.has(bucket)) buckets.set(bucket, {});
    buckets.get(bucket)[id] = extractSceneOverlay(data, content);
  }

  for (const [bucket, scenes] of buckets) {
    const outPath = path.join(outDir, `${bucket}.json`);
    fs.writeFileSync(outPath, JSON.stringify(scenes, null, 2) + '\n');
    console.log(`[extract] ${campaignId} ${bucket}: ${Object.keys(scenes).length} scenes -> ${path.relative(repoRoot, outPath)}`);
  }
}

for (const id of ['calvario', 'demo']) {
  runCampaign(id);
}
