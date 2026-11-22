// "Azi": today's mission from the plan (the fight poster), the day's rounds, then the 28-day routine, sleep and your why.

import { HABIT_STEPS } from '../../data/book.ts';
import { WEEK, type Day } from '../../data/plan.ts';
import { activeStreak, cycleAt, dayProgress, deloadDue, deloadOn, lightOn, habitDone, habitGoal, habitMilestone, habitStreak, habitWeek, weekDone, weekSince } from '../../logic/progress.ts';
import { addDays, dayKey, esc, prettyDay, RO_DAYS, shortDay, weekStart, weekdayIdx, daysBetween } from '../../logic/util.ts';
import { ctx } from '../ctx.ts';
import { ic } from '../icons.ts';
import { blockCard, blockMinutes, gauge, liveBlock, top, skyCanvas, DAY_SCENE } from './shared.ts';
import { rankPlate, wolfMood } from '../show.ts';
import { repeatCard } from './plan.ts';
import { draftSets, workoutDraft } from '../players/workout.ts';
import { KNEE_STEPS, kneeAsk, legDays } from '../../logic/knee.ts';
import { readiness, sleepAvg3, type ReadyLevel } from '../../logic/ready.ts';

/** Monday–Sunday strip: how much of each day is done this week. */
export function weekStrip(today: string, active: number): string {
  const done = weekDone(ctx.S.log, weekStart(today), weekSince(ctx.S.cycle, weekStart(today)));
  const tIdx = weekdayIdx(today);
  return `<nav class="wk" aria-label="Zilele săptămânii">${WEEK.map((d) => {
    const n = dayProgress(d, done);
    const st = n === d.blocks.length ? 'full' : n > 0 ? 'part' : '';
    return `<button class="wk-d ${st} ${d.idx === active ? 'on' : ''} ${d.idx === tIdx ? 'now' : ''}" style="--f:${(n / d.blocks.length).toFixed(3)}" data-a="${d.idx === tIdx ? 'tab' : 'day'}" data-k="today" data-i="${d.idx}" aria-label="${esc(RO_DAYS[d.idx])}, ${n} din ${d.blocks.length} blocuri"${d.idx === active ? ' aria-current="date"' : ''}><span>${RO_DAYS[d.idx].slice(0, 2)}</span><i></i></button>`;
  }).join('')}</nav>`;
}


/** The stage as a fight-night broadcast (2026-11-15): the LIVE bug, the corner brackets, a light sweep, and the lower
 *  third with the day's main event: its longest block. Decoration only; the same facts are in the rows below. */
function broadcast(day: Day, n: number, total: number, tag: string, third = true): string {
  const main = [...day.blocks].sort((a, b) => blockMinutes(b) - blockMinutes(a))[0];
  if (!main) return '';
  const m = liveBlock(main);
  const cleared = n === total;
  return `<div class="bcast" aria-hidden="true">
    <i class="bc-c tl"></i><i class="bc-c tr"></i><i class="bc-c bl"></i><i class="bc-c br"></i><i class="bc-sweep"></i>
    ${wolfMood(day.idx)}
    <p class="bc-bug"><span class="bc-live${cleared ? ' off' : ''}">${cleared ? 'Final' : 'Live'}</span><b>${esc(tag)}</b></p>
    ${third ? `<div class="bc-l3"><span class="bc-tag">${cleared ? 'Gata' : 'Key session'}</span><span class="bc-name"><b>${esc(m.name)}</b><small>${esc(m.dose)}</small></span></div>` : ''}
  </div>`;
}

