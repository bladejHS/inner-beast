// "Azi": today's mission from the plan (the fight poster), the day's rounds, then the 28-day routine, sleep and your why.

import { HABIT_STEPS } from '../../data/book.ts';
import { WEEK, type Day } from '../../data/plan.ts';
import { cycleAt, dayProgress, deloadDue, deloadOn, habitDone, habitGoal, habitMilestone, habitStreak, habitWeek, weekDone } from '../../logic/progress.ts';
import { dayKey, esc, prettyDay, RO_DAYS, weekStart, weekdayIdx, daysBetween } from '../../logic/util.ts';
import { ctx } from '../ctx.ts';
import { ic } from '../icons.ts';
import { dayPhoto } from '../art.ts';
import { rake } from '../claws.ts';
import { blockCard, blockMinutes, gauge, liveBlock, top } from './shared.ts';
import { draftSets, workoutDraft } from '../players/workout.ts';
import { KNEE_STEPS, kneeAsk, legDays } from '../../logic/knee.ts';
import { weekCard } from './alex.ts';

/** Monday–Sunday strip: how much of each day is done this week. */
export function weekStrip(today: string, active: number): string {
  const done = weekDone(ctx.S.log, weekStart(today));
  const tIdx = weekdayIdx(today);
  return `<nav class="wk" aria-label="Zilele săptămânii">${WEEK.map((d) => {
    const n = dayProgress(d, done);
    const st = n === d.blocks.length ? 'full' : n > 0 ? 'part' : '';
    return `<button class="wk-d ${st} ${d.idx === active ? 'on' : ''} ${d.idx === tIdx ? 'now' : ''}" style="--f:${(n / d.blocks.length).toFixed(3)}" data-a="${d.idx === tIdx ? 'tab' : 'day'}" data-k="today" data-i="${d.idx}" aria-label="${esc(RO_DAYS[d.idx])}, ${n} din ${d.blocks.length} blocuri"${d.idx === active ? ' aria-current="date"' : ''}><span>${RO_DAYS[d.idx].slice(0, 2)}</span><i></i></button>`;
  }).join('')}</nav>`;
}

/** Embers that drift up behind the day's title. Fixed positions, so a redraw does not make them jump. */
const EMBERS: Array<[number, number, number, number]> = [
  [8, 0, 5.2, 3], [19, 1.6, 6.4, 2], [31, 3.1, 4.8, 3], [44, 0.8, 5.8, 2], [57, 2.4, 6.9, 3],
  [66, 4.2, 5.1, 2], [74, 1.1, 6.2, 3], [83, 3.6, 4.6, 2], [91, 0.4, 5.6, 3], [52, 5.1, 6.6, 2],
];
const embers = (): string =>
  `<div class="ms-embers" aria-hidden="true">${EMBERS.map(([x, d, s, z]) => `<i style="--x:${x}%;--d:${d}s;--s:${s}s;--z:${z}px"></i>`).join('')}</div>`;

