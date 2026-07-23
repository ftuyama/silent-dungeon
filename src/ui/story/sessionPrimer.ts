import type { LoadedScene } from '../../engine/core/index.ts';
import { t } from '../../i18n/index.ts';

export type ContextPrimerId = 'hub_loop' | 'camp' | 'exploration';

export type SessionPrimerPayload = {
  title: string;
  body?: string;
  tips?: string[];
  modifierClass?: string;
  onDismiss: () => void;
};

const HUB_LOOP_SCENE_ID = 'act2/hub_catacomb';

export function resolveContextPrimerId(
  scene: LoadedScene,
  dismissed: Record<ContextPrimerId, boolean>
): ContextPrimerId | null {
  if (!dismissed.hub_loop && scene.id === HUB_LOOP_SCENE_ID) return 'hub_loop';
  if (!dismissed.camp && scene.frontmatter.campCombatHint === true) return 'camp';
  if (!dismissed.exploration && scene.frontmatter.type === 'exploration') return 'exploration';
  return null;
}

export function buildContextPrimerPayload(
  id: ContextPrimerId,
  onDismiss: () => void
): SessionPrimerPayload {
  switch (id) {
    case 'hub_loop':
      return {
        title: t('story.hubLoopTitle'),
        body: t('story.hubLoopBody'),
        modifierClass: 'session-primer--hub-loop',
        onDismiss,
      };
    case 'camp':
      return {
        title: t('story.campPrimerTitle'),
        body: t('story.campPrimerBody'),
        modifierClass: 'session-primer--camp',
        onDismiss,
      };
    case 'exploration':
      return {
        title: t('story.explorationPrimerTitle'),
        body: t('story.explorationPrimerBody'),
        modifierClass: 'session-primer--exploration',
        onDismiss,
      };
  }
}

export function appendSessionPrimer(
  parent: HTMLElement,
  primer: SessionPrimerPayload,
  onDismissClick: () => void
): void {
  const section = document.createElement('section');
  section.className = ['session-primer', primer.modifierClass].filter(Boolean).join(' ');

  const title = document.createElement('div');
  title.className = 'session-primer-title';
  title.textContent = primer.title;
  section.appendChild(title);

  if (primer.tips && primer.tips.length > 0) {
    const list = document.createElement('ul');
    list.className = 'session-primer-list';
    for (const tip of primer.tips) {
      const li = document.createElement('li');
      li.textContent = tip;
      list.appendChild(li);
    }
    section.appendChild(list);
  } else if (primer.body) {
    const body = document.createElement('p');
    body.className = 'session-primer-body';
    body.textContent = primer.body;
    section.appendChild(body);
  }

  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'session-primer-dismiss';
  dismiss.textContent = t('story.gotIt');
  dismiss.addEventListener('click', onDismissClick);
  section.appendChild(dismiss);

  parent.appendChild(section);
}
