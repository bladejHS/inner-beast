// "Progres": the week, totals, calisthenics, runs, Wim Hof, sleep, steps and the full history.

import { WEEK } from '../../data/plan.ts';
import { EMOM_GOAL, WORKOUTS } from '../../data/workouts.ts';
import { activeStreak, dayProgress, exerciseTrend, totals, weekDone } from '../../logic/progress.ts';
import type { Entry } from '../../logic/store.ts';
import { addDays, dayKey, esc, km, mmss, num, paceStr, prettyDay, RO_DAYS, shortDay, weekStart, weekdayIdx } from '../../logic/util.ts';
import { bars, spark } from '../charts.ts';
import { ctx } from '../ctx.ts';
import { ic } from '../icons.ts';
import { top } from './shared.ts';

function entryLine(e: Entry, del = false): string {
  const d = e.data as Record<string, unknown>;
  let what = '';
  switch (e.kind) {
    case 'rounds':
      what = d.manual ? 'bifat manual' : `${d.rounds} din ${d.planned} runde, ${mmss(Number(d.workDone) || 0)} lucru`;
      break;
    case 'amrap':
      what = `${d.rounds} runde + ${d.extra} repetări`;
      break;
    case 'workout': {
      const ex = (d.ex as Array<{ name: string; sets: Array<number | null> }>) || [];
      what = d.manual ? 'bifat manual' : `${ex.length} exerciții, ${ex.reduce((s, x) => s + x.sets.filter((v) => v !== null).length, 0)} serii`;
      break;
    }
    case 'run':
      what = d.manual && !d.m ? `${mmss(e.dur)}` : `${km(Number(d.m) || 0)} km în ${mmss(e.dur)}, ${paceStr(Number(d.pace) || 0)} /km`;
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
  }
  if (d.manual && e.kind !== 'run' && e.kind !== 'walk') what = 'bifat manual';
  return `<li><div><b>${esc(e.name)}</b><span>${shortDay(e.date)}${what ? `, ${esc(what)}` : ''}${e.block ? '' : ', în afara planului'}</span></div>${del ? `<button class="icon-btn" data-a="hist-del" data-id="${e.id}" aria-label="Șterge">${ic('trash')}</button>` : ''}</li>`;
}