export function dayBody(day: Day, today: string, kicker: string, notes = ''): string {
  const done = weekDone(ctx.S.log, weekStart(today), weekSince(ctx.S.cycle, weekStart(today)));
  const n = dayProgress(day, done);
  const total = day.blocks.length;
  const mins = day.blocks.reduce((s, b) => s + blockMinutes(b), 0);
  const next = day.blocks.find((b) => !done.has(b.id));
  const c = cycleAt(ctx.S.cycle.start, today, ctx.S.cycle.repeats);
  const light = lightOn(ctx.S, today);
  // before the loop starts, the stat says when it starts instead of showing a dash
  const until = ctx.S.cycle.start ? daysBetween(today, ctx.S.cycle.start) : 0;
  const starts = until > 6 ? shortDay(ctx.S.cycle.start) : until > 0 ? RO_DAYS[weekdayIdx(ctx.S.cycle.start)] : '';
  const isToday = weekdayIdx(today) === day.idx;
  const cyc = light ? ['Ușoară', ctx.S.easy === today ? 'ziua' : 'săptămâna'] : c ? [`${c.id} · ${c.week}/4`, 'ciclul'] : starts ? [starts, 'începe ciclul'] : ['—', 'ciclul'];
  return `
    <section class="mission hero az${n === total ? ' cleared' : ''}" aria-label="Misiunea zilei">
      <div class="hero-stage az-stage" aria-hidden="true">
        ${skyCanvas(DAY_SCENE[day.idx] ?? 'summit', day.idx + 1, { fx: 0.5, fy: 0.34, base: 0.66 })}
        ${broadcast(day, n, total, c ? `Ciclul ${c.id} · ${c.week}/4` : RO_DAYS[day.idx], false)}
        ${isToday ? azClock() : ''}
        <i class="mast-hz"></i>
      </div>
      <div class="az-head">
        <p class="ms-k"><span>Today's Mission</span><b>${esc(kicker)}</b></p>
        <h1 class="ms-t"><span>${esc(day.title)}</span></h1>
      </div>
      <div class="ms-row az-hud">
        ${gauge(total ? n / total : 0, `<b class="num">${n}</b><small>/${total}</small>`, `day-${day.idx}`, 'ms-g')}
        <div class="ms-m"><b class="num">~${mins}</b><span>minute</span></div>
        <div class="ms-m"><b>${cyc[0]}</b><span>${cyc[1]}</span></div>
      </div>
      <div class="segs" role="img" aria-label="${n} din ${total} blocuri făcute">${day.blocks.map((b, i) => `<i class="${done.has(b.id) ? 'on' : b === next ? 'next' : ''}" style="--i:${i}"></i>`).join('')}</div>
      ${next
        ? `<button class="cta" data-a="start" data-b="${next.id}"><span class="cta-ic"><i class="cta-halo" aria-hidden="true"></i>${ic('play')}</span><span class="cta-l"><small>Începe · ${day.blocks.indexOf(next) + 1}/${total}</small><b>${esc(liveBlock(next).name)}</b></span><em class="cta-t"><b class="num">${blockMinutes(next)}</b>min</em><i class="cta-sheen" aria-hidden="true"></i></button>`
        : `<p class="ms-done">${ic('claw')}<span>Misiune încheiată</span></p>`}
    </section>
    ${notes}
    ${isToday ? `${briefHtml(today, done)}${readyCard(today, day.idx)}` : ''}
    ${isToday ? rankPlate() : ''}
    ${weekHead(today)}
    ${weekStrip(today, day.idx)}
    <h2 class="sec">Sesiunile zilei<small>Atinge numărul unei sesiuni ca s-o bifezi fără timer.</small></h2>
    <ol class="rds">${day.blocks.map((b, i) => blockCard(b, i + 1, today, b === next)).join('')}</ol>`;
}

/** The time and a greeting over the day's sky (2026-11-22, Azi premium); main.ts keeps the clock running. */
function azClock(): string {
  const d = new Date();
  const h = d.getHours();
  const hi = h < 5 ? 'Noapte bună' : h < 12 ? 'Bună dimineața' : h < 18 ? 'Bună ziua' : 'Bună seara';
  return `<div class="az-clock"><p class="az-greet"><i></i><span>${hi}</span></p><b class="az-time num" data-clock>${String(h).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}</b></div>`;
}

/**
 * The day's briefing (2026-11-22, the user: "vreau să fie ceva foarte premium"): a bento of three instruments, the
 * streak with the last seven days as lights, the week as a ring, and how ready you are (it opens the questions).
 */
