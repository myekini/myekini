/* The architecture is an illustration; scenario outcomes come from pipeline-engine.js. */
(() => {
  const host = document.querySelector('[data-pipeline]');
  const engine = window.PipelineExample;
  if (!host || !engine) return;
  const $ = s => host.querySelector(s);
  const $$ = s => [...host.querySelectorAll(s)];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const svgNS = 'http://www.w3.org/2000/svg';
  const duration = 7000, beat = duration / 5;
  const modes = {
    data: {
      name: 'Payment reconciliation',
      nodes: {
        'source-a': ['Transactions', 'Payment events', 'payments.json'],
        'source-b': ['Bank statement', 'Settlement records', 'statement.pdf'],
        ingest: ['Read & normalize', 'Keep source references', 'structured rows'],
        model: ['Match payments', 'Compare IDs + amounts', 'matching rules'],
        check: ['Validate', 'Check before publishing', 'totals + duplicates'],
        output: ['Reporting', 'Matched records only', 'checked output'],
        review: ['Human review', 'Hold the exceptions', 'nothing silently fixed']
      },
      scenarios: [['clean', 'Clean run'], ['duplicate', 'Duplicate payment'], ['missing', 'Missing settlement']],
      packets: ['JSON', 'PDF', 'ROWS', 'TX-101'],
      messages: ['Transactions and statement records enter separately.', 'Read the sample rows and keep their source references.', 'Match payment IDs and amounts to statement records.', 'Check for duplicates, missing matches and balanced totals.', 'Publish matched records. Hold exceptions for human review.']
    },
    cost: {
      name: 'Cloud cost allocation',
      nodes: {
        'source-a': ['Cloud billing', 'AWS-shaped cost rows', 'billing.csv'],
        'source-b': ['Team rules', 'Owners + usage weights', 'allocation.json'],
        ingest: ['Read & normalize', 'Keep charge references', 'integer cents'],
        model: ['Allocate costs', 'Direct + shared charges', '60 / 40 usage weights'],
        check: ['Validate', 'Check before publishing', 'owners + totals'],
        output: ['Cost analysis', 'Traceable team costs', 'checked output'],
        review: ['Human review', 'Hold unknown owners', 'nothing silently guessed']
      },
      scenarios: [['clean', 'Clean run'], ['double', 'Double-counted charge'], ['owner', 'Missing team owner']],
      packets: ['CSV', 'JSON', 'CENTS', 'BILL-101'],
      messages: ['Billing rows and team-allocation rules enter separately.', 'Read charges as integer cents and retain source references.', 'Assign direct costs; split shared costs without losing a cent.', 'Check unique charges, known owners and preserved totals.', 'Publish traceable costs. Hold exceptions for human review.']
    }
  };
  const connections = [['source-a', 'ingest'], ['source-b', 'ingest'], ['ingest', 'model'], ['model', 'check'], ['check', 'output'], ['check', 'review']];
  const nodes = Object.fromEntries($$('[data-node]').map(node => [node.dataset.node, node]));
  const edges = [], packets = [];
  let mode = 'data', fault = 'clean', result = engine.run(), elapsed = 0, phase = -1;
  let playing = false, inView = false, started = false, raf = 0, lastNow = null, announcement = false;
  const money = cents => new Intl.NumberFormat('en-US', { style: 'currency', currency: result.currency, currencyDisplay: 'narrowSymbol', minimumFractionDigits: 2 }).format(cents / 100);
  const createSVG = (tag, attrs) => { const el = document.createElementNS(svgNS, tag); Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value)); return el; };
  connections.forEach(([from, to], i) => {
    const path = createSVG('path', { class: 'arch-edge', 'marker-end': 'url(#wire-arrow)', fill: 'none' });
    $('[data-edges]').append(path);
    edges.push({ from, to, path, length: 0 });
    const group = createSVG('g', { class: 'data-packet', visibility: 'hidden' });
    group.append(createSVG('path', { d: 'M-22-13H12L22-3V13H-22Z', class: 'packet-paper' }), createSVG('path', { d: 'M12-13V-3H22', class: 'packet-fold' }));
    const text = createSVG('text', { x: 0, y: 4, 'text-anchor': 'middle' });
    group.append(text);
    $('[data-packets]').append(group);
    packets.push({ group, text, edge: i, offset: 0 });
  });
  // A second transaction makes the input read as a stream, not a single slide.
  const extra = packets[0].group.cloneNode(true);
  $('[data-packets]').append(extra);
  packets.push({ group: extra, text: extra.querySelector('text'), edge: 0, offset: 0.28 });

  function drawWires() {
    const box = $('[data-diagram]').getBoundingClientRect();
    $('[data-wires]').setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    const vertical = matchMedia('(max-width: 760px)').matches;
    edges.forEach(edge => {
      const a = nodes[edge.from].getBoundingClientRect(), b = nodes[edge.to].getBoundingClientRect();
      let x1, y1, x2, y2, d;
      if (vertical) {
        x1 = a.left - box.left + a.width / 2; y1 = a.bottom - box.top;
        x2 = b.left - box.left + b.width / 2; y2 = b.top - box.top;
        const mid = (y1 + y2) / 2;
        d = `M${x1},${y1} C${x1},${mid} ${x2},${mid} ${x2},${y2}`;
      } else {
        x1 = a.right - box.left; y1 = a.top - box.top + a.height / 2;
        x2 = b.left - box.left; y2 = b.top - box.top + b.height / 2;
        const mid = (x1 + x2) / 2;
        d = `M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`;
      }
      edge.path.setAttribute('d', d);
      edge.length = edge.path.getTotalLength();
    });
    drawPackets();
  }
  function drawPackets() {
    packets.forEach(packet => {
      const { edge, offset, group, text } = packet;
      const segment = edge < 2 ? 0 : edge - 1;
      const t = (elapsed - segment * beat) / beat - offset;
      const disabled = edge === 5 && !result.held.length;
      const show = !motion.matches && started && elapsed < duration && t >= 0 && t <= 1 && !disabled;
      group.setAttribute('visibility', show ? 'visible' : 'hidden');
      if (!show) return;
      const p = edges[edge].path.getPointAtLength(edges[edge].length * t);
      group.setAttribute('transform', `translate(${p.x},${p.y})`);
      group.classList.toggle('packet-review', edge === 5);
      text.textContent = edge === 4 ? 'PASS' : edge === 5 ? 'HOLD' : modes[mode].packets[Math.min(edge, 3)];
    });
  }
  function renderPhase(force = false) {
    const next = Math.min(4, Math.floor(elapsed / beat));
    const finished = elapsed >= duration;
    if (!force && next === phase && !finished) return;
    phase = next;
    const nodePhases = { 'source-a': 0, 'source-b': 0, ingest: 1, model: 2, check: 3, output: 4, review: 4 };
    Object.entries(nodes).forEach(([id, node]) => {
      const index = nodePhases[id], isReview = id === 'review';
      node.classList.toggle('node-active', started && phase === index && !finished && playing);
      node.classList.toggle('node-complete', started && (phase > index || finished));
      node.classList.toggle('node-held', isReview && result.held.length > 0 && phase === 4);
      const status = node.querySelector('[data-node-status]');
      status.textContent = !started ? '' : phase < index ? 'Waiting' : phase === index && !finished ? (playing ? 'Processing' : 'Paused') : 'Complete';
      if (index === 4 && phase === 4) status.textContent = isReview ? (result.held.length ? `${result.held.length} held` : 'No exceptions') : `${result.accepted.length} published`;
    });
    edges.forEach((edge, i) => {
      const segment = i < 2 ? 0 : i - 1;
      edge.path.classList.toggle('edge-passed', started && phase > segment && !(i === 5 && !result.held.length));
      edge.path.classList.toggle('edge-held', i === 5 && phase === 4 && result.held.length > 0);
    });
    $('[data-flow-log]').textContent = modes[mode].messages[phase];
    $('[data-flow-progress]').textContent = finished ? 'Run complete' : !playing && started ? 'Paused' : `Step ${phase + 1} of 5`;
    $('[data-flow-pause]').disabled = !started || finished || motion.matches;
    $('[data-flow-pause]').hidden = !started || finished || motion.matches;
    $('[data-flow-pause]').textContent = playing ? 'Pause' : 'Resume';
    $('[data-demo-result]').hidden = !finished;
    if (finished) {
      $('[data-result-title]').textContent = `${result.accepted.length} records published. ${result.held.length ? `${result.held.length} held for review.` : 'No exceptions.'}`;
      $('[data-result-description]').textContent = result.held.length ? result.held[0].reason : 'All sample records passed. Every input is accounted for.';
      $('[data-published]').textContent = money(result.published);
      $('[data-held]').textContent = money(result.review);
      $('[data-demo-result]').classList.toggle('has-exceptions', result.held.length > 0);
      if (announcement) $('[data-flow-announcement]').textContent = $('[data-result-title]').textContent;
    }
  }
  function tick(now) {
    raf = 0;
    if (!playing || !inView || document.hidden || motion.matches) { lastNow = null; return; }
    if (lastNow !== null) elapsed = Math.min(duration, elapsed + now - lastNow);
    lastNow = now;
    if (elapsed >= duration) playing = false;
    renderPhase(); drawPackets();
    if (playing) raf = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(raf); raf = 0; lastNow = null;
    if (playing && inView && !document.hidden && !motion.matches) raf = requestAnimationFrame(tick);
  }
  function traceRecord() {
    const trace = result.traces[+$('[data-trace-select]').value || 0];
    const list = $('[data-record-trace]'); list.replaceChildren();
    const entries = [['Source', `${trace.source} · ${money(trace.cents)}`], ['Read', trace.normalization], ['Process', trace.model], ['Check', trace.check], ['Output', trace.route === 'review' ? 'Held for human review. Not included in published reporting.' : 'Included in the published output, with its source reference.']];
    entries.forEach(([label, value]) => { const li = document.createElement('li'); const b = document.createElement('b'); b.textContent = label; const p = document.createElement('p'); p.textContent = value; li.append(b, p); list.append(li); });
  }
  function inspect() {
    const select = $('[data-trace-select]'); select.replaceChildren();
    result.traces.forEach((trace, i) => { const option = new Option(`${trace.id} · row ${trace.line}${trace.route === 'review' ? ' · held' : ''}`, i); select.add(option); });
    traceRecord();
    const list = $('[data-check-list]'); list.replaceChildren();
    result.checks.forEach(check => { const li = document.createElement('li'); li.textContent = `${check.ok ? 'PASS' : 'FAIL'} · ${check.label}`; li.classList.toggle('check-failed', !check.ok); list.append(li); });
  }
  function play(manual = true) {
    announcement = manual;
    $('[data-flow-announcement]').textContent = '';
    result = engine.run(mode, fault); inspect();
    started = true; elapsed = motion.matches ? duration : 0; playing = !motion.matches; phase = -1;
    renderPhase(true); drawPackets(); sync();
  }
  function setMode(next) {
    mode = next; fault = 'clean';
    const example = modes[mode];
    $('[data-flow-name]').textContent = example.name;
    Object.entries(example.nodes).forEach(([id, values]) => {
      ['title', 'detail', 'meta'].forEach((key, i) => nodes[id].querySelector(`[data-node-${key}]`).textContent = values[i]);
    });
    const select = $('[data-flow-scenario]'); select.replaceChildren();
    example.scenarios.forEach(([value, label]) => select.add(new Option(label, value)));
    $$('[data-flow-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.flowMode === mode)));
    play(); drawWires();
  }
  $('[data-flow-controls]').hidden = false;
  $('[data-playback]').hidden = false;
  $('[data-inspector]').hidden = false;
  $$('[data-flow-mode]').forEach(button => button.addEventListener('click', () => setMode(button.dataset.flowMode)));
  $('[data-flow-scenario]').addEventListener('change', e => { fault = e.target.value; play(); });
  $('[data-flow-replay]').addEventListener('click', () => play());
  $('[data-flow-pause]').addEventListener('click', () => { playing = !playing; renderPhase(true); sync(); });
  $('[data-trace-select]').addEventListener('change', traceRecord);
  new ResizeObserver(drawWires).observe($('[data-diagram]'));
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; if (inView && !started) play(false); else sync(); }, { threshold: 0.08 }).observe($('[data-diagram]'));
  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', () => {
    if (motion.matches && started) { elapsed = duration; playing = false; renderPhase(true); drawPackets(); }
    sync();
  });
  inspect(); drawWires();
})();
