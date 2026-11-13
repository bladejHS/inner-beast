// "Plan": the week as a fight card of seven days, where the 12-week loop stands, and the principles.

import { PRINCIPLES } from '../../data/book.ts';
import { WEEK, blockLine } from '../../data/plan.ts';
import { CYCLE_WEEKS, CYCLES, cycleAt, dayComplete, dayProgress, daysOff, loopWeek, repeatMonday, weekDone } from '../../logic/progress.ts';
import { addDays, dayKey, esc, RO_DAYS, shortDay, weekStart, weekdayIdx } from '../../logic/util.ts';
import { ctx } from '../ctx.ts';
import { dayPoster } from '../art.ts';
import { ic } from '../icons.ts';
import { blockIcon, blockMinutes, pageHead, planPicks, top } from './shared.ts';

function weekRange(mon: string): string {
  const end = addDays(mon, 6);
  const [a, b] = [shortDay(mon), shortDay(end)];
  return a.split(' ')[1] === b.split(' ')[1] ? `${a.split(' ')[0]}–${b}` : `${a} – ${b}`;
}

/** A repeat placed on this Monday or the next one, which can still be taken back. */
function pendingRepeat(today: string): string {
  const mon = weekStart(today);
  return ctx.S.cycle.repeats.find((r) => r === mon || r === addDays(mon, 7)) ?? '';
}

/**
 * After 3+ days without training: the week repeats in the loop instead of moving on, so the load doesn't jump.
 * `lead`: the line above, on Azi the days missed.
 */
export function repeatHtml(today: string, lead = ''): string {
  const { start, repeats } = ctx.S.cycle;
  const mon = weekStart(today);
  const when = (r: string) => (r === mon ? 'Săptămâna asta' : `De luni, ${shortDay(r)},`);
  const set = pendingRepeat(today);
  if (set) {
    const p = cycleAt(start, set, repeats);
    return `<div class="cy-rep">${lead}<p class="small">${when(set)} repeți ${p ? `ciclul ${p.id}, săptămâna ${p.week} din 4` : 'săptămâna'}, în loc să treci mai departe.</p>
      <button class="btn ghost sm" data-a="cy-repeat" data-k="0" data-d="${set}">Anulează</button></div>`;
  }
  const at = repeatMonday(ctx.S.log, start, today);
  if (!at) return '';
  const p = cycleAt(start, at, [...repeats, at]);
  if (!p) return '';
  return `<div class="cy-rep">${lead}<p class="small dim">Ai stat 3 zile sau mai mult fără antrenament? ${when(at)} repeți ciclul ${p.id}, săptămâna ${p.week} din 4, cu aceleași greutăți, în loc să treci la următoarea.</p>
    <button class="btn sm" data-a="cy-repeat" data-k="1" data-d="${at}">Repetă săptămâna</button></div>`;
}

/** On Azi, only after more than 3 days without a block of the plan, and while no repeat is set. */
export function repeatCard(today: string): string {
  const off = daysOff(ctx.S.log, today);
  if (off === null || off <= 3 || pendingRepeat(today)) return '';
  const html = repeatHtml(today, `<h3>Ai lipsit ${off} zile</h3>`);
  return html ? `<section class="card lime" aria-label="Repetă săptămâna"><p class="label">Ciclul</p>${html}</section>` : '';
}

