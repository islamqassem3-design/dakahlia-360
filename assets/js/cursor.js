// Cursor shadow: the pointer "floats" above the page and casts a soft olive shadow.
// The shadow trails slightly, stretches along the direction of fast movement,
// widens and fades over clickable things, and tightens on press (as if the pointer touches down).
// Desktop pointers only; disabled under prefers-reduced-motion.
export function mountCursor() {
  if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const sh = document.createElement('div'); sh.className = 'cursor-shadow'; sh.setAttribute('aria-hidden', 'true');
  document.body.append(sh);
  const OFF_X = 7, OFF_Y = 11; // light comes from the top left: shadow falls down and to the right
  const p = { x: -200, y: -200, sx: -200, sy: -200, vx: 0, vy: 0 };
  let hot = false, down = false, running = false, last = 0;
  const step = (now) => {
    const dt = last ? Math.min(64, now - last) : 16; last = now;
    const k = 1 - Math.pow(1e-6, dt / 1000);
    const nx = p.sx + (p.x + OFF_X - p.sx) * k, ny = p.sy + (p.y + OFF_Y - p.sy) * k;
    p.vx = nx - p.sx; p.vy = ny - p.sy; p.sx = nx; p.sy = ny;
    const speed = Math.min(1, Math.hypot(p.vx, p.vy) / 28);
    const ang = Math.atan2(p.vy, p.vx) * 180 / Math.PI;
    const base = down ? 0.7 : hot ? 1.7 : 1;
    sh.style.transform = `translate3d(${p.sx}px, ${p.sy}px, 0) rotate(${ang}deg) scale(${base * (1 + speed * 0.9)}, ${base * (1 - speed * 0.35)})`;
    if (Math.abs(p.x + OFF_X - p.sx) + Math.abs(p.y + OFF_Y - p.sy) > 0.2) requestAnimationFrame(step);
    else { running = false; last = 0; }
  };
  const kick = () => { if (!running) { running = true; requestAnimationFrame(step); } };
  const HOT = 'a, button, summary, input, select, label, .poi, .pjc, .idea, .rm';
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
