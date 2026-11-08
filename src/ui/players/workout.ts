// Calisthenics workout player: variations, sets with last-time numbers, rest timer, hold timer and the pull-up EMOM.
// Every set is kept on the phone as it is ticked (a draft in localStorage), so a force-closed app loses nothing:
// Azi and the next start of the same workout offer to carry on, or to save what was done.

import { EMOM_GOAL, RECORD_WIDS, recordable, workoutById, type Exercise, type Workout } from '../../data/workouts.ts';
import { advise, bestSet, deloadOn, emomAdvice, emomNext, lastExercise, lighter, loadable, stalled, STALL_TEXT, ticked, type Advice, type LastEx } from '../../logic/progress.ts';
import { Clock } from '../../logic/seq.ts';
import { makeEntry, type SetLog } from '../../logic/store.ts';
import { KNEE_STEPS, kneeAdvice, legDays } from '../../logic/knee.ts';
import { dayKey, esc, mmss, shortDay } from '../../logic/util.ts';
import { buzz, say, sfx, unlock } from '../audio.ts';
import { addEntry, ask, closePlayer, ctx, mountPlayer, ovEl, save, toast, type Player } from '../ctx.ts';
import { lite, slam } from '../fx.ts';
import { howHtml } from '../how.ts';
import { ic } from '../icons.ts';
import { art } from '../art.ts';
import { chrome, setText } from './common.ts';

interface EmomState {
  min: number;
  reps: number;
  st: 'setup' | 'run' | 'done';
  marks: boolean[];
  clock: Clock;
  lastSec: number;
  lastMin: number;
}

interface XS {
  ex: Exercise;
  lvl: number;
  vals: number[];
  done: boolean[];
  last?: LastEx;
  /** The session before `last`. */
  prev?: LastEx;
  kg: number;
  emom?: EmomState;
  /** The best set of this session so far, for records. */
  best?: number;
}

const unitOf = (ex: Exercise): SetLog['unit'] =>
  ex.type === 'emom' ? 'emom' : ex.type === 'ytw' ? 'ytw' : ex.type === 'done' ? 'done' : ex.type === 'time' || ex.id === 'hang' ? 'sec' : 'reps';
const isSec = (ex: Exercise): boolean => unitOf(ex) === 'sec';
/** What a ticked set is: 5-5-5 for Y-T-W, the exercise's own label otherwise. */
const tickLabel = (ex: Exercise): string => (ex.type === 'ytw' ? '5 Y, 5 T, 5 W' : ex.label ?? 'O serie');

function targetLine(ex: Exercise): string {
  if (ex.type === 'emom') return 'EMOM';
  if (ex.type === 'ytw') return `${ex.sets} × 5-5-5`;
  if (ex.type === 'done') return `${ex.sets} × ${ex.label ?? 'serie'}`;
  if (ex.type === 'max') return ex.sets > 1 ? `${ex.sets} × maxim` : '1 × maxim';
  const r = ex.lo === ex.hi ? `${ex.lo}` : `${ex.lo}–${ex.hi}`;
  return `${ex.sets} × ${r}${ex.type === 'time' ? ' s' : ''}${ex.perSide ? ' pe parte' : ''}`;
}

// ---------- the draft: the session as it stands, kept after every change ----------
const DRAFT_KEY = 'beast:draft:v1';

interface DraftX {
  id: string;
  lvl: number;
  vals: number[];
  done: boolean[];
  kg: number;
  emom?: { min: number; reps: number; marks: boolean[]; st: EmomState['st'] };
}

export interface WorkoutDraft {
  wid: string;
  block?: string;
  name: string;
  /** When the session started (ms), and the seconds it had run when last kept. */
  start: number;
  elapsed: number;
  i: number;
  xs: DraftX[];
}

export function workoutDraft(): WorkoutDraft | null {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null') as WorkoutDraft | null;
    return d && typeof d.wid === 'string' && Array.isArray(d.xs) ? d : null;
  } catch {
    return null;
  }
}

function writeDraft(d: WorkoutDraft | null): void {
  try {
    if (d) localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
    else localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* storage full or blocked: the session still saves at the end */
  }
}

export function dropWorkoutDraft(): void {
  writeDraft(null);
}

/** Sets ticked (and EMOM minutes marked) in a draft: nothing to offer when it is zero. */
export function draftSets(d: WorkoutDraft): number {
  return d.xs.reduce((s, x) => s + x.done.filter(Boolean).length + (x.emom ? x.emom.marks.filter(Boolean).length : 0), 0);
}

