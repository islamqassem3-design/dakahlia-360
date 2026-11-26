// AI settings panel: the user connects their own free Gemini key (stored only in this browser).
import { icon, esc } from './ui.js';
import { aiOn, aiModel, aiConnect, aiClear } from './lib/ai.js';

export const aiChip = () => aiOn()
  ? `<button class="aichip aichip--on" data-aipanel>${icon('spark')} AI حقيقي: Gemini</button>`
  : `<button class="aichip" data-aipanel>${icon('spark')} وضع المحاكاة · فعّل AI مجاني</button>`;

export function mountAIPanel() {
  const el = document.createElement('div');
  el.className = 'pal aip'; el.hidden = true; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'إعداد الذكاء الاصطناعي');
  document.body.append(el);
  const draw = () => {
    el.innerHTML = `
    <div class="pal__scrim" data-aiclose></div>
    <div class="pal__box aip__box">
      <header class="aip__h"><span class="ai__logo">${icon('spark')}</span><div><b class="title-2">الذكاء الاصطناعي الحقيقي</b><small class="caption-5">Google Gemini · الطبقة المجانية · بدون أي دفع</small></div><button class="iconbtn" data-aiclose aria-label="إغلاق">${icon('close')}</button></header>
      <div class="aip__b">
        ${aiOn() ? `<p class="aip__st aip__st--on">${icon('ok')} متصل بنموذج <b dir="ltr">${esc(aiModel())}</b>. أدوات التطوير والمعمل تستخدم الذكاء الحقيقي الآن.</p>
          <button class="btn btn--ghost" data-aioff>${icon('no')} إيقاف وحذف المفتاح من هذا المتصفح</button>`
        : `<p class="aip__st">${icon('info')} الوضع الحالي: محاكاة قائمة على قواعد. لتفعيل الذكاء الحقيقي مجانًا:</p>
          <ol class="aip__steps body-6">
            <li>افتح <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio ${icon('ext')}</a> وسجّل الدخول بحساب جوجل.</li>
            <li>اضغط <b>Create API key</b> وانسخ المفتاح. لا يطلب أي بيانات دفع.</li>
            <li>الصق المفتاح هنا واضغط «اتصال».</li>
          </ol>
          <form class="aip__f"><input class="inp" type="password" name="k" placeholder="الصق مفتاح Gemini هنا" autocomplete="off" dir="ltr" aria-label="مفتاح Gemini"/><button class="btn btn--primary" type="submit">اتصال</button></form>
          <p class="err" data-aierr hidden></p>`}
        <p class="caption-5 muted">${icon('shield')} المفتاح يُحفظ في هذا المتصفح فقط ولا يُرفع على الموقع ولا يُرسل إلا إلى Google. لا تشارك المفتاح مع أحد. الطبقة المجانية لها حد استخدام يومي، وعند تجاوزه يعود النظام للمحاكاة.</p>
      </div>
    </div>`;
    el.querySelector('form')?.addEventListener('submit', async (e) => {
      e.preventDefault(); const k = e.target.k.value.trim(); const err = el.querySelector('[data-aierr]'); const btn = e.target.querySelector('button');
      if (k.length < 20) { err.hidden = false; err.textContent = 'المفتاح قصير. انسخه كاملًا من Google AI Studio.'; return; }
      btn.disabled = true; btn.textContent = 'جارٍ التحقق…';
      try { await aiConnect(k); draw(); } catch (x) { err.hidden = false; err.textContent = x.message; btn.disabled = false; btn.textContent = 'اتصال'; }
    });
  };
  const open = () => { draw(); el.hidden = false; document.body.classList.add('noscroll'); setTimeout(() => el.querySelector('input')?.focus(), 50); };
  const close = () => { el.hidden = true; document.body.classList.remove('noscroll'); dispatchEvent(new HashChangeEvent('hashchange')); };
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-aipanel]')) { e.preventDefault(); open(); }
    else if (e.target.closest('[data-aiclose]')) close();
    else if (e.target.closest('[data-aioff]')) { aiClear(); draw(); }
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !el.hidden) close(); });
}
