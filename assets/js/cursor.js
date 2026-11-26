// Light cursor shadow: a faint olive shadow just below the pointer, as if it floats over the page.
// Kept deliberately subtle (user feedback): small, transparent, close to the pointer, gentle stretch.
// Desktop pointers only; disabled under prefers-reduced-motion.
export function mountCursor() {
  if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const sh = document.createElement('div'); sh.className = 'cursor-shadow'; sh.setAttribute('aria-hidden', 'true');
  document.body.append(sh);
  const OFF_X = 4, OFF_Y = 7;
  const p = { x: -200, y: -200, sx: -200, sy: -200 };
  let hot = false, down = false, running = false, last = 0;
  const step = (now) => {
    const dt = last ? Math.min(64, now - last) : 16; last = now;
    const k = 1 - Math.pow(1e-7, dt / 1000);
    const nx = p.sx + (p.x + OFF_X - p.sx) * k, ny = p.sy + (p.y + OFF_Y - p.sy) * k;
    const vx = nx - p.sx, vy = ny - p.sy; p.sx = nx; p.sy = ny;
    const speed = Math.min(1, Math.hypot(vx, vy) / 40);
    const ang = Math.atan2(vy, vx) * 180 / Math.PI;
    const base = down ? 0.8 : hot ? 1.35 : 1;
    sh.style.transform = `translate3d(${p.sx}px, ${p.sy}px, 0) rotate(${ang}deg) scale(${base * (1 + speed * 0.35)}, ${base * (1 - speed * 0.15)})`;
    if (Math.abs(p.x + OFF_X - p.sx) + Math.abs(p.y + OFF_Y - p.sy) > 0.2) requestAnimationFrame(step);
    else { running = false; last = 0; }
  };
  const kick = () => { if (!running) { running = true; requestAnimationFrame(step); } };
  const HOT = 'a, button, summary, input, select, label, textarea, .poi, .pjc, .idea, .rm, .opt, .tkc';
  addEventListener('pointermove', (e) => {
    p.x = e.clientX; p.y = e.clientY;
    document.body.classList.add('has-cursor');
    const h = !!e.target.closest(HOT);
    if (h !== hot) { hot = h; sh.classList.toggle('is-hot', hot); }
    kick();
  }, { passive: true });
  document.addEventListener('pointerleave', () => document.body.classList.remove('has-cursor'));
  addEventListener('pointerdown', () => { down = true; sh.classList.add('is-down'); kick(); });
  addEventListener('pointerup', () => { down = false; sh.classList.remove('is-down'); kick(); });
}
