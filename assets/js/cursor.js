// Quiet gold cursor: a ring that follows the mouse closely and a soft light that trails it.
// Desktop pointers only; disabled under prefers-reduced-motion.
export function mountCursor() {
  if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const glow = document.createElement('div'); glow.className = 'cursor-glow'; glow.setAttribute('aria-hidden', 'true');
  const ring = document.createElement('div'); ring.className = 'cursor-ring'; ring.setAttribute('aria-hidden', 'true');
  document.body.append(glow, ring);
  const p = { x: -500, y: -500, rx: -500, ry: -500, gx: -500, gy: -500 };
  let running = false, last = 0;
  const step = (now) => {
    const dt = last ? Math.min(64, now - last) : 16; last = now;
    const kr = 1 - Math.pow(1e-9, dt / 1000), kg = 1 - Math.pow(1e-3, dt / 1000);
    p.rx += (p.x - p.rx) * kr; p.ry += (p.y - p.ry) * kr;
    p.gx += (p.x - p.gx) * kg; p.gy += (p.y - p.gy) * kg;
    ring.style.transform = `translate3d(${p.rx}px, ${p.ry}px, 0)`;
    glow.style.transform = `translate3d(${p.gx}px, ${p.gy}px, 0)`;
    if (Math.abs(p.x - p.gx) + Math.abs(p.y - p.gy) > 0.3) requestAnimationFrame(step);
    else { running = false; last = 0; }
  };
  const HOT = 'a, button, summary, input, select, label, [data-pid], .poi, .pjc';
  addEventListener('pointermove', (e) => {
    p.x = e.clientX; p.y = e.clientY;
    document.body.classList.add('has-cursor');
    ring.classList.toggle('is-hover', !!e.target.closest(HOT));
    if (!running) { running = true; requestAnimationFrame(step); }
  }, { passive: true });
  document.addEventListener('pointerleave', () => document.body.classList.remove('has-cursor'));
  addEventListener('pointerdown', () => ring.classList.add('is-down'));
  addEventListener('pointerup', () => ring.classList.remove('is-down'));
}
