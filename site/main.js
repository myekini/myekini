(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const sections = ['work', 'projects', 'about', 'contact'];
  const header = $('.top');
  const resizeHeader = () => document.documentElement.style.setProperty('--header-height', header.offsetHeight + 'px');
  resizeHeader();
  new ResizeObserver(resizeHeader).observe(header);
  const onScroll = () => {
    let active = '';
    for (const id of sections) if (document.getElementById(id).getBoundingClientRect().top < innerHeight * 0.4) active = id;
    $$('.top nav a').forEach(a => a.setAttribute('aria-current', a.hash === '#' + active ? 'location' : 'false'));
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest('input,textarea,select,button,[contenteditable="true"]')) return;
    // Keyboard jumps are repeated actions, so they land instantly instead of animating
    document.getElementById(sections[+e.key - 1])?.scrollIntoView({ behavior: 'instant' });
  });
  const revealRole = hash => {
    if (!['#finops-work', '#waya-work'].includes(hash)) return;
    const role = $(hash);
    let parent = role.parentElement;
    while (parent) { if (parent.tagName === 'DETAILS') parent.open = true; parent = parent.parentElement; }
    role.open = true;
  };
  $$('a[href="#finops-work"],a[href="#waya-work"]').forEach(link => link.addEventListener('click', () => revealRole(link.hash)));
  revealRole(location.hash);
  addEventListener('hashchange', () => revealRole(location.hash));
  const copy = $('[data-copy]');
  if (navigator.clipboard) {
    copy.hidden = false;
    copy.setAttribute('aria-live', 'polite');
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(copy.dataset.copy);
        copy.textContent = 'Copied';
        copy.classList.add('done');
        setTimeout(() => { copy.textContent = 'Copy'; copy.classList.remove('done'); }, 1800);
      } catch { copy.textContent = 'Use the email link'; }
    });
  }
})();
