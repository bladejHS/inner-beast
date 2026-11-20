import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planSnapshot } from './bridge.ts';

const base = { legMode: 'wall', thuFeet: 'rope', thuMain: 'bag', rowCh: 'a', rest3: 60, rest1: 60 } as const;
const week = (o: Record<string, unknown> = {}) => planSnapshot({ ...base, ...o } as never);

test('the Hybrid365 week: 3 runs, 3 upper lifts, 1 lower lift, 1 conditioning, Sunday for recovery', () => {
  const w = week();
  assert.equal(w.length, 7);
  assert.equal(w.flat().filter((s) => s.kind === 'workout').length, 6);
  assert.deepEqual(w[1]!.map((s) => s.kind), ['run', 'run', 'run']);
  assert.deepEqual([w[1]![1]!.name, w[1]![1]!.min], ['Threshold Run', 29]);
  assert.deepEqual([w[5]![0]!.name, w[5]![0]!.min], ['Long Run (Endurance)', 60]);
});

test('the easy runs can go on the rower, and Wednesday names the conditioning left out', () => {
  const run = week();
  assert.deepEqual(run[0]![0]!.alt, { other: 'Easy Row (Zone 2)' });
  const row = week({ aero: 'row' });
  assert.deepEqual([row[0]![0]!.name, row[0]![0]!.kind, row[0]![0]!.alt], ['Easy Row (Zone 2)', 'run', { other: 'Easy Run (Zone 2)' }]);
  assert.deepEqual(run[2]![1]!.alt, { other: 'Hybrid Circuit (10 Min AMRAP)', detail: '8 × 250 m' });
  const b = week({ wedCond: 'b' })[2]![1]!;
  assert.deepEqual([b.name, b.kind, b.min, b.alt], ['Hybrid Circuit (10 Min AMRAP)', 'amrap', 10, { other: 'Engine Builder (Ski/Row)' }]);
});
