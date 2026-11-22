import assert from 'node:assert/strict';
import { test } from 'node:test';
import { currentKg, meanKg, stillHeavy } from './bodyweight.ts';
import { addDays } from './util.ts';

const TODAY = '2026-11-23';

test('the weight is the average of the last days, not this morning', () => {
  const w = { [addDays(TODAY, -3)]: 130, [addDays(TODAY, -1)]: 128, [TODAY]: 132 };
  assert.equal(meanKg(w, TODAY), 130);
  // one heavy morning cannot move it far
  assert.ok(meanKg({ ...w, [TODAY]: 134 }, TODAY)! < 131.5);
});

test('an old weight is still better than none', () => {
  const w = { '2026-09-01': 136 };
  assert.equal(meanKg(w, TODAY), 136);
  assert.equal(meanKg({}, TODAY), null);
});

test('running comes back under the target, and an unknown weight stays on the machine', () => {
  assert.equal(stillHeavy(130, 125), true);
  assert.equal(stillHeavy(125, 125), false);
  assert.equal(stillHeavy(124.4, 125), false);
  assert.equal(stillHeavy(null, 125), true, 'not knowing is not a reason to start running');
  assert.equal(stillHeavy(130, 0), false, 'no target, no weight rule');
});

test('this app first, then NUTRIX', () => {
  assert.deepEqual(currentKg({ [TODAY]: 129 }, TODAY), { kg: 129, from: 'zenith' });
  // without localStorage (node) the NUTRIX read fails quietly rather than throwing
  assert.equal(currentKg({}, TODAY), null);
});