function briefHtml(today: string, done: Set<string>): string {
  const S = ctx.S;
  const streak = activeStreak(S.log, today);
  const days = new Set(S.log.map((e) => e.date));
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
  const all = WEEK.reduce((t, d) => t + d.blocks.length, 0);
  const pct = all ? Math.round((done.size / all) * 100) : 0;
  const r = readiness(S.ready[today] ?? {}, S.sleep[today], sleepAvg3(S.sleep, today));
  const ring = (f: number, inner: string, label: string, cls = '', attrs = '') =>
    `<${attrs ? 'button' : 'div'} class="bf bf-ring ${cls}" style="--f:${f.toFixed(3)}"${attrs}><svg viewBox="0 0 48 48" aria-hidden="true"><circle class="t" cx="24" cy="24" r="20"/><circle class="v" cx="24" cy="24" r="20" pathLength="100" transform="rotate(-90 24 24)"/></svg><p>${inner}</p><span>${label}</span></${attrs ? 'button' : 'div'}>`;
  return `<section class="brief" aria-label="Rezumatul zilei">
    <div class="bf bf-streak">
      <p class="bf-k">Seria</p>
      <b class="num" data-count="${streak}">${streak}</b>
      <span>${streak === 1 ? 'zi activă' : 'zile active'} la rând</span>
      <div class="bf-dots" aria-label="Ultimele 7 zile">${last7.map((d, i) => `<i class="${days.has(d) ? 'on' : ''}${i === 6 ? ' now' : ''}" style="--i:${i}" title="${RO_DAYS[weekdayIdx(d)]}"></i>`).join('')}</div>
    </div>
    ${ring(pct / 100, `<b class="num" data-count="${pct}">${pct}</b><small>%</small>`, 'săptămâna')}
    ${r ? ring(r.score / 100, `<b class="num" data-count="${r.score}">${r.score}</b>`, 'pregătire', `lv-${r.level}`, ' data-a="ready-edit" data-k="1" aria-label="Pregătirea de azi: schimbă răspunsurile"') : `<button class="bf bf-ask" data-a="ready-edit" data-k="1" aria-label="Cum ești azi? Răspunde la trei întrebări"><b aria-hidden="true">?</b></button>`}
  </section>`;
}

/** Calories logged today in Beast Nutrition, which shares this origin. Null when that app holds nothing. */
function fuelToday(today: string): number | null {
  try {
    const raw = localStorage.getItem('beast-nutrition:v2');
    const days = raw ? (JSON.parse(raw) as { days?: Record<string, { kcal: number }[][]> }).days : null;
    return days?.[today] ? days[today].flat().reduce((s, e) => s + e.kcal, 0) : null;
  } catch {
    return null;
  }
}

/** One line above the week strip: where the week and the loop stand. */
function weekHead(today: string): string {
  const done = weekDone(ctx.S.log, weekStart(today), weekSince(ctx.S.cycle, weekStart(today)));
  const total = WEEK.reduce((s, d) => s + d.blocks.length, 0);
  const c = cycleAt(ctx.S.cycle.start, today, ctx.S.cycle.repeats);
  return `<div class="wk-head"><span class="label">Săptămâna${c ? ` · ${c.lighter ? 'ușoară, cu teste' : `ciclul ${c.id}, ${c.week} din 4`}` : ''}</span><span class="wk-c"><b class="num">${done.size}</b>/${total} blocuri</span></div>`;
}

/** Today's calories from Beast Nutrition, as a link to that app, when it holds any. */
function fuelRow(today: string): string {
  const fuel = fuelToday(today);
  if (fuel === null) return '';
  return `<a class="row-link" href="../beast-nutrition/"><span class="rl-ic">${ic('bowl')}</span><span class="rl-t"><b>Fuel</b><span>${fuel.toLocaleString('ro-RO')} kcal azi în Beast Nutrition</span></span>${ic('ext')}</a>`;
}

