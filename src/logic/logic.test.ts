import { test } from 'node:test';
import assert from 'node:assert/strict';
import { raceTime } from './util.ts';
import { parseTime, readRun, runAdvice, zone2, zoneHard } from './runlog.ts';
import { kickPower, kickWeek, kneeAdvice, kneeAsk, kneeNotes, kneeSore, kneeStreak, legDays } from './knee.ts';
import { advance, back, bestTime, elapsed, newRun, pause, resume, segElapsed } from './race.ts';
import { LEVEL_NAMES, RACES } from '../data/races.ts';
import { angle, GuardTracker, RepCounter, type Pt } from './coach.ts';
import { boxCycle, boxScore, boxStats } from './boxstats.ts';
import { CHALLENGES, challengeDays } from '../data/challenges.ts';
import { addDays, dayKey, inWeek, mmss, num, paceStr, weekStart, weekdayIdx } from './util.ts';
import { Clock, breath478Seq, burstAt, doneSec, locate, phaseStart, roundsSeq, showerSeq, totalSec } from './seq.ts';
import { Track, haversine, routePath, simplify } from './geo.ts';
import { activeStreak, advise, allRecords, bestSet, amrapBest, amrapUp, cycleAt, cycleStartFor, daysOff, repeatMonday, dayComplete, deloadDue, deloadOn, emomAdvice, emomNext, growMinutes, growPushups, habitDone, habitGoal, habitMilestone, habitStreak, habitWeek, lastExercise, lighter, loadable, stalled, totals, variationPath, weekDone } from './progress.ts';
import { defaultHabit, freshState, makeEntry, normalize, type Habit } from './store.ts';
import { LAB, labSeq } from './breathlab.ts';
import { roundThemes } from '../data/combos.ts';
import { WARMUP_SEC } from '../data/plan.ts';
import { DOPA_RULES, dopaBest, dopaStreak, nextMilestone, nofapDays } from './discipline.ts';
import { breathPos, holdStats } from './wimhof.ts';
import { BURST_SEC, WEEK, blockName, blockLine, resolveBlock, type Picks } from '../data/plan.ts';
import { ROW_CHALLENGES, rowChallenge, rowRests, rowTotal } from '../data/row.ts';
import { WORKOUTS, exerciseById, workoutById } from '../data/workouts.ts';
import { ROUTINES, routineSeconds } from '../data/routines.ts';
import { COMBOS, INSIDE, focusCombos, learnOrder, legStrike, REACT_GAP, reactCues, usesLegs, weekCombos } from '../data/combos.ts';
import { BOOK } from '../data/book.ts';
import { testById } from '../data/tests.ts';

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

test('the week keeps the days of the book, reordered for an all-round athlete', () => {
  assert.equal(WEEK.length, 7);
  assert.deepEqual(WEEK.map((d) => d.title), ['Combat Training', 'Push Training', 'Off Day', 'Combat Training II', 'Pull Training', 'Leg Day', 'Mobility & Meditation Day']);
  const r = (id: string) => WEEK.flatMap((d) => d.blocks).find((b) => b.id === id)!;
  assert.deepEqual(WEEK[0].blocks.map((b) => b.id), ['mon-shadow', 'mon-bag', 'mon-bw', 'mon-lower']); // the AMRAP, then the hack squat and curls, after the boxing
  assert.equal(r('mon-shadow').rounds, 5);
  assert.deepEqual(WEEK[3].blocks.map((b) => b.id), ['thu-rope', 'thu-shadow', 'thu-power', 'thu-bag']);
  assert.equal(r('thu-rope').rounds, 3);
  assert.deepEqual([r('thu-power').rounds, r('thu-power').work, r('thu-power').burstFrom, r('thu-power').restSec], [3, 182, 1, 60]);
  assert.equal(r('thu-bag').rounds, 6);
  assert.equal(r('tue-easy').work, 600);
  assert.equal(r('tue-row').kind, 'cardio');
  assert.deepEqual(WEEK[5].blocks.map((b) => b.id), ['sun-legs', 'sun-lunges', 'knee-sat']); // legs two days before Monday
  assert.equal(WEEK[6].blocks[0].id, 'sun-jog');
  assert.deepEqual(r('sun-jog').grow, { base: 20, step: 2, cap: 40 });
  const P: Picks = { legMode: 'wall', thuFeet: 'rope', thuMain: 'bag', rowCh: 'a' };
  assert.equal(blockName(r('sun-lunges'), P), 'Speed, Power & Leg Strength');
  const ids = WEEK.flatMap((d) => d.blocks.map((b) => b.id));
  assert.equal(new Set(ids).size, ids.length);
});

test('strength days: power first, then strength; no failure sets in the plan', () => {
  const order = (w: 'push' | 'pull' | 'legs') => workoutById(w).ex.map((e) => e.id);
  const legs = order('legs');
  assert.ok(legs.indexOf('sprint') < legs.indexOf('cmj') && legs.indexOf('cmj') < legs.indexOf('splitsq') && legs.indexOf('rot') < legs.indexOf('splitsq'));
  assert.equal(order('push')[0], 'explosive');
  assert.ok(workoutById('lower').ex.some((e) => e.id === 'hacksq'));
  assert.ok(!order('push').includes('burnout'));
  assert.ok(order('pull').includes('carry'));
  assert.equal(exerciseById('dips')!.rest, 165);
  assert.equal(exerciseById('splitsq')!.load, true);
  assert.equal(exerciseById('wallsit')!.opt, true);
});

test('routines last as long as the plan says', () => {
  const sec = (id: string) => routineSeconds(ROUTINES.find((x) => x.id === id)!);
  assert.equal(sec('stretch-push'), 10 * 60);
  assert.equal(sec('stretch-pull'), 10 * 60);
  assert.equal(sec('legwarm'), 10 * 60);
  assert.equal(sec('cooldown'), 5 * 60);
  assert.equal(sec('mobility'), 30 * 60);
  assert.equal(sec('daily'), 10 * 60);
});

test('the loop: three emphases of four weeks, the 4th lighter, and blocks that follow it', () => {
  const start = '2026-11-09';
  assert.equal(cycleAt(start, '2026-11-08'), null);
  assert.deepEqual([cycleAt(start, '2026-11-09')!.id, cycleAt(start, '2026-11-15')!.week], ['A', 1]);
  assert.ok(cycleAt(start, '2026-11-30')!.lighter);
  assert.deepEqual([cycleAt(start, '2026-12-07')!.id, cycleAt(start, '2026-12-07')!.week], ['B', 1]);
  assert.equal(cycleAt(start, '2027-01-04')!.id, 'C');
  assert.equal(cycleAt(start, '2027-02-01')!.id, 'A');
  assert.equal(cycleStartFor('2026-11-07'), '2026-11-09');
  assert.equal(cycleStartFor('2026-11-04'), '2026-11-02');
  const r = (id: string) => WEEK.flatMap((d) => d.blocks).find((b) => b.id === id)!;
  const P: Picks = { legMode: 'wall', thuFeet: 'rope', thuMain: 'bag', rowCh: 'a' };
  assert.equal(resolveBlock(r('mon-bag'), { ...P, cycle: 'A' }).burstFrom, undefined);
  assert.equal(resolveBlock(r('mon-bag'), { ...P, cycle: 'B' }).burstFrom, 3);
  assert.equal(resolveBlock(r('thu-bag'), { ...P, cycle: 'C' }).rounds, 8);
  assert.equal(resolveBlock(r('sun-jog'), { ...P, grown: { 'sun-jog': 26 } }).dose, '26 min');
  assert.equal(resolveBlock(r('sun-jog'), { ...P, grown: { 'sun-jog': 26 } }).min, 26);
  const jog = (date: string) => makeEntry({ kind: 'run', block: 'sun-jog', name: 'Jogging', dur: 1200, data: {}, date });
  const g = { base: 20, step: 2, cap: 30 };
  assert.equal(growMinutes([], 'sun-jog', start, g), 20);
  assert.equal(growMinutes([jog('2026-11-01'), jog('2026-11-15'), jog('2026-11-22')], 'sun-jog', start, g), 24);
  assert.equal(growMinutes(Array.from({ length: 9 }, (_, i) => jog(addDays(start, 7 * i + 6))), 'sun-jog', start, g), 30);
});