/** The 12 weeks of the loop as a strip: three emphases of four, the fourth week lighter. */
function cycleCard(today: string): string {
  const start = ctx.S.cycle.start;
  const c = cycleAt(start, today, ctx.S.cycle.repeats);
  const loop = CYCLES.length * CYCLE_WEEKS;
  const w = loopWeek(start, today, ctx.S.cycle.repeats);
  const pos = w < 0 ? -1 : w % loop;
  const track = Array.from({ length: loop }, (_, i) => {
    const cls = [i < pos ? 'ok' : '', i === pos ? 'now' : '', (i + 1) % CYCLE_WEEKS === 0 ? 'light' : ''].filter(Boolean).join(' ');
    return `<i class="${cls}"></i>`;
  }).join('');
  const names = CYCLES.map((x) => `<span class="${c?.id === x.id ? 'on' : ''}">${x.id}</span>`).join('');
  if (!c) {
    return `<section class="cycle"><p class="label">De luni</p><h3>Ciclul A: forță și bază aerobă</h3>
      <div class="cy-track" aria-hidden="true">${track}</div><div class="cy-names" aria-hidden="true">${names}</div>
      <p class="small dim">Trei emfaze de câte 4 săptămâni, a 4-a mereu ușoară și cu teste. Toate calitățile se lucrează în fiecare săptămână; una primește doza mare.</p></section>`;
  }
  return `<section class="cycle"><p class="label">Ciclul ${c.id} · săptămâna ${c.week} din 4</p><h3>${esc(c.name)}</h3>
    <div class="cy-track" aria-hidden="true">${track}</div><div class="cy-names" aria-hidden="true">${names}</div>
    <p class="small dim">${c.lighter ? 'Săptămâna ușoară, cu testele.' : esc(c.what)}</p>
    ${repeatHtml(today)}</section>`;
}

export function planHtml(): string {
  const today = dayKey();
  const mon = weekStart(today);
  const done = weekDone(ctx.S.log, mon);
  const full = WEEK.filter((d) => dayComplete(d, done)).length;
  const blocksDone = WEEK.reduce((s, d) => s + dayProgress(d, done), 0);
  const tIdx = weekdayIdx(today);
  const picks = planPicks(today);
  const totalBlocks = WEEK.reduce((s, d) => s + d.blocks.length, 0);
  const days = WEEK.map((d) => {
    const n = dayProgress(d, done);
    const complete = n === d.blocks.length;
    const mins = d.blocks.reduce((s, b) => s + blockMinutes(b), 0);
    const state = d.idx === tIdx ? 'Azi' : complete ? 'Gata' : d.idx < tIdx && n < d.blocks.length ? 'Rămas' : '';
    return `<li>
      <button class="dc ${d.idx === tIdx ? 'now' : ''} ${complete ? 'full' : ''}" style="--f:${(n / d.blocks.length).toFixed(3)}" data-a="${d.idx === tIdx ? 'tab' : 'day'}" data-k="today" data-i="${d.idx}">
        <span class="dc-ph">${dayPoster(d.idx, 'sm')}</span>
        <span class="dc-head">
          <span class="dc-day">${esc(RO_DAYS[d.idx])}</span>
          ${state ? `<span class="dc-tag">${state}</span>` : ''}
          <span class="dc-min">~${mins} min</span>
        </span>
        <span class="dc-t">${esc(d.title)}</span>
        <span class="dc-list">${d.blocks.map((b) => `<span class="dc-li ${done.has(b.id) ? 'ok' : ''}">${ic(done.has(b.id) ? 'check' : blockIcon(b))}<span>${esc(blockLine(b, picks))}</span></span>`).join('')}</span>
        <span class="dc-bar" aria-hidden="true"><i></i></span>
      </button>
    </li>`;
  }).join('');
  return `${top()}
    ${pageHead('Planul', `Săptămâna ${weekRange(mon)}`)}
    <section class="plan-sum">
      <div class="ps-n"><b class="num" data-count="${full}">${full}</b><span>din 7 zile</span></div>
      <div class="ps-n"><b class="num" data-count="${blocksDone}">${blocksDone}</b><span>din ${totalBlocks} blocuri</span></div>
      <div class="wk-bar" aria-hidden="true">${WEEK.map((d) => {
        const f = dayProgress(d, done) / d.blocks.length;
        return `<i class="${[d.idx === tIdx ? 'now' : '', f === 1 ? 'full' : ''].filter(Boolean).join(' ')}" style="--f:${f.toFixed(3)}"></i>`;
      }).join('')}</div>
    </section>
    ${cycleCard(today)}
    <ol class="dcs">${days}</ol>
    <h2 class="sec">Principiile<small>Din „Bazele fitnessului”, verificate.</small></h2>
    <div class="pr-row">${PRINCIPLES.map((p, i) => `<div class="pr"><span class="pr-n num">${String(i + 1).padStart(2, '0')}</span><b>${esc(p.title)}</b><p>${esc(p.text)}</p><p class="small dim">${esc(p.note)}</p></div>`).join('')}</div>`;
}
