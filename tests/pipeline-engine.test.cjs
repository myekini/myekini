const { test } = require('node:test');
const assert = require('node:assert/strict');
const { run, allocate } = require('../site/pipeline-engine.js');

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
  for (const [mode, faults] of [['data', ['clean', 'duplicate', 'missing']], ['cost', ['clean', 'double', 'owner']]]) {
    for (const fault of faults) {
      const r = run(mode, fault);
      assert.equal(r.published + r.review, r.input);
      assert.ok(r.checks.every(c => c.ok));
      assert.equal(r.traces.length, r.rows.length);
      assert.ok(r.traces.every(t => t.source.includes(t.file) && t.check));
    }
  }
});
test('largest remainder allocation preserves cents even on indivisible amounts', () => {
  assert.deepEqual(allocate(1, [1, 1, 1]), [1, 0, 0]);
  for (const cents of [0, 1, 2, 101, 4820001]) assert.equal(allocate(cents, [46, 28, 18, 8]).reduce((a, b) => a + b, 0), cents);
  assert.throws(() => allocate(100, [0, 0]), RangeError);
  assert.throws(() => allocate(1.5, [1]), RangeError);
});
