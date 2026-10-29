import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addDays, dayKey, inWeek, mmss, num, paceStr, weekStart, weekdayIdx } from './util.ts';
import { Clock, breath478Seq, doneSec, locate, phaseStart, roundsSeq, showerSeq, totalSec } from './seq.ts';
import { Track, haversine, routePath, simplify } from './geo.ts';
import { activeStreak, advise, dayComplete, emomNext, habitMilestone, habitStreak, lastExercise, totals, weekDone } from './progress.ts';
import { freshState, makeEntry, normalize } from './store.ts';
import { fastStatus, hms } from './nutri/fast.ts';
import { breathPos, holdStats } from './wimhof.ts';
import { WEEK, blockName, blockLine, resolveBlock, type Picks } from '../data/plan.ts';
import { ROW_CHALLENGES, rowChallenge, rowRests, rowTotal } from '../data/row.ts';
import { WORKOUTS, exerciseById } from '../data/workouts.ts';
import { ROUTINES, routineSeconds } from '../data/routines.ts';
import { COMBOS, INSIDE, focusCombos } from '../data/combos.ts';
import { BOOK } from '../data/book.ts';

test('dates: the program week starts on Monday', () => {
  assert.equal(weekdayIdx('2026-10-26'), 0); // Monday
  assert.equal(weekdayIdx('2026-10-25'), 6); // Sunday
  assert.equal(weekStart('2026-10-25'), '2026-10-19');
  assert.equal(weekStart('2026-10-26'), '2026-10-26');
  assert.ok(inWeek('2026-11-01', '2026-10-26'));
  assert.ok(!inWeek('2026-11-02', '2026-10-26'));
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(dayKey(new Date(2026, 0, 5)), '2026-01-05');
});

test('formatting', () => {
  assert.equal(mmss(75), '1:15');
  assert.equal(mmss(600), '10:00');
  assert.equal(paceStr(365), '6:05');
  assert.equal(paceStr(0), '–');
  assert.equal(num(10000), '10.000');
});

test('the plan matches the e-book', () => {
  assert.equal(WEEK.length, 7);
  assert.deepEqual(WEEK.map((d) => d.title), ['Combat Training', 'Push Training', 'Off Day', 'Combat Training II', 'Pull Training', 'Mobility & Meditation Day', 'Leg Day']);
  const r = (id: string) => WEEK.flatMap((d) => d.blocks).find((b) => b.id === id)!;
  assert.equal(r('mon-shadow').rounds, 5);
  assert.equal(r('thu-bag').rounds, 10);
  assert.equal(r('thu-shadow').rounds, 3);
  assert.equal(r('thu-rope').work, 180);
  assert.equal(r('tue-easy').work, 600);
  assert.equal(r('sun-legs').rounds, 10);
  assert.equal(r('sun-legs').work, 60);
  const P: Picks = { legMode: 'wall', thuFeet: 'rope', thuMain: 'bag', rowCh: 'a' };
  assert.equal(blockName(r('sun-legs'), P), 'Wall Sit');
  assert.equal(blockName(r('sun-legs'), { ...P, legMode: 'jump' }), 'Jumping Squats');
  assert.equal(exerciseById('lunges')!.lo, 15);
  assert.equal(exerciseById('lunges')!.sets, 4);
  assert.ok(WEEK.every((d) => d.blocks.length === 3));
  const ids = WEEK.flatMap((d) => d.blocks.map((b) => b.id));
  assert.equal(new Set(ids).size, ids.length);
});

test('routines last as long as the plan says', () => {
  const sec = (id: string) => routineSeconds(ROUTINES.find((x) => x.id === id)!);
  assert.equal(sec('stretch-push'), 15 * 60);
  assert.equal(sec('stretch-pull'), 15 * 60);
  assert.equal(sec('mobility'), 30 * 60);
  assert.equal(sec('daily'), 10 * 60);
});

test('content: no nutrition, combos link to the channel, workouts are complete', () => {
  assert.ok(!BOOK.some((c) => /nutri/i.test(c.title)));
  assert.ok(BOOK.length >= 15);
  for (const c of COMBOS) {
    assert.ok(c.seq.length > 0 && c.call.length > 0, c.id);
    if (c.vid) assert.match(c.vid, /^\d{19}$/);
  }
  for (const f of ['jab', 'move', 'combo', 'power', 'slow', 'distance']) assert.ok(focusCombos(f).length >= 4, f);
  for (const w of WORKOUTS) for (const e of w.ex) {
    assert.ok(e.vars.length >= 1 && e.start < e.vars.length, e.id);
    if (e.type === 'reps' || e.type === 'time') assert.ok(e.lo! <= e.hi!, e.id);
  }
});