class WorkoutPlayer implements Player {
  st: 'ready' | 'ex' | 'done' = 'ready';
  w: Workout;
  block?: string;
  i = 0;
  xs: XS[];
  t0 = 0;
  timer = 0;
  rest: { end: number; total: number; next: string } | null = null;
  hold: { k: number; start: number } | null = null;
  lastRestSec = -1;
  saved = false;
  savedEntry: SetLog[] = [];
  /** When the session began; a draft carried over from another day is saved on its own date. */
  startTs = 0;
  /** Built only to save a draft, without a screen. */
  silent = false;
  /** Records set in this session, for the done screen. */
  recs: Array<{ name: string; v: number; prev: number; sec: boolean }> = [];
  /** Accepted lighter week: fewer sets, and nothing here moves the progression. */
  deload = deloadOn(ctx.S.deload, dayKey());

  constructor(wid: string, block?: string, draft?: WorkoutDraft, silent = false) {
    this.w = workoutById(wid);
    this.block = block;
    this.silent = silent;
    this.xs = this.w.ex.map((ex) => this.initX(this.deload ? { ...ex, sets: lighter(ex.sets) } : ex, ctx.S.lvl[ex.id] ?? ex.start));
    if (draft) this.apply(draft);
    if (!silent) this.render();
  }

  /** Puts a kept session back: variations, numbers, ticks, weights, the exercise it was on and the elapsed time. */
  apply(d: WorkoutDraft): void {
    for (const dx of d.xs) {
      const k = this.xs.findIndex((x) => x.ex.id === dx.id);
      if (k < 0) continue;
      const x = this.initX(this.xs[k].ex, dx.lvl);
      x.vals = x.vals.map((v, j) => (typeof dx.vals[j] === 'number' ? dx.vals[j] : v));
      x.done = x.done.map((_, j) => !!dx.done[j]);
      x.kg = dx.kg || x.kg;
      // a running EMOM cannot pick up its clock again: it keeps the minutes marked and counts as finished
      if (x.emom && dx.emom) x.emom = { ...x.emom, min: dx.emom.min, reps: dx.emom.reps, marks: dx.emom.marks, st: dx.emom.st === 'setup' ? 'setup' : 'done' };
      this.xs[k] = x;
    }
    this.block = d.block ?? this.block;
    this.i = Math.max(0, Math.min(this.xs.length - 1, d.i));
    this.startTs = d.start;
    this.t0 = Date.now() - d.elapsed * 1000;
    this.st = 'ex';
    if (!this.silent) {
      window.clearInterval(this.timer);
      this.timer = window.setInterval(() => this.tick(), 250);
    }
  }

  /** Keeps the session as it stands, after every change. */
  persist(): void {
    if (this.st !== 'ex' || this.saved || this.silent) return;
    writeDraft({
      wid: this.w.id,
      block: this.block,
      name: this.w.name,
      start: this.startTs || this.t0,
      elapsed: Math.round((Date.now() - this.t0) / 1000),
      i: this.i,
      xs: this.xs.map((x) => ({ id: x.ex.id, lvl: x.lvl, vals: [...x.vals], done: [...x.done], kg: x.kg, ...(x.emom ? { emom: { min: x.emom.min, reps: x.emom.reps, marks: [...x.emom.marks], st: x.emom.st } } : {}) })),
    });
  }

  initX(ex: Exercise, lvl: number): XS {
    const last = lastExercise(ctx.S.log, ex.id);
    const prev = last ? lastExercise(ctx.S.log, ex.id, last.ts) : undefined;
    const nextKg = advise(ex, last, lvl, prev).kg;
    const lastSets = last && last.lvl === lvl && !nextKg ? last.log.sets : [];
    const base = ex.type === 'max' ? 0 : ex.lo ?? 0;
    const vals = Array.from({ length: ex.sets }, (_, k) => {
      const v = lastSets[k];
      if (typeof v === 'number' && v > 0) return v;
      if (ex.type === 'max' && last && last.lvl === lvl) return Math.max(0, ...last.log.sets.filter((x): x is number => typeof x === 'number'));
      return base;
    });
    const top = Math.min(lvl, ex.vars.length - 1);
    const kg = loadable(ex, top) ? nextKg ?? (last?.lvl === lvl ? last.log.kg ?? 0 : 0) : 0;
    const xs: XS = { ex, lvl: top, vals, done: Array(ex.sets).fill(false), last, prev, kg };
    if (ex.type === 'emom') xs.emom = { min: this.deload ? lighter(ctx.S.emom.min) : ctx.S.emom.min, reps: ctx.S.emom.reps, st: 'setup', marks: [], clock: new Clock(), lastSec: -1, lastMin: -1 };
    return xs;
  }

  get x(): XS {
    return this.xs[this.i];
  }

  // ---------- rendering ----------
  render(): void {
    const el = ovEl();
    if (this.st === 'ready') el.innerHTML = this.readyHtml();
    else if (this.st === 'ex') el.innerHTML = this.exHtml();
    else el.innerHTML = this.doneHtml();
  }

