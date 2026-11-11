import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SRI_EVENTS, SRI_MIN_AVG, sriMark, sriNeed, sriStatus } from '../data/sri.ts';
import { normalize } from './store.ts';

const [sprint, run, pull] = SRI_EVENTS as [typeof SRI_EVENTS[0], typeof SRI_EVENTS[1], typeof SRI_EVENTS[2]];

test('the SRI marks follow the published table', () => {
  assert.equal(sriMark(sprint, 6.8), 10);
  assert.equal(sriMark(sprint, 6.95), 8);
  assert.equal(sriMark(sprint, 7.7), 1);
  assert.equal(sriMark(sprint, 7.8), 0);
  assert.equal(sriMark(run, 200), 10);
  assert.equal(sriMark(run, 226), 4);
  assert.equal(sriMark(run, 300), 0);
  assert.equal(sriMark(pull, 14), 10);
  assert.equal(sriMark(pull, 20), 10);
  assert.equal(sriMark(pull, 9), 5);
  assert.equal(sriMark(pull, 4), 0);
  assert.equal(sriNeed(pull, 9), 13);
  assert.equal(sriNeed(run, 10), 200);
});

test('the status averages the latest result of each event and asks for 9.00 on all three', () => {
  const none = sriStatus({});
  assert.equal(none.avg, undefined);
  assert.equal(none.complete, false);
  const two = sriStatus({ pullups: [{ d: '2026-11-01', v: 8 }, { d: '2026-11-08', v: 13 }], sprint50: [{ d: '2026-11-08', v: 6.9 }] });
  assert.equal(two.avg, 9);
  assert.equal(two.complete, false);
  assert.equal(two.ready, false);
  const all = sriStatus({ pullups: [{ d: '2026-11-08', v: 13 }], sprint50: [{ d: '2026-11-08', v: 6.9 }], run1000: [{ d: '2026-11-08', v: 205 }] });
  assert.equal(all.avg, SRI_MIN_AVG);
  assert.equal(all.ready, true);
  assert.equal(all.rows[2]!.mark, 9);
});

test('the goal date survives a backup without one', () => {
  assert.deepEqual(normalize({ v: 1 }).goal, { date: '' });
  assert.equal(normalize({ v: 1, goal: { date: '2027-03-01' } }).goal.date, '2027-03-01');
});