export function habitCard(compact = false): string {
  const today = dayKey();
  const h = ctx.S.habits.find((x) => !x.archived);
  if (!h) return '';
  const val = h.days[today] ?? 0;
  const ok = habitDone(h, today);
  const streak = habitStreak(h, today);
  const ms = habitMilestone(streak);
  const msText = ms ? HABIT_STEPS.find(([d]) => d === ms)?.[1] ?? '' : '';
  const late = !ok && new Date().getHours() >= 20;
  const dayN = Math.min(28, streak + (ok ? 0 : 1));
  const goal = habitGoal(h, today);
  // small targets count one by one; "Toate" fills the day's number in one tap
  const steps = goal <= 30 ? [-1, 1, 5] : [-10, 10, 25];
  const grow = h.prog ? `<p class="small dim" style="margin:8px 0 0">Săptămâna ${habitWeek(h, today)}: ${goal} pe zi. Crește cu ${h.prog.step} în fiecare săptămână; săptămâna viitoare ${goal + h.prog.step}.</p>` : '';
  const body =
    h.type === 'count'
      ? `<div class="habit-count num">${val}<small> / ${goal}</small></div>
         <div class="bar" style="--fill:${Math.min(1, val / goal).toFixed(3)}"><i></i></div>
         <div class="chips">${steps.map((d) => `<button class="chip" data-a="hab" data-n="${d}">${d > 0 ? '+' : '−'}${Math.abs(d)}</button>`).join('')}<button class="chip" data-a="hab-fill" ${val >= goal ? 'aria-pressed="true"' : ''}>Toate ${goal}</button></div>
         ${grow}`
      : `<button class="btn ${ok ? 'ghost' : ''}" data-a="hab-check">${ok ? 'Făcut azi' : 'Bifează azi'}</button>`;
  return `<section class="card habit ${ok ? 'lime' : ''}" aria-label="Rutina zilei">
    <div class="row"><div class="row-l"><p class="label">Rutina zilei · ziua ${dayN} din 28</p><h3>${esc(h.name)}</h3>${streak ? `<p class="small dim" style="margin:0">Serie de ${streak} ${streak === 1 ? 'zi' : 'zile'}</p>` : ''}</div>${ok ? `<span class="ok-mark">${ic('check')}</span>` : ''}</div>
    ${body}
    ${msText && ok ? `<p class="small" style="margin:12px 0 0"><b class="hl">${ms} zile.</b> ${esc(msText)}</p>` : ''}
    ${late ? '<p class="small warn-l" style="margin:12px 0 0">Nu te culca până nu e gata.</p>' : ''}
    ${compact ? '' : ''}
  </section>`;
}

let editReady = false;
/** Reopens the three questions after they were answered. */
export const setReadyEdit = (on: boolean): void => {
  editReady = on;
};

const READY_TITLE: Record<ReadyLevel, string> = { go: 'Gata de luptă', hold: 'Ține intensitatea, taie volumul', easy: 'Zi ușoară' };
const READY_REST: Record<ReadyLevel, string> = { go: 'Odihnit', hold: 'Recuperează', easy: 'Recuperează' };

/** Ten seconds before training: last night's sleep, energy, muscle freshness. Then the verdict, and on a low day the
 *  offer to run today like a day of the lighter week (see logic/ready.ts for the rules and the sources). */