  readyHtml(): string {
    const rows = this.xs
      .map((x) => {
        const l = x.last;
        const prev = !l ? 'Prima dată' : ticked(x.ex) ? `Data trecută: ${l.log.sets.filter((v) => v).length} serii` : `Data trecută: ${l.log.sets.filter((v) => v !== null && v > 0).join(', ')}${isSec(x.ex) ? ' s' : ''}${l.log.kg ? ` cu ${String(l.log.kg).replace('.', ',')} kg` : ''}`;
        return `<li class="ex-line" style="grid-template-columns:1fr auto"><div><b>${esc(x.ex.vars[x.lvl])}</b><span>${esc(targetLine(x.ex))}${x.ex.opt ? ', opțional' : ''}. ${esc(prev)}</span></div></li>`;
      })
      .join('');
    return chrome(
      this.w.name,
      `<h1 class="pl-h">${esc(this.w.name)}</h1>
      <p class="pl-sub">${this.xs.filter((x) => !x.ex.opt).length} exerciții${this.xs.some((x) => x.ex.opt) ? ` și ${this.xs.filter((x) => x.ex.opt).length} opționale` : ''}, aproximativ ${this.w.min} de minute cu pauze</p>
      ${this.resumeHtml()}
      <p class="dim">La fiecare exercițiu alegi varianta potrivită. Seriile de forță se opresc cu 1–3 repetări înainte de limită. Când atingi capătul intervalului la toate seriile, aplicația îți propune pasul următor: altă variantă sau mai multă greutate.</p>
      ${this.deload ? '<div class="advice">Săptămână ușoară: mai puține serii, fără să forțezi. Sesiunea nu se numără la progres.</div>' : ''}
      <ul class="hist" style="margin:8px 0 18px">${rows}</ul>
      <button class="btn" data-a="p:begin">Start</button>`,
    );
  }

  /** A kept session of this same workout: carry on from it (Start begins a new one and drops it). */
  resumeHtml(): string {
    const d = workoutDraft();
    if (!d || d.wid !== this.w.id || !draftSets(d)) return '';
    const when = new Date(d.start);
    const time = `${String(when.getHours()).padStart(2, '0')}:${String(when.getMinutes()).padStart(2, '0')}`;
    const day = dayKey(when) === dayKey() ? `azi la ${time}` : `${shortDay(dayKey(when))}, ${time}`;
    const n = draftSets(d);
    return `<div class="advice up">Ai ${n} ${n === 1 ? 'serie bifată' : 'serii bifate'} dintr-o sesiune începută ${day}. <button class="link" style="color:inherit;padding:0" data-a="p:resume">Continuă de unde ai rămas</button></div>`;
  }

  dots(): string {
    return `<div class="ex-dots">${this.xs.map((x, k) => `<i class="${k === this.i ? 'on' : x.done.some(Boolean) || x.emom?.st === 'done' ? 'ok' : ''}"></i>`).join('')}</div>`;
  }

  exHtml(): string {
    const x = this.x;
    const ex = x.ex;
    const elapsed = mmss((Date.now() - this.t0) / 1000);
    let main = '';
    if (ex.type === 'emom') main = this.emomHtml(x);
    else main = this.setsHtml(x);
    const varChips =
      ex.vars.length > 1
        ? `<div class="vars" role="group" aria-label="Variante">${ex.vars.map((v, k) => `<button class="chip" aria-pressed="${k === x.lvl}" data-a="p:lvl" data-k="${k}">${esc(v)}</button>`).join('')}</div>`
        : '';
    const adv = this.advice(x);
    const advHtml = adv.text ? `<div class="advice ${adv.kind === 'up' ? 'up' : ''}">${esc(adv.text)}${adv.lvl !== undefined && adv.lvl !== x.lvl ? ` <button class="link" style="color:inherit;padding:0" data-a="p:lvl" data-k="${adv.lvl}">Alege</button>` : ''}</div>` : '';
    const lastVals = x.last ? (ticked(ex) ? `${x.last.log.sets.filter((v) => v).length} serii` : `${x.last.log.sets.filter((v) => v !== null && v > 0).join(', ')}${isSec(ex) ? ' s' : ''}${x.last.log.kg ? ` cu ${String(x.last.log.kg).replace('.', ',')} kg` : ''}`) : '';
    const lastLine = x.last && ex.type !== 'emom' ? `<p class="prev">Data trecută (${shortDay(x.last.date)}, ${esc(ex.vars[x.last.lvl] ?? '')}): ${lastVals}</p>` : '';
    const isLast = this.i === this.xs.length - 1;
    // between sets the thumb goes to the sets, so they come right after the goal; the instructions follow them
    const body = `
      ${this.dots()}
      <p class="small dim" style="margin:6px 0 0">Exercițiul ${this.i + 1} din ${this.xs.length}, <span id="el">${elapsed}</span>${ex.opt ? ', opțional' : ''}</p>
      <h1 class="pl-h">${esc(ex.vars[x.lvl])}</h1>
      ${varChips}
      <p class="target">${esc(targetLine(ex))}</p>
      ${advHtml}
      ${lastLine}
      ${main}
      <p class="cue">${esc(ex.cue)}</p>
      ${howHtml(ex.id, ex.vars[x.lvl])}
      ${ex.alex ? `<p class="alex"><b>Alex:</b> ${esc(ex.alex)}</p>` : ''}`;
    const nav = `<div class="ex-nav">${this.i > 0 ? `<button class="btn ghost" data-a="p:back">Înapoi</button>` : ''}<button class="btn" data-a="p:next">${isLast ? 'Termină' : 'Următorul'}</button></div>`;
    const over = this.rest ? this.restHtml() : this.hold ? this.holdHtml() : '';
    return chrome(this.w.name, body, { cls: '' }).replace(/<\/div>\s*$/, `${nav}${over}</div>`);
  }

