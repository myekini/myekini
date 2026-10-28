(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const sections = ['work', 'projects', 'about', 'contact'];
  const clock = $('[data-clock]');
  const tick = () => { clock.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Lagos' }) + ' WAT'; };
  tick();
  setInterval(tick, 20000);
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
  $('.keys').hidden = false;
  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest('input,textarea,select,button,[contenteditable="true"]')) return;
    document.getElementById(sections[+e.key - 1])?.scrollIntoView({ behavior: motion.matches ? 'instant' : 'smooth' });
  });
  $$('a[href="#finops-work"],a[href="#waya-work"]').forEach(link => link.addEventListener('click', () => { $(link.hash).open = true; }));
  if (location.hash === '#finops-work' || location.hash === '#waya-work') $(location.hash).open = true;
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
  const pipeline = $('[data-pipeline]');
  if (!pipeline) return;
  const examples = {
    data: {
      name: 'reconciliation.pipeline',
      titles: ['Payment records', 'Bring together', 'Reconcile', 'Validate', 'Make usable'],
      bodies: [['Provider exports', 'Bank statements'], ['Batch loads', 'Streaming events'], ['Match records', 'Isolate exceptions'], ['Check totals', 'Review exceptions'], ['Warehouse', 'Dispute portal']],
      logs: ['Start with provider records and bank statements.', 'Bring records into a common pipeline.', 'Match records and separate exceptions for review.', 'Validate the result before it reaches reporting.', 'Checked records support reporting and dispute resolution.']
    },
    cost: {
      name: 'cloud-cost.pipeline',
      titles: ['Cloud billing', 'Bring together', 'Model costs', 'Validate', 'Make usable'],
      bodies: [['AWS cost exports', 'Account history'], ['Monthly reporting', 'Source reconciliation'], ['Amortization', 'Offset logic'], ['Check totals', 'Investigate anomalies'], ['Cost reporting', 'Commitment analysis']],
      logs: ['Start with AWS cost exports and account history.', 'Reconcile source exports with the reporting model.', 'Apply amortization and offsets to avoid double counting.', 'Investigate anomalies and validate the reported costs.', 'Traceable costs support reporting and commitment decisions.']
    }
  };
  const stages = $$('[data-stage]', pipeline);
  const pause = $('[data-flow-pause]', pipeline);
  const log = $('[data-flow-log]', pipeline);
  const progress = $('[data-flow-progress]', pipeline);
  let mode = 'data', step = -1, timer = 0, running = false, visible = false, started = false;
  $('[data-flow-controls]', pipeline).hidden = false;
  const stopTimer = () => { clearTimeout(timer); timer = 0; };
  const render = () => {
    stages.forEach((stage, i) => {
      stage.classList.toggle('is-active', i === step && running);
      stage.classList.toggle('is-complete', i <= step);
      $('[data-stage-state]', stage).textContent = i < step || step === 4 ? 'complete' : i === step ? 'processing' : 'waiting';
    });
    pipeline.classList.toggle('flow-running', running && visible && !document.hidden && !motion.matches);
    pause.disabled = step >= 4 || motion.matches || !started;
    pause.textContent = running ? 'Pause' : 'Resume';
    progress.textContent = step < 0 ? '5 connected stages' : `${step + 1} / 5 stages`;
    log.textContent = step < 0 ? 'Follow the records from source to checked output.' : examples[mode].logs[step];
  };
  const schedule = () => {
    stopTimer();
    if (!running || !visible || document.hidden || motion.matches) return;
    timer = setTimeout(() => {
      step++;
      if (step >= 4) { step = 4; running = false; }
      render(); schedule();
    }, 1450);
  };
  const play = () => { started = true; step = motion.matches ? 4 : 0; running = !motion.matches; render(); schedule(); };
  const setMode = next => {
    mode = next;
    const example = examples[mode];
    $('[data-flow-name]', pipeline).textContent = example.name;
    stages.forEach((stage, i) => {
      $('[data-stage-title]', stage).textContent = example.titles[i];
      $('[data-stage-body]', stage).replaceChildren(document.createTextNode(example.bodies[i][0]), document.createElement('br'), document.createTextNode(example.bodies[i][1]));
    });
    $$('[data-flow-mode]', pipeline).forEach(button => button.setAttribute('aria-pressed', String(button.dataset.flowMode === mode)));
    play();
  };
  $$('[data-flow-mode]', pipeline).forEach(button => button.addEventListener('click', () => setMode(button.dataset.flowMode)));
  $('[data-flow-replay]', pipeline).addEventListener('click', play);
  pause.addEventListener('click', () => { running = !running; render(); schedule(); });
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !started) play(); else { render(); schedule(); }
  }, { threshold: 0.15 }).observe(pipeline);
  document.addEventListener('visibilitychange', () => { render(); schedule(); });
  motion.addEventListener('change', () => { if (motion.matches) { stopTimer(); step = 4; running = false; render(); } });
  render();
})();