export function readyCard(today: string, idx: number): string {
  const S = ctx.S;
  const note = S.ready[today] ?? {};
  const sleep = S.sleep[today];
  const r = readiness(note, sleep, sleepAvg3(S.sleep, today));
  // 2026-11-12: optional. Unanswered it is one quiet line; the questions open only when asked for.
  if (!r && !editReady) {
    // 2026-11-22: unanswered it is only the question mark in the briefing at the top
    return '';
  }
  if (!r || editReady) {
    const five = (f: 'e' | 'f', cur: number | undefined, name: string): string =>
      `<div class="chips five" role="group" aria-label="${name}">${[1, 2, 3, 4, 5].map((n) => `<button class="chip" aria-pressed="${cur === n}" data-a="ready" data-f="${f}" data-v="${n}">${n}</button>`).join('')}</div>`;
    const shown = sleep === undefined ? 'Notează' : `${String(sleep).replace('.', ',')} h`;
    return `<section class="card rdy-ask" aria-label="Pregătirea de azi">
      <p class="label">10 secunde · înainte de antrenament</p><h3>Cum ești azi?</h3>
      <div class="rdy-q"><div><b>Somn</b><span>Azi-noapte. Niciodată sub 7 ore.</span></div>
        <div class="stepper${sleep !== undefined && sleep < 7 ? ' low' : ''}${sleep === undefined ? ' unset' : ''}"><button data-a="sleep" data-d="-1" aria-label="Mai puțin somn">−</button><output>${shown}</output><button data-a="sleep" data-d="1" aria-label="Mai mult somn">+</button></div></div>
      <div class="rdy-q col"><div><b>Energie</b><span>1 stors, 5 plin de energie</span></div>${five('e', note.e, 'Energie')}</div>
      <div class="rdy-q col"><div><b>Mușchii</b><span>1 foarte febrili, 5 proaspeți</span></div>${five('f', note.f, 'Mușchii')}</div>
      <button class="btn ghost sm" style="margin-top:16px" data-a="ready-edit" data-k="0">${r ? 'Gata' : 'Închide'}</button>
    </section>`;
  }
  const trainDay = idx !== 2 && idx !== 6;
  const easyOn = S.easy === today;
  // a good day needs no card: the score is in the briefing ring
  if (r.level === 'go' && !easyOn) return '';
  const why = r.why.length ? `${r.why.join(' și ')}. `.replace(/^./, (c) => c.toUpperCase()) : '';
  const text = r.level === 'go'
    ? ''
    : !trainDay
      ? `${why}Azi e oricum zi ușoară: mergi, mănâncă bine și culcă-te devreme, ca mâine să poți duce planul întreg.`
    : r.level === 'hold'
      ? `${why}Păstrezi intensitatea, dar sari exercițiile opționale și te oprești cu o repetare mai devreme.`
      : `${why}Azi câștigi mai mult din varianta ușoară: aceleași blocuri și aceleași greutăți, cam două treimi din volum.`;
  const offer = trainDay && !deloadOn(S.deload, today) && r.level !== 'go' && !easyOn
    ? `<div class="btn-row"><button class="btn ${r.level === 'easy' ? '' : 'ghost '}sm" data-a="easy-day" data-k="1">Fă varianta ușoară azi</button></div>`
    : '';
  const on = easyOn
    ? '<p class="small" style="margin:12px 0 0"><b class="hl">Zi ușoară pornită.</b> Seriile, rundele și timpul scad la două treimi; sesiunile de azi nu se numără la progres.</p><button class="link" data-a="easy-day" data-k="0">Revin la planul întreg</button>'
    : '';
  return `<section class="card rdy-v lv-${r.level}" aria-label="Pregătirea de azi">
    <div class="row"><div class="row-l"><p class="label">Pregătirea de azi</p><h3>${(trainDay ? READY_TITLE : READY_REST)[r.level]}</h3>${r.level === 'go' && trainDay ? '<p class="small dim" style="margin:6px 0 0">Planul întreg, la intensitatea scrisă.</p>' : ''}</div><div class="rdy-n"><b class="num">${r.score}</b><span>din 100</span></div></div>
    <div class="bar" style="--fill:${(r.score / 100).toFixed(3)}"><i></i></div>
    ${text ? `<p class="small" style="margin:10px 0 0">${esc(text)}</p>` : ''}${offer}${on}
    <button class="link" data-a="ready-edit" data-k="1">Schimbă răspunsurile</button></section>`;
}


/** The 4th week of every emphasis: the lighter week with the tests, proposed; and the reminder while it is on. */
function deloadCard(today: string): string {
  if (deloadOn(ctx.S.deload, today)) return '<section class="card lime"><p class="label">Săptămâna 4</p><h3>Săptămâna ușoară și testele</h3><p class="small dim">Aceleași blocuri, cu aproximativ 2/3 din serii, runde și timp, aceleași greutăți. Testele le faci la începutul săptămânii, cât ești odihnit. Nimic din săptămâna asta nu se numără la progres.</p><button class="btn ghost sm" data-a="tab" data-k="progress" data-to="tests">Teste</button></section>';
  if (!deloadDue(ctx.S.deload, ctx.S.cycle.start, today, ctx.S.cycle.repeats)) return '';
  const c = cycleAt(ctx.S.cycle.start, today, ctx.S.cycle.repeats);
  return `<section class="card lime"><p class="label">Săptămâna 4</p><h3>Ușoară și cu teste</h3><p class="small">Închei trei săptămâni de ${esc((c?.name ?? '').toLowerCase())}. Propun o săptămână cu aceleași blocuri, dar cu aproximativ 2/3 din serii și runde, plus testele, ca să vezi ce ai câștigat și să pornești odihnit în ciclul următor.</p><div class="btn-row"><button class="btn sm" data-a="deload" data-k="1">Accept</button><button class="btn ghost sm" data-a="deload" data-k="0">Nu acum</button></div></section>`;
}

