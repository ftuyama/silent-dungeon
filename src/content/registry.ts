/** Cenas parseadas e `GameData`; pipeline único em `src/campaigns/registry.ts`. */
import type { LoadedScene } from '../engine/core/index.ts';
import type { GameData } from '../engine/data/index.ts';
import { loadParsedCampaignContent } from '../campaigns/registry.ts';
import type { CampaignUIAdapter } from '../campaigns/campaignUi.ts';
import type { Locale } from '../i18n/locale.ts';
import { getLocale } from '../i18n/index.ts';

export class ContentRegistry {
  readonly data: GameData;
  readonly ui: CampaignUIAdapter;
  private scenes = new Map<string, LoadedScene>();

  constructor(campaignId: string, locale: Locale = getLocale()) {
    const { data, scenes, ui } = loadParsedCampaignContent(campaignId, locale);
    this.data = data;
    this.ui = ui;
    this.scenes = scenes;
  }

  getScene(id: string): LoadedScene | undefined {
    return this.scenes.get(id);
  }
}
