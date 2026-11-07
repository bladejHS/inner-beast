// "Provocări", a tab of its own since 2026-11-07: race simulations on five levels with personal bests,
// the 30-day challenges and the discipline challenges (No Fap, Dopamine Discipline).

import { LEVEL_NAMES, raceById, RACES, type Race } from '../../data/races.ts';
import { bestTime } from '../../logic/race.ts';
import { dayKey, esc, raceTime, shortDay } from '../../logic/util.ts';
import { ctx } from '../ctx.ts';
import { ic } from '../icons.ts';
import { pageHead, segBar, segOf, top } from './shared.ts';
import { challengesHtml, dopaCard, nofapCard } from './discipline.ts';

const hm = (min: number): string => (min < 60 ? `${min} min` : `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ''}`);

let open = '';

function raceCard(r: Race): string {
  const levels = r.levels.map((l, i) => {
    const pb = bestTime(ctx.S.log, r.id, i);
    return `<li><div><b>${esc(LEVEL_NAMES[i])}: ${esc(l.name)}</b><span>Cam ${hm(l.est)}${pb !== undefined ? `, recordul tău ${raceTime(pb)}` : ''}</span></div><button class="btn sm" data-a="ch:go" data-k="${r.id}" data-i="${i}" aria-label="Start ${esc(l.name)}">Start</button></li>`;
  });
  return `<section class="card">
    <button class="more-r" data-a="ch:open" data-k="${r.id}" aria-expanded="${open === r.id}"><span class="more-i">${ic(r.icon)}</span><span class="more-t"><b>${esc(r.name)}</b><span>${esc(r.sub)}</span></span>${ic('chev')}</button>
    ${open === r.id ? `<p class="small dim">${esc(r.note)}</p><ul class="hist">${levels.join('')}</ul>` : ''}
  </section>`;
}

export const CHALLENGE_SEGS: Array<[string, string]> = [['races', 'Curse'], ['days', '30 de zile'], ['disc', 'Disciplină']];

/** "Provocări" in three sections: race simulations, the 30-day challenges and the discipline challenges. */
export function challengeHtml(): string {
  const seg = segOf('challenge', CHALLENGE_SEGS.map(([k]) => k));
  const today = dayKey();
  const body =
    seg === 'days'
      ? `<p class="lead dim">O provocare de 30 de zile se bifează singură când salvezi sesiunea care o face.</p>${challengesHtml(today)}`
      : seg === 'disc'
        ? `<p class="lead dim">Disciplina e un mușchi. Îl antrenezi zilnic, ca pe restul.</p>${nofapCard(today)}${dopaCard(today)}`
        : racesSeg();
  return `${top()}
    ${pageHead('Provocări', 'Curse simulate, provocări de 30 de zile și disciplină.')}
    ${segBar('Secțiuni Provocări', CHALLENGE_SEGS, seg)}
    <div class="seg-body" data-seg="${seg}">${body}</div>`;
}

function racesSeg(): string {
  const run = ctx.S.race;
  const cur = run ? raceById(run.ev) : undefined;
  const done = ctx.S.log.filter((e) => e.kind === 'race').slice(-6).reverse();
  return `<p class="lead dim">Simulări de concurs pe cinci niveluri. Alege nivelul care te provoacă, nu pe cel mai mare.</p>
    ${run && cur ? `<section class="card lime"><div class="row"><div class="row-l"><h3>${esc(cur.name)}</h3><p class="small dim" style="margin:0">${esc(cur.levels[run.lvl].name)} e în desfășurare</p></div><button class="btn sm" data-a="ch:resume">Continuă</button></div></section>` : ''}
    <div class="missions">${RACES.map(raceCard).join('')}</div>
    ${done.length ? `<h2 class="sec">Terminate</h2><ul class="hist">${done.map((e) => `<li><div><b>${esc(e.name)}</b><span>${shortDay(e.date)}, ${raceTime(e.dur)}</span></div></li>`).join('')}</ul>` : ''}
    <p class="small dim">Simulări de antrenament, fără legătură cu organizatorii acestor curse. Oprește-te dacă simți durere în piept, amețeală sau o accidentare.</p>`;
}

export function toggleRace(id: string): void {
  open = open === id ? '' : id;
}
