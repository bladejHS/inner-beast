// "Azi": today's session from the plan, the 28-day routine, sleep and your why.

import { HABIT_STEPS } from '../../data/book.ts';
import { WEEK, type Day } from '../../data/plan.ts';
import { dayProgress, habitDone, habitMilestone, habitStreak, weekDone } from '../../logic/progress.ts';
import { dayKey, esc, prettyDay, RO_DAYS, weekStart, weekdayIdx, daysBetween } from '../../logic/util.ts';
import { ctx } from '../ctx.ts';
import { ic } from '../icons.ts';
import { clawSvg } from '../claws.ts';
import { blockCard, blockMinutes, top } from './shared.ts';

function miniRing(n: number, total: number, size = 64): string {
  const r = 26;
  const c = 2 * Math.PI * r;
  const off = c * (1 - n / total);
  return `<svg class="mring" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="${r}" class="mr-t"/><circle cx="32" cy="32" r="${r}" class="mr-v" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}"/></svg>`;
}

/** Monday–Sunday strip: how much of each day is done this week. */
export function weekStrip(today: string, active: number): string {
  const done = weekDone(ctx.S.log, weekStart(today));
  const tIdx = weekdayIdx(today);
  return `<nav class="wk" aria-label="Zilele săptămânii">${WEEK.map((d) => {
    const n = dayProgress(d, done);
    const st = n === d.blocks.length ? 'full' : n > 0 ? 'part' : '';
    return `<button class="wk-d ${st} ${d.idx === active ? 'on' : ''} ${d.idx === tIdx ? 'now' : ''}" data-a="${d.idx === tIdx ? 'tab' : 'day'}" data-k="today" data-i="${d.idx}" aria-label="${esc(RO_DAYS[d.idx])}"><span>${RO_DAYS[d.idx].slice(0, 2)}</span><i></i></button>`;
  }).join('')}</nav>`;
}

export function dayBody(day: Day, today: string, kicker: string): string {
  const done = weekDone(ctx.S.log, weekStart(today));
  const n = dayProgress(day, done);
  const total = day.blocks.length;
  const mins = day.blocks.reduce((s, b) => s + blockMinutes(b), 0);
  return `
    <section class="hero">
      <div class="hero-glow" aria-hidden="true"></div>
      ${clawSvg('#C7FE51', 'hero-claw')}
      <p class="hero-k">${esc(kicker)}</p>
      <h1 class="hero-t">${esc(day.title)}</h1>
      <div class="hero-row">
        <div class="hero-meta"><span><b>${total}</b> blocuri</span><span><b>~${mins}</b> min</span></div>
        <div class="hero-ring">${miniRing(n, total)}<b>${n}<small>/${total}</small></b></div>
      </div>
    </section>
    ${weekStrip(today, day.idx)}
    <ol class="bks">${day.blocks.map((b, i) => blockCard(b, i + 1, today)).join('')}</ol>`;
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
  const body =
    h.type === 'count'
      ? `<div class="habit-count num">${val}<small> / ${h.goal}</small></div>
         <div class="bar"><i style="width:${Math.min(100, (val / h.goal) * 100)}%"></i></div>
         <div class="chips">${[-10, 10, 25, 50].map((d) => `<button class="chip" data-a="hab" data-n="${d}">${d > 0 ? '+' : '−'}${Math.abs(d)}</button>`).join('')}</div>`
      : `<button class="btn ${ok ? 'ghost' : ''}" data-a="hab-check">${ok ? 'Făcut azi' : 'Bifează azi'}</button>`;
  return `<section class="card ${ok ? 'lime' : ''}" aria-label="Rutina zilei">
    <div class="row"><div class="row-l"><h3>${esc(h.name)}</h3><p class="small dim" style="margin:0">Rutina zilei, ziua ${dayN} din 28${streak ? `, serie de ${streak} ${streak === 1 ? 'zi' : 'zile'}` : ''}</p></div>${ok ? `<span style="color:var(--lime)">${ic('check')}</span>` : ''}</div>
    ${body}
    ${msText && ok ? `<p class="small" style="margin:10px 0 0"><b class="hl">${ms} zile.</b> ${esc(msText)}</p>` : ''}
    ${late ? '<p class="small" style="margin:10px 0 0;color:var(--yellow)">Nu te culca până nu e gata.</p>' : ''}
    ${compact ? '' : ''}
  </section>`;
}