/** A workout the phone closed mid-way: every ticked set was kept, so it can go on or be saved. */
function draftCard(): string {
  const d = workoutDraft();
  if (!d || !draftSets(d)) return '';
  const n = draftSets(d);
  const when = new Date(d.start);
  const day = dayKey(when) === dayKey() ? 'azi' : RO_DAYS[weekdayIdx(dayKey(when))].toLowerCase();
  return `<section class="card lime" aria-label="Antrenament neterminat"><p class="label">Antrenament neterminat</p><h3>${esc(d.name)}</h3>
    <p class="small dim">${n} ${n === 1 ? 'serie bifată' : 'serii bifate'}, început ${day}. Fiecare serie s-a păstrat pe telefon.</p>
    <div class="btn-row"><button class="btn sm" data-a="draft-go">Continuă</button><button class="btn ghost sm" data-a="draft-save">Salvează ce am făcut</button></div>
    <button class="link" data-a="draft-drop">Renunță la el</button></section>`;
}

/** The knee note after Leg Day: during the session (if it was skipped at the end) and the next morning. */
function kneeCard(today: string): string {
  const ask = kneeAsk(legDays(ctx.S.log, ctx.S.knee), today);
  if (!ask) return '';
  const day = ask.date === today ? 'azi' : RO_DAYS[weekdayIdx(ask.date)].toLowerCase();
  const q = ask.field === 'm' ? `Genunchii azi-dimineață, după Leg Day-ul de ${day}` : `Genunchii la Leg Day-ul de ${day}`;
  return `<section class="card knee-card" aria-label="Genunchii"><p class="label">5 secunde</p><h3>${esc(q)}</h3>
    <div class="chips knee">${KNEE_STEPS.map(([v, l]) => `<button class="chip" data-a="knee" data-d="${ask.date}" data-f="${ask.field}" data-v="${v}">${l}</button>`).join('')}</div>
    <p class="small dim" style="margin:10px 0 0">Din notele astea aplicația știe când pot reveni săriturile: Box Jump după trei Leg Day-uri la rând fără durere.</p></section>`;
}

function introCard(): string {
  let seen = false;
  try {
    seen = localStorage.getItem('beast:intro') === '1';
  } catch {
    seen = false;
  }
  if (ctx.S.log.length || seen) return '';
  return `<section class="card lime"><p class="label">Bine ai venit</p><h3>Cum merge</h3><p>Planul Hybrid365 e împărțit pe zile: 3 alergări, 3 zile de upper, 1 de lower și o condiționare. Apeși Start la fiecare sesiune: timerul și seriile se salvează singure în Progres.</p><p class="dim small">Dacă ai făcut un bloc fără aplicație, apeși pe numărul lui și îl bifezi.</p><button class="link" data-a="intro-ok">Am înțeles</button></section>`;
}

export function todayHtml(): string {
  const today = dayKey();
  const idx = weekdayIdx(today);
  const day = WEEK[idx];
  return `${top()}
    ${dayBody(day, today, prettyDay(today), `${draftCard()}${kneeCard(today)}${introCard()}${deloadCard(today)}${repeatCard(today)}`)}
    ${habitCard() || fuelRow(today) ? `<h2 class="sec">Zilnic</h2>${habitCard()}${fuelRow(today)}` : ''}
`;
}

export function dayViewHtml(idx: number): string {
  const today = dayKey();
  const day = WEEK[idx];
  const isToday = weekdayIdx(today) === idx;
  return `${top(true)}${dayBody(day, today, isToday ? `Azi, ${RO_DAYS[idx].toLowerCase()}` : `${RO_DAYS[idx]} în plan`)}
  ${isToday ? '' : '<p class="small dim" style="margin-top:14px">Poți face orice zi din săptămână; bifele se adună pe săptămâna curentă.</p>'}`;
}
