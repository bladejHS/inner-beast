import assert from 'node:assert/strict';
import { test } from 'node:test';
import { THR_STEPS } from '../data/plan.ts';
import type { LoopReview } from './loop.ts';
import { lossPerWeek, nextLong, nextLoopPlan, RULES } from './nextblock.ts';
import { addDays } from './util.ts';

const START = '2026-01-05';

const review = (over: Partial<LoopReview> = {}): LoopReview => ({
  loop: 1, from: START, to: addDays(START, 84), weeksDone: 12,
  done: 97, planned: 108, rate: 0.9, blankWeeks: 0,
  thrSessions: 6, longBest: 90, easyBest: 45, records: [], stalls: [], finished: true,
  ...over,
});

test('the long run grows against the last 30 days, not against a rule of thumb', () => {
  assert.equal(nextLong(90), 99);
  assert.equal(nextLong(60), 66);
  assert.equal(RULES.longStep, 1.1);
});

test('a finished loop holds the threshold session instead of lengthening it', () => {
  const p = nextLoopPlan(review());
  assert.deepEqual(p.thr, THR_STEPS.at(-1));
  assert.ok(p.thr.reps <= 6 && p.thr.min <= 8, 'never a seventh rep, never a ninth minute');
  assert.ok(p.thr.rest >= 60, 'the jog between reps never goes under 60 s');
  assert.match(p.why.join(' '), /nu mai crește|rămâne la/);
});

test('the pace moves only after a test, and only by what a test can measure', () => {
  const p = nextLoopPlan(review());
  assert.equal(p.retest, true);
  assert.equal(p.pacePct, RULES.paceStepPct);
  assert.ok(p.pacePct <= RULES.paceMaxPct);
  // an unfinished loop gets no test and no pace change
  const q = nextLoopPlan(review({ finished: false, rate: 0.6 }));
  assert.equal(q.retest, false);
  assert.equal(q.pacePct, 0);
});

test('the easy runs are where volume grows, and the long run keeps its ceiling', () => {
  const p = nextLoopPlan(review());
  assert.equal(p.long.cap, RULES.longCap, 'the ceiling stays at 90 minutes');
  assert.equal(p.easy.cap, 50, 'the easy runs grow instead');
  assert.equal(p.long.base, 90, 'and the long run starts where it got to');
});

test('losing fast means no lift adds load: holding is the win', () => {
  const p = nextLoopPlan(review(), undefined, -1.4);
  assert.equal(p.loadUp, false);
  assert.equal(p.pacePct, 0, 'nor does the pace move while the weight falls that fast');
  assert.match(p.why.join(' '), /progres, nu stagnare/);
  // a normal rate leaves strength free to grow
  assert.equal(nextLoopPlan(review(), undefined, -0.7).loadUp, true);
});

test('a loop that was half done repeats instead of growing', () => {
  const p = nextLoopPlan(review({ rate: 0.6, done: 65 }));
  assert.equal(p.loadUp, false);
  assert.equal(p.easy.cap, 45, 'nothing grows');
  assert.deepEqual(p.order, ['A', 'B', 'C'], 'and the emphasis order stays as it was');
});

test('a loop barely done starts easier than the one before it', () => {
  const p = nextLoopPlan(review({ rate: 0.4, done: 43, thrSessions: 2 }));
  assert.ok(p.thr.min <= 7 || p.thr.reps <= 6);
  assert.notDeepEqual(p.thr, THR_STEPS.at(-1));
  assert.match(p.why.join(' '), /o poți duce/);
});

test('a sore knee holds the long run and keeps the threshold', () => {
  const p = nextLoopPlan(review(), undefined, -0.5, true);
  assert.equal(p.long.base, 60, 'the long run does not start where it got to');
  assert.deepEqual(p.thr, THR_STEPS.at(-1), 'the hard session stays');
  assert.match(p.why.join(' '), /genunchiul/);
});

test('stalled exercises ask for one change, not just more weight', () => {
  const p = nextLoopPlan(review({ stalls: ['bench', 'row'] }));
  assert.match(p.why.join(' '), /o singură variabilă/);
});

test('the weekly loss comes out of the weights of the loop', () => {
  const w: Record<string, number> = {};
  for (let i = 0; i <= 28; i += 2) w[addDays(START, i)] = 134 - i * 0.1;
  const v = lossPerWeek(w, START, addDays(START, 28))!;
  assert.ok(v < -0.4 && v > -0.8, `got ${v}`);
  assert.equal(lossPerWeek({ [START]: 134 }, START, addDays(START, 28)), null, 'too few weights');
});