test('rounds sequence: work/rest without a rest after the last round', () => {
  const s = roundsSeq(5, 180, 60, 5);
  assert.equal(s.filter((p) => p.kind === 'work').length, 5);
  assert.equal(s.filter((p) => p.kind === 'rest').length, 4);
  assert.equal(totalSec(s), 5 + 5 * 180 + 4 * 60);
  const easy = roundsSeq(1, 600, 0, 5);
  assert.equal(easy.length, 2);
  const at = locate(s, 5 + 180 + 30);
  assert.equal(s[at.i].kind, 'rest');
  assert.equal(Math.round(at.left), 30);
  assert.ok(locate(s, 99999).done);
  assert.equal(phaseStart(s, 2), 5 + 180);
  assert.equal(doneSec(s, 5 + 180 + 60 + 90, 'work'), 270);
});

test('shower: 1 min cold, 1 min warm, ending cold', () => {
  const s = showerSeq(3, 60, 60, true, 0);
  assert.deepEqual(s.map((p) => p.kind), ['cold', 'warm', 'cold', 'warm', 'cold', 'warm', 'cold']);
  assert.equal(doneSec(s, 9999, 'cold'), 240);
  assert.equal(showerSeq(2, 60, 60, false, 0).length, 4);
});

test('4-7-8 breathing fills the chosen minutes with whole cycles', () => {
  const s = breath478Seq(10, 0);
  assert.equal(s.length % 3, 0);
  assert.ok(Math.abs(totalSec(s) - 600) <= 19);
  assert.deepEqual(s.slice(0, 3).map((p) => p.sec), [4, 7, 8]);
});

test('clock pauses and skips', () => {
  let now = 0;
  const c = new Clock(() => now);
  c.start();
  now = 3000;
  assert.equal(c.t, 3);
  c.pause();
  now = 10000;
  assert.equal(c.t, 3);
  c.resume();
  now = 11000;
  assert.equal(c.t, 4);
  c.set(60);
  now = 12000;
  assert.equal(c.t, 61);
});

test('gps track drops jitter, bad accuracy and jumps', () => {
  const a = { lat: 45.0, lon: 25.0 };
  const b = { lat: 45.009, lon: 25.0 }; // ~1 km north
  assert.ok(Math.abs(haversine(a, b) - 1000.8) < 2);
  const t = new Track();
  assert.ok(t.add({ ...a, acc: 10, t: 0 }, 0));
  assert.ok(!t.add({ lat: 45.00001, lon: 25.0, acc: 10, t: 1000 }, 1)); // 1 m jitter
  assert.ok(!t.add({ lat: 45.001, lon: 25.0, acc: 80, t: 2000 }, 2)); // inaccurate
  assert.ok(!t.add({ lat: 45.01, lon: 25.0, acc: 5, t: 3000 }, 3)); // 1.1 km in 3 s
  // jog 1.2 km at 3 m/s in 30 m steps
  let lat = 45.0;
  for (let i = 1; i <= 40; i++) {
    lat += 0.00027;
    t.add({ lat, lon: 25.0, acc: 8, t: i * 10000 }, i * 10);
  }
  assert.ok(t.m > 1150 && t.m < 1250, String(t.m));
  assert.equal(t.splits.length, 1);
  const p = t.pace(60);
  assert.ok(p > 300 && p < 370, String(p)); // ~5:33 /km
  const simple = simplify(t.pts, 100);
  assert.ok(simple.length < t.pts.length && simple.length > 5);
  assert.match(routePath(simple), /^M[\d.]+ [\d.]+ L/);
});

test('progression: move up, stay or step back', () => {
  const push = exerciseById('pushups')!;
  const mk = (sets: number[], lvl: number) => ({ log: { id: 'pushups', name: 'Push-ups', sets, unit: 'reps' as const }, lvl, date: '2026-10-20' });
  assert.equal(advise(push, undefined, 1).kind, 'first');
  const up = advise(push, mk([15, 15, 15, 16], 1), 1);
  assert.equal(up.kind, 'up');
  assert.equal(up.lvl, 2);
  assert.equal(advise(push, mk([12, 11, 10, 9], 1), 1).kind, 'stay');
  const down = advise(push, mk([6, 5, 4, 9], 1), 1);
  assert.equal(down.kind, 'down');
  assert.equal(down.lvl, 0);
  assert.equal(advise(push, mk([15, 15, 15, 15], 4), 4).kind, 'top');
  assert.equal(advise(push, mk([15, 15, 15, 15], 0), 1).kind, 'stay'); // new variation
  const ytw = exerciseById('ytw')!;
  assert.equal(advise(ytw, { log: { id: 'ytw', name: 'Y-T-W Raises', sets: [1, 1, 1, 1], unit: 'ytw' }, lvl: 0, date: 'x' }, 0).kind, 'up');
});

