// "Plan": the e-book's weekly timeline, with what's done this week.

import { PRINCIPLES } from '../../data/book.ts';
import { WEEK, blockLine } from '../../data/plan.ts';
import { dayComplete, weekDone } from '../../logic/progress.ts';
import { addDays, dayKey, esc, RO_DAYS, shortDay, weekStart, weekdayIdx } from '../../logic/util.ts';
import { ctx } from '../ctx.ts';
import { ic } from '../icons.ts';
import { top } from './shared.ts';

function weekRange(mon: string): string {
  const end = addDays(mon, 6);
  const [a, b] = [shortDay(mon), shortDay(end)];
  return a.split(' ')[1] === b.split(' ')[1] ? `${a.split(' ')[0]}–${b}` : `${a} – ${b}`;
}

export function planHtml(): string {
  const today = dayKey();
  const mon = weekStart(today);
  const done = weekDone(ctx.S.log, mon);
  const full = WEEK.filter((d) => dayComplete(d, done)).length;
  const tIdx = weekdayIdx(today);
  const days = WEEK.map((d) => {
    const complete = dayComplete(d, done);
    return `<div class="tl-day ${d.idx === tIdx ? 'today' : ''}">
      <span class="tl-node"></span>
      <div class="tl-pill">${esc(RO_DAYS[d.idx])}${complete ? ic('check') : ''}</div>
      <button class="tl-box" data-a="day" data-i="${d.idx}" aria-label="${esc(RO_DAYS[d.idx])}: ${esc(d.title)}">
        <h3>${esc(d.title)}</h3>
        <ul>${d.blocks.map((b) => `<li class="${done.has(b.id) ? 'ok' : ''}">${esc(blockLine(b, ctx.S.set.legMode))}</li>`).join('')}</ul>
      </button>
    </div>`;
  }).join('');
  return `${top()}
    <h1 class="stack">Plan</h1>
    <p class="dim">Săptămâna ${weekRange(mon)}<br>${full} din 7 zile complete</p>
    <div class="tl">${days}</div>
    <h2 class="sec">Principiile<small>Din „Bazele fitnessului”</small></h2>
    <div class="principles">${PRINCIPLES.map((p) => `<div class="principle"><b>${esc(p.title)}</b>${esc(p.text)}</div>`).join('')}</div>`;
}
