// "Provocări", a tab of its own since 2026-11-07: race simulations on five levels with personal bests,
// the 30-day challenges and the discipline challenges (No Fap, Dopamine Discipline).

import { LEVEL_NAMES, raceById, RACES, type Race } from '../../data/races.ts';
import { bestTime } from '../../logic/race.ts';
import { dayKey, esc, raceTime, shortDay } from '../../logic/util.ts';
import { ctx } from '../ctx.ts';
import { ic } from '../icons.ts';
import { segBar, segOf, top, masthead } from './shared.ts';
import { challengesHtml, dopaCard, nofapCard } from './discipline.ts';

const hm = (min: number): string => (min < 60 ? `${min} min` : `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ''}`);

let open = '';

const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
/** Each race its own light: ice, cyan, lavender, blue, white. */
const TINT = ['185,211,245', '159,227,240', '201,184,245', '143,179,230', '233,241,251'];

/**
 * A race as a mission poster in the carousel (2026-11-22, the user wanted Provocări "mai spectaculos, mult mai animat"):
 * its number huge in outline, its sign inside a turning orbit, the five levels as a staircase that lights up where you
 * hold a record, the highest record, and the button that opens its levels under the carousel.
 */
function raceCard(r: Race, i: number): string {
  const pbs = r.levels.map((_, j) => bestTime(ctx.S.log, r.id, j));
  const top = pbs.reduce<number>((b, v, j) => (v !== undefined ? j : b), -1);
  const on = open === r.id;
  return `<li><article class="rc${on ? ' on' : ''}" style="--t:${TINT[i % TINT.length]};--i:${i}">
    <i class="rc-n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</i>
    <i class="rc-aura" aria-hidden="true"></i>
    <div class="rc-orb" aria-hidden="true"><i class="rc-ring"></i><i class="rc-ring two"></i>${ic(r.icon)}</div>
    <p class="rc-k">Misiunea ${String(i + 1).padStart(2, '0')}</p>
    <h3 class="rc-t">${esc(r.name.replace(/ Simulation$/, ''))}</h3>
    <p class="rc-s">${esc(r.sub)}</p>
    <div class="rc-lad" aria-label="Niveluri cu record: ${pbs.filter((v) => v !== undefined).length} din 5">${pbs.map((v, j) => `<i class="${v !== undefined ? 'on' : ''}" style="--j:${j}"><b>${ROMAN[j]}</b></i>`).join('')}</div>
    <p class="rc-pb">${top >= 0 ? `<b>${esc(LEVEL_NAMES[top]!)}</b><span>${raceTime(pbs[top]!)}</span>` : '<span>Niciun record încă</span>'}</p>
    <button class="btn sm rc-go" data-a="ch:open" data-k="${r.id}" aria-expanded="${on}">${on ? 'Ascunde nivelurile' : 'Alege nivelul'}</button>
  </article></li>`;
}

/** The open race's five levels, under the carousel, as a staircase you climb. */
function levelsPanel(r: Race): string {
  const levels = r.levels.map((l, i) => {
    const pb = bestTime(ctx.S.log, r.id, i);
    return `<li class="lv${pb !== undefined ? ' done' : ''}" style="--i:${i}"><i class="lv-n">${ROMAN[i]}</i><div><b>${esc(LEVEL_NAMES[i]!)} · ${esc(l.name)}</b><span>Cam ${hm(l.est)}${pb !== undefined ? ` · recordul tău ${raceTime(pb)}` : ''}</span></div><button class="btn sm" data-a="ch:go" data-k="${r.id}" data-i="${i}" aria-label="Start ${esc(l.name)}">Start</button></li>`;
  });
  return `<section class="rc-panel" aria-label="Nivelurile ${esc(r.name)}"><h2 class="sec first">${esc(r.name)}<small>${esc(r.note)}</small></h2><ol class="lvs">${levels.join('')}</ol></section>`;
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
    ${masthead('Provocări', 'Curse simulate, provocări de 30 de zile și disciplină.', 'trail')}
    ${segBar('Secțiuni Provocări', CHALLENGE_SEGS, seg)}
    <div class="seg-body deck" data-seg="${seg}">${body}</div>`;
}

function racesSeg(): string {
  const run = ctx.S.race;
  const cur = run ? raceById(run.ev) : undefined;
  const races = ctx.S.log.filter((e) => e.kind === 'race');
  const done = races.slice(-6).reverse();
  let pbs = 0, high = -1;
  for (const r of RACES) r.levels.forEach((_, j) => { if (bestTime(ctx.S.log, r.id, j) !== undefined) { pbs++; high = Math.max(high, j); } });
  const openRace = RACES.find((r) => r.id === open);
  return `<div class="hof">
      <div><b class="num" data-count="${races.length}">${races.length}</b><span>curse terminate</span></div>
      <div><b class="num" data-count="${pbs}">${pbs}</b><span>recorduri din ${RACES.length * 5}</span></div>
      <div><b>${high >= 0 ? ROMAN[high] : '–'}</b><span>${high >= 0 ? esc(LEVEL_NAMES[high]!) : 'nivel atins'}</span></div>
    </div>
    ${run && cur ? `<section class="rc-live"><i class="rc-live-dot"></i><div><b>${esc(cur.name)}</b><span>${esc(cur.levels[run.lvl].name)} e în desfășurare</span></div><button class="btn sm" data-a="ch:resume">Continuă</button></section>` : ''}
    <h2 class="sec">Alege misiunea<small>Glisează prin curse. Alege nivelul care te provoacă, nu pe cel mai mare.</small></h2>
    <ol class="rcs" aria-label="Cursele">${RACES.map(raceCard).join('')}</ol>
    ${openRace ? levelsPanel(openRace) : ''}
    ${done.length ? `<h2 class="sec">Terminate</h2><ol class="tl">${done.map((e) => `<li><i></i><div><b>${esc(e.name)}</b><span>${shortDay(e.date)} · ${raceTime(e.dur)}</span></div></li>`).join('')}</ol>` : ''}
    <p class="small dim">Simulări de antrenament, fără legătură cu organizatorii acestor curse. Oprește-te dacă simți durere în piept, amețeală sau o accidentare.</p>`;
}

export function toggleRace(id: string): void {
  open = open === id ? '' : id;
}
