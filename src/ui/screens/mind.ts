// "Minte": recovery tools, your why, the 28-day routine, the victory journal, the book and Alex's mindset.

import { BOOK, FORMULA, HABIT_STEPS, PRINCIPLES, type Chapter, type Para } from '../../data/book.ts';
import { holdStats } from '../../logic/wimhof.ts';
import { habitStreak } from '../../logic/progress.ts';
import { dayKey, esc, mmss, shortDay } from '../../logic/util.ts';
import { ctx } from '../ctx.ts';
import { art } from '../art.ts';
import { ic } from '../icons.ts';
import { habitCard } from './today.ts';
import { top } from './shared.ts';

const TOOLS = [
  { k: 'lab', icon: 'wind', name: 'Breathwork Lab', sub: 'Reset, Tactical, Recovery, Advanced' },
  { k: 'wimhof', icon: 'wind', name: 'Wim Hof', sub: 'Meditație cu respirație și retenție' },
  { k: 'breath', icon: 'mind', name: '4-7-8', sub: 'Sesiunea de breathing' },
  { k: 'shower', icon: 'drop', name: 'Shower', sub: '1 min rece, 1 min cald' },
  { k: 'mobility', icon: 'stretch', name: 'Mobility', sub: '30 min, picioare, șolduri, umeri' },
  { k: 'daily', icon: 'bolt', name: 'Daily Mobility', sub: '10 min, rutina lui Alex' },
  { k: 'stretch-push', icon: 'timer', name: 'Stretching', sub: '15 min, încălzirea umerilor' },
];

function whyBlock(): string {
  const w = ctx.S.why;
  const q = (k: 'victim' | 'winner' | 'drive', label: string, ph: string) =>
    `<label class="small" for="why-${k}" style="font-weight:700;display:block;margin:12px 0 6px">${esc(label)}</label><textarea id="why-${k}" data-a="why" data-k="${k}" placeholder="${esc(ph)}">${esc(w[k])}</textarea>`;
  return `<section id="why">${art('why', 'why-art')}
    ${q('victim', 'De ce nu vrei să fii o victimă?', 'Scrie sincer, doar tu vezi asta.')}
    ${q('winner', 'De ce tocmai tu ar trebui să fii un câștigător?', '')}
    ${q('drive', 'Cum va arăta viața ta când atingi tot ce ți-ai propus? Ce vor spune cei care te-au tras în jos?', 'Motorul tău suprem, pentru când corpul spune că nu mai poate.')}
    <p class="small dim" style="margin-top:8px">Se salvează singur. Pe ecranul Azi vezi zilnic una dintre ele.</p>
  </section>`;
}

function winsBlock(): string {
  const wins = [...ctx.S.wins].reverse();
  return `<section id="wins">
    <div class="row" style="align-items:stretch;gap:8px"><input type="text" id="win-in" placeholder="O victorie, mare sau mică" maxlength="200" aria-label="Victorie nouă"><button class="btn sm" data-a="win-add" style="min-width:96px">Adaugă</button></div>
    <label class="row small" style="justify-content:flex-start;gap:10px;margin:10px 0 4px;font-weight:600"><span class="switch"><input type="checkbox" id="win-big"><span></span></span>E o victorie mare</label>
    ${wins.length ? `<p class="small dim" style="margin-top:12px">${wins.length} ${wins.length === 1 ? 'victorie notată' : 'victorii notate'}. Nu uita cât de departe ai ajuns.</p>` : ''}
    <ul class="hist">${wins
      .slice(0, 40)
      .map((w) => `<li><div><b>${w.big ? `<span class="hl">${ic('star')}</span>` : ''}${esc(w.text)}</b><span>${shortDay(w.date)}</span></div><button class="icon-btn" data-a="win-del" data-id="${w.id}" aria-label="Șterge">${ic('trash')}</button></li>`)
      .join('')}</ul>
  </section>`;
}

