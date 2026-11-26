// Talking cursor: a small orange dot rides beside the pointer; over anything clickable it opens into a
// short label that says what will happen («افتح»، «اختر»، «زيارة ↗»). The native cursor stays visible.
// Desktop pointers only; disabled under prefers-reduced-motion.
export function mountCursor() {
  if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const el = document.createElement('div'); el.className = 'tc'; el.setAttribute('aria-hidden', 'true');
  el.innerHTML = '<span class="tc__t"></span>';
  document.body.append(el);
  const txt = el.firstChild;
  const OFF = 18; // sits below-left of the pointer (RTL reading side), never on top of it
  const p = { x: -100, y: -100, sx: -100, sy: -100 };
  let running = false, last = 0, label = '';
  const step = (now) => {
    const dt = last ? Math.min(64, now - last) : 16; last = now;
    const k = 1 - Math.pow(1e-8, dt / 1000);
    p.sx += (p.x - OFF - p.sx) * k; p.sy += (p.y + OFF - p.sy) * k;
    el.style.transform = `translate3d(${p.sx.toFixed(1)}px, ${p.sy.toFixed(1)}px, 0)`;
    if (Math.abs(p.x - OFF - p.sx) + Math.abs(p.y + OFF - p.sy) > 0.2) requestAnimationFrame(step); else { running = false; last = 0; }
  };
  const labelFor = (t) => {
    const a = t.closest('[data-cursor]'); if (a) return a.dataset.cursor;
    if (t.closest('input, textarea, select, .tc-skip, .top, .tabbar')) return null;
    const l = t.closest('a[href]');
    if (l) return /^https?:/.test(l.getAttribute('href')) ? 'زيارة ↗' : l.getAttribute('href').startsWith('tel:') ? 'اتصال' : 'افتح';
    const b = t.closest('button, summary, label.chk, .opt, .fchip, .rm, .tkc');
    if (!b) return '';
    if (b.matches('[data-assistant]')) return 'اسأل';
    if (b.matches('summary')) return 'اعرض';
    if (b.matches('.opt, .fchip, .rm, .chk, .tkc, [data-v], [data-pick]')) return 'اختر';
    return 'اضغط';
  };
  addEventListener('pointermove', (e) => {
    p.x = e.clientX; p.y = e.clientY;
    const l = labelFor(e.target);
    el.classList.toggle('is-off', l === null);
    if (l && l !== label) { label = l; txt.textContent = l; }
    el.classList.toggle('is-lbl', !!l);
    document.body.classList.add('has-cursor');
    if (!running) { running = true; requestAnimationFrame(step); }
  }, { passive: true });
  document.addEventListener('pointerleave', () => document.body.classList.remove('has-cursor'));
  addEventListener('pointerdown', () => el.classList.add('is-down'));
  addEventListener('pointerup', () => el.classList.remove('is-down'));
}