  advice(x: XS): Advice {
    if (this.deload) return { kind: 'stay', text: '' };
    const kn = kneeAdvice(x.ex.id, x.lvl, legDays(ctx.S.log, ctx.S.knee));
    if (kn) return kn;
    const adv = advise(x.ex, x.last, x.lvl, x.prev);
    return adv.kind === 'stay' && adv.text && !ticked(x.ex) && stalled(ctx.S.log, x.ex.id, x.lvl, x.kg) ? { ...adv, text: STALL_TEXT } : adv;
  }

  kgHtml(x: XS): string {
    if (!loadable(x.ex, x.lvl)) return '';
    const unit = x.ex.bar ? 'kg cu tot cu bara (20 kg), opțional' : x.ex.load ? 'kg pe o ganteră, opțional' : 'kg, opțional';
    return `<div class="field"><div class="field-l">Greutate<small>${unit}</small></div><input type="number" inputmode="decimal" step="0.5" min="0" max="300" value="${x.kg || ''}" data-a="p:kg" aria-label="Greutate în kg" style="width:96px"></div>`;
  }

  setsHtml(x: XS): string {
    const ex = x.ex;
    const rows = x.vals
      .map((v, k) => {
        const d = x.done[k];
        const ctl =
          ticked(ex)
            ? `<span class="dim" style="font-weight:600">${esc(tickLabel(ex))}</span>`
            : `<div class="stepper" role="group" aria-label="Seria ${k + 1}"><button data-a="p:v" data-k="${k}" data-d="-1" aria-label="Scade">−</button>${isSec(ex) ? `<output>${v} s</output>` : `<input type="number" inputmode="numeric" pattern="[0-9]*" min="0" max="999" value="${v}" data-a="p:vin" data-k="${k}" aria-label="Repetări, seria ${k + 1}">`}<button data-a="p:v" data-k="${k}" data-d="1" aria-label="Crește">+</button></div>`;
        const okLabel = d ? 'Anulează seria' : isSec(ex) && !d ? 'Pornește cronometrul' : 'Bifează seria';
        return `<div class="set ${d ? 'done' : ''}"><span class="sn">Seria ${k + 1}</span>${ctl}<button class="ok" data-a="p:set" data-k="${k}" aria-label="${okLabel}">${ic(isSec(ex) && !d ? 'play' : 'check')}</button></div>`;
      })
      .join('');
    return `${this.kgHtml(x)}<div class="sets">${rows}</div>`;
  }