test('punch-out rounds: 14 bursts of 3 s with 10 s easy', () => {
  assert.equal(BURST_SEC, 182);
  assert.deepEqual(burstAt(0), { n: 1, on: true, left: 3 });
  assert.deepEqual(burstAt(4), { n: 1, on: false, left: 9 });
  assert.deepEqual(burstAt(13), { n: 2, on: true, left: 3 });
  assert.equal(burstAt(181.5).n, 14);
  assert.equal(totalSec(roundsSeq(3, 180, 60, 0, (r) => (r >= 2 ? 182 : 180))), 180 + 182 + 182 + 120);
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

test('emom: the target moves only after two full sessions in a row, and stops at 15 × 8', () => {
  const run = (min: number, reps: number, done: number) => makeEntry({ kind: 'workout', name: 'x', dur: 60, data: { ex: [{ id: 'emom', name: 'e', unit: 'emom', sets: [], lvl: 2, emom: { min, reps, done } }] } });
  assert.deepEqual(emomNext({ min: 10, reps: 3 }, 10), { min: 10, reps: 3 });
  assert.deepEqual(emomNext({ min: 10, reps: 3 }, 10, [run(10, 3, 10)]), { min: 10, reps: 4 });
  assert.deepEqual(emomNext({ min: 10, reps: 3 }, 8, [run(10, 3, 10)]), { min: 10, reps: 3 });
  assert.deepEqual(emomNext({ min: 10, reps: 3 }, 10, [run(10, 3, 9)]), { min: 10, reps: 3 });
  assert.deepEqual(emomNext({ min: 10, reps: 8 }, 10, [run(10, 8, 10)]), { min: 11, reps: 8 });
  assert.deepEqual(emomNext({ min: 15, reps: 8 }, 15, [run(15, 8, 15)]), { min: 15, reps: 8 });
  assert.deepEqual(normalize({ emom: { min: 30, reps: 10 } }).emom, { min: 15, reps: 8 });
});

test('weekly completion, streaks and habit milestones', () => {
  const s = freshState('2026-10-26');
  const add = (block: string, date: string) => s.log.push(makeEntry({ kind: 'rounds', block, name: 'x', dur: 60, data: {}, date }));
  add('mon-shadow', '2026-10-26');
  add('mon-bw', '2026-10-26');
  add('mon-lower', '2026-10-27');
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
  h.days['2026-10-28'] = 5; // under the default target of 10 push-ups
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
  assert.equal(n.habits[0].goal, 10);
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
  const [feet, shadow, power, main] = thu.blocks;
  const spar = resolveBlock(shadow, { ...P, thuPartner: 'spar' });
  assert.deepEqual([spar.id, spar.name, spar.focus], ['thu-shadow', 'Technical Sparring / Pads', 'pads']);
  assert.equal(resolveBlock(power, { ...P, thuMain: 'row' }).name, 'Punch-out Shadow');
  assert.equal(resolveBlock(power, P).name, 'Punch-out');
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
  assert.equal(thu.blocks.length, 4);
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

test('combinations: a 200 cm fighter gets long-range kickboxing sets, a sore knee gets boxing', () => {
  const ids = new Set(COMBOS.map((c) => c.id));
  assert.equal(ids.size, COMBOS.length);
  for (const f of ['jab', 'move', 'slow', 'combo', 'power', 'distance']) {
    const tall = focusCombos(f, 200);
    assert.ok(tall.length >= 8, f);
    const inside = tall.filter((c) => INSIDE.has(c.id)).length;
    assert.ok(inside <= 2, `${f}: ${inside} close-range combos`);
    assert.ok(tall.filter(usesLegs).length / tall.length >= 0.4, `${f}: kicks`);
    // no jumping technique while jumps hurt the knees
    assert.ok(!tall.some((c) => c.seq.some((s) => /Hop|Flying|Jump|Switch step/.test(s))), `${f}: no jumps`);
    // a bad knee note: a full set with nothing on one leg
    const sore = focusCombos(f, 200, false);
    assert.ok(sore.length >= 8 && !sore.some(usesLegs), `${f}: sore knee`);
    // generic profile still works
    assert.ok(focusCombos(f, 175).length >= 4, f);
  }
  // the Dutch finish, with the hook kept where distance allows it
  assert.ok(focusCombos('power', 200).some((c) => c.seq.some((s) => /Hook/.test(s)) && /Kick/.test(c.seq[c.seq.length - 1])));
  // every kickboxing item names its source and explains itself
  for (const c of COMBOS.filter((x) => x.id.startsWith('kb-'))) assert.ok(c.kb && c.note.length > 80, c.id);
  // the learning plan: the first kickboxing week (2026-11-02) brings the teep and reviews the 1-2
  assert.deepEqual(weekCombos(1, 200).map((c) => c.id), ['kb-teep', 'one-two']);
  assert.deepEqual(learnOrder(200).slice(2, 6).map((c) => c.id), ['kb-low', 'kb-check', 'kb-jab-teep', 'kb-12-low']);
  assert.ok(learnOrder(200).findIndex((c) => c.id === 'kb-body-high') > 20);
});

test('knee rule: the newest note of the past week decides the kicks, from Leg Day or from the bag', () => {
  const legs = (date: string) => makeEntry({ kind: 'workout', name: 'Leg Day', dur: 3000, date, data: { wid: 'legs', ex: [] } });
  const bag = (date: string, knee: number) => makeEntry({ kind: 'rounds', name: 'Heavy Bag Training', dur: 900, date, data: { rounds: 5, focus: 'move', knee, kicks: true } });
  const log = [legs('2026-10-31'), bag('2026-11-02', 2), bag('2026-11-05', 6)];
  const knee = { '2026-10-31': { d: 2 } };
  const notes = kneeNotes(log, knee);
  assert.deepEqual(notes.map((n) => [n.date, n.v, n.from]), [['2026-11-05', 6, 'kicks'], ['2026-11-02', 2, 'kicks'], ['2026-10-31', 2, 'legs']]);
  assert.equal(kneeSore(notes, '2026-11-07')?.from, 'kicks');
  // a newer good note, after a boxing-only session at the bag, brings the kicks back
  log.push(bag('2026-11-06', 0));
  assert.equal(kneeSore(kneeNotes(log, knee), '2026-11-07'), null);
  // a bad Leg Day note counts too (the worse of the session and the next morning), and a week on it no longer does
  const legBad = kneeNotes([legs('2026-11-07')], { '2026-11-07': { d: 2, m: 6 } });
  assert.equal(kneeSore(legBad, '2026-11-09')?.from, 'legs');
  assert.equal(kneeSore(kneeNotes([legs('2026-11-07')], { '2026-11-07': { d: 4 } }), '2026-11-09'), null);
  assert.equal(kneeSore(legBad, '2026-11-15'), null);
  assert.equal(kneeSore([], '2026-11-09'), null);
});

test('kick power: 50, 65, 80 % in the first three weeks of kicking, all of it from the fourth, again after a long break', () => {
  const kick = (date: string) => makeEntry({ kind: 'rounds', name: 'Shadow Kickboxing', dur: 900, date, data: { rounds: 5, focus: 'jab', kicks: true } });
  assert.equal(kickWeek([], '2026-11-09'), 1);
  const log = [kick('2026-11-09'), kick('2026-11-12'), kick('2026-11-16')];
  assert.deepEqual(['2026-11-09', '2026-11-16', '2026-11-23', '2026-11-30'].map((d) => kickPower(kickWeek(log, d))), [50, 65, 80, 100]);
  // five weeks without kicks: the ramp starts again
  assert.equal(kickWeek(log, '2026-12-22'), 1);
  log.push(kick('2026-12-22'));
  assert.equal(kickWeek(log, '2026-12-29'), 2);
});

test('records: the best bodyweight set on each variation, not the loaded sets or the prehab', () => {
  const day = (d: string) => new Date(`${d}T18:00:00`).getTime();
  const w = (date: string, ex: unknown[], wid = 'push') => makeEntry({ kind: 'workout', name: 'Push', dur: 3000, ts: day(date), data: { wid, ex } });
  const log = [
    w('2026-11-03', [{ id: 'pushups', name: 'Push-ups', lvl: 1, unit: 'reps', sets: [20, 18, null] }]),
    w('2026-11-10', [{ id: 'pushups', name: 'Push-ups', lvl: 1, unit: 'reps', sets: [22, 19, 17] }]),
    w('2026-11-10', [{ id: 'knee-iso', name: 'Wall Sit Hold', lvl: 0, unit: 'sec', sets: [45, 45] }], 'knee'),
    w('2026-11-14', [{ id: 'curls', name: 'Hammer Curls', lvl: 0, unit: 'reps', sets: [15], kg: 12.5 }], 'pull'),
    w('2026-11-14', [{ id: 'hollow', name: 'Hollow Body Hold', lvl: 1, unit: 'sec', sets: [40, 35] }], 'push'),
  ];
  assert.deepEqual(allRecords(log).map((r) => [r.id, r.lvl, r.v, r.sec]), [['hollow', 1, 40, true], ['pushups', 1, 22, false]]);
  assert.equal(bestSet(log, 'pushups', 1)?.v, 22);
  assert.equal(bestSet(log, 'pushups', 1, log[1].ts)?.v, 20);
  assert.equal(bestSet(log, 'pushups', 2), null);
});

test('push, pull, legs after the review of 2026-11-08: no bench dips, TRX rows, the neck as its own routine, hip thrust', () => {
  const ids = (w: string) => workoutById(w as 'push').ex.map((e) => e.id);
  assert.ok(!WORKOUTS.some((w) => w.ex.some((e) => e.vars.includes('Bench Dips'))));
  assert.equal(exerciseById('dips')!.vars[0], 'Assisted Dips');
  assert.ok(!WORKOUTS.some((w) => w.ex.some((e) => /neck/i.test(e.id))), 'the neck work is outside the plan');
  const neck = ROUTINES.find((r) => r.id === 'neck')!;
  assert.equal(neck.moves.filter((m) => m.name.startsWith('Neck Hold')).length, 8);
  assert.ok(routineSeconds(neck) <= 150);
  assert.deepEqual(ids('pull').slice(0, 3), ['emom', 'rows', 'trxrow']);
  assert.ok(!exerciseById('trxrow')!.load && !exerciseById('trxrow')!.bar, 'no weights for the back');
  assert.equal(ids('legs')[ids('legs').indexOf('rdl') + 1], 'hipthrust');
});

test('reaction rounds: round 4 on Thursday, the last 3 minutes on Friday, none with a partner, no legs on a no-kick day', () => {
  const thu = WEEK[3].blocks[1];
  assert.deepEqual([thu.rounds, thu.dose, thu.react], [4, '4 × 3 min', { round: 4 }]);
  assert.deepEqual(WEEK[4].blocks.find((b) => b.id === 'fri-easy')!.react, { lastSec: 180 });
  const pads = resolveBlock(thu, { legMode: 'wall', thuFeet: 'rope', thuMain: 'bag', thuPartner: 'spar', rowCh: 'a' });
  assert.deepEqual([pads.rounds, pads.react, blockLine(thu, { legMode: 'wall', thuFeet: 'rope', thuMain: 'bag', thuPartner: 'spar', rowCh: 'a' })], [3, undefined, '3 × 3 min Technical Sparring / Pads']);
  assert.ok(reactCues().length >= 6 && reactCues().every((c) => c.answer.length > 0 && c.call.endsWith('!')));
  assert.ok(reactCues().filter((c) => c.answer.some(legStrike)).length >= 3);
  assert.ok(reactCues(false).length >= 4 && !reactCues(false).some((c) => c.answer.some(legStrike)));
  assert.ok(REACT_GAP[0] >= 2 && REACT_GAP[1] > REACT_GAP[0]);
});

test('program additions: Kick Armor on Friday, pad rounds for the partner slot, the Kick Height test', () => {
  const fri = WEEK[4].blocks.map((b) => b.id);
  assert.deepEqual(fri, ['fri-stretch', 'fri-cal', 'kick-fri', 'fri-easy']);
  assert.equal(workoutById('kick').ex.length, 3);
  const pads = resolveBlock(WEEK[3].blocks[1], { legMode: 'wall', thuFeet: 'rope', thuMain: 'bag', thuPartner: 'spar', rowCh: 'a' });
  assert.equal(pads.focus, 'pads');
  const themes = roundThemes('pads', 200);
  assert.deepEqual(themes.map((t) => t.name), ['Arme lungi', 'Pumni, apoi piciorul', 'Atacă el, răspunzi tu']);
  for (const t of themes) assert.ok(t.combos.length >= 3 && t.combos.every((c) => c.note.startsWith('Partenerul:')), t.name);
  const sore = roundThemes('pads', 200, false);
  assert.ok(sore.length === 1 && sore[0].combos.length >= 3 && !sore[0].combos.some(usesLegs));
  assert.ok(focusCombos('pads', 200).length >= 12);
  assert.equal(testById('kickh')?.unit, 'cm');
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

test('discipline: no fap days and dopamine streaks', () => {
  assert.equal(nofapDays({ start: '2026-10-20', best: 0, resets: [] }, '2026-10-29'), 9);
  assert.equal(nofapDays({ start: null, best: 0, resets: [] }, '2026-10-29'), 0);
  assert.equal(nextMilestone(9), 14);
  const all = DOPA_RULES.map((r) => r.id);
  const d = { started: '2026-10-25', days: { '2026-10-25': all, '2026-10-26': all, '2026-10-27': ['cold'], '2026-10-28': all } as Record<string, string[]> };
  assert.equal(dopaStreak(d, '2026-10-29'), 1); // today not done yet: yesterday counts
  d.days['2026-10-29'] = all;
  assert.equal(dopaStreak(d, '2026-10-29'), 2);
  assert.equal(dopaBest(d), 2);
  const s = normalize({ disc: { nofap: { start: '2026-10-01' } } });
  assert.equal(s.disc.nofap.start, '2026-10-01');
  assert.deepEqual(s.disc.nofap.resets, []);
  assert.equal(s.disc.dopa.started, null);
});

test('breathwork lab: four modes, whole cycles filling the minutes', () => {
  assert.deepEqual(LAB.map((m) => m.name), ['RESET', 'TACTICAL', 'RECOVERY', 'ADVANCED']);
  for (const m of LAB) {
    assert.ok(m.mins.includes(m.rec), m.id);
    const s = labSeq(m.id, m.rec, 0);
    const t = totalSec(s);
    assert.ok(t >= m.rec * 60 - 1 && t < m.rec * 60 + 40, `${m.id}: ${t}`);
    assert.ok(s.every((p) => ['in', 'hold', 'out'].includes(p.kind)), m.id);
  }
  const tac = labSeq('tactical', 1, 0);
  assert.deepEqual(tac.slice(0, 4).map((p) => [p.kind, p.sec]), [['in', 4], ['hold', 4], ['out', 4], ['hold', 4]]);
  const adv = labSeq('advanced', 12, 0).filter((p, i, a) => p.kind === 'hold' && a[i - 1]?.kind === 'out');
  assert.equal(adv[0].sec, 5);
  assert.equal(Math.max(...adv.map((p) => p.sec)), 20);
});

test('rounds: kickboxing themes for a tall fighter, boxing themes on a sore knee, warm-up length', () => {
  const tall = roundThemes('power', 200);
  assert.deepEqual(tall.map((t) => t.name), ['Pumni, apoi piciorul', 'Genunchi la intrare', 'Lovituri de picior', 'Check, teep și distanță']);
  assert.ok(tall[3].combos.some((c) => c.id === 'kb-check-cross') && tall[3].combos.some((c) => c.id === 'clinch-exit'));
  for (const t of tall) assert.ok(t.combos.length >= 2, t.name);
  assert.ok(!roundThemes('power', 175).some((t) => t.name === 'Check, teep și distanță'));
  assert.equal(roundThemes('slow', 200).length, 0);
  const jab = roundThemes('jab', 200)[0];
  assert.equal(jab.name, 'Jab și teep');
  assert.ok(jab.combos.every((c) => !c.seq.some((s) => /Cross|Hook|Uppercut|Low Kick|Body Kick/.test(s))));
  // a sore knee: the boxing rounds from before, nothing on one leg
  const sore = roundThemes('power', 200, false);
  assert.ok(sore.some((t) => t.name === 'Apărare la distanță' && t.combos.some((c) => c.id === 'clinch-exit')));
  assert.ok(sore.every((t) => !t.combos.some(usesLegs)));
  assert.equal(roundThemes('combo', 200, false)[0].name, 'Combinații de box');
  assert.ok(WARMUP_SEC >= 300 && WARMUP_SEC <= 420);
  const r = (id: string) => WEEK.flatMap((d) => d.blocks).find((b) => b.id === id)!;
  assert.ok(r('mon-shadow').warmup && r('thu-rope').warmup);
});

test('camera coach: rep counting, shallow reps, slowing down', () => {
  const r = new RepCounter(150, 100);
  let t = 0;
  const rep = (low: number, up = 0.5): void => {
    for (const a of [170, 130, low, low, low, low, low]) r.feed(a, (t += 0.2));
    t += up;
    for (const a of [170, 170, 170, 170, 170]) r.feed(a, (t += 0.05));
  };
  rep(70);
  assert.equal(r.reps, 1);
  rep(115);
  assert.equal(r.reps, 1);
  assert.equal(r.shallow, 1);
  for (let i = 0; i < 4; i++) rep(70);
  assert.equal(r.slowed, false);
  rep(70, 2);
  assert.equal(r.slowed, true);
});

test('camera coach: punches, guard and angles', () => {
  const pose = (lx: number, ly: number): Pt[] => {
    const p: Pt[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 1 }));
    p[11] = { x: 0.45, y: 0.3 };
    p[12] = { x: 0.55, y: 0.3 };
    p[23] = { x: 0.46, y: 0.6 };
    p[24] = { x: 0.54, y: 0.6 };
    p[14] = { x: 0.6, y: 0.33 };
    p[16] = { x: 0.55, y: 0.27 };
    p[13] = { x: (0.45 + lx) / 2, y: (0.3 + ly) / 2 };
    p[15] = { x: lx, y: ly };
    return p;
  };
  const g = new GuardTracker();
  g.feed(pose(0.47, 0.28), 0);
  assert.equal(g.feed(pose(0.1, 0.3), 0.1).punch, true);
  assert.equal(g.feed(pose(0.1, 0.3), 0.2).punch, false);
  g.feed(pose(0.47, 0.28), 0.3);
  assert.equal(g.punches, 1);
  g.feed(pose(0.46, 0.55), 1);
  assert.equal(g.feed(pose(0.46, 0.55), 2).drop, true);
  assert.equal(Math.round(angle({ x: 1, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 1 })), 90);
});

test('30-day challenge counts days from the log; box stats add up', () => {
  const c = CHALLENGES.find((x) => x.id === 'box')!;
  const log = [
    makeEntry({ kind: 'rounds', name: 'Heavy Bag Training', dur: 600, date: '2026-10-02', data: { rounds: 3, workDone: 540, focus: 'combo', called: { X: 2 } } }),
    makeEntry({ kind: 'coach', name: 'Camera', dur: 60, date: '2026-10-02', data: { mode: 'box', punches: 40, guard: 80 } }),
  ];
  const d = challengeDays(c, '2026-10-01', log);
  assert.deepEqual([d[0], d[1], d.length], [false, true, 30]);
  const b = boxStats(log, '2026-10-10');
  assert.deepEqual([b.rounds, b.bagMin, b.punches, b.guard, b.called.X], [3, 9, 40, [80], 2]);
});

test('races: every event has all five levels, with real segments', () => {
  assert.ok(RACES.length >= 6);
  for (const r of RACES) {
    assert.equal(r.levels.length, LEVEL_NAMES.length, r.id);
    for (const l of r.levels) assert.ok(l.segs.length > 1 && l.est > 0 && l.segs.every((s) => s.name), l.name);
  }
  const hx = RACES.find((r) => r.id === 'hyrox')!.levels[3].segs;
  assert.equal(hx.length, 16);
  assert.equal(hx[15].detail, '100 repetări');
  assert.equal(RACES.find((r) => r.id === 'spartan')!.levels[1].segs.length, 40);
});

test('race clock: pauses do not count, undo restores, survives by timestamps', () => {
  const r = newRun('murph', 0, 0);
  pause(r, 10000);
  assert.equal(elapsed(r, 70000), 10);
  resume(r, 70000);
  assert.equal(elapsed(r, 80000), 20);
  advance(r, 80000);
  assert.deepEqual([r.i, r.splits], [1, [20]]);
  assert.equal(segElapsed(r, 85000), 5);
  back(r, 85000);
  assert.deepEqual([r.i, segElapsed(r, 85000)], [0, 25]);
  const log = [90, 80].map((dur) => makeEntry({ kind: 'race', name: 'x', dur, data: { ev: 'murph', lvl: 0 } }));
  assert.equal(bestTime(log, 'murph', 0), 80);
  assert.equal(bestTime(log, 'murph', 1), undefined);
  assert.equal(normalize({ race: r }).race?.ev, 'murph');
});

test('run log: reads times the way a watch shows them', () => {
  assert.deepEqual(['25', '25:30', '25,30', '5.05', '1:05:30', ''].map(parseTime), [1500, 1530, 1530, 305, 3930, 0]);
  for (const bad of ['abc', '5:7', '5:75', '25,5', '1:2:3']) assert.ok(isNaN(parseTime(bad)), bad);
});

test('run log: checks the form, and only the duration is required', () => {
  const blank = { dur: '', km: '', hrAvg: '', kcal: '', hrMax: '', paceAvg: '', paceMax: '' };
  assert.deepEqual(readRun({ ...blank, dur: '30:00', km: '5,0' }), { dur: 1800, m: 5000, pace: 360, paceMax: 0, hrAvg: 0, hrMax: 0, kcal: 0 });
  assert.deepEqual(readRun({ dur: '30:00', km: '5', hrAvg: '148', kcal: '410', hrMax: '172', paceAvg: '5:55', paceMax: '4:50' }), { dur: 1800, m: 5000, pace: 355, paceMax: 290, hrAvg: 148, hrMax: 172, kcal: 410 });
  assert.equal(typeof readRun(blank), 'string');
  assert.equal(typeof readRun({ ...blank, dur: '30', km: 'x' }), 'string');
  assert.equal(typeof readRun({ ...blank, dur: '30', paceAvg: '5:00', paceMax: '6:00' }), 'string');
  assert.equal(typeof readRun({ ...blank, dur: '30', hrAvg: '180', hrMax: '170' }), 'string');
  assert.equal(typeof readRun({ ...blank, dur: '30', hrAvg: '999' }), 'string');
  assert.equal(typeof readRun({ ...blank, dur: '30', kcal: '12.5' }), 'string');
});

test('race clock: going back to a timed segment restarts it and rewinds the clock', () => {
  const r = newRun('fight', 0, 0);
  advance(r, 120000, 120);
  advance(r, 180000, 60);
  back(r, 190000, true);
  assert.deepEqual([r.i, r.splits, segElapsed(r, 190000), elapsed(r, 190000)], [1, [120], 0, 120]);
  assert.equal(segElapsed(r, 200000), 10);
  back(r, 200000, true);
  assert.deepEqual([r.i, r.splits, segElapsed(r, 200000), elapsed(r, 200000)], [0, [], 0, 0]);
  pause(r, 205000);
  advance(r, 205000, 120);
  back(r, 206000, true);
  assert.deepEqual([r.pausedAt, segElapsed(r, 206000)], [205000, 0]);
  resume(r, 215000);
  assert.equal(segElapsed(r, 220000), 5);
});

test('race time switches to hours', () => {
  assert.equal(raceTime(59 * 60), '59:00');
  assert.equal(raceTime(13 * 3600 + 5 * 60 + 9), '13:05:09');
});

import { planSnapshot } from './bridge.ts';

test('the plan published for Beast Nutrition follows the real week and the user picks', () => {
  const base = { legMode: 'wall', thuFeet: 'rope', thuMain: 'bag', rowCh: 'a', rest3: 60, rest1: 60 } as const;
  const week = planSnapshot(base);
  assert.equal(week.length, 7);
  const bag = week[0]!.find((s) => s.id === 'mon-bag')!;
  assert.deepEqual([bag.kind, bag.min, bag.focus], ['rounds', 19, 'move']);
  assert.equal(week[5]!.find((s) => s.id === 'sun-lunges')!.kind, 'workout');
  assert.equal(week[1]!.find((s) => s.id === 'tue-row')!.kind, 'run'); // easy cardio counts as a run in Beast Nutrition
  assert.equal(planSnapshot({ ...base, grown: { 'sun-jog': 28 } })[6]!.find((s) => s.id === 'sun-jog')!.min, 28);
  assert.equal(week[3]!.find((s) => s.id === 'thu-power')!.min, 11);
  const row = planSnapshot({ ...base, thuMain: 'row' })[3]!.find((s) => s.id === 'thu-bag')!;
  assert.equal(row.kind, 'row');
});

const lastOf = (id: string, sets: number[], lvl: number, kg?: number) => ({ log: { id, name: id, sets, unit: 'reps' as const, kg }, lvl, date: 'x' });
const session = (id: string, sets: number[], lvl: number, date: string, kg?: number, extra = {}) => makeEntry({ kind: 'workout', name: 'x', dur: 60, date, ts: Date.parse(date), data: { ex: [{ id, name: id, unit: 'reps', sets, lvl, kg }], ...extra } });

test('progression: a fixed target has to be met twice before moving up', () => {
  const bss = { ...exerciseById('splitsq')!, sets: 3, lo: 5, hi: 5 };
  assert.equal(advise(bss, lastOf('splitsq', [5, 5, 5], 1), 1).kind, 'stay');
  assert.equal(advise(bss, lastOf('splitsq', [5, 5, 5], 1), 1, lastOf('splitsq', [5, 5, 4], 1)).kind, 'stay');
  assert.equal(advise(bss, lastOf('splitsq', [5, 5, 5], 1), 1, lastOf('splitsq', [5, 5, 5], 1)).kind, 'up');
  const heavy = advise(exerciseById('splitsq')!, lastOf('splitsq', [8, 8, 8, 8], 1, 12), 1);
  assert.deepEqual([heavy.kind, heavy.kg], ['top', 14.5]);
  const push = exerciseById('pushups')!;
  assert.equal(advise(push, lastOf('pushups', [15, 15, 15, 15], 1), 1).kind, 'up');
});

test('progression: Dead Hang moves up at 60 s on every set, short of grip failure', () => {
  const hang = exerciseById('hang')!;
  assert.equal(advise(hang, lastOf('hang', [60, 62, 60], 0), 0).kind, 'up');
  assert.equal(advise(hang, lastOf('hang', [60, 45, 60], 0), 0).kind, 'stay');
  assert.match(advise(hang, lastOf('hang', [65, 65, 65], 0), 1).text, /Variantă nouă/);
});

test('progression: weight is noted on the hardest variation and goes up by 2.5 kg', () => {
  const dips = exerciseById('dips')!;
  assert.deepEqual([loadable(dips, 3), loadable(dips, 2), loadable(exerciseById('hollow')!, 2), loadable(exerciseById('emom')!, 3)], [true, false, false, true]);
  assert.equal(advise(dips, lastOf('dips', [12, 12, 12, 12], 3, 10), 3).kg, 12.5);
  assert.equal(advise(dips, lastOf('dips', [12, 12, 12, 12], 3), 3).kg, undefined);
  assert.equal(advise(dips, lastOf('dips', [8, 8, 7], 3, 10), 3).kg, undefined);
});

test('equipment: dumbbells stop at 30 kg, then the variation or the tempo moves', () => {
  const bss = exerciseById('splitsq')!;
  assert.equal(advise(bss, lastOf('splitsq', [8, 8, 8, 8], 2, 27.5), 2).kg, 30);
  assert.equal(advise(bss, lastOf('splitsq', [8, 8, 8, 8], 2, 28), 2).kg, 30);
  const top = advise(bss, lastOf('splitsq', [8, 8, 8, 8], 2, 30), 2);
  assert.deepEqual([top.kind, top.kg], ['top', undefined]);
  assert.match(top.text, /cele mai grele gantere/);
  const carry = advise(exerciseById('carry')!, { log: { id: 'carry', name: 'c', sets: [45, 45, 45, 45], unit: 'sec' as const, kg: 30 }, lvl: 0, date: 'x' }, 0);
  assert.deepEqual([carry.kind, carry.lvl], ['up', 1]);
  const rdl = exerciseById('rdl')!;
  assert.equal(rdl.bar, true);
  assert.equal(advise(rdl, lastOf('rdl', [8, 8, 8], 0, 100), 0).kg, 102.5);
});

test('knees: Leg Day and the warm-ups start without landings, the jumps come back as later variations', () => {
  const legs = workoutById('legs').ex;
  for (const e of legs) assert.doesNotMatch(e.vars[e.start]!, /Jump|Hop/, e.id);
  assert.deepEqual(exerciseById('cmj')!.vars, ['Medicine Ball Scoop Toss', 'Box Jump', 'Countermovement Jump']);
  assert.ok(exerciseById('broad')!.vars.includes('Broad Jump'));
  assert.equal(exerciseById('sprint')!.vars[0], 'Hill Sprints (8–10 s)');
  const order = legs.map((e) => e.id);
  assert.ok(order.indexOf('cmj') < order.indexOf('splitsq') && order.indexOf('splitsq') < order.indexOf('rdl'));
  for (const id of ['legwarm', 'stretch-push', 'stretch-pull']) {
    const moves = ROUTINES.find((r) => r.id === id)!.moves.map((m) => m.name);
    assert.ok(!moves.some((m) => /Jump|Hop|Skip/.test(m)), `${id}: ${moves.join(', ')}`);
  }
});

test('stalling: three sessions that do not beat the one before them', () => {
  const log = [session('pushups', [10, 10], 1, '2026-10-01'), session('pushups', [10, 9], 1, '2026-10-08'), session('pushups', [10, 10], 1, '2026-10-15')];
  assert.equal(stalled(log, 'pushups', 1), false);
  assert.equal(stalled([...log, session('pushups', [9, 9], 1, '2026-10-22')], 'pushups', 1), true);
  assert.equal(stalled([...log, session('pushups', [11, 10], 1, '2026-10-22')], 'pushups', 1), false);
  assert.equal(stalled([...log, session('pushups', [9, 9], 1, '2026-10-22', 5)], 'pushups', 1), false);
  assert.deepEqual(variationPath([...log, session('pushups', [9], 2, '2026-10-22')], 'pushups'), [{ lvl: 1, date: '2026-10-01' }, { lvl: 2, date: '2026-10-22' }]);
});

test('EMOM: proposes a step down after two misses and a lighter start on a harder variation', () => {
  const run = (done: number, lvl = 2) => makeEntry({ kind: 'workout', name: 'x', dur: 60, data: { ex: [{ id: 'emom', name: 'e', unit: 'emom', sets: [], lvl, emom: { min: 10, reps: 6, done } }] } });
  const vars = exerciseById('emom')!.vars;
  const cur = { min: 10, reps: 6 };
  assert.equal(emomAdvice([run(8)], cur, 2, vars), null);
  assert.equal(emomAdvice([run(8), run(9)], cur, 2, vars)?.reps, 5);
  assert.equal(emomAdvice([run(8), run(10), run(9)], cur, 2, vars), null);
  assert.equal(emomAdvice([run(10)], cur, 3, vars)?.reps, 3);
  assert.equal(emomAdvice([run(30)], { min: 30, reps: 10 }, 2, vars)?.lvl, 3);
});

test('bodyweight workout: records and the next scheme stay per scheme', () => {
  const am = (rounds: number, scheme: number, extra = 0) => makeEntry({ kind: 'amrap', name: 'x', dur: 600, data: { rounds, extra, scheme } });
  const log = [am(9, 0), am(5, 1, 3), am(5, 1, 7), am(7, 1)];
  assert.equal(amrapBest(log, 1)?.data.rounds, 7);
  assert.equal(amrapBest(log, 2), undefined);
  assert.equal(amrapUp(log, 0), null);
  assert.equal(amrapUp(log, 1), null);
  assert.equal(amrapUp([...log, am(7, 1)], 1), 2);
  assert.equal(amrapUp([am(9, 2), am(9, 2)], 2), null);
});

test('box score and its eight-week targets', () => {
  assert.equal(boxScore({ rounds: 5, planned: 5 }), undefined);
  assert.equal(boxScore({ rounds: 5, planned: 5, q: 5, rpe: 1 }), 100);
  assert.equal(boxScore({ rounds: 5, planned: 5, q: 3, rpe: 3 }), 60);
  assert.equal(boxScore({ rounds: 2, planned: 4, q: 5, rpe: 1 }), 50);
  const box = (date: string, q: number, focus = 'jab') => makeEntry({ kind: 'rounds', name: 'x', dur: 900, date, data: { rounds: 5, planned: 5, focus, q, rpe: 3 } });
  assert.equal(boxCycle([box('2026-09-07', 3), box('2026-09-08', 3)], '2026-09-09'), null);
  const log = [box('2026-09-07', 3), box('2026-09-08', 3), box('2026-09-09', 3), box('2026-09-10', 5, 'rope')];
  const c = boxCycle(log, '2026-09-10')!;
  assert.deepEqual([c.week, c.check, c.base, c.target, c.now], [1, 4, 60, 65, 60]);
  assert.deepEqual([boxCycle(log, '2026-10-20')!.week, boxCycle(log, '2026-10-20')!.check, boxCycle(log, '2026-10-20')!.target, boxCycle(log, '2026-10-20')!.now], [7, 8, 70, null]);
  assert.equal(boxCycle(log, '2026-11-03')!.week, 1);
});

test('lighter week: proposed in the 4th week of every emphasis, and it does not count for progress', () => {
  const start = '2026-08-24';
  const mon = '2026-09-14';
  assert.equal(deloadDue({ last: '', week: '' }, start, addDays(mon, -7)), false);
  assert.equal(deloadDue({ last: '', week: '' }, start, mon), true);
  assert.equal(deloadDue({ last: '', week: '' }, '', mon), false);
  assert.equal(deloadDue({ last: mon, week: mon }, start, addDays(mon, 3)), false);
  assert.equal(deloadDue({ last: mon, week: '' }, start, addDays(mon, 2)), false);
  assert.equal(deloadDue({ last: mon, week: '' }, start, addDays(mon, 28)), true);
  const am = makeEntry({ kind: 'amrap', name: 'x', dur: 420, data: { rounds: 12, extra: 0, scheme: 1, deload: true } });
  assert.equal(amrapBest([am], 1), undefined);
  assert.deepEqual([deloadOn({ week: mon }, addDays(mon, 6)), deloadOn({ week: mon }, addDays(mon, 7))], [true, false]);
  assert.deepEqual([lighter(5), lighter(3), lighter(10), lighter(4), lighter(1)], [4, 2, 7, 3, 1]);
  const light = [session('pushups', [10, 10], 1, '2026-10-01'), session('pushups', [5], 1, '2026-10-08', undefined, { deload: true })];
  assert.deepEqual(lastExercise(light, 'pushups')?.log.sets, [10, 10]);
  assert.equal(normalize({ deload: { last: mon, week: mon } }).deload.week, mon);
  assert.deepEqual(normalize({}).deload, { last: '', week: '' });
});

test('run advice: no pace target, pulse at the same pace, a check every 4th run', () => {
  const run = (pace: number, hrAvg?: number) => makeEntry({ kind: 'run', name: 'x', dur: 1200, data: { pace, hrAvg } });
  assert.equal(runAdvice([]), '');
  assert.match(runAdvice([run(360)]), /Ritm de conversație/);
  assert.doesNotMatch(runAdvice([run(360)]), /Ținta/);
  assert.match(runAdvice([run(360, 150), run(362, 145)]), /5 bpm mai puțin/);
  assert.match(runAdvice([run(360, 150), run(340, 150)]), /Mai rapid cu 20 s\/km/);
  assert.match(runAdvice([run(360, 150), run(358, 158)]), /8 bpm mai mare/);
  assert.match(runAdvice([run(360, 150), run(358, 152), run(362, 149)]), /verificarea.*6:00 \/km/);
});

test('Upper Strength: the second strength dose replaces the AMRAP on Monday in cycle A only', () => {
  const bw = WEEK[0].blocks.find((b) => b.id === 'mon-bw')!;
  const P: Picks = { legMode: 'wall', thuFeet: 'rope', thuMain: 'bag', rowCh: 'a' };
  const a = resolveBlock(bw, { ...P, cycle: 'A' });
  assert.deepEqual([a.id, a.kind, a.workout, a.name, a.min], ['mon-bw', 'workout', 'upper', 'Upper Strength', 15]);
  assert.equal(resolveBlock(bw, { ...P, cycle: 'B' }).kind, 'amrap');
  assert.equal(resolveBlock(bw, { ...P, cycle: 'C' }).kind, 'amrap');
  assert.equal(resolveBlock(bw, P).kind, 'amrap');
  const up = workoutById('upper');
  assert.deepEqual(up.ex.map((x) => [x.id, x.sets, x.lo, x.hi, x.rest]), [['pull-str', 3, 3, 5, 150], ['dips-str', 3, 3, 5, 150]]);
  assert.deepEqual(WORKOUTS.map((w) => [w.id, w.min]), [['push', 38], ['pull', 54], ['legs', 66], ['upper', 15], ['lower', 14], ['knee', 8], ['kick', 10]]);
  // Monday's hack squat and biceps curls, after the kickboxing; Tuesday has no lower-body block, Friday no curls
  const lower = workoutById('lower');
  assert.deepEqual(lower.ex.map((x) => x.id), ['hacksq', 'curls']);
  assert.deepEqual(WEEK[0].blocks.map((b) => b.id), ['mon-shadow', 'mon-bag', 'mon-bw', 'mon-lower']);
  assert.ok(!workoutById('pull').ex.some((x) => x.id === 'curls'));
  assert.ok(!exerciseById('curls')!.opt);
  // the machine has no dumbbell ceiling: 40 kg at the top of the range goes to 42.5
  const lp = advise(exerciseById('hacksq')!, lastOf('hacksq', [12, 12, 12], 0, 40), 0);
  assert.deepEqual([lp.kind, lp.kg], ['top', 42.5]);
  assert.deepEqual(WEEK[1].blocks.map((b) => b.id).slice(1, 3), ['tue-cal', 'knee-tue']);
  assert.ok(!workoutById('pull').ex.find((x) => x.id === 'hang')!.opt, 'the dead hang is part of Friday');
});

test('knees: three clean Leg Days bring Box Jump, three more with Box Jump bring CMJ and Broad Jump', () => {
  const leg = (date: string, cmj: number) => makeEntry({ kind: 'workout', name: 'Leg Day', dur: 3600, date, ts: Date.parse(date), data: { wid: 'legs', ex: [{ id: 'cmj', name: 'x', unit: 'done', sets: [1, 1, 1], lvl: cmj }] } });
  const log = [leg('2026-11-07', 0), leg('2026-11-14', 0), leg('2026-11-21', 0)];
  const none = legDays(log, {});
  assert.match(kneeAdvice('cmj', 0, none)!.text, /notezi cât te-au durut/);
  assert.equal(kneeAdvice('bss', 0, none), null);
  const two = legDays(log, { '2026-11-14': { d: 2, m: 0 }, '2026-11-21': { d: 0 } });
  assert.deepEqual(kneeStreak(two), { clean: 2, jump: 0 });
  assert.equal(kneeAdvice('cmj', 0, two)!.kind, 'stay');
  const three = legDays(log, { '2026-11-07': { d: 0, m: 2 }, '2026-11-14': { d: 2, m: 0 }, '2026-11-21': { d: 0 } });
  assert.deepEqual([kneeAdvice('cmj', 0, three)!.kind, kneeAdvice('cmj', 0, three)!.lvl], ['up', 1]);
  assert.equal(kneeAdvice('broad', 0, three)!.kind, 'stay');
  // a morning at 4 breaks the run; a session at 6 sends the jumps back to the throws
  const broke = legDays(log, { '2026-11-07': { d: 0 }, '2026-11-14': { d: 0, m: 4 }, '2026-11-21': { d: 0 } });
  assert.deepEqual(kneeStreak(broke), { clean: 1, jump: 0 });
  const hurt = legDays([...log, leg('2026-11-28', 1)], { '2026-11-28': { d: 6 } });
  assert.deepEqual([kneeAdvice('cmj', 1, hurt)!.kind, kneeAdvice('cmj', 1, hurt)!.lvl], ['down', 0]);
  const jumps = [leg('2026-12-05', 1), leg('2026-12-12', 1), leg('2026-12-19', 1)];
  const ok = legDays(jumps, { '2026-12-05': { d: 0, m: 0 }, '2026-12-12': { d: 2, m: 2 }, '2026-12-19': { d: 0, m: 0 } });
  assert.deepEqual([kneeAdvice('cmj', 1, ok)!.lvl, kneeAdvice('broad', 0, ok)!.lvl], [2, 1]);
});

test('knees: Azi asks for the session note, then for the next morning, for two days', () => {
  const leg = (date: string) => makeEntry({ kind: 'workout', name: 'Leg Day', dur: 3600, date, ts: Date.parse(date), data: { wid: 'legs', ex: [] } });
  const days = (knee: Record<string, { d?: number; m?: number }>) => legDays([leg('2026-11-07')], knee);
  assert.deepEqual(kneeAsk(days({}), '2026-11-07'), { date: '2026-11-07', field: 'd' });
  assert.equal(kneeAsk(days({ '2026-11-07': { d: 2 } }), '2026-11-07'), null);
  assert.deepEqual(kneeAsk(days({ '2026-11-07': { d: 2 } }), '2026-11-08'), { date: '2026-11-07', field: 'm' });
  assert.equal(kneeAsk(days({ '2026-11-07': { d: 2, m: 0 } }), '2026-11-08'), null);
  assert.equal(kneeAsk(days({ '2026-11-07': { d: 2 } }), '2026-11-10'), null);
  assert.deepEqual(normalize({}).knee, {});
  assert.equal(normalize({}).set.hrMax, 192);
});

test('pulse: zone 2 is 60-70 % of the maximum, and an easy run above it is called out', () => {
  assert.deepEqual(zone2(192), [115, 134]);
  const run = (pace: number, hrAvg?: number) => makeEntry({ kind: 'run', name: 'x', dur: 1200, data: { pace, hrAvg } });
  assert.match(runAdvice([run(400)], zone2(192)), /zona 2: 115–134 bpm/);
  assert.match(runAdvice([run(400, 152)], zone2(192)), /152 bpm, peste zona 2/);
  assert.doesNotMatch(runAdvice([run(400, 130)], zone2(192)), /peste zona 2/);
});

test('Monday in B and C: rower intervals every other week; Sunday rows by default; the knee block twice a week', () => {
  const bw = WEEK[0].blocks.find((b) => b.id === 'mon-bw')!;
  const P: Picks = { legMode: 'wall', thuFeet: 'rope', thuMain: 'bag', rowCh: 'a' };
  const at = (cycle: 'A' | 'B' | 'C', cycleWeek: number) => resolveBlock(bw, { ...P, cycle, cycleWeek });
  assert.deepEqual([at('B', 1).kind, at('B', 3).kind, at('C', 1).kind], ['amrap', 'amrap', 'amrap']);
  const iv = at('B', 2);
  assert.deepEqual([iv.id, iv.kind, iv.name, iv.rounds, iv.work, iv.restSec, iv.hiit], ['mon-bw', 'rounds', 'Rower Intervals', 4, 240, 180, true]);
  assert.equal(at('C', 4).name, 'Rower Intervals');
  assert.equal(at('A', 2).name, 'Upper Strength');
  assert.deepEqual(zoneHard(192), [163, 182]);
  const jog = WEEK[6].blocks.find((b) => b.id === 'sun-jog')!;
  assert.deepEqual([resolveBlock(jog, P).kind, resolveBlock(jog, P).name], ['cardio', 'Easy Row']);
  assert.deepEqual([resolveBlock(jog, { ...P, sunAero: 'run' }).kind, resolveBlock(jog, { ...P, sunAero: 'run' }).name], ['run', 'Jogging']);
  assert.equal(resolveBlock(jog, { ...P, grown: { 'sun-jog': 34 } }).dose, '34 min');
  assert.deepEqual(WEEK.flatMap((d) => d.blocks).filter((b) => b.workout === 'knee').map((b) => b.id), ['knee-tue', 'knee-sat']);
  assert.deepEqual(workoutById('knee').ex.map((x) => x.id), ['knee-iso', 'knee-step', 'tib']);
});

test('daily routine: push-ups from 10, three more every week, and the old routine turns into it once', () => {
  const h: Habit = { id: 'p', name: '50 Push-ups', type: 'count', goal: 50, start: '2026-10-20', days: { '2026-11-06': 50 } };
  assert.equal(growPushups([h], '2026-11-07'), true);
  assert.deepEqual([h.name, h.goal, h.prog], ['Push-ups', 10, { start: 10, step: 3, from: '2026-11-07' }]);
  assert.equal(growPushups([h], '2026-11-08'), false); // once only
  assert.deepEqual(['2026-11-07', '2026-11-13', '2026-11-14', '2026-11-21', '2026-12-05'].map((d) => habitGoal(h, d)), [10, 10, 13, 16, 22]);
  assert.deepEqual([habitWeek(h, '2026-11-07'), habitWeek(h, '2026-11-14')], [1, 2]);
  h.days['2026-11-14'] = 12;
  assert.equal(habitDone(h, '2026-11-14'), false);
  h.days['2026-11-14'] = 13;
  assert.equal(habitDone(h, '2026-11-14'), true);
  assert.equal(habitDone(h, '2026-11-06'), true); // the day before: 50 done, more than the new target
  const read: Habit = { id: 'r', name: 'Citit', type: 'count', goal: 10, start: '2026-11-01', days: {} };
  assert.equal(growPushups([read], '2026-11-07'), false);
  assert.equal(habitGoal(read, '2026-12-01'), 10);
  assert.deepEqual(defaultHabit('2026-11-07').prog, { start: 10, step: 3, from: '2026-11-07' });
});

test('a missed week repeats in the loop instead of moving on, and only from its Monday', () => {
  const start = '2026-11-09';
  // week 2 of A (Nov 16) repeated: Nov 23 is week 2 again, Nov 30 week 3, and the lighter week moves to Dec 7
  const rep = ['2026-11-23'];
  assert.equal(cycleAt(start, '2026-11-20', rep)!.week, 2);
  assert.equal(cycleAt(start, '2026-11-23', rep)!.week, 2);
  assert.equal(cycleAt(start, '2026-11-30', rep)!.week, 3);
  assert.ok(cycleAt(start, '2026-12-07', rep)!.lighter);
  assert.deepEqual([cycleAt(start, '2026-12-14', rep)!.id, cycleAt(start, '2026-12-14', rep)!.week], ['B', 1]);
  // a repeat on the first Monday of the loop does nothing
  assert.equal(cycleAt(start, '2026-11-09', ['2026-11-09'])!.week, 1);
  // where the repeat lands: this week when nothing is done yet and it is Monday to Wednesday, otherwise next week
  const block = (date: string) => makeEntry({ kind: 'workout', block: 'tue-cal', name: 'Push', dur: 60, date, data: {} });
  assert.equal(repeatMonday([], start, '2026-11-24'), '2026-11-23');
  assert.equal(repeatMonday([], start, '2026-11-26'), '2026-11-30');
  assert.equal(repeatMonday([block('2026-11-24')], start, '2026-11-25'), '2026-11-30');
  assert.equal(repeatMonday([], start, '2026-11-10'), '2026-11-16');
  assert.equal(repeatMonday([], '', '2026-11-10'), '');
  assert.equal(daysOff([block('2026-11-17')], '2026-11-21'), 4);
  assert.equal(daysOff([], '2026-11-21'), null);
});
