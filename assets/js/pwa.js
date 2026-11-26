// Installable app: registers the service worker and offers "install on your phone" in the mobile menu.
export function mountPWA() {
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
  const btn = document.querySelector('[data-install]'); if (!btn) return;
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (standalone) return;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  let deferred = null;
  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; btn.hidden = false; });
  if (ios) btn.hidden = false;
  const toast = (html) => {
    document.querySelector('.toast')?.remove();
    const t = document.createElement('div'); t.className = 'toast'; t.innerHTML = html; document.body.append(t);
    setTimeout(() => t.remove(), 7000); t.addEventListener('click', () => t.remove());
  };
  btn.addEventListener('click', async () => {
    if (deferred) { deferred.prompt(); const r = await deferred.userChoice.catch(() => null); deferred = null; if (r?.outcome === 'accepted') btn.hidden = true; return; }
    if (ios) toast('على الآيفون: اضغط زر <b>المشاركة</b> أسفل الشاشة، ثم اختر <b>«إضافة إلى الشاشة الرئيسية»</b>.');
  });
  addEventListener('appinstalled', () => { btn.hidden = true; toast('تم تثبيت <b>الدقهلية 360°</b> على موبايلك.'); });
}