  emomHtml(x: XS): string {
    const e = x.emom!;
    const toGoal = Math.round(((e.min * e.reps) / (EMOM_GOAL.min * EMOM_GOAL.reps)) * 100);
    if (e.st === 'setup') {
      const ea = this.deload ? null : emomAdvice(ctx.S.log, ctx.S.emom, x.lvl, x.ex.vars);
      const show = ea && (ea.lvl !== undefined || ea.reps !== e.reps);
      return `
        ${show ? `<div class="advice">${esc(ea.text)} <button class="link" style="color:inherit;padding:0" ${ea.lvl !== undefined ? `data-a="p:lvl" data-k="${ea.lvl}"` : `data-a="p:eadv" data-k="${ea.reps}"`}>Alege</button></div>` : ''}
        ${this.kgHtml(x)}
        <div class="setup">
          <div class="field"><div class="field-l">Minute</div><div class="stepper"><button data-a="p:emin" data-d="-1" aria-label="Scade">−</button><output>${e.min}</output><button data-a="p:emin" data-d="1" aria-label="Crește">+</button></div></div>
          <div class="field"><div class="field-l">Tracțiuni pe minut</div><div class="stepper"><button data-a="p:ereps" data-d="-1" aria-label="Scade">−</button><output>${e.reps}</output><button data-a="p:ereps" data-d="1" aria-label="Crește">+</button></div></div>
        </div>
        <p class="small dim">Azi: ${e.min * e.reps} tracțiuni. Drumul spre ${EMOM_GOAL.min} × ${EMOM_GOAL.reps}: ${toGoal}%. Ținta crește după două sesiuni complete la rând.</p>
        <div class="bar"><i style="width:${Math.min(100, toGoal)}%"></i></div>
        <button class="btn" data-a="p:estart">Start EMOM</button>`;
    }
    if (e.st === 'run') {
      const t = e.clock.t;
      const m = Math.min(e.min - 1, Math.floor(t / 60));
      const left = 60 - (t - m * 60);
      const marked = e.marks[m];
      return `
        <p class="round-lbl">Minutul <span id="em">${m + 1}</span> din ${e.min}</p>
        <div class="mid-time" id="et">${mmss(Math.ceil(left))}</div>
        <p class="pl-sub" style="margin-bottom:12px">${e.reps} × ${esc(x.ex.vars[x.lvl])}, apoi pauză până la minutul următor</p>
        <button class="tap-big" data-a="p:emark" style="${marked ? 'background:transparent;color:inherit;box-shadow:inset 0 0 0 3px currentColor' : ''}">${marked ? 'Făcut ✓' : 'Făcut'}</button>
        <p class="small dim" style="margin-top:10px">Minute făcute: ${e.marks.filter(Boolean).length}. <button class="link" data-a="p:estop">Oprește EMOM-ul</button></p>`;
    }
    const n = e.marks.filter(Boolean).length;
    const nx = this.nextEmom(e, n);
    return `<div class="advice ${n >= e.min && !this.deload ? 'up' : ''}">${n} din ${e.min} minute făcute.${this.deload ? '' : ` Data viitoare: ${nx.min} × ${nx.reps}.`}</div>`;
  }

  /** Once saved, this session is in the log and the next target is already set. */
  nextEmom(e: EmomState, done: number): { min: number; reps: number } {
    return this.saved ? ctx.S.emom : emomNext({ min: e.min, reps: e.reps }, done, ctx.S.log);
  }

  restHtml(): string {
    const r = this.rest!;
    const left = Math.max(0, (r.end - performance.now()) / 1000);
    return `<div class="rest-ov" role="timer"><p class="phase-lbl">Pauză</p><div class="big-time" id="rt">${mmss(Math.ceil(left))}</div><p class="pl-sub">Urmează: ${esc(r.next)}</p><div class="btn-row" style="width:100%;max-width:420px"><button class="btn ghost" data-a="p:rest15">+15 s</button><button class="btn" data-a="p:restskip">Gata</button></div></div>`;
  }

  holdHtml(): string {
    const h = this.hold!;
    const ex = this.x.ex;
    const s = (performance.now() - h.start) / 1000;
    const target = ex.lo ? `Țintă: ${ex.lo}–${ex.hi} s` : 'Cât poți de mult';
    return `<div class="rest-ov" role="timer"><p class="phase-lbl">${esc(ex.vars[this.x.lvl])}</p><div class="big-time" id="ht">${Math.floor(s)}</div><p class="pl-sub">${esc(target)}</p><button class="btn" style="max-width:420px" data-a="p:holdstop">Stop</button></div>`;
  }

  /** What today's sets lead to. */
  advise(x: XS, sets: Array<number | null>): Advice {
    return advise(x.ex, { log: { id: x.ex.id, name: x.ex.vars[x.lvl], sets, unit: unitOf(x.ex), kg: x.kg || undefined }, lvl: x.lvl, date: '' }, x.lvl, x.last);
  }

