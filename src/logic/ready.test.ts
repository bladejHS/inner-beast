import { test } from 'node:test';
import assert from 'node:assert/strict';
import { entryLoad, entryMinutes, entryRpe, loadReport, loadText, readiness, sleepAvg3 } from './ready.ts';
import { lightOn } from './progress.ts';
import { freshState, makeEntry, normalize, type Entry } from './store.ts';
import { addDays } from './util.ts';

test('readiness: rested and fresh means the whole plan', () => {
  const r = readiness({ e: 4, f: 4 }, 8)!;
  assert.equal(r.level, 'go');
  assert.deepEqual(r.why, []);
  assert.ok(r.score >= 80);
});

test('readiness: one soft sign holds the volume, two or one hard sign make an easy day', () => {
  assert.equal(readiness({ e: 4, f: 4 }, 6)!.level, 'hold');
  assert.equal(readiness({ e: 2, f: 4 }, 8)!.level, 'hold');
  assert.equal(readiness({ e: 2, f: 2 }, 8)!.level, 'easy');
  assert.equal(readiness({ e: 4, f: 4 }, 4.5)!.level, 'easy');
  assert.equal(readiness({ e: 1, f: 5 }, 9)!.level, 'easy');
  assert.deepEqual(readiness({ e: 3, f: 2 }, 6)!.why, ['ai dormit 6 h', 'mușchii sunt încă febrili']);
});

test('readiness: several short nights count even after one good night, and a short night is not counted twice', () => {
  assert.equal(readiness({ e: 4, f: 4 }, 7.5, 6)!.level, 'hold');
  assert.equal(readiness({ e: 4, f: 4 }, 6, 6)!.why.length, 1);
});

test('readiness: nothing to say until both answers are in, and it works without a sleep note', () => {
  assert.equal(readiness({ e: 4 }, 8), null);
  assert.equal(readiness({ e: 5, f: 5 })!.score, 100);
});

test('sleepAvg3 needs two noted nights', () => {
  assert.equal(sleepAvg3({ '2026-11-10': 6 }, '2026-11-10'), undefined);
  assert.equal(sleepAvg3({ '2026-11-10': 6, '2026-11-08': 7 }, '2026-11-10'), 6.5);
});

const ses = (date: string, kind: Entry['kind'], min: number, data: Record<string, unknown> = {}, block?: string): Entry =>
  makeEntry({ kind, name: 'x', dur: min * 60, data, block, date, ts: new Date(`${date}T18:00:00`).getTime() });

test('load: minutes × effort, with the rating given at the end doubled to the 0–10 scale', () => {
  assert.equal(entryRpe(ses('2026-11-02', 'rounds', 30, { rpe: 4 })), 8);
  assert.equal(entryLoad(ses('2026-11-02', 'rounds', 30, { rpe: 4 })), 240);
  assert.equal(entryLoad(ses('2026-11-02', 'workout', 45)), 270);
  assert.equal(entryLoad(ses('2026-11-02', 'workout', 8, { wid: 'knee' })), 24);
  assert.equal(entryLoad(ses('2026-11-02', 'cardio', 30)), 90);
  assert.equal(entryRpe(ses('2026-11-02', 'walk', 60)), null);
  assert.equal(entryLoad(ses('2026-11-02', 'wimhof', 10)), 0);
});

test('load: a block ticked by hand counts the plan\'s minutes', () => {
  assert.equal(entryMinutes(ses('2026-11-02', 'rounds', 0, { manual: true }, 'mon-shadow')), 15);
  assert.equal(entryMinutes(ses('2026-11-03', 'workout', 0, { manual: true }, 'tue-cal')), 45);
});

test('load report: the last 7 days against the three weeks before', () => {
  const today = '2026-11-29';
  const log: Entry[] = [];
  for (let w = 1; w <= 3; w++) for (const off of [0, 2, 4]) log.push(ses(addDays(today, -(7 * w + off)), 'workout', 50));
  assert.equal(loadReport(log, today).verdict, 'low');
  for (const off of [0, 2, 4]) log.push(ses(addDays(today, -off), 'workout', 50));
  const same = loadReport(log, today);
  assert.equal(same.usual, 900);
  assert.equal(same.week, 900);
  assert.equal(same.verdict, 'ok');
  log.push(ses(addDays(today, -1), 'rounds', 60, { rpe: 5 }));
  const more = loadReport(log, today);
  assert.equal(more.verdict, 'spike');
  assert.match(loadText(more), /67% peste/);
  assert.equal(more.weeks.length, 6);
  assert.equal(more.weeks[5].mon, '2026-11-23');
});

test('load report: says nothing before two weeks of history', () => {
  const r = loadReport([ses('2026-11-10', 'workout', 50)], '2026-11-11');
  assert.equal(r.verdict, 'none');
  assert.equal(r.usual, null);
});

test('an easy day lightens today only, like the lighter week', () => {
  const s = freshState('2026-11-11');
  assert.equal(lightOn(s, '2026-11-11'), false);
  s.easy = '2026-11-11';
  assert.equal(lightOn(s, '2026-11-11'), true);
  assert.equal(lightOn(s, '2026-11-12'), false);
  s.deload = { last: '2026-11-09', week: '2026-11-09' };
  assert.equal(lightOn(s, '2026-11-12'), true);
});

test('older backups load with empty readiness notes', () => {
  const s = normalize({ v: 1, log: [] });
  assert.deepEqual(s.ready, {});
  assert.equal(s.easy, '');
});
