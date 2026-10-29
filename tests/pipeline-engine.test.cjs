const { test } = require('node:test');
const assert = require('node:assert/strict');
const { run, allocate, validateDraft } = require('../site/pipeline-engine.js');

test('clean reconciliation publishes all three matching payments', () => {
  const r = run('data');
  assert.equal(r.accepted.length, 3);
  assert.equal(r.published, 250000);
  assert.equal(r.held.length, 0);
});
test('duplicate payment is held and cannot inflate reporting', () => {
  const r = run('data', 'duplicate');
  assert.equal(r.accepted.length, 3);
  assert.equal(r.held.length, 1);
  assert.equal(r.published, run('data').published);
  assert.match(r.held[0].reason, /Duplicate/);
});
test('missing settlement is not silently marked as matched', () => {
  const r = run('data', 'missing');
  assert.equal(r.published, 200000);
  assert.equal(r.held[0].id, 'TX-103');
  assert.equal(r.review, 50000);
});
test('a repeated cloud charge cannot inflate published cost', () => {
  const r = run('cost', 'double');
  assert.equal(r.published, 250000);
  assert.equal(r.review, 120000);
  assert.equal(r.held[0].duplicate, true);
});
test('unowned cost stays in review rather than getting a guessed team', () => {
  const r = run('cost', 'owner');
  assert.equal(r.published, 170000);
  assert.equal(r.held[0].id, 'BILL-102');
  assert.match(r.held[0].reason, /Missing team owner/);
});
test('all scenarios conserve the input across output and review with traceable sources', () => {
  for (const [mode, faults] of [['data', ['clean', 'duplicate', 'missing']], ['cost', ['clean', 'double', 'owner']], ['ai', ['clean', 'wrong-number', 'missing-source']]]) {
    for (const fault of faults) {
      const r = run(mode, fault);
      assert.equal(r.published + r.review, r.input);
      assert.ok(r.checks.every(c => c.ok));
      assert.equal(r.traces.length, r.rows.length);
      assert.ok(r.traces.every(t => t.source.includes(t.file) && t.check));
    }
  }
});
test('AI example checks grounded fixture responses and requires human approval', () => {
  const r = run('ai');
  assert.equal(r.simulated, true);
  assert.equal(r.approvalRequired, true);
  assert.equal(r.accepted.length, 3);
  assert.equal(r.held.length, 0);
  assert.ok(r.checks.every(check => check.ok));
});
test('AI wrong-amount fixture is held without modifying the computed fact', () => {
  const r = run('ai', 'wrong-number');
  assert.equal(r.accepted.length, 2);
  assert.equal(r.held.length, 1);
  assert.equal(r.held[0].id, 'FACT-101');
  assert.equal(r.facts[0].current, 125000);
  assert.match(r.held[0].draft.text, /1,300\.00/);
  assert.match(r.held[0].reason, /amount disagrees/);
});
test('AI unknown source cannot be passed as grounded evidence', () => {
  const r = run('ai', 'missing-source');
  assert.equal(r.held.length, 1);
  assert.equal(r.held[0].draft.sourceId, 'FACT-999');
  assert.match(r.held[0].reason, /Unknown source/);
});
test('draft boundary checks all currency amounts and rejects malformed responses', () => {
  const fact = { id: 'F', previous: 100, current: 125 };
  const text = 'Changed from $1.00 to $1.25, up $0.25.';
  assert.equal(validateDraft({ text, sourceId: 'F' }, fact), '');
  for (const amount of ['$1.00', '$1.25', '$0.25']) assert.match(validateDraft({ text: text.replace(amount, '$9.99'), sourceId: 'F' }, fact), /disagrees/);
  assert.match(validateDraft({ text: text + ' Extra $9.99.', sourceId: 'F' }, fact), /disagrees/);
  assert.match(validateDraft({ text }, fact), /Invalid response shape/);
  assert.match(validateDraft(null, fact), /Invalid response shape/);
});
test('largest remainder allocation preserves cents even on indivisible amounts', () => {
  assert.deepEqual(allocate(1, [1, 1, 1]), [1, 0, 0]);
  for (const cents of [0, 1, 2, 101, 4820001]) assert.equal(allocate(cents, [46, 28, 18, 8]).reduce((a, b) => a + b, 0), cents);
  assert.throws(() => allocate(100, [0, 0]), RangeError);
  assert.throws(() => allocate(1.5, [1]), RangeError);
});
