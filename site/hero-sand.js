/* ASCII sand: user-triggered, bounded motion. No continuous background loop. */
(() => {
  const canvas = document.querySelector('[data-hero-sand]');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const hero = canvas.closest('.hero');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const base = document.createElement('canvas'), ink = base.getContext('2d');
  const chars = '.:;+=*01';
  let width = 0, height = 0, dpr = 1, particles = [], active = [], quiet = [];
  let visible = true, raf = 0, last = 0, frame = 0, resizeTimer = 0;
  const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const shade = (x, y, alpha) => quiet.some(b => x > b.left && x < b.right && y > b.top && y < b.bottom) ? alpha * 0.22 : alpha;
  function glyph(g, p, x = p.homeX, y = p.homeY, moving = false) {
    g.fillStyle = `rgba(214,158,46,${shade(x, y, moving ? 0.6 : p.alpha)})`;
    g.fillText(p.char, x, y);
  }
  function paint() {
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(base, 0, 0, width, height);
    active.forEach(p => ctx.clearRect(p.homeX - 1, p.homeY - 1, 10, 12));
    active.forEach(p => glyph(ctx, p, p.x, p.y, true));
  }
  function reset() {
    cancelAnimationFrame(raf); raf = 0; last = 0;
    active.forEach(p => { p.state = 0; }); active = [];
    if (width) paint();
  }
  function build() {
    reset();
    width = document.documentElement.clientWidth;
    height = Math.round(hero.getBoundingClientRect().height);
    if (!width || !height) return;
    dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.style.width = width + 'px';
    for (const c of [canvas, base]) { c.width = Math.round(width * dpr); c.height = Math.round(height * dpr); }
    for (const g of [ctx, ink]) { g.setTransform(dpr, 0, 0, dpr, 0, 0); g.font = '9px ui-monospace, monospace'; g.textBaseline = 'top'; }
    const bounds = canvas.getBoundingClientRect();
    quiet = [...hero.querySelectorAll('.hero-text, .portrait')].map(el => {
      const b = el.getBoundingClientRect();
      return { left: b.left - bounds.left - 12, top: b.top - bounds.top - 8, right: b.right - bounds.left + 12, bottom: b.bottom - bounds.top + 8 };
    });
    particles = [];
    const gap = width < 760 ? 17 : 15;
    const max = width < 760 ? 650 : 2200;
    for (let y = 12, row = 0; y < height - 8; y += 16, row++) {
      for (let x = 8, col = 0; x < width - 8; x += gap, col++) {
        const seed = row * 719 + col * 37;
        if (hash(seed) > 0.48 || particles.length >= max) continue;
        const p = { homeX: x + hash(seed + 1) * 3, homeY: y, char: chars[Math.floor(hash(seed + 2) * chars.length)], alpha: 0.17 + hash(seed + 3) * 0.18, state: 0, seed };
        particles.push(p); glyph(ink, p);
      }
    }
    paint();
  }
  function tick(now) {
    raf = 0;
    if (!visible || document.hidden || motion.matches) { reset(); return; }
    // Draw at 30fps; physics uses elapsed time instead of frame counts.
    if (now - frame < 32) { raf = requestAnimationFrame(tick); return; }
    frame = now;
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.033;
    last = now;
    active = active.filter(p => {
      p.age += dt;
      if (p.state === 1) {
        p.vy += 620 * dt; p.vx *= Math.pow(0.92, dt * 30);
        p.x = Math.max(3, Math.min(width - 10, p.x + p.vx * dt)); p.y += p.vy * dt;
        if (p.y >= p.floor) { p.y = p.floor; p.state = 2; p.age = 0; }
      } else if (p.state === 2 && p.age > 0.3) { p.state = 3; p.age = 0; }
      if (p.state === 3) {
        const ease = 1 - Math.exp(-5 * dt);
        p.x += (p.homeX - p.x) * ease; p.y += (p.homeY - p.y) * ease;
        if (Math.hypot(p.homeX - p.x, p.homeY - p.y) < 0.65) { p.state = 0; return false; }
      }
      return true;
    });
    paint();
    if (active.length) raf = requestAnimationFrame(tick); else last = 0;
  }
  function disturb(e) {
    if (motion.matches || !visible || document.hidden) return;
    const b = canvas.getBoundingClientRect();
    const x = e.clientX - b.left, y = e.clientY - b.top;
    if (y < 0 || y > height || x < 0 || x > width) return;
    const radius = e.pointerType === 'mouse' ? 76 : 48;
    particles.forEach(p => {
      if (p.state || Math.hypot(p.homeX - x, p.homeY - y) > radius) return;
      p.state = 1; p.age = 0; p.x = p.homeX; p.y = p.homeY;
      p.vx = (p.homeX - x) * 2.5; p.vy = -60 - hash(p.seed) * 90;
      p.floor = height - 10 - Math.floor(hash(p.seed + 7) * 6) * 3;
      active.push(p);
    });
    if (active.length && !raf) { last = 0; raf = requestAnimationFrame(tick); }
  }
  addEventListener('pointermove', e => { if (e.pointerType === 'mouse') disturb(e); }, { passive: true });
  hero.addEventListener('pointerdown', disturb, { passive: true });
  hero.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse' && e.buttons) disturb(e); }, { passive: true });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible) reset(); }).observe(hero);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
  motion.addEventListener('change', reset);
  new ResizeObserver(() => { clearTimeout(resizeTimer); resizeTimer = setTimeout(build, 100); }).observe(hero);
  addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(build, 100); });
  build();
})();
