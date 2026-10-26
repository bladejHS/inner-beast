// Calisthenics workout player: variations, sets with last-time numbers, rest timer, hold timer and the pull-up EMOM.

import { EMOM_GOAL, workoutById, type Exercise, type Workout } from '../../data/workouts.ts';
import { advise, emomNext, lastExercise, type LastEx } from '../../logic/progress.ts';
import { Clock } from '../../logic/seq.ts';
import { makeEntry, type SetLog } from '../../logic/store.ts';
import { esc, mmss, shortDay } from '../../logic/util.ts';
import { buzz, say, sfx, unlock } from '../audio.ts';
import { addEntry, ask, closePlayer, ctx, mountPlayer, ovEl, save, type Player } from '../ctx.ts';
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
  emom?: EmomState;
}

const unitOf = (ex: Exercise): SetLog['unit'] =>
  ex.type === 'emom' ? 'emom' : ex.type === 'ytw' ? 'ytw' : ex.type === 'time' || ex.id === 'hang' ? 'sec' : 'reps';
const isSec = (ex: Exercise): boolean => unitOf(ex) === 'sec';

function targetLine(ex: Exercise): string {
  if (ex.type === 'emom') return 'EMOM';
  if (ex.type === 'ytw') return `${ex.sets} × 5-5-5`;
  if (ex.type === 'max') return ex.sets > 1 ? `${ex.sets} × maxim` : '1 × maxim';
  const r = ex.lo === ex.hi ? `${ex.lo}` : `${ex.lo}–${ex.hi}`;
  return `${ex.sets} × ${r}${ex.type === 'time' ? ' s' : ''}${ex.perSide ? ' pe parte' : ''}`;
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

  constructor(wid: string, block?: string) {
    this.w = workoutById(wid);
    this.block = block;
    this.xs = this.w.ex.map((ex) => this.initX(ex, ctx.S.lvl[ex.id] ?? ex.start));
    this.render();
  }

  initX(ex: Exercise, lvl: number): XS {
    const last = lastExercise(ctx.S.log, ex.id);
    const lastSets = last && last.lvl === lvl ? last.log.sets : [];
    const base = ex.type === 'max' ? 0 : ex.lo ?? 0;
    const vals = Array.from({ length: ex.sets }, (_, k) => {
      const v = lastSets[k];
      if (typeof v === 'number' && v > 0) return v;
      if (ex.type === 'max' && last) return Math.max(0, ...last.log.sets.filter((x): x is number => typeof x === 'number'));
      return base;
    });
    const xs: XS = { ex, lvl: Math.min(lvl, ex.vars.length - 1), vals, done: Array(ex.sets).fill(false), last };
    if (ex.type === 'emom') xs.emom = { min: ctx.S.emom.min, reps: ctx.S.emom.reps, st: 'setup', marks: [], clock: new Clock(), lastSec: -1, lastMin: -1 };
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
        const prev = !l ? 'Prima dată' : x.ex.type === 'ytw' ? `Data trecută: ${l.log.sets.filter((v) => v).length} serii` : `Data trecută: ${l.log.sets.filter((v) => v !== null && v > 0).join(', ')}${isSec(x.ex) ? ' s' : ''}`;
        return `<li class="ex-line" style="grid-template-columns:1fr auto"><div><b>${esc(x.ex.vars[x.lvl])}</b><span>${esc(targetLine(x.ex))}${x.ex.opt ? ', opțional' : ''}. ${esc(prev)}</span></div></li>`;
      })
      .join('');
    return chrome(
      this.w.name,
      `<h1 class="pl-h">${esc(this.w.name)}</h1>
      <p class="pl-sub">${this.xs.length} exerciții${this.w.id === 'legs' ? '' : ', aproximativ 50–60 de minute cu pauze'}</p>
      <p class="dim">La fiecare exercițiu alegi varianta potrivită. Când atingi capătul intervalului la toate seriile, aplicația îți propune varianta următoare: progresia e obligatorie.</p>
      <ul class="hist" style="margin:8px 0 18px">${rows}</ul>
      <button class="btn" data-a="p:begin">Start</button>`,
    );
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
    const adv = advise(ex, x.last, x.lvl);
    const advHtml = adv.text ? `<div class="advice ${adv.kind === 'up' ? 'up' : ''}">${esc(adv.text)}${adv.lvl !== undefined && adv.lvl !== x.lvl ? ` <button class="link" style="color:inherit;padding:0" data-a="p:lvl" data-k="${adv.lvl}">Alege</button>` : ''}</div>` : '';
    const lastVals = x.last ? (ex.type === 'ytw' ? `${x.last.log.sets.filter((v) => v).length} serii` : `${x.last.log.sets.filter((v) => v !== null && v > 0).join(', ')}${isSec(ex) ? ' s' : ''}`) : '';
    const lastLine = x.last && ex.type !== 'emom' ? `<p class="prev">Data trecută (${shortDay(x.last.date)}, ${esc(ex.vars[x.last.lvl] ?? '')}): ${lastVals}</p>` : '';
    const isLast = this.i === this.xs.length - 1;
    const body = `
      ${this.dots()}
      <p class="small dim" style="margin:6px 0 0">Exercițiul ${this.i + 1} din ${this.xs.length}, <span id="el">${elapsed}</span>${ex.opt ? ', opțional' : ''}</p>
      <h1 class="pl-h">${esc(ex.vars[x.lvl])}</h1>
      ${varChips}
      <p class="target">${esc(targetLine(ex))}</p>
      ${advHtml}
      <p class="cue">${esc(ex.cue)}</p>
      ${howHtml(ex.id, ex.vars[x.lvl])}
      ${ex.alex ? `<p class="alex"><b>Alex:</b> ${esc(ex.alex)}</p>` : ''}
      ${lastLine}
      ${main}`;
    const nav = `<div class="ex-nav">${this.i > 0 ? `<button class="btn ghost" data-a="p:back">Înapoi</button>` : ''}<button class="btn" data-a="p:next">${isLast ? 'Termină' : 'Următorul'}</button></div>`;
    const over = this.rest ? this.restHtml() : this.hold ? this.holdHtml() : '';
    return chrome(this.w.name, body, { cls: '' }).replace(/<\/div>\s*$/, `${nav}${over}</div>`);
  }

  setsHtml(x: XS): string {
    const ex = x.ex;
    const rows = x.vals
      .map((v, k) => {
        const d = x.done[k];
        const ctl =
          ex.type === 'ytw'
            ? `<span class="dim" style="font-weight:600">5 Y, 5 T, 5 W</span>`
            : `<div class="stepper" role="group" aria-label="Seria ${k + 1}"><button data-a="p:v" data-k="${k}" data-d="-1" aria-label="Scade">−</button><output>${v}${isSec(ex) ? ' s' : ''}</output><button data-a="p:v" data-k="${k}" data-d="1" aria-label="Crește">+</button></div>`;
        const okLabel = d ? 'Anulează seria' : isSec(ex) && !d ? 'Pornește cronometrul' : 'Bifează seria';
        return `<div class="set ${d ? 'done' : ''}"><span class="sn">Seria ${k + 1}</span>${ctl}<button class="ok" data-a="p:set" data-k="${k}" aria-label="${okLabel}">${ic(isSec(ex) && !d ? 'play' : 'check')}</button></div>`;
      })
      .join('');
    return `<div class="sets">${rows}</div>`;
  }

  emomHtml(x: XS): string {
    const e = x.emom!;
    const toGoal = Math.round(((e.min * e.reps) / (EMOM_GOAL.min * EMOM_GOAL.reps)) * 100);
    if (e.st === 'setup') {
      return `
        <div class="setup">
          <div class="field"><div class="field-l">Minute</div><div class="stepper"><button data-a="p:emin" data-d="-1" aria-label="Scade">−</button><output>${e.min}</output><button data-a="p:emin" data-d="1" aria-label="Crește">+</button></div></div>
          <div class="field"><div class="field-l">Tracțiuni pe minut</div><div class="stepper"><button data-a="p:ereps" data-d="-1" aria-label="Scade">−</button><output>${e.reps}</output><button data-a="p:ereps" data-d="1" aria-label="Crește">+</button></div></div>
        </div>
        <p class="small dim">Azi: ${e.min * e.reps} tracțiuni. Drumul spre 30 × 10 al lui Alex: ${toGoal}%.</p>
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
    const nx = emomNext({ min: e.min, reps: e.reps }, n);
    return `<div class="advice ${n >= e.min ? 'up' : ''}">${n} din ${e.min} minute făcute. Data viitoare: ${nx.min} × ${nx.reps}.</div>`;
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

  doneHtml(): string {
    const lines = this.xs
      .filter((x) => x.done.some(Boolean) || x.emom?.st === 'done')
      .map((x) => {
        if (x.ex.type === 'emom') {
          const e = x.emom!;
          const n = e.marks.filter(Boolean).length;
          const nx = emomNext({ min: e.min, reps: e.reps }, n);
          return `<li><div><b>${esc(x.ex.vars[x.lvl])}</b><span>${n} din ${e.min} minute × ${e.reps}. Data viitoare: ${nx.min} × ${nx.reps}.</span></div></li>`;
        }
        const sets = x.vals.map((v, k) => (x.done[k] ? v : null));
        const adv = advise(x.ex, { log: { id: x.ex.id, name: x.ex.vars[x.lvl], sets, unit: unitOf(x.ex) }, lvl: x.lvl, date: '' }, x.lvl);
        const tip = adv.kind === 'up' || adv.kind === 'down' || adv.kind === 'top' ? ` ${adv.text}` : '';
        const vals = x.ex.type === 'ytw' ? `${sets.filter((v) => v !== null).length} × 5-5-5` : `${sets.filter((v) => v !== null).join(', ')}${isSec(x.ex) ? ' s' : ''}`;
        return `<li><div><b>${esc(x.ex.vars[x.lvl])}</b><span>${vals}${tip ? '.' : ''}${esc(tip)}</span></div></li>`;
      })
      .join('');
    return chrome(
      this.w.name,
      `${art('claws', 'done-claws')}<h1 class="pl-h done-h">Gata.</h1>
      <p class="lead">${mmss((Date.now() - this.t0) / 1000)} de antrenament. ${this.saved ? 'Salvat în progres.' : ''}</p>
      <ul class="hist">${lines || '<li><span>Nicio serie bifată.</span></li>'}</ul>
      <div style="height:16px"></div>
      <button class="btn" data-a="p:close">Închide</button>`,
    );
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
    const x = this.x;
    const k = Number(el.dataset.k ?? -1);
    const d = Number(el.dataset.d ?? 0);
    switch (a) {
      case 'p:begin':
        unlock();
        this.st = 'ex';
        this.t0 = Date.now();
        this.timer = window.setInterval(() => this.tick(), 250);
        return this.render();
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
        if (x.ex.type !== 'ytw' && x.vals[k] <= 0) return;
        x.done[k] = true;
        if (x.ex.type === 'ytw') x.vals[k] = 1;
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

  afterSet(k: number): void {
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
        ex.push({ id: x.ex.id, name: x.ex.vars[x.lvl], lvl: x.lvl, unit: 'emom', sets: e.marks.map((m) => (m ? e.reps : null)), emom: { min: e.min, reps: e.reps, done: n } });
        ctx.S.emom = emomNext({ min: e.min, reps: e.reps }, n);
        ctx.S.lvl[x.ex.id] = x.lvl;
        continue;
      }
      if (!x.done.some(Boolean)) continue;
      ex.push({ id: x.ex.id, name: x.ex.vars[x.lvl], lvl: x.lvl, unit: unitOf(x.ex), sets: x.vals.map((v, k) => (x.done[k] ? v : null)) });
      ctx.S.lvl[x.ex.id] = x.lvl;
    }
    if (!ex.length) return;
    const core = this.xs.filter((x) => !x.ex.opt);
    const doneCore = core.filter((x) => ex.some((e) => e.id === x.ex.id)).length;
    addEntry(
      makeEntry({
        kind: 'workout',
        block: doneCore * 2 >= core.length ? this.block : undefined,
        name: this.w.name,
        dur: (Date.now() - this.t0) / 1000,
        data: { wid: this.w.id, ex },
      }),
    );
    save();
    this.saved = true;
  }

  close(): boolean {
    if (this.st !== 'ex') return true;
    const any = this.xs.some((x) => x.done.some(Boolean) || (x.emom && x.emom.st !== 'setup'));
    if (!any) return true;
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
