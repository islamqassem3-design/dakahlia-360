// Cursor: a light orange shadow directly under the pointer (user's choice after trying a ring, an olive
// shadow and a talking dot). It hugs the pointer, grows softly over clickable things and tightens on press.
// Desktop pointers only; disabled under prefers-reduced-motion.
export function mountCursor() {
  if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const el = document.createElement('div'); el.className = 'osh'; el.setAttribute('aria-hidden', 'true');
  document.body.append(el);
  const OX = 3, OY = 5; // just under the pointer tip
  const p = { x: -100, y: -100, sx: -100, sy: -100 };
  let running = false, last = 0, hot = false;
  const step = (now) => {
    const dt = last ? Math.min(64, now - last) : 16; last = now;
    const k = 1 - Math.pow(1e-12, dt / 1000); // very fast follow: stays under the pointer
    p.sx += (p.x + OX - p.sx) * k; p.sy += (p.y + OY - p.sy) * k;
    el.style.transform = `translate3d(${p.sx.toFixed(1)}px, ${p.sy.toFixed(1)}px, 0)`;
    if (Math.abs(p.x + OX - p.sx) + Math.abs(p.y + OY - p.sy) > 0.2) requestAnimationFrame(step); else { running = false; last = 0; }
  };
  addEventListener('pointermove', (e) => {
    p.x = e.clientX; p.y = e.clientY;
    const h = !!e.target.closest('a, button, summary, label, select, .poi, .pjc, .idea, .rm, .opt, .tkc');
    if (h !== hot) { hot = h; el.classList.toggle('is-hot', hot); }
    el.classList.toggle('is-off', !!e.target.closest('input, textarea'));
    document.body.classList.add('has-cursor');
    if (!running) { running = true; requestAnimationFrame(step); }
  }, { passive: true });
  document.addEventListener('pointerleave', () => document.body.classList.remove('has-cursor'));
  addEventListener('pointerdown', () => el.classList.add('is-down'));
  addEventListener('pointerup', () => el.classList.remove('is-down'));
}
