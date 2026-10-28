(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = 'cubic-bezier(.16,1,.3,1)';
  const sections = ['work', 'projects', 'about', 'contact'];

  // Lagos clock
  const clock = $('[data-clock]');
  const tick = () => {
    clock.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' }) + ' wat';
  };
  tick();
  setInterval(tick, 20000);

  // Active nav item
  const navLinks = $$('.top nav a');
  const onScroll = () => {
    let active = '';
    for (const id of sections) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top < innerHeight * 0.4) active = id;
    }
    navLinks.forEach(a => a.setAttribute('aria-current', a.hash === '#' + active ? 'true' : 'false'));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Keys 1-4 jump to sections
  $('.keys').hidden = false;
  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName || '')) return;
    const el = document.getElementById(sections[+e.key - 1]);
    if (el) el.scrollIntoView({ behavior: still ? 'auto' : 'smooth' });
  });

  // Typed prompt
  const typed = $('[data-typed]');
  const text = typed.textContent;
  const caret = document.createElement('span');
  caret.className = 'caret';
  if (still) {
    typed.after(caret);
  } else {
    let i = 0;
    typed.textContent = '';
    typed.after(caret);
    const id = setInterval(() => { typed.textContent = text.slice(0, ++i); if (i >= text.length) clearInterval(id); }, 55);
  }

  // Cost allocator: largest-remainder rounding so allocations sum to the cent
  const alloc = $('[data-alloc]');
  const totalIn = $('[data-total]', alloc);
  const weights = $$('[data-w]', alloc);
  const bars = $$('[data-bar] i', alloc);
  const money = c => '$' + (c / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const allocate = () => {
    const cents = +totalIn.value * 100;
    const w = weights.map(el => +el.value);
    const sw = w.reduce((a, b) => a + b, 0);
    const raw = w.map(x => (sw ? x / sw : 0) * cents);
    const fl = raw.map(Math.floor);
    let rem = (sw ? cents : 0) - fl.reduce((a, b) => a + b, 0);
    raw.map((r, i) => [r - fl[i], i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (rem > 0) { fl[i]++; rem--; } });
    const sum = fl.reduce((a, b) => a + b, 0);
    const ok = sw > 0 && sum === cents;
    $('[data-total-out]', alloc).textContent = money(cents);
    weights.forEach((el, i) => {
      el.nextElementSibling.textContent = money(fl[i]);
      bars[i].style.width = (sw ? w[i] / sw * 100 : 0).toFixed(1) + '%';
    });
    $('[data-check]', alloc).classList.toggle('bad', !ok);
    $('[data-check-text]', alloc).textContent = ok ? money(sum) + ' ✓' : 'set at least one weight';
  };
  alloc.addEventListener('input', allocate);
  allocate();

  // Copy email
  const copy = $('[data-copy]');
  if (navigator.clipboard) {
    copy.hidden = false;
    let t;
    copy.addEventListener('click', () => {
      navigator.clipboard.writeText(copy.dataset.copy).then(() => {
        copy.textContent = 'copied ✓';
        copy.classList.add('done');
        clearTimeout(t);
        t = setTimeout(() => { copy.textContent = 'copy'; copy.classList.remove('done'); }, 1800);
      });
    });
  }

  // Entrance and scroll-reveal motion
  if (still || document.visibilityState !== 'visible' || !Element.prototype.animate) return;
  $$('[data-intro]').forEach(el => el.animate(
    [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }],
    { duration: 700, delay: +el.dataset.intro || 0, easing: ease, fill: 'backwards' }));
  const hidden = new Map();
  $$('[data-reveal]').forEach(el => {
    if (el.getBoundingClientRect().top < innerHeight * 0.92) return;
    hidden.set(el, el.animate([{ opacity: 0, transform: 'translateY(12px)' }], { duration: 1, fill: 'forwards' }));
  });
  const show = (el, anim) => {
    const h = hidden.get(el);
    if (!h) return;
    hidden.delete(el);
    if (anim) el.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: ease, fill: 'backwards' });
    h.cancel();
  };
  const check = () => {
    hidden.forEach((_, el) => { if (el.getBoundingClientRect().top < innerHeight * 0.92) show(el, true); });
    if (!hidden.size) off();
  };
  const all = () => { [...hidden.keys()].forEach(el => show(el, false)); off(); };
  const off = () => { removeEventListener('scroll', check); removeEventListener('resize', check); removeEventListener('beforeprint', all); };
  addEventListener('scroll', check, { passive: true });
  addEventListener('resize', check);
  addEventListener('beforeprint', all);
  // Anchor jumps land on hidden elements; reveal them
  addEventListener('hashchange', check);
})();
