import type { LoadedScene } from '../engine/core/index.ts';
import type { Choice, Effect } from '../engine/schema/index.ts';

export type SceneChoiceOverlay = {
  text?: string;
  preview?: string;
  lockedHint?: string;
  uiSection?: string;
  diaryTexts?: string[];
};

export type SceneOverlay = {
  title?: string;
  body?: string;
  choices?: SceneChoiceOverlay[];
  onEnterDiaryTexts?: string[];
  repeatOnEnterDiaryTexts?: string[];
  skillCheckLabel?: string;
  dualAttrSkillCheckLabel?: string;
  luckCheckLabel?: string;
};

function applyDiaryOverlayToEffects(effects: Effect[], diaryTexts: string[] | undefined): Effect[] {
  if (!diaryTexts?.length) return effects;
  let diaryIdx = 0;
  return effects.map((effect) => {
    if (effect.op !== 'addDiary') return effect;
    const next = diaryTexts[diaryIdx];
    diaryIdx += 1;
    if (!next) return effect;
    return { ...effect, text: next };
  });
}

function applyChoiceOverlay(choices: Choice[], overlay: SceneChoiceOverlay[] | undefined): Choice[] {
  if (!overlay?.length) return choices;
  return choices.map((choice, i) => {
    const co = overlay[i];
    if (!co) return choice;
    return {
      ...choice,
      text: co.text ?? choice.text,
      preview: co.preview ?? choice.preview,
      lockedHint: co.lockedHint ?? choice.lockedHint,
      uiSection: co.uiSection ?? choice.uiSection,
      effects: applyDiaryOverlayToEffects(choice.effects, co.diaryTexts),
    };
  });
}

export function mergeSceneOverlay(scene: LoadedScene, ov: SceneOverlay | undefined): LoadedScene {
  if (!ov) return scene;

  const fm = { ...scene.frontmatter };
  if (ov.title) fm.title = ov.title;
  if (ov.choices) fm.choices = applyChoiceOverlay(fm.choices, ov.choices);
  if (ov.onEnterDiaryTexts) {
    fm.onEnter = applyDiaryOverlayToEffects(fm.onEnter, ov.onEnterDiaryTexts);
  }
  if (ov.repeatOnEnterDiaryTexts) {
    fm.repeatOnEnter = applyDiaryOverlayToEffects(fm.repeatOnEnter, ov.repeatOnEnterDiaryTexts);
  }
  if (ov.skillCheckLabel && fm.skillCheck) {
    fm.skillCheck = { ...fm.skillCheck, label: ov.skillCheckLabel };
  }
  if (ov.dualAttrSkillCheckLabel && fm.dualAttrSkillCheck) {
    fm.dualAttrSkillCheck = { ...fm.dualAttrSkillCheck, label: ov.dualAttrSkillCheckLabel };
  }
  if (ov.luckCheckLabel && fm.luckCheck) {
    fm.luckCheck = { ...fm.luckCheck, label: ov.luckCheckLabel };
  }

  return {
    ...scene,
    frontmatter: fm,
    bodyRaw: ov.body ?? scene.bodyRaw,
  };
}