  doneHtml(): string {
    const lines = this.xs
      .filter((x) => x.done.some(Boolean) || x.emom?.st === 'done')
      .map((x) => {
        if (x.ex.type === 'emom') {
          const e = x.emom!;
          const n = e.marks.filter(Boolean).length;
          const nx = this.nextEmom(e, n);
          return `<li><div><b>${esc(x.ex.vars[x.lvl])}</b><span>${n} din ${e.min} minute × ${e.reps}.${this.deload ? '' : ` Data viitoare: ${nx.min} × ${nx.reps}.`}</span></div></li>`;
        }
        const sets = x.vals.map((v, k) => (x.done[k] ? v : null));
        const adv = this.advise(x, sets);
        const tip = this.deload ? '' : adv.kind === 'up' ? ` ${adv.text} Data viitoare pornești direct de acolo.` : adv.kind === 'down' || adv.kind === 'top' ? ` ${adv.text}` : '';
        const vals = ticked(x.ex) ? `${sets.filter((v) => v !== null).length} serii` : `${sets.filter((v) => v !== null).join(', ')}${isSec(x.ex) ? ' s' : ''}${x.kg ? ` cu ${String(x.kg).replace('.', ',')} kg` : ''}`;
        return `<li><div><b>${esc(x.ex.vars[x.lvl])}</b><span>${vals}${tip ? '.' : ''}${esc(tip)}</span></div></li>`;
      })
      .join('');
    return chrome(
      this.w.name,
      `${art('claws', 'done-claws')}<h1 class="pl-h done-h">Gata.</h1>
      <p class="lead">${mmss((Date.now() - this.t0) / 1000)} de antrenament. ${this.saved ? 'Salvat în progres.' : ''}</p>
      ${this.recs.length ? `<div class="advice"><b>${this.recs.length === 1 ? 'Record nou' : 'Recorduri noi'}:</b> ${this.recs.map((r) => `${esc(r.name)} ${r.v}${r.sec ? ' s' : ''} (înainte ${r.prev}${r.sec ? ' s' : ''})`).join(', ')}.</div>` : ''}
      <ul class="hist">${lines || '<li><span>Nicio serie bifată.</span></li>'}</ul>
      ${this.w.id === 'legs' && this.saved ? this.kneeHtml() : ''}
      <div style="height:16px"></div>
      <button class="btn" data-a="p:close">Închide</button>`,
    );
  }

  /** After Leg Day: how the knees felt during the session (the next morning is asked on Azi). */
  kneeHtml(): string {
    const cur = ctx.S.knee[this.sessionDate()]?.d;
    return `<div class="knee-q"><p class="label">Genunchii, azi la antrenament</p>
      <div class="chips knee">${KNEE_STEPS.map(([v, l]) => `<button class="chip" aria-pressed="${cur === v}" data-a="p:knee" data-k="${v}">${l}</button>`).join('')}</div>
      <p class="small dim">Mâine dimineață te întreb din nou, pe ecranul Azi. Trei Leg Day-uri la rând fără durere și săriturile încep să revină.</p></div>`;
  }

  /** The day the session belongs to: the day it started. */
  sessionDate(): string {
    return dayKey(new Date(this.startTs || this.t0 || Date.now()));
  }

  // ---------- timing ----------
  tick(): void {
    setText('el', mmss((Date.now() - this.t0) / 1000));
    if (this.rest) {
      const left = (this.rest.end - performance.now()) / 1000;
      const s = Math.ceil(left);
      if (s !== this.lastRestSec) {
        this.lastRestSec = s;
        setText('rt', mmss(Math.max(0, s)));
        if (s <= 3 && s >= 1) sfx.tick();
      }
      if (left <= 0) {
        this.rest = null;
        sfx.go();
        buzz([250, 80, 250]);
        this.render();
      }
    }
    if (this.hold) setText('ht', String(Math.floor((performance.now() - this.hold.start) / 1000)));
    const e = this.x?.emom;
    if (e && e.st === 'run') {
      const t = e.clock.t;
      if (t >= e.min * 60) {
        e.st = 'done';
        e.clock.pause();
        sfx.bell(3);
        buzz([300, 120, 300]);
        return this.render();
      }
      const m = Math.floor(t / 60);
      const s = Math.ceil(60 - (t - m * 60));
      if (m !== e.lastMin) {
        e.lastMin = m;
        this.persist();
        if (m > 0) {
          sfx.go();
          buzz(300);
        }
        return this.render();
      }
      if (s !== e.lastSec) {
        e.lastSec = s;
        setText('et', mmss(s));
        if (s <= 3 && s >= 1) sfx.tick();
      }
    }
  }

  startRest(sec: number, next: string): void {
    if (sec <= 0) return;
    this.rest = { end: performance.now() + sec * 1000, total: sec, next };
    this.lastRestSec = -1;
  }

  nextLabel(k: number): string {
    const x = this.x;
    const nextSet = x.done.findIndex((d, j) => !d && j !== k);
    if (nextSet >= 0) return `seria ${nextSet + 1}`;
    const nx = this.xs[this.i + 1];
    return nx ? nx.ex.vars[nx.lvl] : 'finalul';
  }

  // ---------- actions ----------
  act(a: string, el: HTMLElement): void {
    this.doAct(a, el);
    this.persist();
  }