function habitsBlock(): string {
  const today = dayKey();
  const active = ctx.S.habits.find((h) => !h.archived);
  const streak = active ? habitStreak(active, today) : 0;
  const old = ctx.S.habits.filter((h) => h.archived);
  return `${habitCard()}
    <ol class="ticks" style="margin-top:10px">${HABIT_STEPS.map(([d, t]) => `<li style="${streak >= d ? 'color:var(--white)' : 'color:var(--dim)'}"><b>${d} zile.</b> ${esc(t)}</li>`).join('')}</ol>
    <div class="btn-row"><button class="btn ghost sm" data-a="hab-edit">Schimbă rutina</button>${streak >= 28 ? '<button class="btn sm" data-a="hab-new">Adaugă un obicei nou</button>' : ''}</div>
    ${old.length ? `<p class="small dim" style="margin-top:12px">Obiceiuri construite: ${old.map((h) => esc(h.name)).join(', ')}.</p>` : ''}`;
}

export function mindHtml(): string {
  const hs = holdStats(ctx.S.log);
  return `${top()}
    <h1 class="stack">Minte</h1>
    ${art('eyes', 'mind-eyes')}
    <h2 class="sec">Unelte</h2>
    <div class="tiles">${TOOLS.map((t) => `<button class="tile" data-a="${t.k === 'lab' ? 'tab' : 'tool'}" data-k="${t.k}">${ic(t.icon)}<b>${esc(t.name)}</b><span>${esc(t.k === 'wimhof' && hs.best ? `Record: ${mmss(hs.best)}` : t.sub)}</span></button>`).join('')}</div>
    <h2 class="sec">De ce-ul tău<small>„Găsește-ți de ce-ul și îți vei găsi succesul.”</small></h2>
    ${whyBlock()}
    <h2 class="sec">Rutina de 28 de zile<small>Un singur lucru simplu, în fiecare zi. Nu te culci până nu e gata.</small></h2>
    ${habitsBlock()}
    <h2 class="sec">Jurnalul victoriilor<small>Privește înapoi la victoriile tale, mari și mici.</small></h2>
    ${winsBlock()}
    <h2 class="sec">Cartea<small>Unleash Your Inner Beast, tot în afară de nutriție</small></h2>
    <ul class="toc">${BOOK.map((c) => `<li class="${/^\d$/.test(c.num) ? 'sub' : ''}"><button data-a="chapter" data-id="${c.id}"><span class="n">${esc(c.num)}</span><span class="t">${esc(c.title)}</span></button></li>`).join('')}</ul>
    <div class="card" style="margin-top:28px"><h3>Mentalitatea lui Alex</h3><p class="dim" style="margin:0 0 12px">Toate mesajele lui din video-uri sunt în tabul Alex.</p><button class="btn ghost sm" data-a="tab" data-k="alex">Deschide Alex</button></div>
    <div class="sign">${art('trust')}</div>`;
}