export function dayBody(day: Day, today: string, kicker: string): string {
  const done = weekDone(ctx.S.log, weekStart(today));
  const n = dayProgress(day, done);
  const total = day.blocks.length;
  const mins = day.blocks.reduce((s, b) => s + blockMinutes(b), 0);
  const next = day.blocks.find((b) => !done.has(b.id));
  const c = cycleAt(ctx.S.cycle.start, today);
  const light = deloadOn(ctx.S.deload, today);
  const cyc = light ? ['Ușoară', 'săptămâna'] : c ? [`${c.id} · ${c.week}/4`, 'ciclul'] : ['—', 'ciclul'];
  return `
    <section class="mission${n === total ? ' cleared' : ''}" aria-label="Misiunea zilei">
      <div class="ms-ph">${dayPhoto(day.idx, 'ms-img')}</div>
      ${embers()}
      ${rake('ms-rake')}
      <p class="ms-k"><span>Today's Mission</span><b>${esc(kicker)}</b></p>
      <h1 class="ms-t"><span>${esc(day.title)}</span></h1>
      <div class="ms-row">
        ${gauge(total ? n / total : 0, `<b class="num">${n}</b><small>/${total}</small>`, `day-${day.idx}`, 'ms-g')}
        <div class="ms-m"><b class="num">~${mins}</b><span>minute</span></div>
        <div class="ms-m"><b>${cyc[0]}</b><span>${cyc[1]}</span></div>
      </div>
      <div class="segs" role="img" aria-label="${n} din ${total} blocuri făcute">${day.blocks.map((b, i) => `<i class="${done.has(b.id) ? 'on' : b === next ? 'next' : ''}" style="--i:${i}"></i>`).join('')}</div>
      ${next
        ? `<button class="cta" data-a="start" data-b="${next.id}"><span class="cta-ic">${ic('play')}</span><span class="cta-l"><small>Începe</small><b>${esc(liveBlock(next).name)}</b></span><i class="cta-sheen" aria-hidden="true"></i></button>`
        : `<p class="ms-done">${ic('claw')}<span>Misiune încheiată</span></p>`}
    </section>
    ${weekHead(today)}
    ${weekStrip(today, day.idx)}
    <h2 class="sec">Rundele zilei<small>Atinge numărul unei runde ca s-o bifezi fără timer.</small></h2>
    <ol class="rds">${day.blocks.map((b, i) => blockCard(b, i + 1, today, b === next)).join('')}</ol>`;
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
  const done = weekDone(ctx.S.log, weekStart(today));
  const total = WEEK.reduce((s, d) => s + d.blocks.length, 0);
  const c = cycleAt(ctx.S.cycle.start, today);
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
  const h = ctx.S.habits.find((x) => !x.archived) ?? ctx.S.habits[0];
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

export function sleepCard(): string {
  const today = dayKey();
  const v = ctx.S.sleep[today];
  const shown = v === undefined ? 'Notează' : `${String(v).replace('.', ',')} h`;
  return `<section class="card" aria-label="Somn">
    <div class="row"><div class="row-l"><p class="label">Azi-noapte</p><h3>Somn</h3><p class="small dim" style="margin:0">Niciodată sub 7 ore.</p></div>
    <div class="stepper${v !== undefined && v < 7 ? ' low' : ''}${v === undefined ? ' empty' : ''}"><button data-a="sleep" data-d="-1" aria-label="Mai puțin">−</button><output>${shown}</output><button data-a="sleep" data-d="1" aria-label="Mai mult">+</button></div></div>
  </section>`;
}

function whyCard(): string {
  const w = ctx.S.why;
  const lines = [w.winner, w.victim, w.drive].filter((s) => s.trim());
  if (!lines.length) {
    return `<section class="card why"><p class="label">De ce-ul tău</p><p class="why-quote">„Găsește-ți de ce-ul și îți vei găsi succesul.”</p><p class="small dim">Scrie de ce faci asta; îl vezi aici în fiecare zi.</p><button class="btn ghost sm" data-a="tab" data-k="mind" data-to="why">Scrie-l</button></section>`;
  }
  const pick = lines[daysBetween('2026-01-01', dayKey()) % lines.length] ?? lines[0];
  return `<section class="card why"><p class="label">De ce-ul tău</p><p class="why-quote">${esc(pick)}</p></section>`;
}

function dailyCard(): string {
  return `<section class="card"><div class="row"><div class="row-l"><p class="label">10 minute · opțional</p><h3>Mobilitate zilnică</h3><p class="small dim" style="margin:0">Alex face mobilitate în fiecare zi ca să rămână rapid.</p></div><button class="go" data-a="tool" data-k="daily" aria-label="Start mobilitate zilnică">${ic('play')}</button></div></section>`;
}

/** The 4th week of every emphasis: the lighter week with the tests, proposed; and the reminder while it is on. */
function deloadCard(today: string): string {
  if (deloadOn(ctx.S.deload, today)) return '<section class="card lime"><p class="label">Săptămâna 4</p><h3>Săptămâna ușoară și testele</h3><p class="small dim">Aceleași blocuri, cu aproximativ 2/3 din serii, runde și timp, aceleași greutăți. Testele le faci la începutul săptămânii, cât ești odihnit. Nimic din săptămâna asta nu se numără la progres.</p><button class="btn ghost sm" data-a="tab" data-k="progress" data-to="tests">Teste</button></section>';
  if (!deloadDue(ctx.S.deload, ctx.S.cycle.start, today)) return '';
  const c = cycleAt(ctx.S.cycle.start, today);
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
  return `<section class="card lime"><p class="label">Bine ai venit</p><h3>Cum merge</h3><p>Planul din carte e împărțit pe zile. Apeși Start la fiecare rundă: timerul, combinațiile și seriile se salvează singure în Progres.</p><p class="dim small">Dacă ai făcut un bloc fără aplicație, apeși pe numărul lui și îl bifezi.</p><button class="link" data-a="intro-ok">Am înțeles</button></section>`;
}

export function todayHtml(): string {
  const today = dayKey();
  const idx = weekdayIdx(today);
  const day = WEEK[idx];
  return `${top()}
    ${draftCard()}
    ${kneeCard(today)}
    ${introCard()}
    ${deloadCard(today)}
    ${dayBody(day, today, prettyDay(today))}
    <h2 class="sec">Zilnic<small>Mintea și corpul, în afara rundelor.</small></h2>
    ${habitCard()}
    ${sleepCard()}
    ${fuelRow(today)}
    ${whyCard()}
    ${dailyCard()}
    <h2 class="sec">De învățat<small>Combinațiile săptămânii.</small></h2>
    ${weekCard(false)}`;
}

export function dayViewHtml(idx: number): string {
  const today = dayKey();
  const day = WEEK[idx];
  const isToday = weekdayIdx(today) === idx;
  return `${top(true)}${dayBody(day, today, isToday ? `Azi, ${RO_DAYS[idx].toLowerCase()}` : `${RO_DAYS[idx]} în plan`)}
  ${isToday ? '' : '<p class="small dim" style="margin-top:14px">Poți face orice zi din săptămână; bifele se adună pe săptămâna curentă.</p>'}`;
}