  doAct(a: string, el: HTMLElement): void {
    const x = this.x;
    const k = Number(el.dataset.k ?? -1);
    const d = Number(el.dataset.d ?? 0);
    switch (a) {
      case 'p:begin':
        unlock();
        dropWorkoutDraft();
        this.st = 'ex';
        this.t0 = Date.now();
        this.startTs = this.t0;
        this.timer = window.setInterval(() => this.tick(), 250);
        return this.render();
      case 'p:resume': {
        const d = workoutDraft();
        if (!d || d.wid !== this.w.id) return;
        unlock();
        this.apply(d);
        return this.render();
      }
      case 'p:knee': {
        const v = Number(el.dataset.k);
        const day = this.sessionDate();
        ctx.S.knee[day] = { ...(ctx.S.knee[day] ?? {}), d: v };
        save();
        return this.render();
      }
      case 'p:lvl': {
        const nx = this.initX(x.ex, k);
        nx.done = x.done.map(() => false);
        if (x.done.some(Boolean)) {
          nx.done = [...x.done];
          nx.vals = x.vals.map((v, j) => (x.done[j] ? v : nx.vals[j]));
        }
        if (x.emom) nx.emom = x.emom;
        this.xs[this.i] = nx;
        return this.render();
      }
      case 'p:v': {
        const step = isSec(x.ex) ? 5 : 1;
        x.vals[k] = Math.max(0, Math.min(999, x.vals[k] + d * step));
        if (x.done[k]) x.done[k] = x.vals[k] > 0;
        return this.render();
      }
      case 'p:vin': {
        // Typed reps: commit on change without re-rendering, so a tap on ✓ right after typing still lands.
        const inp = el as HTMLInputElement;
        this.typeReps(k, inp.value);
        inp.value = String(x.vals[k]);
        return;
      }
      case 'p:set':
        if (x.done[k]) {
          x.done[k] = false;
          return this.render();
        }
        if (isSec(x.ex)) {
          unlock();
          this.hold = { k, start: performance.now() };
          sfx.go();
          return this.render();
        }
        if (!ticked(x.ex) && x.vals[k] <= 0) return;
        x.done[k] = true;
        if (ticked(x.ex)) x.vals[k] = 1;
        sfx.beep();
        buzz(60);
        this.afterSet(k);
        return this.render();
      case 'p:holdstop': {
        if (!this.hold) return;
        const s = Math.round((performance.now() - this.hold.start) / 1000);
        const hk = this.hold.k;
        this.hold = null;
        if (s > 0) {
          x.vals[hk] = s;
          x.done[hk] = true;
          sfx.beep();
          this.afterSet(hk);
        }
        return this.render();
      }
      case 'p:rest15':
        if (this.rest) this.rest.end += 15000;
        return;
      case 'p:restskip':
        this.rest = null;
        return this.render();
      case 'p:next':
        this.rest = null;
        this.hold = null;
        if (this.i < this.xs.length - 1) {
          this.i++;
          ovEl().querySelector('.pl-body')?.scrollTo(0, 0);
          return this.render();
        }
        return this.finish();
      case 'p:back':
        this.rest = null;
        this.hold = null;
        this.i = Math.max(0, this.i - 1);
        return this.render();
      case 'p:eadv':
        if (x.emom) x.emom.reps = k;
        return this.render();
      case 'p:emin':
        if (x.emom) x.emom.min = Math.max(1, Math.min(40, x.emom.min + d));
        return this.render();
      case 'p:ereps':
        if (x.emom) x.emom.reps = Math.max(1, Math.min(20, x.emom.reps + d));
        return this.render();
      case 'p:estart':
        if (!x.emom) return;
        unlock();
        x.emom.st = 'run';
        x.emom.marks = Array(x.emom.min).fill(false);
        x.emom.lastMin = 0;
        x.emom.clock.start();
        sfx.go();
        buzz(300);
        say(`${x.emom.reps} pull-ups`, 'en');
        return this.render();
      case 'p:emark': {
        const e = x.emom;
        if (!e || e.st !== 'run') return;
        const m = Math.min(e.min - 1, Math.floor(e.clock.t / 60));
        e.marks[m] = !e.marks[m];
        if (e.marks[m]) sfx.beep();
        return this.render();
      }
      case 'p:estop':
        if (x.emom) {
          x.emom.st = 'done';
          x.emom.clock.pause();
        }
        return this.render();
    }
  }

  input(el: HTMLElement): void {
    if (el.dataset.a === 'p:vin') this.typeReps(Number(el.dataset.k), (el as HTMLInputElement).value);
    if (el.dataset.a === 'p:kg') this.x.kg = Math.max(0, Math.min(300, parseFloat((el as HTMLInputElement).value) || 0));
    this.persist();
  }

  typeReps(k: number, raw: string): void {
    const x = this.x;
    const n = parseInt(raw, 10);
    x.vals[k] = Math.max(0, Math.min(999, Number.isFinite(n) ? n : 0));
    if (x.done[k] && x.vals[k] <= 0) {
      x.done[k] = false;
      ovEl().querySelectorAll('.set')[k]?.classList.remove('done');
    }
  }

