// Round timer for Shadow Boxing, Heavy Bag, Jumping Rope and Wall Sit / Jumping Squats,
// with Alex Hanma's combinations called out during the rounds.

import type { ComboFocus } from '../../data/plan.ts';
import { focusCombos, ROPE_MOVES, FOCUS_LINE, type Combo } from '../../data/combos.ts';
import { REST_TIPS } from '../../data/alex.ts';
import { Clock, doneSec, locate, phaseStart, roundsSeq, type Phase } from '../../logic/seq.ts';
import { makeEntry } from '../../logic/store.ts';
import { esc, mmss } from '../../logic/util.ts';
import { buzz, say, sfx, unlock, hush } from '../audio.ts';
import { addEntry, ask, closePlayer, ctx, mountPlayer, ovEl, save, toast, type Player } from '../ctx.ts';
import { howHtml } from '../how.ts';
import { chrome, ctrlBtn, field, setText, stepper, switchCtl } from './common.ts';

export interface RoundsCfg {
  name: string;
  rounds: number;
  work: number;
  rest: number;
  focus?: ComboFocus;
  block?: string;
  tip?: string;
  legSwap?: boolean;
}

interface Call {
  name: string;
  seq: string[];
  say: string;
  note?: string;
}

const LEG_CUES: Record<'wall' | 'jump', string> = {
  wall: 'Spatele lipit de perete, genunchii la 90°, coapsele paralele cu solul. Respiră calm.',
  jump: 'Cobori până la paralel, sari exploziv, aterizezi moale cu genunchii în afară.',
};

class RoundsPlayer implements Player {
  st: 'ready' | 'run' | 'done' = 'ready';
  cfg: RoundsCfg;
  phases: Phase[] = [];
  clock = new Clock();
  timer = 0;
  lastI = -1;
  lastSec = -1;
  calls: Call[] = [];
  call: Call | null = null;
  callIdx = -1;
  lastCall = -999;
  caller: boolean;
  tip = '';
  saved = false;

  constructor(cfg: RoundsCfg) {
    this.cfg = { ...cfg };
    if (cfg.legSwap) this.cfg.name = ctx.S.set.legMode === 'jump' ? 'Jumping Squats' : 'Wall Sit';
    this.calls = this.buildCalls();
    this.caller = this.calls.length > 0 && ctx.S.set.callEvery > 0;
    this.render();
  }

  buildCalls(): Call[] {
    const f = this.cfg.focus;
    if (f === 'rope') return ROPE_MOVES.map((m) => ({ name: m.name, seq: [], say: m.call, note: m.note }));
    return focusCombos(f).map((c: Combo) => ({ name: c.name, seq: c.seq, say: c.call, note: c.note }));
  }

  get every(): number {
    const base = ctx.S.set.callEvery || 15;
    return this.cfg.focus === 'slow' ? base * 2 : this.cfg.focus === 'power' ? base + 5 : base;
  }

  render(): void {
    const el = ovEl();
    if (this.st === 'ready') el.innerHTML = this.readyHtml();
    else if (this.st === 'run') el.innerHTML = this.runHtml();
    else el.innerHTML = this.doneHtml();
  }

  readyHtml(): string {
    const c = this.cfg;
    const legs = c.legSwap
      ? field('Exercițiu', `<div class="chips"><button class="chip" aria-pressed="${ctx.S.set.legMode === 'wall'}" data-a="p:leg" data-v="wall">Wall Sit</button><button class="chip" aria-pressed="${ctx.S.set.legMode === 'jump'}" data-a="p:leg" data-v="jump">Jumping Squats</button></div>`)
      : '';
    const callerRow = this.calls.length
      ? field(c.focus === 'rope' ? 'Mișcări strigate' : 'Combinații strigate', switchCtl('p:caller', this.caller, 'Combinații strigate'), `La fiecare ${this.every} s, cu voce`)
      : '';
    const body = `
      <h1 class="pl-h">${esc(c.name)}</h1>
      ${c.focus && FOCUS_LINE[c.focus] ? `<p class="pl-sub">${esc(FOCUS_LINE[c.focus])}</p>` : ''}
      ${c.tip ? `<p class="dim">${esc(c.tip)}</p>` : ''}
      ${c.legSwap ? `<p class="dim">${esc(LEG_CUES[ctx.S.set.legMode])}</p>` : ''}
      ${howHtml(c.legSwap ? (ctx.S.set.legMode === 'jump' ? 'Jumping Squats' : 'Wall Sit') : c.name, undefined, { open: true })}
      <div class="setup">
        ${legs}
        ${field('Runde', stepper('p:rounds', String(c.rounds), 'Runde'))}
        ${field('Lucru', stepper('p:work', mmss(c.work), 'Lucru'))}
        ${c.rounds > 1 ? field('Pauză', stepper('p:rest', mmss(c.rest), 'Pauză'), 'Cartea nu dă pauza; 1 minut e standardul din box') : ''}
        ${callerRow}
      </div>
      <button class="btn" data-a="p:start">Start</button>`;
    return chrome(c.name, body);
  }

