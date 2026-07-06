import { onLocaleChange, t } from '../i18n/index.ts';

const STORAGE_KEY = 'sd_mobile_notice_dismissed_v1';
const MOBILE_MQ = '(max-width: 720px)';

function isDismissed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function dismiss(notice: HTMLElement): void {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    /* noop */
  }
  notice.hidden = true;
}

function syncVisibility(notice: HTMLElement): void {
  notice.hidden = !window.matchMedia(MOBILE_MQ).matches || isDismissed();
}

function syncCopy(notice: HTMLElement): void {
  const title = notice.querySelector<HTMLElement>('.mobile-notice__title');
  const body = notice.querySelector<HTMLElement>('.mobile-notice__body');
  const dismissBtn = notice.querySelector<HTMLButtonElement>('.mobile-notice__dismiss');
  if (title) title.textContent = t('mobileNotice.title');
  if (body) body.textContent = t('mobileNotice.body');
  if (dismissBtn) {
    dismissBtn.textContent = t('mobileNotice.dismiss');
    dismissBtn.setAttribute('aria-label', t('mobileNotice.dismissAria'));
  }
}

/** Aviso fixo no celular: experiência pensada para PC (dispensável, persistido). */
export function mountMobileNotice(root: HTMLElement): void {
  if (root.querySelector('[data-mobile-notice]')) return;

  const notice = document.createElement('aside');
  notice.className = 'mobile-notice';
  notice.setAttribute('data-mobile-notice', '');
  notice.setAttribute('role', 'dialog');
  notice.setAttribute('aria-modal', 'true');
  notice.setAttribute('aria-labelledby', 'mobile-notice-title');

  notice.innerHTML = `
    <div class="mobile-notice__inner">
      <div class="mobile-notice__glyph" aria-hidden="true"></div>
      <div class="mobile-notice__copy">
        <p class="mobile-notice__title" id="mobile-notice-title"></p>
        <p class="mobile-notice__body"></p>
      </div>
      <button type="button" class="mobile-notice__dismiss"></button>
    </div>
  `;

  const dismissBtn = notice.querySelector<HTMLButtonElement>('.mobile-notice__dismiss');
  dismissBtn?.addEventListener('click', () => dismiss(notice));

  syncCopy(notice);
  syncVisibility(notice);

  onLocaleChange(() => syncCopy(notice));
  window.matchMedia(MOBILE_MQ).addEventListener('change', () => syncVisibility(notice));

  root.appendChild(notice);
}
