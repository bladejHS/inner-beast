// "Progres" in four sections: Săptămâna (the Hybrid365 framework, totals, sleep, steps), Antrenament (strength by lift,
// runs, conditioning),
// Teste (the test battery and the challenges) and Istoric (the latest entries; the full list opens on its own screen).

import { fireCalendar } from '../fire.ts';
import { WEEK } from '../../data/plan.ts';
import { CIRCUITS, type Race } from '../../data/races.ts';
import { BW_SCHEMES, WORKOUTS } from '../../data/workouts.ts';
import { activeStreak, allRecords, dayProgress, exerciseTrend, stalled, totals, weekDone, weekSince } from '../../logic/progress.ts';
import { runAdvice, zone2 } from '../../logic/runlog.ts';
import { loadReport, loadText } from '../../logic/ready.ts';
import type { Entry } from '../../logic/store.ts';
import { addDays, dayKey, esc, km, mmss, raceTime, num, paceStr, prettyDay, RO_DAYS, shortDay, weekStart, weekdayIdx } from '../../logic/util.ts';
import { bars, spark } from '../charts.ts';
import { ctx } from '../ctx.ts';
import { art } from '../art.ts';
import { ic } from '../icons.ts';
import { healthRow, pageHead, segBar, segOf, top, masthead } from './shared.ts';
import { boxScore } from '../../logic/boxstats.ts';
import { bestOf, TESTS, UNIT_LABEL, type FitTest } from '../../data/tests.ts';
import { goalHtml } from './goal.ts';

/** A test result in its unit: 10:59, 34 cm, 41 repetări. */
export function testValue(t: FitTest, v: number): string {
  return t.unit === 'time' ? mmss(v) : `${String(v).replace('.', ',')} ${UNIT_LABEL[t.unit]}`;
}

/** A circuit's card: the start, the best and the last time, the times drawing themselves, and each part of the last
 *  run against the best run as bars that grow in. */
function circuitCard(r: Race): string {
  const runs = ctx.S.log.filter((e) => e.kind === 'race' && e.data.ev === r.id);
  const best = runs.length ? runs.reduce((b, e) => (e.dur < b.dur ? e : b)) : undefined;
  const last = runs[runs.length - 1];
  const first = runs[0];
  const gain = first && best && runs.length > 1 ? first.dur - best.dur : 0;
  const segs = r.levels[0]!.segs;
  const ls = (last?.data.splits as number[] | undefined) ?? [];
  const bs = (best?.data.splits as number[] | undefined) ?? [];
  const max = Math.max(1, ...ls, ...bs);
  const parts = last ? `<div class="cc-parts">${segs.map((s, i) => {
    const l = ls[i] ?? 0, b = bs[i] ?? 0;
    return `<div class="cc-p" style="--i:${i}"><span>${esc(s.name)}</span><div class="cc-bars"><i class="cc-b best" style="--w:${(b / max).toFixed(3)}"></i><i class="cc-b last${l <= b ? ' pb' : ''}" style="--w:${(l / max).toFixed(3)}"></i></div><b>${raceTime(l)}</b></div>`;
  }).join('')}<p class="small dim cc-key"><i class="best"></i>cel mai bun · <i class="last"></i>ultima încercare</p></div>` : '';
  return `<section class="card cc">
    <div class="cc-h"><div><b>${esc(r.name)}</b><span>${esc(r.sub)}</span></div><button class="btn sm" data-a="ch:go" data-k="${r.id}" data-i="0">Start</button></div>
    ${runs.length ? `<div class="cc-stats">
      <div><b class="num">${raceTime(best!.dur)}</b><span>cel mai bun</span></div>
      <div><b class="num">${raceTime(last!.dur)}</b><span>ultima, ${shortDay(last!.date)}</span></div>
      <div class="${gain > 0 ? 'up' : ''}"><b class="num">${gain > 0 ? `−${raceTime(gain)}` : runs.length}</b><span>${gain > 0 ? 'față de prima' : runs.length === 1 ? 'încercare' : 'încercări'}</span></div>
    </div>
    ${runs.length > 1 ? `<div class="cc-spark">${spark(runs.slice(-12).map((e) => Math.round(e.dur)), true)}</div>` : ''}
    ${parts}` : `<ul class="cc-list">${segs.map((s) => `<li>${esc(s.name)}</li>`).join('')}</ul><p class="small dim">${esc(r.note)}</p>`}
  </section>`;
}

