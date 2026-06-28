import type { Locale } from '../../i18n/locale.ts';
import type { LoadedScene } from '../../engine/core/index.ts';
import sceneAct1En from './locales/en-US/scenes/act1.json';
import { mergeSceneOverlay, type SceneOverlay } from '../sceneOverlayApply.ts';

const DEMO_SCENE_OVERLAYS_EN = sceneAct1En as Record<string, SceneOverlay>;

export function applyDemoSceneLocaleOverlay(scene: LoadedScene, locale: Locale): LoadedScene {
  if (locale === 'pt-BR') return scene;
  return mergeSceneOverlay(scene, DEMO_SCENE_OVERLAYS_EN[scene.id]);
}
