// "Lupte": round timers, Alex Hanma's combinations and his fight advice.

import { srcUrl, type TipCard } from '../../data/alex.ts';
import { CAT_NAMES, COMBOS, tiktokUrl, type ComboCat } from '../../data/combos.ts';
import { WEEK, blockName, type Block } from '../../data/plan.ts';
import { dayKey, esc, weekdayIdx } from '../../logic/util.ts';
import { ctx } from '../ctx.ts';
import { art } from '../art.ts';
import { howHtml } from '../how.ts';
import { weekCard } from './alex.ts';
import { ic } from '../icons.ts';
import { openRounds } from '../players/rounds.ts';
import { restFor, top } from './shared.ts';

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
  { k: 'shadow', name: 'Shadow Boxing', icon: 'shadow', match: (b) => b.name === 'Shadow Boxing', def: { rounds: 3, work: 180, rest: 'r3', focus: 'combo' } },
  { k: 'bag', name: 'Heavy Bag Training', icon: 'bag', match: (b) => b.name === 'Heavy Bag Training', def: { rounds: 5, work: 180, rest: 'r3', focus: 'power' } },
  { k: 'rope', name: 'Jumping Rope', icon: 'rope', match: (b) => b.name === 'Jumping Rope', def: { rounds: 5, work: 180, rest: 'r3', focus: 'rope' } },
  { k: 'legs', name: 'Wall Sit', icon: 'wall', match: (b) => !!b.legSwap, def: { rounds: 10, work: 60, rest: 'r1', focus: 'legs' } },
];

/** A quick timer uses today's plan block when today has one of the same kind, so it gets checked off too. */
export function startQuick(k: string): void {
  if (k === 'free') return openRounds({ name: 'Runde libere', rounds: 3, work: 180, rest: ctx.S.set.rest3 });
  if (k === 'week') return openRounds({ name: 'Combinațiile săptămânii', rounds: 3, work: 180, rest: ctx.S.set.rest3, focus: 'week' });
  const q = QUICK.find((x) => x.k === k);
  if (!q) return;
  const today = WEEK[weekdayIdx(dayKey())];
  const b = today.blocks.find(q.match);
  if (b) return openRounds({ name: blockName(b, ctx.S.set), rounds: b.rounds ?? 1, work: b.work ?? 180, rest: restFor(b.rest), focus: b.focus, block: b.id, tip: b.tip, cues: b.cues, legSwap: b.legSwap });
  openRounds({ name: q.k === 'legs' ? blockName({ legSwap: true } as Block, ctx.S.set) : q.name, rounds: q.def.rounds, work: q.def.work, rest: restFor(q.def.rest), focus: q.def.focus, legSwap: q.k === 'legs' });
}

function quickRow(q: Quick): string {
  const today = WEEK[weekdayIdx(dayKey())];
  const b = today.blocks.find(q.match);
  const name = q.k === 'legs' ? (ctx.S.set.legMode === 'jump' ? 'Jumping Squats' : 'Wall Sit') : q.name;
  const sub = b ? `Azi în plan: ${b.dose}` : q.k === 'legs' ? '10 × 1 min' : 'Runde de 3 minute';
  return `<button class="timer-row" data-a="qt" data-k="${q.k}"><div><b>${esc(name)}</b><span>${esc(sub)}</span></div>${ic(q.icon)}</button>`;
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

export function fightHtml(): string {
  const cats: Array<ComboCat | 'all'> = ['all', 'basics', 'combo', 'power', 'defense', 'counter', 'footwork'];
  const list = COMBOS.filter((c) => cat === 'all' || c.cat === cat);
  const combos = list
    .map(
      (c) => `<article class="combo">
      <h3>${esc(c.name)}</h3>
      <div class="seq">${c.seq.map((s) => `<span class="${/^(Switch|Slip|Roll|Bob|Weave|Lean|Small step|Push off|Step out|Step to|Ghost|Duck|Level|Back to|Close the|Move|Pivot|Feint|Step|Switch step|Hop|Tap|Shift|Fake)/.test(s) ? 'move' : ''}">${esc(s)}</span>`).join('')}</div>
      <p>${esc(c.note)}</p>
      ${c.vid ? `<a class="src" href="${tiktokUrl(c.vid)}" target="_blank" rel="noopener">${ic('ext')}${esc(c.src ?? 'TikTok')}</a>` : '<span class="src">Baza pe care insistă Alex</span>'}
    </article>`,
    )
    .join('');
  return `${top()}
    <div class="fight-art"><div class="title-art"><h1>Lupte</h1>${art('fighter')}</div>${art('boxer')}</div>
    ${weekCard(false)}
    <h2 class="sec">Timere</h2>
    <div class="timer-list">${QUICK.map(quickRow).join('')}
      <button class="timer-row" data-a="tool" data-k="peekaboo"><div><b>Peekaboo Workout</b><span>7 exerciții, câte 2 serii, de la Alex</span></div>${ic('shadow')}</button>
      <button class="timer-row" data-a="tool" data-k="homebox"><div><b>Home Boxing Rounds</b><span>3 × 3 min fără echipament, de la Alex</span></div>${ic('timer')}</button>
      <button class="timer-row" data-a="qt" data-k="free"><div><b>Runde libere</b><span>Setezi tu rundele, lucrul și pauza</span></div>${ic('timer')}</button>
    </div>
    <h2 class="sec">Loviturile de bază<small>Cum se face fiecare lovitură și mișcare din combinații</small></h2>
    ${['Jab', 'Cross', 'Hook', 'Uppercut', 'Overhand', 'Gazelle Punch', 'Check Hook', 'Slip & Roll', 'Footwork'].map((k) => howHtml(k, undefined, { title: k })).join('')}
    <h2 class="sec">Combinații de la Alex<small>Citite cadru cu cadru din video-urile lui de pe TikTok. Le auzi și în timpul rundelor de shadow boxing și sac.</small></h2>
    <div class="chips" role="group" aria-label="Filtru" style="margin-bottom:14px">${cats.map((c) => `<button class="chip" aria-pressed="${cat === c}" data-a="ccat" data-k="${c}">${c === 'all' ? 'Toate' : esc(CAT_NAMES[c])}</button>`).join('')}</div>
    ${combos}
    <div class="card" style="margin-top:28px"><h3>Mai mult de la Alex</h3><p class="dim" style="margin:0 0 12px">Combinațiile săptămânii, rutinele, antrenamentele, tehnica și mentalitatea lui sunt în tabul Alex.</p><button class="btn ghost sm" data-a="tab" data-k="alex">Deschide Alex</button></div>`;
}