function testsHtml(): string {
  const rows = TESTS.map((t) => {
    const r = ctx.S.tests[t.id] ?? [];
    const last = r[r.length - 1];
    const best = bestOf(t, r);
    const info = last
      ? `Ultima: ${testValue(t, last.v)}, ${shortDay(last.d)}${r.length > 1 && best !== undefined ? `. Cel mai bun: ${testValue(t, best)}` : ''}`
      : `${t.what}. ${t.every}`;
    return `<li class="test-row"><div><b>${esc(t.name)}</b><span>${esc(info)}</span></div><button class="btn ghost sm" data-a="test" data-k="${t.id}" aria-label="Notează ${esc(t.name)}">Notează</button></li>`;
  });
  return `<h2 class="sec first">Circuite<small>Pe timp. Bate-ți timpul; barele arată unde l-ai câștigat sau pierdut.</small></h2>
    ${CIRCUITS.map(circuitCard).join('')}
    ${goalHtml(dayKey())}<h2 class="sec" id="tests">Teste<small>În săptămâna ușoară, odihnit: puterea întâi, alergarea la final</small></h2><ul class="hist tests">${rows.join('')}</ul>`;
}

function entryLine(e: Entry, del = false): string {
  const d = e.data as Record<string, unknown>;
  let what = '';
  switch (e.kind) {
    case 'rounds':
      what = d.manual ? 'bifat manual' : `${d.rounds} din ${d.planned} runde, ${mmss(Number(d.workDone) || 0)} lucru${boxScore(d) !== undefined ? `, scor ${boxScore(d)}` : ''}`;
      break;
    case 'amrap':
      what = `${BW_SCHEMES[Number(d.scheme) || 0]?.name ?? ''}, ${d.rounds} runde + ${d.extra} repetări`;
      break;
    case 'workout': {
      const ex = (d.ex as Array<{ name: string; sets: Array<number | null> }>) || [];
      what = d.manual ? 'bifat manual' : `${ex.length} exerciții, ${ex.reduce((s, x) => s + x.sets.filter((v) => v !== null).length, 0)} serii`;
      break;
    }
    case 'run':
      what = [
        d.m ? `${km(Number(d.m))} km în ${raceTime(e.dur)}` : raceTime(e.dur),
        d.pace ? `${paceStr(Number(d.pace))} /km` : '',
        d.paceMax ? `max ${paceStr(Number(d.paceMax))} /km` : '',
        d.hrAvg ? `HR avg ${d.hrAvg}` : '',
        d.hrMax ? `HR max ${d.hrMax}` : '',
        d.kcal ? `${num(Number(d.kcal))} kcal` : '',
      ].filter(Boolean).join(', ');
      break;
    case 'walk':
      what = `${d.steps ? `${num(Number(d.steps))} pași` : ''}${d.m ? `, ${km(Number(d.m))} km` : ''}`.replace(/^, /, '');
      break;
    case 'wimhof':
      what = `retenții ${((d.holds as number[]) || []).map(mmss).join(', ')}`;
      break;
    case 'breath':
      what = `${d.cycles ?? ''} cicluri 4-7-8`;
      break;
    case 'shower':
      what = `${mmss(Number(d.coldSec) || 0)} la rece`;
      break;
    case 'routine':
      what = mmss(e.dur);
      break;
    case 'race':
      what = `${d.level}, ${raceTime(e.dur)}`;
      break;
    case 'coach':
      what = d.mode === 'box' ? `${d.punches} lovituri, gardă ${d.guard}%` : d.angle ? `${d.angle}°` : `${d.reps} repetări`;
      break;
    case 'row':
      what = `${d.challenge}: ${num(Number(d.meters) || 0)} m${d.reps && Number(d.reps) > 1 ? `, ${d.intervals} din ${d.reps} intervale` : ''} în ${mmss(e.dur)}`;
      break;
    case 'cardio':
      what = `${mmss(Number(d.workDone) || e.dur)} ușor`;
      break;
  }
  if (d.manual && e.kind !== 'run' && e.kind !== 'walk') what = 'bifat manual';
  return `<li><div><b>${esc(e.name)}</b><span>${shortDay(e.date)}${what ? `, ${esc(what)}` : ''}${e.block ? '' : ', în afara planului'}</span></div>${del ? `<button class="icon-btn" data-a="hist-del" data-id="${e.id}" aria-label="Șterge">${ic('trash')}</button>` : ''}</li>`;
}