// ---------- reader ----------
function para(p: Para): string {
  if (typeof p === 'string') return `<p>${esc(p)}</p>`;
  if ('hl' in p) return `<p class="hl-p">${esc(p.hl)}</p>`;
  if ('list' in p) return `<ul class="ticks">${p.list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
  return `<ol class="steps">${p.steps.map(([a, b]) => `<li><b>${esc(a)}</b>${esc(b)}</li>`).join('')}</ol>`;
}

function formulaSvg(): string {
  const n = FORMULA.length;
  const R = 49;
  const r = 22;
  const segs = FORMULA.map((label, i) => {
    // start at the top-right like the e-book's wheel, each segment ends in an arrow tip
    const a0 = (i / n) * Math.PI * 2 - Math.PI / 2 + 0.05;
    const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2 - 0.05;
    const tip = a1 + 0.09;
    const p = (a: number, rad: number) => `${(50 + rad * Math.cos(a)).toFixed(2)} ${(50 + rad * Math.sin(a)).toFixed(2)}`;
    const mid = (a0 + a1) / 2;
    const tx = 50 + 35.5 * Math.cos(mid);
    const ty = 50 + 35.5 * Math.sin(mid);
    const words = label.toUpperCase().split(' ');
    const lines = words.length > 2 ? [words[0], words.slice(1).join(' ')] : [label.toUpperCase()];
    const text = lines
      .map((l, k) => `<tspan x="${tx.toFixed(2)}" dy="${k === 0 ? (-(lines.length - 1) * 2).toFixed(1) : '4.2'}">${esc(l)}</tspan>`)
      .join('');
    return `<path d="M${p(a0, R)} A${R} ${R} 0 0 1 ${p(a1, R)} L${p(tip, (R + r) / 2)} L${p(a1, r)} A${r} ${r} 0 0 0 ${p(a0, r)} L${p(a0 + 0.09, (R + r) / 2)} Z" fill="#fff"/><text x="${tx.toFixed(2)}" y="${ty.toFixed(2)}" text-anchor="middle" dominant-baseline="middle" font-family="League Spartan, sans-serif" font-weight="800" font-size="3.5" fill="#000">${text}</text>`;
  }).join('');
  return `<div class="formula"><svg viewBox="0 0 100 100" role="img" aria-label="${esc(FORMULA.join(', apoi '))}">${segs}</svg></div>`;
}

function chapterTool(c: Chapter): string {
  switch (c.tool) {
    case 'formula':
      return formulaSvg();
    case 'warrior': {
      const v = ctx.S.warrior[dayKey()];
      if (v === 'v') return `<div class="card white">${art('masks', 'card-art')}<h3>20 de flotări. Acum.</h3><p>Apoi răspunde din nou.</p><button class="btn" data-a="warrior" data-v="">Am făcut 20</button></div>`;
      if (v === 'w') return `<div class="card lime">${art('wolf', 'card-art')}<h3>Războinic.</h3><p class="dim">Poartă-te ca atare azi.</p></div>`;
      return `<div class="btn-row"><button class="btn ghost" data-a="warrior" data-v="v">Victimă</button><button class="btn" data-a="warrior" data-v="w">Războinic</button></div>`;
    }
    case 'habit':
      return `<h2 class="sec">Rutina ta</h2>${habitCard()}`;
    case 'why':
    case 'drive':
      return `<h2 class="sec">De ce-ul tău</h2>${whyBlock()}`;
    case 'wins':
      return `<h2 class="sec">Jurnalul victoriilor</h2>${winsBlock()}`;
    case 'principles':
      return `<div class="principles">${PRINCIPLES.map((p) => `<div class="principle"><b>${esc(p.title)}</b>${esc(p.text)}</div>`).join('')}</div>`;
    case 'plan':
      return '<button class="btn" data-a="tab" data-k="plan">Vezi planul</button>';
    case 'recovery':
      return `<div class="tiles">
        <button class="tile" data-a="tab" data-k="today">${ic('moon')}<b>Somn</b><span>Notează orele pe ecranul Azi</span></button>
        <button class="tile" data-a="tool" data-k="shower">${ic('drop')}<b>Rece</b><span>Dușul alternativ</span></button>
        <button class="tile" data-a="tool" data-k="mobility">${ic('stretch')}<b>Mobilitate</b><span>30 de minute</span></button>
        <button class="tile" data-a="tool" data-k="wimhof">${ic('wind')}<b>Meditație</b><span>Wim Hof</span></button>
      </div>`;
    default:
      return '';
  }
}

export function chapterHtml(id: string): string {
  const i = BOOK.findIndex((c) => c.id === id);
  const c = BOOK[i] ?? BOOK[0];
  const prev = BOOK[i - 1];
  const next = BOOK[i + 1];
  return `${top(true)}
    <p class="kicker">${esc(c.num)}</p>
    <h1 class="stack mid">${esc(c.title)}</h1>
    <div class="reader">${c.body.map(para).join('')}</div>
    ${chapterTool(c)}
    <div class="btn-row" style="margin-top:28px">
      ${prev ? `<button class="btn ghost sm" data-a="chapter" data-id="${prev.id}">Înapoi</button>` : '<span></span>'}
      ${next ? `<button class="btn sm" data-a="chapter" data-id="${next.id}">Mai departe</button>` : '<button class="btn sm" data-a="tab" data-k="today">E timpul să ataci</button>'}
    </div>`;
}
