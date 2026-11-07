// "Lupte" in three sections: Timere (round timers and Alex's sessions), Combinații (the week's pair, the kickboxing
// techniques and combinations for a 2 m fighter, the punches, Alex Hanma's boxing combinations) and Alex (his routines,
// workouts, technique and mindset).

import { srcUrl, type TipCard } from '../../data/alex.ts';
import { CAT_NAMES, COMBOS, type Combo, type ComboCat } from '../../data/combos.ts';
import { WEEK, blockName, type Block } from '../../data/plan.ts';
import { dayKey, esc, weekdayIdx } from '../../logic/util.ts';
import { ctx } from '../ctx.ts';
import { howHtml } from '../how.ts';
import { alexBody, MOVE, nextWeeks, srcLink, weekCard } from './alex.ts';
import { ic } from '../icons.ts';
import { openRounds } from '../players/rounds.ts';
import { blockRest, liveBlock, pageHead, restFor, segBar, segOf, top } from './shared.ts';

let cat: ComboCat | 'all' = 'all';
export function setComboCat(c: string): void {
  cat = (c as ComboCat | 'all') || 'all';
}

interface Quick {
  k: string;
  name: string;
  icon: string;
  match: (b: Block) => boolean;
  def: { rounds: number; work: number; rest: 'r3' | 'r1'; focus: Block['focus'] };
}

const QUICK: Quick[] = [
  { k: 'shadow', name: 'Shadow Kickboxing', icon: 'shadow', match: (b) => b.name === 'Shadow Kickboxing', def: { rounds: 3, work: 180, rest: 'r3', focus: 'combo' } },
  { k: 'bag', name: 'Heavy Bag Training', icon: 'bag', match: (b) => b.name === 'Heavy Bag Training', def: { rounds: 5, work: 180, rest: 'r3', focus: 'power' } },
  { k: 'rope', name: 'Jumping Rope', icon: 'rope', match: (b) => b.name === 'Jumping Rope', def: { rounds: 5, work: 180, rest: 'r3', focus: 'rope' } },
  { k: 'legs', name: 'Wall Sit', icon: 'wall', match: (b) => !!b.legSwap, def: { rounds: 5, work: 60, rest: 'r1', focus: 'legs' } },
];

/** A quick timer uses today's plan block when today has one of the same kind, so it gets checked off too. */
export function startQuick(k: string): void {
  if (k === 'free') return openRounds({ name: 'Runde libere', rounds: 3, work: 180, rest: ctx.S.set.rest3 });
  if (k === 'week') return openRounds({ name: 'Combinațiile săptămânii', rounds: 3, work: 180, rest: ctx.S.set.rest3, focus: 'week' });
  const q = QUICK.find((x) => x.k === k);
  if (!q) return;
  const today = WEEK[weekdayIdx(dayKey())];
  const raw = today.blocks.find(q.match);
  if (raw) {
    const b = liveBlock(raw);
    return openRounds({ name: b.name, rounds: b.rounds ?? 1, work: b.work ?? 180, rest: blockRest(b), focus: b.focus, block: b.id, tip: b.tip, cues: b.cues, legSwap: b.legSwap, burstFrom: b.burstFrom });
  }
  openRounds({ name: q.k === 'legs' ? blockName({ legSwap: true } as Block, ctx.S.set) : q.name, rounds: q.def.rounds, work: q.def.work, rest: restFor(q.def.rest), focus: q.def.focus, legSwap: q.k === 'legs' });
}

/** One timer as a row: icon, name, what it runs, and a start mark. Today's plan block is marked. */
function timerRow(a: string, k: string, icon: string, name: string, sub: string, plan = false): string {
  return `<button class="timer-row${plan ? ' plan' : ''}" data-a="${a}" data-k="${k}"><span class="tr-ic">${ic(icon)}</span><span class="tr-t">${plan ? '<em>Azi în plan</em>' : ''}<b>${esc(name)}</b><span>${esc(sub)}</span></span><span class="tr-go">${ic('play')}</span></button>`;
}

function quickRow(q: Quick): string {
  const today = WEEK[weekdayIdx(dayKey())];
  const b = today.blocks.find(q.match);
  const name = q.k === 'legs' ? (ctx.S.set.legMode === 'jump' ? 'Jumping Squats' : 'Wall Sit') : q.name;
  const sub = b ? liveBlock(b).dose : q.k === 'legs' ? '5 × 1 min' : 'Runde de 3 minute';
  return timerRow('qt', q.k, q.icon, name, sub, !!b);
}

export function tipCard(t: TipCard, red = false): string {
  const url = srcUrl(t.src);
  const tool =
    t.tool === 'daily'
      ? '<button class="btn ghost sm" data-a="tool" data-k="daily">Mobilitate zilnică, 10 min</button>'
      : t.tool === 'pull'
        ? '<button class="btn ghost sm" data-a="day" data-i="4">Ziua de pull</button>'
        : '';
  return `<article class="tip-card ${red ? 'red' : ''}"><h3>${esc(t.title)}</h3><ul>${t.points.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
    <div class="row" style="justify-content:flex-start;gap:14px;flex-wrap:wrap">${url ? `<a class="src" href="${url}" target="_blank" rel="noopener">${ic('ext')}${esc(t.srcTitle ?? 'Sursa')}</a>` : ''}${tool}</div></article>`;
}