export const PROGRESS_SEGS: Array<[string, string]> = [['week', 'Săptămâna'], ['train', 'Antrenament'], ['tests', 'Teste'], ['log', 'Istoric']];

const day2 = (d: string) => RO_DAYS[weekdayIdx(d)].slice(0, 2);
const hours = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1).replace('.', ','));
/** 8200 → "8,2k", 10000 → "10k". */
const kSteps = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1).replace('.', ',').replace(/,0$/, '')}k` : String(v));

/** Săptămâna: the week, the totals, sleep and steps. */
function weekSeg(): string {
  const S = ctx.S;
  const today = dayKey();
  const done = weekDone(S.log, weekStart(today), weekSince(S.cycle, weekStart(today)));
  const t = totals(S.log);
  const streak = activeStreak(S.log, today);
  const week = WEEK.map((d) => {
    const n = dayProgress(d, done);
    // gold for a finished day, as on Azi and in Plan
    const cls = [weekdayIdx(today) === d.idx ? 'today' : '', n === d.blocks.length ? 'full' : ''].filter(Boolean).join(' ');
    return `<div class="${cls}"><i style="--f:${(n / d.blocks.length).toFixed(3)}"><b></b></i><span>${RO_DAYS[d.idx].slice(0, 2)}</span></div>`;
  }).join('');
  const full = WEEK.filter((d) => dayProgress(d, done) === d.blocks.length).length;
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const sleepVals = last7.map((d) => S.sleep[d] ?? 0);
  const slept = sleepVals.filter((v) => v > 0);
  const avgSleep = slept.length ? slept.reduce((a, b) => a + b, 0) / slept.length : 0;
  const stepsVals = last7.map((d) => S.steps[d] ?? 0);
  const lr = loadReport(S.log, today);
  const dm = (d: string) => `${Number(d.slice(8))}.${Number(d.slice(5, 7))}`;
  const stat = (v: number, label: string, cls = '', shown = String(v)) => `<div class="stat ${cls}"><b class="num" data-count="${Math.round(v)}">${shown}</b><span>${label}</span></div>`;
  return `<h2 class="sec first">Săptămâna asta<small>${full} din 7 zile complete</small></h2>
    <div class="week7">${week}</div>
    ${frameworkHtml(done)}
    <div class="stats">
      ${stat(streak, streak === 1 ? 'zi activă la rând' : 'zile active la rând', streak > 0 ? 'hot' : '')}
      ${stat(t.sessions, 'sesiuni în total')}
      ${stat(S.log.filter((e) => e.kind === 'workout').length, 'sesiuni de forță')}
      <div class="stat"><b class="num">${t.runKm.toFixed(1).replace('.', ',')}</b><span>km alergați</span></div>
      ${stat(Math.round(t.coldMin), 'minute la rece')}
      ${stat(Math.round(t.breathMin), 'minute de respirație')}
    </div>
    <h2 class="sec">Ultimele 12 săptămâni<small>Fiecare zi arde după minutele de antrenament: cu cât mai multe, cu atât mai fierbinte.</small></h2>
    ${fireCalendar(S.log, today)}
    <h2 class="sec">Încărcare<small>Minute × efort la fiecare sesiune, pe săptămâni${lr.usual ? `. Obișnuitul tău: ${kSteps(lr.usual)}` : ''}</small></h2>
    ${bars(lr.weeks.map((w, i) => ({ v: w.load, label: dm(w.mon), today: i === lr.weeks.length - 1 })), lr.usual ?? undefined, { fmt: kSteps, goalLabel: 'obișnuit', name: 'Încărcarea pe ultimele 6 săptămâni' })}
    <p class="small dim" style="margin:12px 0 0">${esc(loadText(lr))}</p>
    <h2 class="sec">Somn<small>${avgSleep ? `Media pe 7 zile: ${avgSleep.toFixed(1).replace('.', ',')} h` : 'Notează-l pe ecranul Azi, la „Cum ești azi?”'}</small></h2>
    ${bars(last7.map((d, i) => ({ v: sleepVals[i], label: day2(d), today: d === today })), 7, { fmt: hours, goalLabel: '7 h', name: 'Somn pe 7 zile, în ore' })}
    <h2 class="sec">Pași<small>Ținta: 10.000</small></h2>
    ${bars(last7.map((d, i) => ({ v: stepsVals[i], label: day2(d), today: d === today })), 10000, { fmt: kSteps, goalLabel: '10k', name: 'Pași pe 7 zile' })}
    ${healthRow()}`;
}

/** Istoric: the latest entries, then the whole list on its own screen. */
function logSeg(): string {
  const recent = [...ctx.S.log].reverse().slice(0, 20);
  return recent.length
    ? `<ul class="hist">${recent.map((e) => entryLine(e)).join('')}</ul><button class="btn ghost sm" data-a="history" style="margin-top:14px">Tot istoricul</button>`
    : `<div class="empty">${art('peek')}<p>Tot ce faci apare aici.</p></div>`;
}

export function progressHtml(): string {
  const seg = segOf('progress', PROGRESS_SEGS.map(([k]) => k));
  const body = seg === 'train' ? trainSeg() : seg === 'tests' ? testsHtml() : seg === 'log' ? logSeg() : weekSeg();
  return `${top()}
    ${masthead('Progres', 'Ce ai construit, săptămână de săptămână.', 'press')}
    ${segBar('Secțiuni Progres', PROGRESS_SEGS, seg)}
    <div class="seg-body" data-seg="${seg}">${body}</div>`;
}

/** The best set on every variation, newest first: the RECORD the workout player shows, kept. */
function recordsHtml(): string {
  const recs = allRecords(ctx.S.log).slice(0, 10);
  if (!recs.length) return '';
  return `<h2 class="sec">Recorduri<small>Cea mai bună serie pe fiecare variantă, la exercițiile fără greutăți</small></h2>
    <ul class="hist">${recs.map((r) => `<li><div><b>${esc(r.name)}</b><span>${r.v} ${r.sec ? 's' : 'repetări'}, ${shortDay(r.date)}</span></div></li>`).join('')}</ul>`;
}

/** The Hybrid365 framework this week: 3 runs, 3 upper lifts, 1 lower lift, 1 conditioning, as on the first slide. */
const FRAMEWORK: Array<[string, string[]]> = [
  ['Runs', ['mon-run', 'tue-thr', 'thu-run', 'sat-long']],
  ['Upper', ['mon-upper', 'wed-upper', 'fri-upper']],
  ['Lower', ['thu-lower']],
  ['Conditioning', ['wed-cond']],
];
const FRAMEWORK_GOAL: Record<string, number> = { Runs: 3, Upper: 3, Lower: 1, Conditioning: 1 };

function frameworkHtml(done: Set<string>): string {
  return `<div class="fw">${FRAMEWORK.map(([name, ids]) => {
    const goal = FRAMEWORK_GOAL[name] ?? 1;
    const n = Math.min(goal, ids.filter((id) => done.has(id)).length);
    return `<div class="fw-i${n >= goal ? ' full' : ''}"><b class="num">${n}<small>/${goal}</small></b><span>${name}</span><i style="--f:${(n / goal).toFixed(3)}"></i></div>`;
  }).join('')}</div>`;
}

/** Estimated one-rep max (Epley): a common yardstick across rep ranges, for the strength trend. */
const e1rm = (kg: number, reps: number): number => (kg > 0 && reps > 0 ? kg * (1 + reps / 30) : 0);
const kgS = (v: number): string => String(Math.round(v * 2) / 2).replace('.', ',');

/** Antrenament (since 2026-11-20): Hybrid365 strength by lift, the runs, the conditioning, the records. */
function trainSeg(): string {
  const S = ctx.S;

  // strength: per session the best set as an estimated 1RM, per lift, grouped by day
  const blocks = WORKOUTS.map((w) => {
    const lines: string[] = [];
    for (const ex of w.ex) {
      const tr = exerciseTrend(S.log, ex.id, 12);
      if (!tr.length) continue;
      const last = tr[tr.length - 1]!;
      const loaded = tr.some((x) => x.kg > 0);
      const series = loaded ? tr.map((x) => Math.round(e1rm(x.kg, x.best))) : tr.filter((x) => x.lvl === last.lvl).map((x) => x.total);
      const top = loaded ? tr.reduce((b, x) => (e1rm(x.kg, x.best) > e1rm(b.kg, b.best) ? x : b)) : null;
      const stuck = stalled(S.log, ex.id, last.lvl, last.kg) ? ' · fără progres la ultimele 3 sesiuni' : '';
      const info = loaded
        ? `Ultima: ${last.best} × ${kgS(last.kg)} kg (${shortDay(last.date)}) · cel mai bun: ${top!.best} × ${kgS(top!.kg)} kg, 1RM estimat ${kgS(e1rm(top!.kg, top!.best))} kg${stuck}`
        : `Ultima: ${last.total} repetări în total (${shortDay(last.date)})${stuck}`;
      lines.push(`<div class="ex-line"><div><b>${esc(ex.vars[last.lvl] ?? ex.name)}</b><span>${info}</span></div>${spark(series)}</div>`);
    }
    return lines.length ? `<h3 class="sub-h">${esc(WEEK.find((d) => d.blocks.some((b) => b.workout === w.id))?.title ?? w.name)}</h3>${lines.join('')}` : '';
  }).join('');

  // runs: the long run's minutes, the easy runs, the threshold sets, the pace
  const runMin = (id: string) => S.log.filter((e) => e.block === id && e.dur > 0).map((e) => Math.round(e.dur / 60)).slice(-12);
  const longs = runMin('sat-long'), easies = [...S.log.filter((e) => (e.block === 'mon-run' || e.block === 'thu-run') && e.dur > 0)].map((e) => Math.round(e.dur / 60)).slice(-12);
  const thr = S.log.filter((e) => e.block === 'tue-thr' && e.data.hiit).slice(-8);
  const runs = S.log.filter((e) => e.kind === 'run');
  const paces = runs.map((e) => Number(e.data.pace) || 0).filter((v) => v > 0).slice(-12);
  const runLine = (name: string, vals: number[], goal: string) => `<div class="ex-line"><div><b>${name}</b><span>${vals.length ? `Ultima: ${vals[vals.length - 1]} min · cea mai lungă: ${Math.max(...vals)} min · ${goal}` : `Încă nimic · ${goal}`}</span></div>${vals.length > 1 ? spark(vals) : ''}</div>`;

  // conditioning: Engine Builder times, circuit rounds, the interval sessions
  const engine = S.log.filter((e) => e.kind === 'row' && e.data.ch === 'd' && Number(e.data.meters) >= 2000).slice(-10);
  const circuits = S.log.filter((e) => e.kind === 'amrap' && e.data.circuit).slice(-10);
  const intervals = S.log.filter((e) => e.block === 'wed-cond' && e.kind === 'cardio').slice(-6);
  const bestEngine = engine.length ? Math.min(...engine.map((e) => e.dur)) : 0;

  return `<h2 class="sec first">Forță<small>Cea mai bună serie din fiecare sesiune, ca 1RM estimat (greutate × repetări). Hybrid365: întâi repetări, apoi greutate.</small></h2>
    ${blocks || '<p class="dim">După primul antrenament de upper sau lower vezi aici fiecare exercițiu, cu greutățile.</p>'}
    ${recordsHtml()}

    <h2 class="sec">Alergare<small>Zona 2 la alergările ușoare și la cea lungă; pragul marțea</small></h2>
    ${runAdvice(S.log, zone2(S.set.hrMax)) ? `<p class="small dim">${esc(runAdvice(S.log, zone2(S.set.hrMax)))}</p>` : ''}
    ${runLine('Long Run', longs, 'ținta crește spre 90 min')}
    ${runLine('Easy Runs', easies, 'luni 30→45, joi 30→40 min')}
    <div class="ex-line"><div><b>Threshold Run</b><span>${thr.length ? `Ultima: ${thr[thr.length - 1]!.data.rounds} × ${Math.round(Number(thr[thr.length - 1]!.data.work) / 60)} min (${shortDay(thr[thr.length - 1]!.date)}) · ${thr.length} sesiuni de prag` : 'Încă nimic · 4 × 6 min, apoi 5 × 6, apoi 5 × 7'}</span></div>${thr.length > 1 ? spark(thr.map((e) => Math.round(Number(e.data.workDone) / 60))) : ''}</div>
    ${paces.length > 1 ? `<p class="small dim" style="margin:10px 0 0">Ritmul mediu la alergare (mai jos e mai rapid)</p>${spark(paces, true)}` : ''}

    <h2 class="sec">Condiționare<small>Miercuri: timpii și rundele, ca să le bați</small></h2>
    <div class="ex-line"><div><b>Engine Builder 8 × 250 m</b><span>${engine.length ? `Ultima: ${mmss(engine[engine.length - 1]!.dur)} · cel mai bun: ${mmss(bestEngine)}` : 'Încă nimic · notează timpul și încearcă să-l bați'}</span></div>${engine.length > 1 ? spark(engine.map((e) => Math.round(e.dur)), true) : ''}</div>
    <div class="ex-line"><div><b>Hybrid Circuit (10 Min AMRAP)</b><span>${circuits.length ? `Ultima: ${circuits[circuits.length - 1]!.data.rounds} runde + ${circuits[circuits.length - 1]!.data.extra} · cel mai bun: ${Math.max(...circuits.map((e) => Number(e.data.rounds) || 0))} runde` : 'Încă nimic · cât mai multe runde în 10 minute'}</span></div>${circuits.length > 1 ? spark(circuits.map((e) => Number(e.data.rounds) || 0)) : ''}</div>
    ${intervals.length ? `<ul class="hist">${intervals.reverse().map((e) => entryLine(e)).join('')}</ul>` : '<p class="small dim">Norwegian 4x4, Hill Repeats și 30/30s apar aici după prima sesiune.</p>'}`;
}

export function historyHtml(): string {
  const groups = new Map<string, Entry[]>();
  for (const e of [...ctx.S.log].reverse()) {
    const g = groups.get(e.date) ?? [];
    g.push(e);
    groups.set(e.date, g);
  }
  const html = [...groups.entries()].map(([d, es]) => `<h2 class="sec day-h">${esc(prettyDay(d))}</h2><ul class="hist">${es.map((e) => entryLine(e, true)).join('')}</ul>`).join('');
  return `${top(true)}${pageHead('Istoric', `${ctx.S.log.length} ${ctx.S.log.length === 1 ? 'înregistrare' : 'înregistrări'}`)}${html || `<div class="empty">${art('peek')}<p>Gol deocamdată.</p></div>`}`;
}
