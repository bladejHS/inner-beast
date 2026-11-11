// "Progres" in four sections: Săptămâna (the week, totals, sleep, steps), Antrenament (box, calisthenics, aerobic),
// Teste (the test battery and the challenges) and Istoric (the latest entries; the full list opens on its own screen).

import { WEEK } from '../../data/plan.ts';
import { BW_SCHEMES, EMOM_GOAL, WORKOUTS } from '../../data/workouts.ts';
import { activeStreak, allRecords, amrapBest, amrapTrend, dayProgress, exerciseTrend, stalled, totals, variationPath, weekDone } from '../../logic/progress.ts';
import { runAdvice, zone2 } from '../../logic/runlog.ts';
import { KNEE_RUN, kneeStreak, legDays } from '../../logic/knee.ts';
import { loadReport, loadText } from '../../logic/ready.ts';
import type { Entry } from '../../logic/store.ts';
import { addDays, dayKey, esc, km, mmss, raceTime, num, paceStr, prettyDay, RO_DAYS, shortDay, weekStart, weekdayIdx } from '../../logic/util.ts';
import { bars, spark } from '../charts.ts';
import { ctx } from '../ctx.ts';
import { art } from '../art.ts';
import { ic } from '../icons.ts';
import { pageHead, segBar, segOf, top } from './shared.ts';
import { boxCycle, boxScore, boxStats } from '../../logic/boxstats.ts';
import { COMBOS } from '../../data/combos.ts';
import { bestOf, TESTS, UNIT_LABEL, type FitTest } from '../../data/tests.ts';
import { learned } from './alex.ts';
import { goalHtml } from './goal.ts';