  runHtml(): string {
    const L = locate(this.phases, this.clock.t);
    const p = this.phases[L.i];
    const last = p.kind === 'work' && L.left <= 10 && this.cfg.work > 20;
    const cls = p.kind === 'work' ? (last ? 'ph-last' : 'ph-work') : p.kind === 'prep' ? 'ph-prep' : 'ph-rest';
    const roundTxt = p.round ? `Runda ${p.round} din ${p.rounds}` : '';
    let panel = '';
    if (p.kind === 'work' && this.call && this.caller) panel = this.callHtml('Acum');
    else if (p.kind === 'work' && this.cfg.legSwap) panel = `<div class="call-box"><h4>Formă</h4><p style="margin:0">${esc(LEG_CUES[ctx.S.set.legMode])}</p></div>`;
    else if (p.kind === 'rest' && this.tip) panel = `<div class="call-box"><h4>Sfat de la Alex</h4><p style="margin:0;font-weight:600">${esc(this.tip)}</p></div>`;
    else if (p.kind === 'rest') panel = `<div class="call-box"><h4>Urmează</h4><p style="margin:0;font-weight:600">Runda ${(p.round ?? 0) + 1} din ${p.rounds}. Respiră adânc.</p></div>`;
    else if (p.kind === 'prep') panel = this.cfg.tip ? `<div class="call-box"><h4>Focus</h4><p style="margin:0;font-weight:600">${esc(this.cfg.tip)}</p></div>` : '';
    const body = `
      <p class="phase-lbl" id="ph">${esc(p.kind === 'work' ? (this.cfg.focus && FOCUS_LINE[this.cfg.focus]) || 'Lucru' : p.label)}</p>
      <div class="big-time" id="t">${mmss(Math.ceil(L.left))}</div>
      <p class="round-lbl" id="rd">${esc(roundTxt)}</p>
      ${panel}`;
    const paused = !this.clock.running;
    const ctrl =
      ctrlBtn('p:prev', 'prev', 'Înapoi') +
      ctrlBtn('p:pause', paused ? 'play' : 'pause', paused ? 'Continuă' : 'Pauză', true) +
      ctrlBtn('p:skip', 'next', 'Sari') +
      (this.caller && p.kind === 'work' ? ctrlBtn('p:combo', 'bolt', 'Altă combinație') : '');
    return chrome(this.cfg.name, body, { cls, ctrl, center: true });
  }

  callHtml(h: string): string {
    const c = this.call!;
    return `<div class="call-box" aria-live="polite"><h4>${esc(h)}</h4><div class="c-name">${esc(c.name)}</div>${c.seq.length ? `<div class="seq">${c.seq.map((s) => `<span>${esc(s)}</span>`).join('')}</div>` : ''}${c.note ? `<p class="small" style="margin:0">${esc(c.note)}</p>` : ''}</div>`;
  }

  doneHtml(): string {
    const r = this.roundsDone();
    const body = `
      <h1 class="pl-h">Gata.</h1>
      <p class="lead">${esc(this.cfg.name)}: ${r} din ${this.cfg.rounds} ${this.cfg.rounds === 1 ? 'rundă' : 'runde'}, ${mmss(doneSec(this.phases, this.clock.t, 'work'))} de lucru.</p>
      <p class="dim">${this.saved ? 'Salvat în progres.' : ''}</p>
      <button class="btn" data-a="p:close">Închide</button>`;
    return chrome(this.cfg.name, body, { center: true });
  }

  roundsDone(): number {
    const t = this.clock.t;
    return this.phases.filter((p, i) => p.kind === 'work' && phaseStart(this.phases, i) + p.sec <= t + 0.5).length;
  }

  start(): void {
    unlock();
    const c = this.cfg;
    this.phases = roundsSeq(c.rounds, c.work, c.rounds > 1 ? c.rest : 0, 5);
    this.clock.start();
    this.st = 'run';
    this.lastI = -1;
    this.render();
    this.timer = window.setInterval(() => this.tick(), 200);
    this.tick();
  }

  nextCall(speak = true): void {
    if (!this.calls.length) return;
    let i = Math.floor(Math.random() * this.calls.length);
    if (this.calls.length > 1 && i === this.callIdx) i = (i + 1) % this.calls.length;
    this.callIdx = i;
    this.call = this.calls[i];
    this.lastCall = this.clock.t;
    if (speak) say(this.call.say, 'en');
  }

