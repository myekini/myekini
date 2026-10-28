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
  return { run, allocate };
});