  /** A set past the best ever on this variation (bodyweight sets of the strength days): RECORD, once per new best. */
  checkRecord(k: number): void {
    const x = this.x;
    if (!RECORD_WIDS.includes(this.w.id) || !recordable(x.ex) || x.kg) return;
    const v = x.vals[k];
    const prev = bestSet(ctx.S.log, x.ex.id, x.lvl)?.v ?? 0;
    const bar = Math.max(prev, x.best ?? 0);
    x.best = Math.max(x.best ?? 0, v);
    // the first time on a variation sets the mark; a record has to beat one
    if (!prev || v <= bar) return;
    const name = x.ex.vars[x.lvl];
    const sec = isSec(x.ex);
    const i = this.recs.findIndex((r) => r.name === name);
    if (i >= 0) this.recs[i].v = v;
    else this.recs.push({ name, v, prev, sec });
    buzz([80, 60, 160]);
    const what = `${name}: ${v}${sec ? ' s' : ''}`;
    if (lite()) toast(`Record: ${what}`);
    else slam('Record', what);
  }

  afterSet(k: number): void {
    this.checkRecord(k);
    const x = this.x;
    const allDone = x.done.every(Boolean);
    const lastEx = this.i === this.xs.length - 1;
    if (allDone && lastEx) return;
    this.startRest(x.ex.rest, this.nextLabel(k));
  }

  finish(): void {
    this.saveEntry();
    this.st = 'done';
    window.clearInterval(this.timer);
    sfx.bell(3);
    this.render();
  }

  saveEntry(): void {
    if (this.saved) return;
    const ex: Array<SetLog & { lvl: number }> = [];
    for (const x of this.xs) {
      if (x.ex.type === 'emom') {
        const e = x.emom!;
        if (e.st === 'setup') continue;
        const n = e.marks.filter(Boolean).length;
        ex.push({ id: x.ex.id, name: x.ex.vars[x.lvl], lvl: x.lvl, unit: 'emom', sets: e.marks.map((m) => (m ? e.reps : null)), emom: { min: e.min, reps: e.reps, done: n }, ...(x.kg ? { kg: x.kg } : {}) });
        if (!this.deload) ctx.S.emom = emomNext({ min: e.min, reps: e.reps }, n, ctx.S.log);
        ctx.S.lvl[x.ex.id] = x.lvl;
        continue;
      }
      if (!x.done.some(Boolean)) continue;
      const sets = x.vals.map((v, k) => (x.done[k] ? v : null));
      ex.push({ id: x.ex.id, name: x.ex.vars[x.lvl], lvl: x.lvl, unit: unitOf(x.ex), sets, ...(x.kg ? { kg: x.kg } : {}) });
      const adv = this.advise(x, sets);
      // Progression is mandatory: the next session opens on the harder variation (the chips can still go back).
      ctx.S.lvl[x.ex.id] = adv.kind === 'up' && adv.lvl !== undefined && !this.deload ? adv.lvl : x.lvl;
    }
    if (!ex.length) {
      dropWorkoutDraft();
      return;
    }
    const core = this.xs.filter((x) => !x.ex.opt);
    const doneCore = core.filter((x) => ex.some((e) => e.id === x.ex.id)).length;
    // a session carried over from an earlier day is saved on that day
    const other = this.startTs && dayKey(new Date(this.startTs)) !== dayKey();
    addEntry(
      makeEntry({
        kind: 'workout',
        block: doneCore * 2 >= core.length ? this.block : undefined,
        name: this.w.name,
        dur: Math.min((Date.now() - this.t0) / 1000, 4 * 3600),
        data: { wid: this.w.id, ex, ...(this.deload ? { deload: true } : {}) },
        ...(other ? { ts: this.startTs } : {}),
      }),
    );
    save();
    this.saved = true;
    dropWorkoutDraft();
  }

  close(): boolean {
    if (this.st !== 'ex') return true;
    const any = this.xs.some((x) => x.done.some(Boolean) || (x.emom && x.emom.st !== 'setup'));
    if (!any) {
      dropWorkoutDraft();
      return true;
    }
    ask('Te oprești?', 'Salvez seriile bifate până acum?', 'Salvează și ieși', () => {
      this.saveEntry();
      closePlayer(true);
    }, 'Continuă');
    return false;
  }

  destroy(): void {
    window.clearInterval(this.timer);
  }
}

export function openWorkout(wid: string, block?: string): void {
  mountPlayer(new WorkoutPlayer(wid, block));
}

/** Opens the kept session where it stopped. */
export function resumeWorkout(): void {
  const d = workoutDraft();
  if (d) mountPlayer(new WorkoutPlayer(d.wid, d.block, d));
}

/** Saves the kept session as it is, without opening it. */
export function saveWorkoutDraft(): boolean {
  const d = workoutDraft();
  if (!d) return false;
  const p = new WorkoutPlayer(d.wid, d.block, d, true);
  p.saveEntry();
  dropWorkoutDraft();
  return p.saved;
}
