// Touch feedback: phones have no hover, so every hover effect in the stylesheet is mirrored onto a `.tap`
// class that is applied for a moment when a finger touches an element (cards darken, icons turn and go orange).
// Internal links wait ~180ms before navigating so the feedback is visible.
export function mountTouch() {
  if (!matchMedia('(hover: none)').matches) return;

  const build = () => {
    if (document.getElementById('tapcss')) return;
    const out = [];
    const walk = (rules) => {
      for (const r of rules) {
        if (r.cssRules && !r.selectorText) walk(r.cssRules);
        else if (r.selectorText && r.selectorText.includes(':hover')) {
          out.push(`${r.selectorText.replace(/:hover/g, '.tap')}{${r.style.cssText}}`);
        }
      }
    };
    for (const sh of document.styleSheets) {
      if (sh.href && !sh.href.includes('/assets/css/app.css')) continue;
      try { walk(sh.cssRules); } catch {}
    }
    const st = document.createElement('style'); st.id = 'tapcss'; st.textContent = out.join('\n'); document.head.append(st);
  };
  if (document.readyState === 'complete') build(); else addEventListener('load', build);

  let timer = 0, lit = [], lastTouch = 0;
  const clear = () => { clearTimeout(timer); lit.forEach((el) => el.classList.remove('tap')); lit = []; };
  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'touch') return;
    lastTouch = Date.now(); clear();
    const t = e.target;
    // light the touched element and its ancestors (rules decide which of them react)
    timer = setTimeout(() => { for (let n = t; n && n !== document.body; n = n.parentElement) { n.classList.add('tap'); lit.push(n); } }, 60);
  }, { passive: true });
  document.addEventListener('pointercancel', clear, { passive: true }); // the finger started a scroll
  document.addEventListener('pointerup', (e) => { if (e.pointerType === 'touch') setTimeout(clear, 420); }, { passive: true });

  // let the tap animation show before internal navigation
  document.addEventListener('click', (e) => {
    if (Date.now() - lastTouch > 800 || e.defaultPrevented) return;
    const a = e.target.closest('a[href^="#/"]'); if (!a || a.target) return;
    e.preventDefault();
    const href = a.getAttribute('href');
    if (!lit.length) { for (let n = a; n && n !== document.body; n = n.parentElement) { n.classList.add('tap'); lit.push(n); } }
    setTimeout(() => { location.hash = href.slice(1); }, 180);
  });
}
