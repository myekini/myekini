/* Small, deterministic synthetic examples. This is not a production reconciler. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PipelineExample = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const sum = rows => rows.reduce((total, row) => total + row.cents, 0);
  function allocate(cents, weights) {
    if (!Number.isSafeInteger(cents) || cents < 0 || !weights.length || weights.some(w => !Number.isFinite(w) || w < 0) || !weights.some(w => w > 0)) throw new RangeError('Use integer cents and at least one positive weight.');
    const total = weights.reduce((a, b) => a + b, 0);
    const raw = weights.map(w => cents * w / total);
    const parts = raw.map(Math.floor);
    let remaining = cents - parts.reduce((a, b) => a + b, 0);
    raw.map((value, i) => ({ i, fraction: value - parts[i] })).sort((a, b) => b.fraction - a.fraction || a.i - b.i).forEach(({ i }) => { if (remaining > 0) { parts[i]++; remaining--; } });
    return parts;
  }
  function run(mode = 'data', fault = 'clean') {
    if (mode === 'ai') return explain(fault);
    if (!['data', 'cost'].includes(mode)) throw new RangeError('Unknown example.');
    const allowed = mode === 'data' ? ['clean', 'duplicate', 'missing'] : ['clean', 'double', 'owner'];
    if (!allowed.includes(fault)) throw new RangeError('Unknown scenario for this example.');
    const data = mode === 'data';
    const rows = data ? [
      { id: 'TX-101', cents: 125000, file: 'payments.json', line: 1 },
      { id: 'TX-102', cents: 75000, file: 'payments.json', line: 2 },
      { id: 'TX-103', cents: 50000, file: 'payments.json', line: 3 }
    ] : [
      { id: 'BILL-101', cents: 120000, team: 'platform', file: 'billing.csv', line: 1 },
      { id: 'BILL-102', cents: 80000, team: fault === 'owner' ? null : 'data', file: 'billing.csv', line: 2 },
      { id: 'BILL-103', cents: 50000, team: 'shared', file: 'billing.csv', line: 3 }
    ];
    if (fault === 'duplicate' || fault === 'double') rows.push({ ...rows[0], line: 4 });
    // Statement rows are supplied as synthetic extracted data. No PDF is parsed.
    const statement = [{ id: 'TX-101', cents: 125000 }, { id: 'TX-102', cents: 75000 }, { id: 'TX-103', cents: 50000 }].filter(row => fault !== 'missing' || row.id !== 'TX-103');
    const seen = new Set(), accepted = [], held = [];
    const traces = rows.map(row => {
      let reason = '';
      if (seen.has(row.id)) reason = 'Duplicate ID: extra record held to prevent double counting.';
      else if (data && !statement.some(bank => bank.id === row.id && bank.cents === row.cents)) reason = 'No statement match: hold for human review.';
      else if (!data && !row.team) reason = 'Missing team owner: hold rather than guess an allocation.';
      const duplicate = seen.has(row.id);
      seen.add(row.id);
      const result = { ...row, reason, duplicate, route: reason ? 'review' : 'report' };
      (reason ? held : accepted).push(result);
      let allocation = '';
      if (!data && row.team === 'shared' && !reason) {
        const parts = allocate(row.cents, [60, 40]);
        allocation = `Shared charge split 60/40: platform ${parts[0]} cents, data ${parts[1]} cents. Total unchanged.`;
      }
      return { ...result, source: `${row.file}, row ${row.line}`, normalization: 'Amount represented in integer minor units; ID retained.', model: data ? 'Match payment ID and amount against extracted statement rows.' : allocation || (row.team ? `Direct cost assigned to ${row.team}.` : 'No owner available.'), check: reason || (data ? 'Payment ID and amount match the statement.' : 'Unique charge ID, known owner and preserved total.') };
    });
    const published = sum(accepted), review = sum(held);
    const checks = [
      { label: 'Every input has an output or review entry', ok: accepted.length + held.length === rows.length },
      { label: 'Published + held equals the input total', ok: published + review === sum(rows) },
      { label: 'No duplicate IDs in the published output', ok: new Set(accepted.map(row => row.id)).size === accepted.length }
    ];
    if (!data) checks.push({ label: 'Shared-cost rounding preserves every cent', ok: allocate(50000, [60, 40]).reduce((a, b) => a + b, 0) === 50000 });
    return { mode, fault, currency: data ? 'NGN' : 'USD', rows, statement: data ? statement : null, accepted, held, traces, published, review, input: sum(rows), checks };
  }
  function validateDraft(draft, fact) {
    if (!draft || typeof draft.text !== 'string' || typeof draft.sourceId !== 'string') return 'Invalid response shape: hold for review.';
    if (draft.sourceId !== fact.id) return 'Unknown source reference: hold the explanation for review.';
    const amounts = [...draft.text.matchAll(/\$([\d,]+\.\d{2})/g)].map(match => Math.round(Number(match[1].replaceAll(',', '')) * 100));
    const expected = [fact.previous, fact.current, Math.abs(fact.current - fact.previous)];
    if (amounts.length !== expected.length || amounts.some((amount, i) => amount !== expected[i])) return 'A stated amount disagrees with the computed facts: hold for review.';
    return '';
  }
  function explain(fault = 'clean') {
    if (!['clean', 'wrong-number', 'missing-source'].includes(fault)) throw new RangeError('Unknown AI example scenario.');
    const facts = [
      { id: 'FACT-101', team: 'Platform', previous: 100000, current: 125000 },
      { id: 'FACT-102', team: 'Data', previous: 75000, current: 65000 },
      { id: 'FACT-103', team: 'Payments', previous: 50000, current: 55000 }
    ];
    const dollars = cents => '$' + (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    // Canned model fixtures exercise the validation boundary. No LLM API is called.
    const traces = facts.map((fact, i) => {
      const delta = fact.current - fact.previous;
      const statedCurrent = fault === 'wrong-number' && i === 0 ? fact.current + 5000 : fact.current;
      const draft = { sourceId: fault === 'missing-source' && i === 0 ? 'FACT-999' : fact.id, text: `${fact.team} changed from ${dollars(fact.previous)} to ${dollars(statedCurrent)}, ${delta < 0 ? 'down' : 'up'} ${dollars(Math.abs(delta))}.` };
      const reason = validateDraft(draft, fact);
      return { id: fact.id, cents: fact.current, file: 'daily-costs.csv', line: i + 1, source: `daily-costs.csv, row ${i + 1}`, route: reason ? 'review' : 'report', reason, duplicate: false, normalization: `Computed: previous ${dollars(fact.previous)}, current ${dollars(fact.current)}, change ${dollars(Math.abs(delta))} ${delta < 0 ? 'down' : 'up'}.`, prompt: 'Illustrative contract: explain only the supplied amounts and cite the provided fact ID. Do not infer causes or propose changes to data.', model: `Simulated response: “${draft.text}” Source: ${draft.sourceId}.`, check: reason || 'All three currency amounts and the source ID agree with the computed fact.', fact, draft };
    });
    const accepted = traces.filter(row => row.route === 'report'), held = traces.filter(row => row.route === 'review');
    const checks = [
      { label: 'Every explanation is checked or held', ok: accepted.length + held.length === traces.length },
      { label: 'Checked drafts cite known source IDs', ok: accepted.every(row => row.draft.sourceId === row.fact.id) },
      { label: 'Every displayed currency amount matches its fact', ok: accepted.every(row => !validateDraft(row.draft, row.fact)) },
      { label: 'Input facts remain unchanged; no model write-back', ok: facts.every((fact, i) => fact.current === [125000, 65000, 55000][i]) }
    ];
    return { mode: 'ai', fault, currency: 'USD', rows: traces, traces, accepted, held, published: sum(accepted), review: sum(held), input: sum(traces), checks, simulated: true, facts, approvalRequired: true };
  }
  return { run, allocate, validateDraft };
});
