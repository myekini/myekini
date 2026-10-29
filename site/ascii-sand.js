/* Shared material behaviour for the hero field and the sampled portrait. */
(() => {
  const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  function clear(g) {
    // Clear physical pixels too: fractional DPR must not leave a composited edge.
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, g.canvas.width, g.canvas.height); g.restore();
  }
  function release(p, x, y, height) {
    p.state = 1; p.age = 0; p.x = p.homeX; p.y = p.homeY;
    p.vx = (p.homeX - x) * 2.5; p.vy = -60 - hash(p.seed) * 90;
    p.floor = height - 10 - Math.floor(hash(p.seed + 7) * 6) * 3;
  }
  function step(p, dt, width) {
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
  }
  window.AsciiSand = Object.freeze({ hash, clear, release, step, radius: type => type === 'mouse' ? 76 : 48, frameInterval: 32 });
})();
