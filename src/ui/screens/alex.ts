// "Alex": everything taken from Alex Hanma's channel — the combinations of the week, his routines,
// his workouts, technique and mindset.

import { ALEX_FIGHT, ALEX_MIND, ALEX_WORKOUTS } from '../../data/alex.ts';
import { learnOrder, learnWeek, tiktokUrl, weekCombos, type Combo } from '../../data/combos.ts';
import { esc } from '../../logic/util.ts';
import { art } from '../art.ts';
import { ic } from '../icons.ts';
import { ctx } from '../ctx.ts';
import { tipCard } from './fight.ts';
import { top } from './shared.ts';

const KEY = 'beast:learned';

export function learned(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) || '[]') as string[]);
  } catch {
    return new Set();
  }
}

export function toggleLearned(id: string): void {
  const s = learned();
  if (s.has(id)) s.delete(id);
  else s.add(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...s]));
  } catch {
    /* ignore */
  }
}

const MOVE = /^(Switch|Slip|Roll|Bob|Weave|Lean|Small step|Push off|Step|Ghost|Duck|Level|Back to|Close the|Move|Pivot|Feint|Hop|Tap|Shift|Fake)/;

export function seqHtml(c: Combo): string {
  return `<div class="seq">${c.seq.map((s) => `<span class="${MOVE.test(s) ? 'move' : ''}">${esc(s)}</span>`).join('')}</div>`;
}

/** The week's pair: the new combination and last week's to review. Compact on the Today screen, full on the Alex screen. */
export function weekCard(full: boolean): string {
  const done = learned();
  const combos = weekCombos(learnWeek(), ctx.S.nut.h);
  const items = combos
    .map(
      (c, i) => `<div class="wc-item ${done.has(c.id) ? 'ok' : ''}">
        <div class="wc-n">${i === 0 ? 'Nouă' : 'Recapitulare'}</div>
        <div class="wc-main">
          <h3>${esc(c.name)}</h3>
          ${seqHtml(c)}
          ${full ? `<p>${esc(c.note)}</p>${c.vid ? `<a class="src" href="${tiktokUrl(c.vid)}" target="_blank" rel="noopener">${ic('ext')}${esc(c.src ?? 'TikTok')}</a>` : ''}` : ''}
          <button class="chip ${done.has(c.id) ? 'on' : ''}" data-a="learned" data-id="${c.id}" aria-pressed="${done.has(c.id)}">${done.has(c.id) ? `${ic('check')} Învățată` : 'Am învățat-o'}</button>
        </div>
      </div>`,
    )
    .join('');
  return `<section class="card wc" aria-label="Combinațiile săptămânii">
    <div class="row"><div class="row-l"><h3>Combinațiile săptămânii</h3><p class="small dim" style="margin:0">Săptămâna ${learnWeek() + 1}: una nouă și una de recapitulat. Joi, în shadow boxing, prima rundă e doar cu cea nouă.</p></div></div>
    ${items}
    <button class="btn sm" style="width:100%;margin-top:12px" data-a="qt" data-k="week">${ic('play')} Exersează-le: 3 × 3 min</button>
  </section>`;
}

function nextWeeks(): string {
  const w = learnWeek();
  const h = ctx.S.nut.h;
  const rows = [1, 2, 3].map((d) => {
    const [a] = weekCombos(w + d, h);
    return `<li><div><b>Săptămâna ${w + d + 1}</b><span>${esc(a.name)}</span></div></li>`;
  });
  const total = learnOrder(h).length;
  const done = learned();
  const n = learnOrder(h).filter((c) => done.has(c.id)).length;
  return `<p class="small dim" style="margin:14px 0 4px">Ai învățat ${n} din ${total}. Urmează:</p><ul class="hist">${rows.join('')}</ul>`;
}

const ROUTINES = [
  { k: 'peekaboo', icon: 'shadow', name: 'Peekaboo Workout', sub: '7 exerciții × 2 serii' },
  { k: 'homebox', icon: 'timer', name: 'Home Boxing', sub: '3 × 3 min fără echipament' },
  { k: 'abs', icon: 'bolt', name: 'Abs', sub: '5 min fără pauză' },
  { k: 'splits', icon: 'stretch', name: 'Split Routine', sub: '17 min, sfoara laterală' },
  { k: 'dagestan', icon: 'stretch', name: 'Dagestan', sub: '9 min, șolduri' },
  { k: 'daily', icon: 'bolt', name: 'Daily Mobility', sub: '10 min în fiecare zi' },
];

export function alexHtml(): string {
  return `${top('fight')}
    <div class="alex-head"><h1 class="stack">Alex</h1>${art('masks', 'alex-art')}</div>
    <p class="dim">Tot ce e util de pe TikTok-ul lui Alex Hanma (@alexhanma___), citit cadru cu cadru: combinații, rutine, antrenamente, tehnică și mentalitate.</p>
    <h2 class="sec">De învățat săptămâna asta<small>O combinație nouă pe săptămână, plus recapitularea celei de dinainte.</small></h2>
    ${weekCard(true)}
    ${nextWeeks()}
    <h2 class="sec">Rutinele lui Alex<small>Cu timer, ilustrații și explicații.</small></h2>
    <div class="tiles">${ROUTINES.map((t) => `<button class="tile" data-a="tool" data-k="${t.k}">${ic(t.icon)}<b>${esc(t.name)}</b><span>${esc(t.sub)}</span></button>`).join('')}</div>
    <h2 class="sec">Antrenamentele lui Alex<small>Sesiuni întregi din video-urile lui, cu numerele scrise pe ecran.</small></h2>
    ${ALEX_WORKOUTS.map((t) => tipCard(t)).join('')}
    <h2 class="sec">Tehnică și sfaturi</h2>
    ${ALEX_FIGHT.map((t) => tipCard(t, t.id === 'mistakes')).join('')}
    <h2 class="sec">Mentalitate</h2>
    ${ALEX_MIND.map((t) => tipCard(t)).join('')}
    <div class="sign">${art('trust')}</div>`;
}