export function progressHtml(): string {
  const S = ctx.S;
  const today = dayKey();
  const mon = weekStart(today);
  const done = weekDone(S.log, mon);
  const t = totals(S.log);
  const streak = activeStreak(S.log, today);
  const week = WEEK.map((d) => {
    const n = dayProgress(d, done);
    return `<div class="${weekdayIdx(today) === d.idx ? 'today' : ''}"><i><b style="height:${((n / d.blocks.length) * 100).toFixed(0)}%"></b></i><span>${RO_DAYS[d.idx].slice(0, 2)}</span></div>`;
  }).join('');
  const full = WEEK.filter((d) => dayProgress(d, done) === d.blocks.length).length;

  // calisthenics
  const exLines: string[] = [];
  for (const w of WORKOUTS) {
    for (const ex of w.ex) {
      if (ex.type === 'emom') continue;
      const tr = exerciseTrend(S.log, ex.id, 12);
      if (!tr.length) continue;
      const last = tr[tr.length - 1];
      const unit = ex.type === 'time' || ex.id === 'hang' ? ' s' : '';
      const same = tr.filter((x) => x.lvl === last.lvl);
      const best = ex.type === 'ytw' ? `${last.total} × 5-5-5 data trecută` : `Cel mai bun: ${Math.max(...same.map((x) => x.best))}${unit}`;
      exLines.push(`<div class="ex-line"><div><b>${esc(ex.vars[last.lvl] ?? ex.name)}</b><span>${best}, ultima dată ${shortDay(last.date)}</span></div>${spark(same.map((x) => x.total))}</div>`);
    }
  }
  const emomPct = Math.round(((S.emom.min * S.emom.reps) / (EMOM_GOAL.min * EMOM_GOAL.reps)) * 100);
  const amraps = S.log.filter((e) => e.kind === 'amrap');
  const amrapBest = amraps.reduce((m, e) => Math.max(m, Number(e.data.rounds) || 0), 0);

  // runs
  const runs = S.log.filter((e) => e.kind === 'run');
  const paces = runs.map((e) => Number(e.data.pace) || 0).filter((p) => p > 0).slice(-12);

  // wim hof
  const wh = S.log.filter((e) => e.kind === 'wimhof').slice(-10);

  // sleep & steps
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const sleepVals = last7.map((d) => S.sleep[d] ?? 0);
  const slept = sleepVals.filter((v) => v > 0);
  const avgSleep = slept.length ? slept.reduce((a, b) => a + b, 0) / slept.length : 0;
  const stepsVals = last7.map((d) => S.steps[d] ?? 0);

  const recent = [...S.log].reverse().slice(0, 12);

  return `${top()}
    <h1 class="stack">Progres</h1>
    <h2 class="sec">Săptămâna asta<small>${full} din 7 zile complete</small></h2>
    <div class="week7">${week}</div>
    <div class="stats" style="margin-top:14px">
      <div class="stat"><b>${streak}</b><span>${streak === 1 ? 'zi activă la rând' : 'zile active la rând'}</span></div>
      <div class="stat"><b>${t.sessions}</b><span>sesiuni în total</span></div>
      <div class="stat"><b>${Math.round(t.boxingMin)}</b><span>minute de runde</span></div>
      <div class="stat"><b>${t.runKm.toFixed(1).replace('.', ',')}</b><span>km alergați</span></div>
      <div class="stat"><b>${Math.round(t.coldMin)}</b><span>minute la rece</span></div>
      <div class="stat"><b>${t.bestHold ? mmss(t.bestHold) : '–'}</b><span>retenție record</span></div>
    </div>

    <h2 class="sec">Calistenie<small>Totalul de repetări pe sesiune, la varianta curentă</small></h2>
    <div class="ex-line"><div><b>Pull-up EMOM</b><span>Următoarea țintă: ${S.emom.min} min × ${S.emom.reps}. Spre 30 × 10: ${emomPct}%.</span></div><div class="bar" style="margin:0"><i style="width:${Math.min(100, emomPct)}%"></i></div></div>
    ${amraps.length ? `<div class="ex-line"><div><b>Bodyweight Workout</b><span>Ultima dată ${amraps[amraps.length - 1].data.rounds} runde, recordul ${amrapBest}</span></div>${spark(amraps.slice(-12).map((e) => Number(e.data.rounds) || 0))}</div>` : ''}
    ${exLines.join('') || '<p class="dim">După primul antrenament de push, pull sau picioare vezi aici fiecare exercițiu.</p>'}

    <h2 class="sec">Alergare</h2>
    ${runs.length ? `${paces.length > 1 ? `<p class="small dim" style="margin:0">Ritmul mediu (mai jos e mai rapid)</p>${spark(paces, true)}` : ''}<ul class="hist">${runs.slice(-6).reverse().map((e) => entryLine(e)).join('')}</ul>` : '<p class="dim">Duminică: 20 de minute de jogging, cu GPS.</p>'}

    <h2 class="sec">Wim Hof<small>Cea mai lungă retenție din fiecare sesiune</small></h2>
    ${wh.length ? bars(wh.map((e) => ({ v: Math.max(...((e.data.holds as number[]) || [0])), label: shortDay(e.date).split(' ')[0] })), undefined, 120) : '<p class="dim">Fără sesiuni încă.</p>'}

    <h2 class="sec">Somn<small>${avgSleep ? `Media pe 7 zile: ${avgSleep.toFixed(1).replace('.', ',')} h` : 'Notează-l pe ecranul Azi'}</small></h2>
    ${bars(last7.map((d, i) => ({ v: sleepVals[i], label: RO_DAYS[weekdayIdx(d)].slice(0, 2) })), 7)}

    <h2 class="sec">Pași<small>Ținta: 10.000</small></h2>
    ${bars(last7.map((d, i) => ({ v: stepsVals[i], label: RO_DAYS[weekdayIdx(d)].slice(0, 2) })), 10000)}

    <h2 class="sec">Istoric</h2>
    ${recent.length ? `<ul class="hist">${recent.map((e) => entryLine(e)).join('')}</ul><button class="btn ghost sm" data-a="history" style="margin-top:12px">Tot istoricul</button>` : '<p class="dim">Tot ce faci apare aici.</p>'}`;
}

export function historyHtml(): string {
  const groups = new Map<string, Entry[]>();
  for (const e of [...ctx.S.log].reverse()) {
    const g = groups.get(e.date) ?? [];
    g.push(e);
    groups.set(e.date, g);
  }
  const html = [...groups.entries()].map(([d, es]) => `<h2 class="sec" style="font-size:19px;margin:24px 0 6px">${esc(prettyDay(d))}</h2><ul class="hist">${es.map((e) => entryLine(e, true)).join('')}</ul>`).join('');
  return `${top(true)}<h1 class="stack mid">Istoric</h1>${html || '<p class="dim">Gol deocamdată.</p>'}`;
}
