import { t } from '../../i18n/index.ts';

export type FaithMiracleBannerCallbacks = {
  setFaithMiraclePending: (pending: boolean) => void;
  playUiClick: () => void;
  render: () => void;
};

/** Banner após milagre de fé em combate (consome fé, mantém o herói de pé). */
export function appendFaithMiracleBanner(
  inner: HTMLElement,
  callbacks: FaithMiracleBannerCallbacks
): void {
  const miracle = document.createElement('div');
  miracle.className = 'faith-miracle-banner';
  const kicker = document.createElement('div');
  kicker.className = 'faith-miracle-kicker';
  kicker.textContent = t('faithMiracle.kicker');
  miracle.appendChild(kicker);
  const titleEl = document.createElement('div');
  titleEl.className = 'faith-miracle-title';
  titleEl.textContent = t('faithMiracle.title');
  miracle.appendChild(titleEl);
  const sub = document.createElement('div');
  sub.className = 'faith-miracle-subtitle';
  sub.textContent = t('faithMiracle.subtitle');
  miracle.appendChild(sub);
  const btnM = document.createElement('button');
  btnM.type = 'button';
  btnM.className = 'faith-miracle-dismiss';
  btnM.dataset.quickNavContinue = '';
  btnM.title = t('faithMiracle.spaceBarHint');
  btnM.textContent = t('faithMiracle.continue');
  btnM.addEventListener('click', () => {
    callbacks.setFaithMiraclePending(false);
    callbacks.playUiClick();
    callbacks.render();
  });
  miracle.appendChild(btnM);
  inner.appendChild(miracle);
}