/** A test result in its unit: 10:59, 34 cm, 41 repetări. */
export function testValue(t: FitTest, v: number): string {
  return t.unit === 'time' ? mmss(v) : `${String(v).replace('.', ',')} ${UNIT_LABEL[t.unit]}`;
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
  return `${goalHtml(dayKey())}<h2 class="sec" id="tests">Teste<small>În săptămâna ușoară, odihnit: puterea întâi, alergarea la final</small></h2><ul class="hist tests">${rows.join('')}</ul>`;
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

function boxHtml(today: string): string {
  const b = boxStats(ctx.S.log, today);
  if (!b.rounds && !b.punches) return '<h2 class="sec first">Kickboxing</h2><p class="dim">După primele runde vezi aici statisticile.</p>';
  const diff = Math.round(b.min30 - b.minPrev30);
  const known = learned();
  const cy = boxCycle(ctx.S.log, today);
  const rare = COMBOS.filter((c) => known.has(c.id)).sort((x, y) => (b.called[x.name] ?? 0) - (b.called[y.name] ?? 0)).slice(0, 3);
  return `<h2 class="sec first">Kickboxing<small>Ultimele 30 de zile: ${Math.round(b.min30)} min, ${diff >= 0 ? '+' : '−'}${Math.abs(diff)} față de cele 30 dinainte</small></h2>
    <div class="stats">
      <div class="stat"><b>${b.rounds}</b><span>runde în total</span></div>
      <div class="stat"><b>${Math.round(b.bagMin)}</b><span>minute la sac</span></div>
      <div class="stat"><b>${Math.round(b.shadowMin)}</b><span>minute de shadow</span></div>
      <div class="stat"><b>${known.size} din ${COMBOS.length}</b><span>combinații învățate</span></div>
      ${b.punches ? `<div class="stat"><b>${b.punches}</b><span>lovituri numărate cu camera</span></div>` : ''}
    </div>
    ${cy
      ? `<div class="ex-line"><div><b>Scor de kickboxing, săptămâna ${cy.week} din 8</b><span>Ținta la săptămâna ${cy.check}: ${cy.target}. Acum: ${cy.now ?? '–'}, ai pornit de la ${cy.base}.</span></div>${spark(cy.scores)}</div>`
      : '<p class="small dim">Notează tehnica și efortul la finalul a 3 sesiuni și primești scorul de kickboxing, cu ținte la săptămânile 4 și 8.</p>'}
    ${b.guard.length > 1 ? `<p class="small dim" style="margin-bottom:0">Garda sus, % din timp</p>${spark(b.guard)}` : ''}
    ${rare.length ? `<p class="small dim">Exersate cel mai rar dintre cele învățate: ${rare.map((c) => esc(c.name)).join(', ')}.</p>` : ''}`;
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
  const done = weekDone(S.log, weekStart(today));
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
    <div class="stats">
      ${stat(streak, streak === 1 ? 'zi activă la rând' : 'zile active la rând', streak > 0 ? 'hot' : '')}
      ${stat(t.sessions, 'sesiuni în total')}
      ${stat(Math.round(t.boxingMin), 'minute de runde')}
      <div class="stat"><b class="num">${t.runKm.toFixed(1).replace('.', ',')}</b><span>km alergați</span></div>
      ${stat(Math.round(t.coldMin), 'minute la rece')}
      ${stat(Math.round(t.breathMin), 'minute de respirație')}
    </div>
    <h2 class="sec">Încărcare<small>Minute × efort la fiecare sesiune, pe săptămâni${lr.usual ? `. Obișnuitul tău: ${kSteps(lr.usual)}` : ''}</small></h2>
    ${bars(lr.weeks.map((w, i) => ({ v: w.load, label: dm(w.mon), today: i === lr.weeks.length - 1 })), lr.usual ?? undefined, { fmt: kSteps, goalLabel: 'obișnuit', name: 'Încărcarea pe ultimele 6 săptămâni' })}
    <p class="small dim" style="margin:12px 0 0">${esc(loadText(lr))}</p>
    <h2 class="sec">Somn<small>${avgSleep ? `Media pe 7 zile: ${avgSleep.toFixed(1).replace('.', ',')} h` : 'Notează-l pe ecranul Azi, la „Cum ești azi?”'}</small></h2>
    ${bars(last7.map((d, i) => ({ v: sleepVals[i], label: day2(d), today: d === today })), 7, { fmt: hours, goalLabel: '7 h', name: 'Somn pe 7 zile, în ore' })}
    <h2 class="sec">Pași<small>Ținta: 10.000</small></h2>
    ${bars(last7.map((d, i) => ({ v: stepsVals[i], label: day2(d), today: d === today })), 10000, { fmt: kSteps, goalLabel: '10k', name: 'Pași pe 7 zile' })}`;
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
    ${pageHead('Progres', 'Ce ai construit, săptămână de săptămână.')}
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

/** Antrenament: boxing, calisthenics and the aerobic work. */
function trainSeg(): string {
  const S = ctx.S;
  const today = dayKey();

  // calisthenics
  const exLines: string[] = [];
  for (const w of WORKOUTS) {
    for (const ex of w.ex) {
      if (ex.type === 'emom' || ex.type === 'done') continue;
      const tr = exerciseTrend(S.log, ex.id, 12);
      if (!tr.length) continue;
      const last = tr[tr.length - 1];
      const unit = ex.type === 'time' || ex.id === 'hang' ? ' s' : '';
      const same = tr.filter((x) => x.lvl === last.lvl);
      const kg = Math.max(...same.map((x) => x.kg));
      const best = ex.type === 'ytw' ? `${last.total} × 5-5-5 data trecută` : `Cel mai bun: ${Math.max(...same.filter((x) => x.kg === kg).map((x) => x.best))}${unit}${kg ? ` cu ${String(kg).replace('.', ',')} kg` : ''}`;
      const path = variationPath(S.log, ex.id);
      const road = path.length > 1 ? `, drumul: ${path.map((p) => `${esc(ex.vars[p.lvl] ?? '')} (${shortDay(p.date)})`).join(', ')}` : '';
      const stuck = ex.type !== 'ytw' && stalled(S.log, ex.id, last.lvl, last.kg) ? ', fără progres la ultimele 3 sesiuni' : '';
      exLines.push(`<div class="ex-line"><div><b>${esc(ex.vars[last.lvl] ?? ex.name)}</b><span>${best}, ultima dată ${shortDay(last.date)}${road}${stuck}</span></div>${spark(same.map((x) => x.total))}</div>`);
    }
  }
  const emomPct = Math.round(((S.emom.min * S.emom.reps) / (EMOM_GOAL.min * EMOM_GOAL.reps)) * 100);
  const amraps = S.log.filter((e) => e.kind === 'amrap');
  const sch = S.set.bwScheme;
  const amBest = amrapBest(S.log, sch);

  // runs and easy cardio
  const runs = S.log.filter((e) => e.kind === 'run');
  const aerobic = S.log.filter((e) => e.kind === 'run' || e.kind === 'cardio');
  const paces = runs.map((e) => Number(e.data.pace) || 0).filter((p) => p > 0).slice(-12);

  return `${boxHtml(today)}

    <h2 class="sec">Calistenie<small>Totalul de repetări pe sesiune, la varianta curentă</small></h2>
    <div class="ex-line"><div><b>Pull-up EMOM</b><span>Următoarea țintă: ${S.emom.min} min × ${S.emom.reps}. Spre ${EMOM_GOAL.min} × ${EMOM_GOAL.reps}: ${emomPct}%.</span></div><div class="bar" style="margin:0;--fill:${Math.min(1, emomPct / 100).toFixed(3)}"><i></i></div></div>
    ${amraps.length ? `<div class="ex-line"><div><b>Bodyweight Workout</b><span>Ultima dată ${amraps[amraps.length - 1].data.rounds} runde${amBest ? `, recordul la ${esc(BW_SCHEMES[sch].name)}: ${amBest.data.rounds} runde + ${amBest.data.extra}` : ''}</span></div>${spark(amrapTrend(S.log, sch))}</div>` : ''}
    ${exLines.join('') || '<p class="dim">După primul antrenament de push, pull sau picioare vezi aici fiecare exercițiu.</p>'}
    ${recordsHtml()}
    ${kneeLine()}

    <h2 class="sec">Aerob<small>Alergarea de duminică și canotajul de marți, ușor</small></h2>
    ${runAdvice(S.log, zone2(S.set.hrMax)) ? `<p class="small dim">${esc(runAdvice(S.log, zone2(S.set.hrMax)))}</p>` : ''}
    ${aerobic.length ? `${paces.length > 1 ? `<p class="small dim" style="margin:0">Ritmul mediu la alergare (mai jos e mai rapid)</p>${spark(paces, true)}` : ''}<ul class="hist">${aerobic.slice(-6).reverse().map((e) => entryLine(e)).join('')}</ul>` : '<p class="dim">Duminică: alergare ușoară, de la 20 la 30 de minute. Marți: canotaj ușor.</p>'}`;
}

/** The knees after Leg Day: the last notes and how far the jumps are. */
function kneeLine(): string {
  const days = legDays(ctx.S.log, ctx.S.knee);
  const noted = days.filter((l) => l.d !== undefined).slice(0, 6);
  if (!noted.length) return '';
  const { clean, jump } = kneeStreak(days);
  const lvl = ctx.S.lvl.cmj ?? 0;
  const next = lvl === 0 ? `Box Jump: ${Math.min(clean, KNEE_RUN)} din ${KNEE_RUN} Leg Day-uri la rând fără durere` : lvl === 1 ? `Countermovement Jump: ${Math.min(jump, KNEE_RUN)} din ${KNEE_RUN} cu Box Jump fără durere` : 'Săriturile sunt înapoi';
  const notes = noted.map((l) => `${shortDay(l.date)}: ${l.d}/10${l.m !== undefined ? `, dimineața ${l.m}/10` : ''}`).join('; ');
  return `<div class="ex-line"><div><b>Genunchii după Leg Day</b><span>${esc(next)}. ${esc(notes)}.</span></div>${spark([...noted].reverse().map((l) => Math.max(l.d ?? 0, l.m ?? 0)), true)}</div>`;
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