function timersSeg(): string {
  return `<div class="timer-list">${QUICK.map(quickRow).join('')}
      ${timerRow('tool', 'coach', 'camera', 'Antrenor cu camera', 'Garda, loviturile și ritmul, urmărite live')}
      ${timerRow('tool', 'peekaboo', 'shadow', 'Peekaboo Workout', '7 exerciții, câte 2 serii, de la Alex')}
      ${timerRow('tool', 'homebox', 'timer', 'Home Boxing Rounds', '3 × 3 min fără echipament, de la Alex')}
      ${timerRow('qt', 'free', 'timer', 'Runde libere', 'Setezi tu rundele, lucrul și pauza')}
    </div>
    <section class="card lime" style="margin-top:28px"><p class="label">Partener</p><h3>Ce nu poți antrena singur</h3>
      <p class="dim">Shadow-ul, sacul și timerele construiesc tehnica și condiția. Reacția la un om, distanța reală, check-ul la o lovitură adevărată și apărarea sub presiune se învață doar cu cineva în față: Thai pads cu un antrenor sau sparring tehnic, controlat, cu tibiere și cască.</p>
      <p class="dim" style="margin:0">O singură sesiune pe săptămână cu un antrenor de kickboxing schimbă cel mai mult. Joi poți alege „Cu partener” în locul shadow-ului.</p>
    </section>`;
}

function comboCard(c: Combo): string {
  return `<article class="combo">
      <h3>${esc(c.name)}</h3>
      <div class="seq">${c.seq.map((s) => `<span class="${MOVE.test(s) ? 'move' : ''}">${esc(s)}</span>`).join('')}</div>
      <p>${esc(c.note)}</p>
      ${srcLink(c) || '<span class="src">Baza pe care insistă Alex</span>'}
    </article>`;
}

function combosSeg(): string {
  const cats: Array<ComboCat | 'all'> = ['all', 'kicks', 'basics', 'combo', 'power', 'defense', 'counter', 'footwork'];
  const pick = (c: Combo): boolean => cat === 'all' || c.cat === cat;
  const kb = COMBOS.filter((c) => c.kb && pick(c));
  const box = COMBOS.filter((c) => !c.kb && pick(c));
  const count = (n: number): string => `${n} ${n === 1 ? 'combinație' : 'combinații'}`;
  return `${weekCard(true)}
    ${nextWeeks()}
    <h2 class="sec">Loviturile de kickboxing<small>Pentru un luptător de 2 m: poziția, teep-ul, low kick-urile, genunchiul și check-ul.</small></h2>
    ${['Kickboxing Stance', 'Teep', 'Low Kick', 'Inside Low Kick', 'Body Kick', 'Knee', 'Check', 'High Kick'].map((k) => howHtml(k, undefined, { title: k })).join('')}
    <h2 class="sec">Pumnii și mișcarea<small>Cum se face fiecare pumn și fiecare mișcare din combinații.</small></h2>
    ${['Jab', 'Cross', 'Hook', 'Uppercut', 'Overhand', 'Gazelle Punch', 'Check Hook', 'Slip & Roll', 'Footwork'].map((k) => howHtml(k, undefined, { title: k })).join('')}
    <h2 class="sec">Combinații de kickboxing<small>Pentru luptătorul înalt: de la Ernesto Hoost, din meciurile lui Semmy Schilt și de la antrenori de Muay Thai. Le auzi în rundele de shadow și de sac.</small></h2>
    <div class="chips filter" role="group" aria-label="Filtru">${cats.map((c) => `<button class="chip" aria-pressed="${cat === c}" data-a="ccat" data-k="${c}">${c === 'all' ? 'Toate' : esc(CAT_NAMES[c])}</button>`).join('')}</div>
    <p class="small dim">${count(kb.length)}</p>
    ${kb.map(comboCard).join('')}
    <h2 class="sec">Combinații de box de la Alex<small>Citite cadru cu cadru din video-urile lui de pe TikTok. Pumnii lui rămân în runde, iar când genunchiul cere pauză de la kick-uri, rundele sunt doar cu ele.</small></h2>
    <p class="small dim">${count(box.length)}</p>
    ${box.map(comboCard).join('')}`;
}

export const FIGHT_SEGS: Array<[string, string]> = [['timers', 'Timere'], ['combos', 'Combinații'], ['alex', 'Alex']];

export function fightHtml(): string {
  const seg = segOf('fight', FIGHT_SEGS.map(([k]) => k));
  const body = seg === 'combos' ? combosSeg() : seg === 'alex' ? alexBody() : timersSeg();
  return `${top()}
    ${pageHead('Lupte', 'Runde de kickboxing, combinații și tot ce a arătat Alex.')}
    ${segBar('Secțiuni Lupte', FIGHT_SEGS, seg)}
    <div class="seg-body" data-seg="${seg}">${body}</div>`;
}