  tick(): void {
    const L = locate(this.phases, this.clock.t);
    if (L.done) return this.finish();
    const p = this.phases[L.i];
    if (L.i !== this.lastI) {
      const first = this.lastI === -1;
      this.lastI = L.i;
      this.lastSec = -1;
      if (!first || p.kind !== 'prep') this.onPhase(p);
      this.render();
    }
    const sec = Math.ceil(L.left);
    if (sec !== this.lastSec) {
      this.lastSec = sec;
      setText('t', mmss(sec));
      if (p.kind === 'work') {
        if (sec === 10 && this.cfg.work > 20) {
          sfx.warn();
          buzz(120);
          this.render();
        }
      } else if (sec <= 3 && sec >= 1) sfx.tick();
    }
    if (p.kind === 'work' && this.caller && this.clock.running && this.clock.t - this.lastCall >= this.every && L.left > 5) {
      this.nextCall();
      this.render();
    }
  }

  onPhase(p: Phase): void {
    if (p.kind === 'work') {
      sfx.bell(1);
      buzz(350);
      if (this.caller) {
        this.nextCall(false);
        window.setTimeout(() => this.call && this.clock.running && say(this.call.say, 'en'), 900);
      }
    } else if (p.kind === 'rest') {
      sfx.bell(3);
      buzz([200, 100, 200]);
      hush();
      const boxing = this.cfg.focus && !['rope', 'legs'].includes(this.cfg.focus);
      this.tip = boxing ? REST_TIPS[Math.floor(Math.random() * REST_TIPS.length)] : '';
    }
  }

  finish(): void {
    window.clearInterval(this.timer);
    this.clock.pause();
    sfx.bell(3);
    buzz([300, 120, 300]);
    this.saveEntry();
    this.st = 'done';
    this.render();
  }

  saveEntry(): void {
    if (this.saved) return;
    const r = this.roundsDone();
    const work = doneSec(this.phases, this.clock.t, 'work');
    if (work < 30) return;
    const full = r >= Math.ceil(this.cfg.rounds * 0.8);
    addEntry(
      makeEntry({
        kind: 'rounds',
        block: full ? this.cfg.block : undefined,
        name: this.cfg.name,
        dur: this.clock.t,
        data: { rounds: r, planned: this.cfg.rounds, work: this.cfg.work, rest: this.cfg.rest, workDone: Math.round(work), focus: this.cfg.focus ?? '' },
      }),
    );
    this.saved = true;
    if (!full && this.cfg.block) toast('Salvat ca sesiune parțială.');
  }

  act(a: string, el: HTMLElement): void {
    const d = Number(el.dataset.d || 0);
    const c = this.cfg;
    switch (a) {
      case 'p:rounds':
        c.rounds = Math.max(1, Math.min(30, c.rounds + d));
        return this.render();
      case 'p:work':
        c.work = Math.max(30, Math.min(1800, c.work + d * (c.work >= 120 ? 30 : 15)));
        return this.render();
      case 'p:rest':
        c.rest = Math.max(0, Math.min(300, c.rest + d * 15));
        return this.render();
      case 'p:leg':
        ctx.S.set.legMode = el.dataset.v === 'jump' ? 'jump' : 'wall';
        c.name = ctx.S.set.legMode === 'jump' ? 'Jumping Squats' : 'Wall Sit';
        save();
        return this.render();
      case 'p:caller':
        this.caller = (el as HTMLInputElement).checked;
        return;
      case 'p:start':
        return this.start();
      case 'p:pause':
        if (this.clock.running) {
          this.clock.pause();
          hush();
        } else this.clock.resume();
        return this.render();
      case 'p:skip': {
        const L = locate(this.phases, this.clock.t);
        this.clock.set(phaseStart(this.phases, L.i + 1));
        return this.tick();
      }
      case 'p:prev': {
        const L = locate(this.phases, this.clock.t);
        const into = L.into;
        this.clock.set(phaseStart(this.phases, into > 3 ? L.i : Math.max(0, L.i - 1)));
        this.lastI = -2;
        return this.tick();
      }
      case 'p:combo':
        this.nextCall();
        return this.render();
    }
  }

  close(): boolean {
    if (this.st !== 'run') return true;
    const work = doneSec(this.phases, this.clock.t, 'work');
    if (work < 30) return true;
    const wasRunning = this.clock.running;
    this.clock.pause();
    this.render();
    ask(
      'Te oprești?',
      `Ai făcut ${this.roundsDone()} din ${this.cfg.rounds} runde. Salvez ce ai făcut până acum?`,
      'Salvează și ieși',
      () => {
        this.saveEntry();
        closePlayer(true);
      },
      'Continuă',
      false,
      () => {
        if (wasRunning) this.clock.resume();
        this.render();
      },
    );
    return false;
  }

  destroy(): void {
    window.clearInterval(this.timer);
  }
}

export function openRounds(cfg: RoundsCfg): void {
  const p = new RoundsPlayer(cfg);
  mountPlayer(p);
}