test('emom climbs to 30 × 10', () => {
  assert.deepEqual(emomNext({ min: 10, reps: 3 }, 10), { min: 10, reps: 4 });
  assert.deepEqual(emomNext({ min: 10, reps: 3 }, 8), { min: 10, reps: 3 });
  assert.deepEqual(emomNext({ min: 10, reps: 10 }, 10), { min: 12, reps: 10 });
  assert.deepEqual(emomNext({ min: 30, reps: 10 }, 30), { min: 30, reps: 10 });
});

test('weekly completion, streaks and habit milestones', () => {
  const s = freshState('2026-10-26');
  const add = (block: string, date: string) => s.log.push(makeEntry({ kind: 'rounds', block, name: 'x', dur: 60, data: {}, date }));
  add('mon-shadow', '2026-10-26');
  add('mon-bw', '2026-10-26');
  add('mon-bag', '2026-10-27');
  add('tue-cal', '2026-10-25'); // previous week
  const done = weekDone(s.log, '2026-10-26');
  assert.ok(dayComplete(WEEK[0], done));
  assert.ok(!done.has('tue-cal'));
  assert.equal(activeStreak(s.log, '2026-10-27'), 3);
  assert.equal(activeStreak(s.log, '2026-10-28'), 3);
  assert.equal(activeStreak(s.log, '2026-10-30'), 0);
  const h = s.habits[0];
  for (let i = 0; i < 8; i++) h.days[addDays('2026-10-20', i)] = 50;
  h.days['2026-10-28'] = 20;
  assert.equal(habitStreak(h, '2026-10-28'), 8);
  assert.equal(habitMilestone(8), 7);
  assert.equal(habitMilestone(30), 28);
});

test('last exercise and totals read the log', () => {
  const s = freshState();
  s.log.push(makeEntry({ kind: 'workout', block: 'tue-cal', name: 'Push', dur: 3000, data: { ex: [{ id: 'pushups', name: 'Push-ups', sets: [10, 9, null, null], unit: 'reps', lvl: 1 }] } }));
  s.log.push(makeEntry({ kind: 'run', block: 'sun-jog', name: 'Jogging', dur: 1200, data: { m: 3200 } }));
  s.log.push(makeEntry({ kind: 'shower', name: 'Showers', dur: 420, data: { coldSec: 240 } }));
  s.log.push(makeEntry({ kind: 'wimhof', name: 'Meditation', dur: 600, data: { holds: [62, 80, 95] } }));
  s.log.push(makeEntry({ kind: 'rounds', name: 'Shadow', dur: 1200, data: { workDone: 900 } }));
  const last = lastExercise(s.log, 'pushups')!;
  assert.deepEqual(last.log.sets, [10, 9, null, null]);
  assert.equal(last.lvl, 1);
  const t = totals(s.log);
  assert.equal(t.runKm, 3.2);
  assert.equal(t.coldMin, 4);
  assert.equal(t.bestHold, 95);
  assert.equal(t.boxingMin, 15);
  assert.equal(holdStats(s.log).best, 95);
});

test('normalize repairs partial or broken state', () => {
  const n = normalize({ set: { sound: false }, log: [{ date: '2026-10-01', kind: 'run' }, 'junk'] }, '2026-10-26');
  assert.equal(n.set.sound, false);
  assert.equal(n.set.callEvery, 15);
  assert.equal(n.log.length, 1);
  assert.equal(n.habits[0].goal, 50);
  assert.equal(normalize(null).v, 1);
});

test('wim hof breath animation goes in then out', () => {
  const a = breathPos(0.5, 3.2);
  assert.ok(a.inhale && a.n === 0);
  const b = breathPos(3.0, 3.2);
  assert.ok(!b.inhale && b.fill < 0.5);
  assert.equal(breathPos(6.5, 3.2).n, 2);
});

test('day focus: each boxing block carries the requested focus', () => {
  const r = (id: string) => WEEK.flatMap((d) => d.blocks).find((b) => b.id === id)!;
  assert.equal(r('mon-shadow').focus, 'jab');
  assert.equal(r('mon-bag').focus, 'move');
  assert.equal(r('tue-easy').focus, 'slow');
  assert.equal(r('thu-shadow').focus, 'combo');
  assert.equal(r('thu-bag').focus, 'power');
  assert.equal(r('fri-easy').focus, 'distance');
  for (const id of ['mon-shadow', 'mon-bag', 'tue-easy', 'thu-shadow', 'thu-bag', 'fri-easy']) assert.ok((r(id).cues ?? []).length >= 3, id);
});