export function sleepCard(): string {
  const today = dayKey();
  const v = ctx.S.sleep[today];
  const shown = v === undefined ? 'Notează' : `${String(v).replace('.', ',')} h`;
  return `<section class="card" aria-label="Somn">
    <div class="row"><div class="row-l"><h3>Somn</h3><p class="small dim" style="margin:0">Azi-noapte. Niciodată sub 7 ore.</p></div>
    <div class="stepper"><button data-a="sleep" data-d="-1" aria-label="Mai puțin">−</button><output style="${v === undefined ? 'font:600 14px/1 var(--body);color:var(--dim)' : v < 7 ? 'color:var(--red)' : ''}">${shown}</output><button data-a="sleep" data-d="1" aria-label="Mai mult">+</button></div></div>
  </section>`;
}

function whyCard(): string {
  const w = ctx.S.why;
  const lines = [w.winner, w.victim, w.drive].filter((s) => s.trim());
  if (!lines.length) {
    return `<section class="card"><h3>De ce-ul tău</h3><p class="dim">„Găsește-ți de ce-ul și îți vei găsi succesul.” Scrie de ce faci asta; îl vezi aici în fiecare zi.</p><button class="btn ghost sm" data-a="tab" data-k="mind" data-to="why">Scrie-l</button></section>`;
  }
  const pick = lines[daysBetween('2026-01-01', dayKey()) % lines.length] ?? lines[0];
  return `<section class="card"><h3>De ce-ul tău</h3><p class="why-quote">${esc(pick)}</p></section>`;
}

function dailyCard(): string {
  return `<section class="card"><div class="row"><div class="row-l"><h3>Mobilitate zilnică</h3><p class="small dim" style="margin:0">10 minute, opțional. Alex face mobilitate în fiecare zi ca să rămână rapid.</p></div><button class="bk-go" data-a="tool" data-k="daily" aria-label="Start mobilitate zilnică">${ic('play')}</button></div></section>`;
}

function introCard(): string {
  let seen = false;
  try {
    seen = localStorage.getItem('beast:intro') === '1';
  } catch {
    seen = false;
  }
  if (ctx.S.log.length || seen) return '';
  return `<section class="card lime"><h3>Bine ai venit</h3><p>Planul din carte e împărțit pe zile. Apeși Start la fiecare bloc: timerul, combinațiile și seriile se salvează singure în Progres.</p><p class="dim small">Dacă ai făcut un bloc fără aplicație, apeși pe numărul lui și îl bifezi.</p><button class="link" data-a="intro-ok">Am înțeles</button></section>`;
}

export function todayHtml(): string {
  const today = dayKey();
  const idx = weekdayIdx(today);
  const day = WEEK[idx];
  return `${top()}
    ${introCard()}
    ${dayBody(day, today, prettyDay(today))}
    <h2 class="sec">Zilnic</h2>
    ${habitCard()}
    ${sleepCard()}
    ${whyCard()}
    ${dailyCard()}`;
}

export function dayViewHtml(idx: number): string {
  const today = dayKey();
  const day = WEEK[idx];
  const isToday = weekdayIdx(today) === idx;
  return `${top(true)}${dayBody(day, today, isToday ? `Azi, ${RO_DAYS[idx].toLowerCase()}` : `${RO_DAYS[idx]} în plan`)}
  ${isToday ? '' : '<p class="small dim" style="margin-top:14px">Poți face orice zi din săptămână; bifele se adună pe săptămâna curentă.</p>'}`;
}
