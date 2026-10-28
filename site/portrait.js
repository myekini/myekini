// ASCII portrait. The photo is sampled into a character grid; a lens follows the
// pointer, pushes the characters aside and shows the real photo underneath.
(() => {
  const host = document.querySelector('[data-portrait]');
  if (!host || !host.getContext) return;
  const box = host.parentElement;
  const img = box.querySelector('img');
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  let still = motionPreference.matches;
  const RAMP = ' .,:;-=+*#%@';
  const INK = [232, 217, 176];
  const ACCENT = '#d69e2e';
  const ctx = host.getContext('2d');
  const base = document.createElement('canvas');
  const bctx = base.getContext('2d');

  let W, H, dpr, cols, rows, cw, ch, cells = [];
  let lens = { x: 0, y: 0, tx: 0, ty: 0, r: 0, R: 0, on: false };
  let introStart = 0, introDone = still, raf = 0, visible = true;

  const lerp = (a, b, t) => a + (b - a) * t;

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
        cells.push({ x: x * cw, y: y * ch, cx: x * cw + cw / 2, cy: y * ch + ch / 2, ch: RAMP[k], a: 0.3 + 0.7 * v, k, t: (y / rows) * 750 + Math.random() * 450 });
      }
    }
  }

  function setup() {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = box.clientWidth; H = Math.round(W * 1.25);
    cols = Math.round(W / (W < 140 ? 1.5 : 2.6));
    cw = W / cols; ch = cw * 1.6; rows = Math.floor(H / ch);
    for (const c of [host, base]) { c.width = W * dpr; c.height = H * dpr; }
    host.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    lens.R = W * 0.17;
    sample();
    bake();
  }

  function font(g) { g.font = `${(cw / 0.6).toFixed(2)}px "JetBrains Mono", ui-monospace, monospace`; g.textBaseline = 'top'; }
  function ink(a) { return `rgba(${INK[0]},${INK[1]},${INK[2]},${a.toFixed(3)})`; }

  function bake() {
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bctx.clearRect(0, 0, W, H);
    font(bctx);
    for (const c of cells) { bctx.fillStyle = ink(c.a); bctx.fillText(c.ch, c.x, c.y); }
  }

  function drawIntro(now) {
    const t = now - introStart;
    ctx.clearRect(0, 0, W, H);
    font(ctx);
    let pending = false;
    for (const c of cells) {
      if (t >= c.t) { ctx.fillStyle = ink(c.a); ctx.fillText(c.ch, c.x, c.y); }
      else if (t > c.t - 260) { ctx.fillStyle = ink(0.25); ctx.fillText(RAMP[1 + Math.floor(Math.random() * (RAMP.length - 1))], c.x, c.y); pending = true; }
      else pending = true;
    }
    return pending;
  }

  function drawFrame(now) {
    ctx.clearRect(0, 0, W, H);
    const r = lens.r, push = r * 0.75;
    if (r > 0.5) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W, H);
      ctx.arc(lens.x, lens.y, r + push, 0, Math.PI * 2);
      ctx.clip('evenodd');
      ctx.drawImage(base, 0, 0, W, H);
      ctx.restore();
      // Characters in the ring get pushed outward
      font(ctx);
      for (const c of cells) {
        const dx = c.cx - lens.x, dy = c.cy - lens.y, d = Math.hypot(dx, dy);
        if (d >= r + push || d < 0.001) continue;
        const f = d < r ? 1 : 1 - (d - r) / push;
        const off = f * f * push * 0.55 + (d < r ? r - d : 0);
        const nx = c.x + (dx / d) * off, ny = c.y + (dy / d) * off;
        ctx.fillStyle = ink(c.a * (d < r ? 0.5 : 1));
        ctx.fillText(c.ch, nx, ny);
      }
      // The real photo inside the lens
      ctx.save();
      ctx.beginPath();
      ctx.arc(lens.x, lens.y, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = '#0d0e0f';
      ctx.fillRect(lens.x - r, lens.y - r, r * 2, r * 2);
      ctx.drawImage(img, 0, 0, W, H);
      ctx.restore();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = ACCENT;
      ctx.beginPath(); ctx.arc(lens.x, lens.y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(214,158,46,.22)';
      ctx.beginPath(); ctx.arc(lens.x, lens.y, r + 5, 0, Math.PI * 2); ctx.stroke();
    } else {
      ctx.drawImage(base, 0, 0, W, H);
    }
  }

  function loop(now) {
    raf = 0;
    if (!introDone) {
      if (drawIntro(now)) { raf = requestAnimationFrame(loop); return; }
      introDone = true;
    }
    const k = still ? 1 : 0.2;
    lens.x = lerp(lens.x, lens.tx, k);
    lens.y = lerp(lens.y, lens.ty, k);
    lens.r = lerp(lens.r, lens.on ? lens.R : 0, still ? 1 : 0.16);
    if (!lens.on && lens.r < 0.5) lens.r = 0;
    drawFrame(now);
    const moving = !still && (Math.abs(lens.x - lens.tx) > 0.3 || Math.abs(lens.y - lens.ty) > 0.3 || Math.abs(lens.r - (lens.on ? lens.R : 0)) > 0.3);
    if (!visible || document.hidden) return;
    if (moving) raf = requestAnimationFrame(loop);
    // No idle loop: the pipeline is the page's focal motion.
  }
  let idle = 0;
  const kick = () => {
    if (idle) { clearTimeout(idle); idle = 0; }
    if (!raf) raf = requestAnimationFrame(loop);
  };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) kick(); });
  motionPreference.addEventListener('change', () => { still = motionPreference.matches; if (still) introDone = true; kick(); });

  function point(e) {
    const b = host.getBoundingClientRect();
    lens.tx = e.clientX - b.left; lens.ty = e.clientY - b.top;
    if (!lens.on || lens.r === 0) { lens.x = lens.tx; lens.y = lens.ty; }
  }
  host.addEventListener('pointerenter', e => { if (e.pointerType !== 'mouse') return; lens.R = W * 0.17; point(e); lens.on = true; kick(); });
  host.addEventListener('pointermove', e => { if (e.pointerType !== 'mouse') return; point(e); lens.on = true; kick(); });
  host.addEventListener('pointerleave', () => { lens.on = false; kick(); });
  host.addEventListener('pointerdown', e => { lens.R = W * (e.pointerType === 'mouse' ? 0.17 : 0.38); point(e); lens.on = true; kick(); });
  host.addEventListener('pointerup', e => { if (e.pointerType !== 'mouse') setTimeout(() => { lens.on = false; kick(); }, 900); });
  host.addEventListener('pointercancel', () => { lens.on = false; kick(); });

  new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) kick(); }).observe(host);
  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { if (box.clientWidth !== W) { setup(); kick(); } }, 150); });

  // High-contrast, sharpened greyscale cutout used only for the characters
  const src = new Image();
  src.src = host.dataset.portrait;
  const loaded = el => el.complete && el.naturalWidth ? Promise.resolve() : new Promise(r => el.addEventListener('load', r, { once: true }));
  const ready = () => Promise.all([
    loaded(img),
    loaded(src),
    document.fonts ? document.fonts.load('10px "JetBrains Mono"') : Promise.resolve()
  ]);
  ready().then(() => {
    setup();
    box.classList.add('live');
    const hint = box.querySelector('[data-portrait-hint]');
    if (hint) hint.textContent = matchMedia('(hover: hover)').matches ? 'hover to look closer' : 'tap to look closer';
    introStart = performance.now();
    kick();
  }).catch(() => { /* Keep the original photo if an image or font cannot load. */ });
})();