test('thursday: rope/ladder and bag/row are alternatives for the same slot', () => {
  const thu = WEEK[3];
  const P: Picks = { legMode: 'wall', thuFeet: 'rope', thuMain: 'bag', rowCh: 'a' };
  const [feet, , main] = thu.blocks;
  assert.equal(resolveBlock(feet, P).name, 'Jumping Rope');
  assert.equal(resolveBlock(feet, P).focus, 'rope');
  const ladder = resolveBlock(feet, { ...P, thuFeet: 'ladder' });
  assert.equal(ladder.name, 'Agility Ladder');
  assert.equal(ladder.focus, 'ladder');
  assert.equal(ladder.id, 'thu-rope');
  assert.equal(resolveBlock(main, P).name, 'Heavy Bag Training');
  assert.equal(resolveBlock(main, P).kind, 'rounds');
  const row = resolveBlock(main, { ...P, thuMain: 'row', rowCh: 'd' });
  assert.equal(row.kind, 'row');
  assert.equal(row.id, 'thu-bag');
  assert.equal(row.focus, undefined);
  assert.match(blockLine(main, { ...P, thuMain: 'row', rowCh: 'd' }), /250 m × 8/);
  assert.equal(thu.blocks.length, 3);
  // other days don't change with the Thursday picks
  for (const d of WEEK.filter((x) => x.idx !== 3)) for (const b of d.blocks) assert.equal(resolveBlock(b, { ...P, thuFeet: 'ladder', thuMain: 'row' }).name, resolveBlock(b, P).name);
});

test('machine row: four challenges, 250 m × 8 with 45 s between intervals only', () => {
  assert.deepEqual(ROW_CHALLENGES.map((c) => [c.id, rowTotal(c), c.reps]), [['a', 1000, 1], ['b', 5000, 1], ['c', 10000, 1], ['d', 2000, 8]]);
  const d = rowChallenge('d');
  assert.equal(d.meters, 250);
  assert.equal(d.rest, 45);
  assert.equal(rowRests(d), 7);
  assert.equal(rowRests(rowChallenge('a')), 0);
  assert.equal(rowChallenge('x').id, 'a');
});

test('combinations: a 200 cm boxer gets jab-led, long-range sets', () => {
  const ids = new Set(COMBOS.map((c) => c.id));
  assert.equal(ids.size, COMBOS.length);
  for (const f of ['jab', 'move', 'slow', 'combo', 'power', 'distance']) {
    const tall = focusCombos(f, 200).filter((c) => !['week'].includes(c.id));
    assert.ok(tall.length >= 8, f);
    const inside = tall.filter((c) => INSIDE.has(c.id)).length;
    assert.ok(inside <= 2, `${f}: ${inside} close-range combos`);
    const jabLed = tall.filter((c) => /^(Jab|Step in|Fake jab)/.test(c.seq[0])).length;
    assert.ok(jabLed / tall.length >= 0.6, `${f}: ${jabLed}/${tall.length} jab-led`);
    // generic profile still works
    assert.ok(focusCombos(f, 175).length >= 4, f);
  }
  // hooks are kept where distance allows them, not removed
  assert.ok(focusCombos('power', 200).some((c) => c.seq.some((s) => /Hook/.test(s))));
});

test('height: an unconfirmed nutrition profile takes the 200 cm default, a confirmed one keeps its own', () => {
  assert.equal(freshState('2026-10-29').nut.h, 200);
  assert.equal(normalize({ nut: { h: 180 } }, '2026-10-29').nut.h, 200);
  assert.equal(normalize({ nut: { h: 186, ok: '2026-10-01' } }, '2026-10-29').nut.h, 186);
  const s = normalize({ set: { legMode: 'jump' } }, '2026-10-29').set;
  assert.equal(s.thuFeet, 'rope');
  assert.equal(s.thuMain, 'bag');
  assert.equal(s.rowCh, 'a');
});

test('fasting: 16/8 and 24 h timers', () => {
  const H = 3600_000;
  const t0 = Date.UTC(2026, 9, 29, 20);
  const a = fastStatus({ mode: '168', start: t0 }, t0 + 10 * H);
  assert.equal(a.done, false);
  assert.equal(a.left, 6 * H);
  const b = fastStatus({ mode: '168', start: t0 }, t0 + 17 * H);
  assert.ok(b.done && !b.over);
  assert.equal(b.windowLeft, 7 * H);
  assert.ok(fastStatus({ mode: '168', start: t0 }, t0 + 24 * H).over);
  const c = fastStatus({ mode: '24', start: t0 }, t0 + 23 * H);
  assert.equal(c.done, false);
  assert.equal(hms(c.left), '1:00:00');
  assert.ok(fastStatus({ mode: '24', start: t0 }, t0 + 24 * H).done);
  assert.equal(normalize({ fast: { mode: 'x', start: 1 } }).fast, null);
  assert.deepEqual(normalize({ fast: { mode: '24', start: t0 } }).fast, { mode: '24', start: t0 });
});
