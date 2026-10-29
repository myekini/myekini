/* The architecture is an illustration; scenario outcomes come from pipeline-engine.js. */
(() => {
  const host = document.querySelector('[data-pipeline]');
  const engine = window.PipelineExample;
  if (!host || !engine) return;
  const $ = s => host.querySelector(s);
  const $$ = s => [...host.querySelectorAll(s)];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const svgNS = 'http://www.w3.org/2000/svg';
  const duration = 5600, beat = duration / 5;
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
    },
    ai: {
      name: 'Data pipeline + variance explainer',
      nodes: {
        'source-a': ['Daily metrics', 'Synthetic cost records', 'daily-costs.csv'],
        'source-b': ['Evidence rules', 'Allowed source references', 'fact-schema.json'],
        ingest: ['Compute changes', 'Facts before language', 'Python / SQL pattern'],
        model: ['Draft explanation', 'Simulated LLM response', 'fixture, not a live model'],
        check: ['Check draft', 'Amounts + source IDs', 'numeric + source checks'],
        output: ['Checked draft', 'Ready for human approval', 'no automatic write-back'],
        review: ['Human review', 'Hold unsupported claims', 'no silent repair']
      },
      scenarios: [['clean', 'Grounded response'], ['wrong-number', 'Wrong amount'], ['missing-source', 'Unknown source']],
      packets: ['CSV', 'JSON', 'FACTS', 'DRAFT'],
      messages: ['Load sample metrics and a source-reference contract.', 'Compute changes in code; keep the evidence separate from the explanation.', 'Create a simulated model response using the computed facts.', 'Compare each currency amount and source ID with the evidence.', 'Keep checked drafts for human approval; hold unsupported claims.']
    }
  };
  const connections = [['source-a', 'ingest'], ['source-b', 'ingest'], ['ingest', 'model'], ['model', 'check'], ['check', 'output'], ['check', 'review']];
  const nodes = Object.fromEntries($$('[data-node]').map(node => [node.dataset.node, node]));
  const defaultModelIcon = nodes.model.querySelector('svg').innerHTML;
  const edges = [], packets = [];
  let mode = 'data', fault = 'clean', result = engine.run(), elapsed = 0, phase = -1;
  let playing = false, inView = false, started = false, raf = 0, lastNow = null, lastPaint = 0, announcement = false;
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
      const segment = edge < 2 ? 0 : Math.min(edge - 1, 3);
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
      node.classList.toggle('node-held', (isReview || id === 'check') && result.held.length > 0 && phase === 4);
      const status = node.querySelector('[data-node-status]');
      status.textContent = !started ? '' : phase < index ? 'Waiting' : phase === index && !finished ? (playing ? 'Processing' : 'Paused') : 'Complete';
      if (index === 4 && phase === 4) status.textContent = isReview ? (result.held.length ? `${result.held.length} held` : 'No exceptions') : `${result.accepted.length} published`;
      if (id === 'check' && phase === 4 && result.held.length) status.textContent = `${result.held.length} flagged`;
      if (mode === 'ai' && id === 'output' && phase === 4) status.textContent = `${result.accepted.length} checked`;
      if (mode === 'ai' && isReview && phase === 4 && !result.held.length) status.textContent = 'Approval required';
    });
    edges.forEach((edge, i) => {
      const segment = i < 2 ? 0 : Math.min(i - 1, 3);
      edge.path.classList.toggle('edge-passed', started && phase > segment && !(i === 5 && !result.held.length));
      edge.path.classList.toggle('edge-held', i === 5 && phase === 4 && result.held.length > 0);
    });
    $('[data-flow-log]').textContent = modes[mode].messages[phase];
    $('[data-flow-progress]').textContent = finished ? 'Run complete' : !playing && started ? 'Paused' : `Step ${phase + 1} of 5`;
    // One status bar: the step message while it plays, the result once it finishes
    $('[data-flow-status]').hidden = finished;
    $('[data-demo-result]').hidden = !finished;
    $('[data-flow-pause]').disabled = !started || finished || motion.matches;
    $('[data-flow-pause]').hidden = !started || finished || motion.matches;
    $('[data-flow-pause]').textContent = playing ? 'Pause' : 'Resume';
  }
  function renderOutcome() {
    const ai = mode === 'ai';
    $('[data-result-title]').textContent = ai
      ? `${result.accepted.length} explanations checked. ${result.held.length ? `${result.held.length} held for review.` : 'Ready for human approval.'}`
      : `${result.accepted.length} records cleared. ${result.held.length ? `${result.held.length} held for review.` : 'No exceptions.'}`;
    $('[data-result-description]').textContent = result.held.length ? result.held[0].reason : '';
    $('[data-result-description]').hidden = !result.held.length;
    $('[data-published-label]').textContent = ai ? 'Checked drafts' : 'Sent to reporting';
    $('[data-held-label]').textContent = ai ? 'Flagged drafts' : 'Held for review';
    $('[data-published]').textContent = ai ? `${result.accepted.length} / ${result.rows.length}` : money(result.published);
    $('[data-held]').textContent = ai ? String(result.held.length) : money(result.review);
    $('[data-demo-result]').classList.toggle('has-exceptions', result.held.length > 0);
    if (announcement) $('[data-flow-announcement]').textContent = $('[data-result-title]').textContent;
  }
  function tick(now) {
    raf = 0;
    if (!playing || !inView || document.hidden || motion.matches) { lastNow = null; return; }
    if (now - lastPaint < 32) { raf = requestAnimationFrame(tick); return; }
    lastPaint = now;
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
    const outcome = mode === 'ai' ? (trace.route === 'review' ? 'Flagged draft held for human review. No data changed.' : 'Checked draft ready for human approval. No data changed.') : trace.route === 'review' ? 'Held for human review. Not included in published reporting.' : 'Included in the published output, with its source reference.';
    const entries = [['Source', `${trace.source} · ${money(trace.cents)}`], ['Compute', trace.normalization], [mode === 'ai' ? 'Draft' : 'Process', trace.model], ['Check', trace.check], ['Output', outcome]];
    if (mode === 'ai') entries.splice(2, 0, ['Prompt', trace.prompt]);
    entries.forEach(([label, value]) => { const li = document.createElement('li'); const b = document.createElement('b'); b.textContent = label; const p = document.createElement('p'); p.textContent = value; li.append(b, p); list.append(li); });
  }
  function inspect() {
    const select = $('[data-trace-select]'); select.replaceChildren();
    result.traces.forEach((trace, i) => { const option = new Option(`${trace.id} · row ${trace.line}${trace.route === 'review' ? ' · held' : ''}`, i); select.add(option); });
    traceRecord();
    const list = $('[data-check-list]'); list.replaceChildren();
    result.checks.forEach(check => { const li = document.createElement('li'); li.textContent = `${check.ok ? 'PASS' : 'FAIL'} · ${check.label}`; li.classList.toggle('check-failed', !check.ok); list.append(li); });
    $('[data-demo-disclosure]').textContent = {
      data: 'The PDF is only a picture; statement rows are synthetic extracted data.',
      cost: 'Shared costs are split by usage, and leftover cents go to the largest shares so the total stays exact.',
      ai: 'Model replies are fixed examples, not live AI. Code checks amounts and source IDs, not the meaning of the text, and drafts still need human approval.'
    }[mode];
  }
  function play(manual = true) {
    announcement = manual;
    $('[data-flow-announcement]').textContent = '';
    result = engine.run(mode, fault); inspect(); renderOutcome();
    started = true; elapsed = motion.matches ? duration : 0; playing = !motion.matches; phase = -1;
    renderPhase(true); drawPackets(); sync();
  }
  function setMode(next) {
    mode = next; fault = 'clean';
    host.classList.toggle('flow-ai', mode === 'ai');
    nodes.model.querySelector('svg').innerHTML = mode === 'ai' ? '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4M9 10h6m-6 4h4"/>' : defaultModelIcon;
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
  inspect(); renderOutcome(); drawWires();
})();
