// The portrait and hero field share one ASCII sand material.
(() => {
  const host = document.querySelector('[data-portrait]');
  const sand = window.AsciiSand;
  if (!host || !sand) return;
  const ctx = host.getContext('2d');
  if (!ctx) return;
  const box = host.parentElement, img = box.querySelector('img');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const RAMP = ' .,:;-=+*#%@';
  const base = document.createElement('canvas'), bctx = base.getContext('2d');
  let W = 0, H = 0, cols, rows, cw, ch, cells = [], active = [];
  let visible = true, ready = false, touching = false, raf = 0, last = 0, frame = 0;
  const ink = alpha => 'rgba(232,217,176,' + alpha + ')';
  function font(g) { g.font = (cw / 0.6).toFixed(2) + 'px "JetBrains Mono", ui-monospace, monospace'; g.textBaseline = 'top'; }
  function sample() {
    const s = document.createElement('canvas');
    s.width = cols; s.height = rows;
    const sctx = s.getContext('2d', { willReadFrequently: true });
    sctx.drawImage(src, 0, 0, cols, rows);
    const d = sctx.getImageData(0, 0, cols, rows).data;
    const lum = new Float32Array(cols * rows), alpha = new Float32Array(cols * rows);
    for (let i = 0; i < cols * rows; i++) {
      alpha[i] = d[i * 4 + 3] / 255;
      lum[i] = (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255;
    }
    // Stretch contrast over the subject only, then sharpen edges a little
    const vals = [...lum].filter((_, i) => alpha[i] > 0.5).sort((a, b) => a - b);
    const lo = vals[Math.floor(vals.length * 0.04)] || 0, hi = vals[Math.floor(vals.length * 0.97)] || 1;
    cells = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        if (alpha[i] < 0.4) continue;
        let v = Math.min(1, Math.max(0, (lum[i] - lo) / (hi - lo)));
        let n = 0, c = 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const j = (y + dy) * cols + (x + dx);
          if (x + dx >= 0 && x + dx < cols && y + dy >= 0 && y + dy < rows && alpha[j] > 0.4) { n += (lum[j] - lo) / (hi - lo); c++; }
        }
        if (c) v = Math.min(1, Math.max(0, v + 0.25 * (v - n / c)));
        const k = Math.max(1, Math.round(v * (RAMP.length - 1)));
        cells.push({ homeX: x * cw, homeY: y * ch, char: RAMP[k], a: (0.3 + 0.7 * v) * Math.max(0, Math.min(1, (H * 0.98 - y * ch) / (H * 0.30))), seed: i, state: 0 });
      }
    }
  }


  function paint() {
    sand.clear(ctx);
    ctx.drawImage(base, 0, 0, W, H);
    active.forEach(p => ctx.clearRect(p.homeX - 0.5, p.homeY - 0.5, cw + 1, ch + 1));
    active.forEach(p => { ctx.fillStyle = ink(p.a * (p.state === 2 ? 0.55 : 1)); ctx.fillText(p.char, p.x, p.y); });
  }
  function reset() {
    cancelAnimationFrame(raf); raf = 0; last = 0; touching = false;
    active.forEach(p => { p.state = 0; }); active = [];
    if (ready) paint();
  }
  function setup() {
    reset();
    W = box.clientWidth; H = Math.round(W * 1.25);
    if (!W) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    cols = Math.round(W / (W < 140 ? 1.5 : 2.6));
    cw = W / cols; ch = cw * 1.6; rows = Math.floor(H / ch);
    for (const c of [host, base]) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); }
    host.style.height = H + 'px';
    for (const g of [ctx, bctx]) { g.setTransform(dpr, 0, 0, dpr, 0, 0); font(g); }
    sample();
    cells.forEach(p => { bctx.fillStyle = ink(p.a); bctx.fillText(p.char, p.homeX, p.homeY); });
    ready = true; paint();
  }
  function tick(now) {
    raf = 0;
    if (!visible || document.hidden || motion.matches) { reset(); return; }
    if (now - frame < sand.frameInterval) { raf = requestAnimationFrame(tick); return; }
    frame = now;
    const dt = last ? Math.min((now - last) / 1000, 0.05) : 0.033;
    last = now;
    active = active.filter(p => sand.step(p, dt, W));
    paint();
    if (active.length) raf = requestAnimationFrame(tick); else last = 0;
  }
  function disturb(e) {
    if (!ready || !visible || document.hidden || motion.matches) return;
    const b = host.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top;
    const radius = Math.min(sand.radius(e.pointerType), W * 0.14, 46);
    for (const p of cells) {
      if (active.length >= 700) break;
      if (p.state || Math.hypot(p.homeX - x, p.homeY - y) > radius) continue;
      sand.release(p, x, y, H); active.push(p);
    }
    if (active.length && !raf) { last = 0; raf = requestAnimationFrame(tick); }
  }
  host.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' || touching) disturb(e); }, { passive: true });
  host.addEventListener('pointerdown', e => { touching = e.pointerType !== 'mouse'; disturb(e); }, { passive: true });
  host.addEventListener('pointerup', () => { touching = false; });
  host.addEventListener('pointercancel', () => { touching = false; });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (!visible) reset(); }).observe(host);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
  motion.addEventListener('change', reset);
  new ResizeObserver(() => { if (ready && box.clientWidth !== W) setup(); }).observe(box);
  const src = new Image(); src.src = host.dataset.portrait;
  const loaded = image => image.complete && image.naturalWidth ? Promise.resolve() : new Promise((resolve, reject) => {
    image.addEventListener('load', resolve, { once: true }); image.addEventListener('error', reject, { once: true });
  });
  Promise.all([loaded(img), loaded(src), document.fonts ? document.fonts.load('10px "JetBrains Mono"') : Promise.resolve()]).then(() => {
    setup(); box.classList.add('live');
    const hint = box.querySelector('[data-portrait-hint]');
    if (hint) hint.textContent = matchMedia('(hover: hover)').matches ? 'move to scatter' : 'touch to scatter';
  }).catch(() => { /* The original photo remains available if enhancement fails. */ });
})();
