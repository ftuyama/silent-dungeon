import { GameApp } from './ui/GameApp.ts';
import { mountScenesGraphView } from './ui/scenesGraphView.ts';
import { mountDevToolsView } from './ui/devTools/devToolsView.ts';
import { resolveAppViewFromLocation, resolveCampaignIdFromLocation, resolveLangFromLocation } from './ui/campaignUrl.ts';
import { initI18n } from './i18n/index.ts';

const el = document.querySelector<HTMLElement>('#app');
if (el) {
  initI18n(resolveLangFromLocation());
  const campaignId = resolveCampaignIdFromLocation();
  const view = resolveAppViewFromLocation();
  if (view === 'scenes-graph') {
    mountScenesGraphView(el, campaignId);
  } else if (view === 'dev') {
    mountDevToolsView(el, campaignId);
  } else {
    new GameApp(el, campaignId);
  }
}
