// "Plan": the week from the e-book as a stack of day cards, with what's done this week.

import { PRINCIPLES } from '../../data/book.ts';
import { WEEK, blockLine } from '../../data/plan.ts';
import { dayComplete, dayProgress, weekDone } from '../../logic/progress.ts';
import { addDays, dayKey, esc, RO_DAYS, shortDay, weekStart, weekdayIdx } from '../../logic/util.ts';
import { ctx } from '../ctx.ts';
import { art, dayPhoto } from '../art.ts';
import { ic } from '../icons.ts';
import { blockIcon, blockMinutes, planPicks, top } from './shared.ts';
import { cycleAt } from '../../logic/progress.ts';

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
  const blocksDone = WEEK.reduce((s, d) => s + dayProgress(d, done), 0);
  const tIdx = weekdayIdx(today);
  const picks = planPicks(today);
  const totalBlocks = WEEK.reduce((s, d) => s + d.blocks.length, 0);
  const cyc = cycleAt(ctx.S.cycle.start, today);
  const days = WEEK.map((d) => {
    const n = dayProgress(d, done);
    const complete = n === d.blocks.length;
    const mins = d.blocks.reduce((s, b) => s + blockMinutes(b), 0);
    const state = d.idx === tIdx ? 'Azi' : complete ? 'Gata' : d.idx < tIdx && n < d.blocks.length ? 'Rămas' : '';
    return `<li>
      <button class="dc ${d.idx === tIdx ? 'now' : ''} ${complete ? 'full' : ''}" data-a="${d.idx === tIdx ? 'tab' : 'day'}" data-k="today" data-i="${d.idx}">
        ${dayPhoto(d.idx, 'dc-ph', true)}
        <div class="dc-head">
          <span class="dc-day">${esc(RO_DAYS[d.idx])}</span>
          ${state ? `<span class="dc-tag">${state}</span>` : ''}
          <span class="dc-min">~${mins} min</span>
        </div>
        <h3>${esc(d.title)}</h3>
        <ul>${d.blocks.map((b) => `<li class="${done.has(b.id) ? 'ok' : ''}">${ic(done.has(b.id) ? 'check' : blockIcon(b))}<span>${esc(blockLine(b, picks))}</span></li>`).join('')}</ul>
        <div class="dc-bar">${d.blocks.map((b) => `<i class="${done.has(b.id) ? 'on' : ''}"></i>`).join('')}</div>
      </button>
    </li>`;
  }).join('');
  return `${top()}
    <section class="hero hero-plan">
      ${art('atlas', 'hero-art atlas')}
      <p class="hero-k">Săptămâna ${weekRange(mon)}</p>
      <h1 class="hero-t">Planul</h1>
      <div class="hero-row">
        <div class="hero-meta"><span><b>${full}</b> din 7 zile</span><span><b>${blocksDone}</b> din ${totalBlocks} blocuri</span></div>
      </div>
      <div class="wk-bar" aria-hidden="true">${WEEK.map((d) => `<i style="--f:${dayProgress(d, done) / d.blocks.length}"></i>`).join('')}</div>
    </section>
    ${cyc
      ? `<section class="cycle-card"><p class="label">Ciclul ${cyc.id} · săptămâna ${cyc.week} din 4</p><h3>${esc(cyc.name)}</h3><p class="small dim">${cyc.lighter ? 'Săptămâna ușoară, cu testele.' : esc(cyc.what)}</p></section>`
      : `<section class="cycle-card"><p class="label">De luni</p><h3>Ciclul A: forță și bază aerobă</h3><p class="small dim">Trei emfaze de câte 4 săptămâni, a 4-a mereu ușoară și cu teste. Toate calitățile se lucrează în fiecare săptămână; una primește doza mare.</p></section>`}
    <ol class="dcs">${days}</ol>
    <h2 class="sec">Principiile<small>Din „Bazele fitnessului”, verificate</small></h2>
    <div class="pr-row">${PRINCIPLES.map((p) => `<div class="pr"><b>${esc(p.title)}</b><p>${esc(p.text)}</p><p class="small dim">${esc(p.note)}</p></div>`).join('')}</div>`;
}
