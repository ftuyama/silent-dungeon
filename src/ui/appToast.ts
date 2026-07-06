/** Toast não bloqueante com `aria-live` para substituir `alert()` no jogo. */

import { t } from '../i18n/index.ts';

const TOAST_MS_INFO = 6000;
const TOAST_MS_ERROR = 10000;

let toastHideTimer: number | null = null;

function clearToastRegion(el: HTMLElement): void {
  el.replaceChildren();
  el.classList.remove('app-toast-region--error', 'app-toast-region--success');
  el.setAttribute('aria-live', 'polite');
}

export function showAppToast(
  el: HTMLElement,
  message: string,
  variant: 'info' | 'error' | 'success' = 'info'
): void {
  if (toastHideTimer != null) {
    clearTimeout(toastHideTimer);
    toastHideTimer = null;
  }
  el.classList.toggle('app-toast-region--error', variant === 'error');
  el.classList.toggle('app-toast-region--success', variant === 'success');
  el.setAttribute('aria-live', variant === 'error' ? 'assertive' : 'polite');

  const msg = document.createElement('span');
  msg.className = 'app-toast-msg';
  msg.textContent = message;

  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'app-toast-dismiss';
  dismiss.textContent = t('sidebar.close');
  dismiss.setAttribute('aria-label', t('toast.closeNotification'));

  const scheduleHide = (ms: number): void => {
    toastHideTimer = window.setTimeout((): void => {
      clearToastRegion(el);
      toastHideTimer = null;
    }, ms);
  };

  dismiss.addEventListener('click', () => {
    if (toastHideTimer != null) {
      clearTimeout(toastHideTimer);
      toastHideTimer = null;
    }
    clearToastRegion(el);
  });

  el.replaceChildren(msg, dismiss);

  scheduleHide(variant === 'error' ? TOAST_MS_ERROR : TOAST_MS_INFO);
}
