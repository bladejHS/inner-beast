import assert from 'node:assert/strict';
import { test } from 'node:test';
import { KEY_BLOCKS, LOOP_WEEKS, loopEnding, loopIndex, loopRange, reviewLoop } from './loop.ts';
import type { Entry } from './store.ts';
import { addDays } from './util.ts';

const START = '2026-01-05'; // a Monday

const entry = (date: string, block: string, over: Partial<Entry> = {}): Entry => ({
  id: `${date}-${block}`, ts: Date.parse(`${date}T18:00:00Z`), date, kind: 'workout', block, name: block, dur: 50, data: {}, ...over,
});

/** A full week of key sessions on the Monday given. */
function week(mon: string): Entry[] {
  return KEY_BLOCKS.map((b, i) => entry(addDays(mon, Math.min(6, i)), b));
}

test('a loop is twelve weeks and the index counts from one', () => {
  assert.equal(LOOP_WEEKS, 12);
  assert.equal(loopIndex(START, START), 1);
  assert.equal(loopIndex(START, addDays(START, 11 * 7)), 1);
  assert.equal(loopIndex(START, addDays(START, 12 * 7)), 2);
  assert.equal(loopIndex(START, '2025-12-01'), 0, 'nothing before the start');
  assert.equal(loopIndex('', '2026-03-01'), 0);
});

test('the range of a loop, and a repeated week pushing it out', () => {
  assert.deepEqual(loopRange(START, 1), { from: START, to: addDays(START, 84) });
  assert.deepEqual(loopRange(START, 2), { from: addDays(START, 84), to: addDays(START, 168) });
  const rep = [addDays(START, 14)];
  assert.deepEqual(loopRange(START, 1, rep), { from: START, to: addDays(START, 91) }, 'one repeat, one week later');
});

test('the review counts what was done against what the weeks asked for', () => {
  const log = [...week(START), ...week(addDays(START, 7))];
  const r = reviewLoop(log, START, addDays(START, 13))!;
  assert.equal(r.loop, 1);
  assert.equal(r.weeksDone, 2);
  assert.equal(r.planned, 2 * KEY_BLOCKS.length);
  assert.equal(r.done, 2 * KEY_BLOCKS.length);
  assert.equal(r.rate, 1);
  assert.equal(r.blankWeeks, 0);
  assert.equal(r.finished, false);
});

test('a week with nothing logged is counted as blank', () => {
  const log = [...week(START), ...week(addDays(START, 14))];
  const r = reviewLoop(log, START, addDays(START, 20))!;
  assert.equal(r.weeksDone, 3);
  assert.equal(r.blankWeeks, 1);
  assert.ok(r.rate < 0.7);
});

test('the long run and the easy run report their best minutes', () => {
  const log = [
    entry(addDays(START, 5), 'sat-long', { kind: 'run', data: { minutes: 60 } }),
    entry(addDays(START, 12), 'sat-long', { kind: 'run', data: { minutes: 75 } }),
    entry(addDays(START, 7), 'mon-run', { kind: 'run', data: { minutes: 35 } }),
  ];
  const r = reviewLoop(log, START, addDays(START, 13))!;
  assert.equal(r.longBest, 75);
  assert.equal(r.easyBest, 35);
});

test('sessions outside the loop do not count', () => {
  const log = [...week(addDays(START, 84))]; // the first week of loop 2
  const r = reviewLoop(log, START, addDays(START, 90), 1)!;
  assert.equal(r.done, 0);
  assert.equal(r.finished, true);
  const r2 = reviewLoop(log, START, addDays(START, 90), 2)!;
  assert.equal(r2.done, KEY_BLOCKS.length);
});

test('the last week of the loop is when the next one is offered', () => {
  assert.equal(loopEnding(START, addDays(START, 10 * 7)), false);
  assert.equal(loopEnding(START, addDays(START, 11 * 7)), true);
  assert.equal(loopEnding(START, addDays(START, 23 * 7)), true, 'and again at the end of loop 2');
});
