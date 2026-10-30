// Round timer for Shadow Boxing, Heavy Bag, Jumping Rope / Agility Ladder and Wall Sit / Jumping Squats,
// with Alex Hanma's combinations called out during the rounds.

import { WARMUP, type ComboFocus } from '../../data/plan.ts';
import { focusCombos, LADDER_MOVES, ROPE_MOVES, FOCUS_LINE, roundThemes, type Combo, type RoundTheme } from '../../data/combos.ts';

/** The e-book's focus line for each block, as printed on the plan page. */
const BOOK_FOCUS: Record<string, string> = {
  jab: '„Focus on jabs & footwork”',
  move: '„Movement & punches”',
  slow: '„Slow and clean moves”',
  combo: '„Focus on combinations”',
  power: '„Angle changes & power”',
  distance: '„Distance work”',
  rope: '„Focus on light footwork”',
};
import { REST_TIPS } from '../../data/alex.ts';
import { Clock, doneSec, locate, phaseStart, roundsSeq, type Phase } from '../../logic/seq.ts';
import { makeEntry } from '../../logic/store.ts';
import { esc, mmss } from '../../logic/util.ts';
import { buzz, say, sfx, unlock, hush } from '../audio.ts';
import { addEntry, ask, closePlayer, ctx, mountPlayer, ovEl, save, toast, type Player } from '../ctx.ts';
import { slam } from '../fx.ts';
import { howHtml } from '../how.ts';
import { art } from '../art.ts';
import { chrome, ctrlBtn, field, setText, stepper, switchCtl } from './common.ts';

export interface RoundsCfg {
  name: string;
  rounds: number;
  work: number;
  rest: number;
  focus?: ComboFocus;
  block?: string;
  tip?: string;
  cues?: string[];
  legSwap?: boolean;
  /** Offer the 6-minute warm-up before round 1. */
  warmup?: boolean;
}

/** Last seconds of a round that turn into a straight-punch sprint (second half of the rounds). */
const SPRINT = 30;

/** Footwork drills (rope, ladder) are called as moves, not combinations. */
const isDrill = (f: ComboFocus | undefined): boolean => f === 'rope' || f === 'ladder';

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
  themes: RoundTheme[] = [];
  /** Sprint finish on the later rounds; on by default at the bag. */
  sprint: boolean;
  sprinting = false;
  warm: boolean;

  constructor(cfg: RoundsCfg) {
    this.cfg = { ...cfg };
    if (cfg.legSwap) this.cfg.name = ctx.S.set.legMode === 'jump' ? 'Jumping Squats' : 'Wall Sit';
    this.calls = this.buildCalls();
    this.themes = cfg.rounds > 1 ? roundThemes(cfg.focus, ctx.S.nut.h) : [];
    this.caller = this.calls.length > 0 && ctx.S.set.callEvery > 0;
    this.sprint = cfg.focus === 'move' || cfg.focus === 'power';
    this.warm = !!cfg.warmup;
    this.render();
  }

  /** The theme of a round (1-based), if the block has themes. */
  themeOf(round: number | undefined): RoundTheme | null {
    return round && this.themes.length ? this.themes[(round - 1) % this.themes.length] : null;
  }

  sprintRound(round: number | undefined): boolean {
    return this.sprint && !!round && round > Math.floor(this.cfg.rounds / 2) && this.cfg.work >= 90;
  }

  buildCalls(): Call[] {
    const f = this.cfg.focus;
    if (isDrill(f)) return (f === 'ladder' ? LADDER_MOVES : ROPE_MOVES).map((m) => ({ name: m.name, seq: [], say: m.call, note: m.note }));
    return focusCombos(f, ctx.S.nut.h).map((c: Combo) => ({ name: c.name, seq: c.seq, say: c.call, note: c.note }));
  }

  callsHtml(): string {
    const f = this.cfg.focus;
    if (!f || f === 'legs' || !this.calls.length) return '';
    const book = BOOK_FOCUS[f];
    const list = this.calls
      .map((c) => `<li><b>${esc(c.name)}</b>${c.seq.length ? `<span>${esc(c.seq.join(' → '))}</span>` : ''}</li>`)
      .join('');
    return `<details class="how" ${isDrill(f) ? '' : 'open'}><summary>${isDrill(f) ? 'Mișcările' : 'Combinațiile'} (${this.calls.length})</summary><div class="how-body">
      ${book ? `<p class="small" style="margin:0 0 8px"><b>Din carte:</b> ${esc(book)}</p>` : ''}
      <ul class="calls">${list}</ul>
      <p class="small dim" style="margin:6px 0 0">Ți le strig pe rând în timpul rundelor. Le găsești explicate în Lupte.</p>
    </div></details>`;
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
      ? field(isDrill(c.focus) ? 'Mișcări strigate' : 'Combinații strigate', switchCtl('p:caller', this.caller, 'Combinații strigate'), `La fiecare ${this.every} s, cu voce`)
      : '';
    const body = `
      <h1 class="pl-h">${esc(c.name)}</h1>
      ${c.focus && FOCUS_LINE[c.focus] ? `<p class="pl-sub">${esc(FOCUS_LINE[c.focus])}</p>` : ''}
      ${c.tip ? `<p class="dim">${esc(c.tip)}</p>` : ''}
      ${c.cues?.length ? `<ul class="ticks small">${c.cues.map((q) => `<li>${esc(q)}</li>`).join('')}</ul>` : ''}
      ${c.legSwap ? `<p class="dim">${esc(LEG_CUES[ctx.S.set.legMode])}</p>` : ''}
      ${howHtml(c.legSwap ? (ctx.S.set.legMode === 'jump' ? 'Jumping Squats' : 'Wall Sit') : c.name, undefined, { open: true })}
      ${this.themes.length ? `<div class="call-box"><h4>Tema fiecărei runde</h4><ol class="small" style="margin:0;padding-left:18px">${this.themes.map((t) => `<li><b>${esc(t.name)}</b>: ${esc(t.cue)}</li>`).join('')}</ol>${this.themes.length < c.rounds ? '<p class="small dim" style="margin:6px 0 0">Apoi se reiau în ordine.</p>' : ''}</div>` : ''}
      ${this.callsHtml()}
      <div class="setup">
        ${legs}
        ${c.warmup ? field('Încălzire', switchCtl('p:warm', this.warm, 'Încălzire'), `${WARMUP.length} mișcări, 6 min, înainte de runda 1`) : ''}
        ${this.calls.length && !isDrill(c.focus) && c.rounds > 1 && c.work >= 90 ? field('Sprint final', switchCtl('p:sprint', this.sprint, 'Sprint final'), `Ultimele ${SPRINT} s din a doua jumătate a rundelor`) : ''}
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
    const last = p.kind === 'work' && (L.left <= 10 || this.sprinting) && this.cfg.work > 20;
    const cls = p.kind === 'work' ? (last ? 'ph-last' : 'ph-work') : p.kind === 'prep' || p.kind === 'move' ? 'ph-prep' : 'ph-rest';
    const roundTxt = p.kind === 'move' ? `Încălzire ${p.round} din ${p.rounds}` : p.round ? `Runda ${p.round} din ${p.rounds}` : '';
    const theme = p.kind === 'work' ? this.themeOf(p.round) : null;
    let panel = '';
    if (p.kind === 'move') panel = `<div class="call-box"><h4>${esc(p.label)}</h4><p style="margin:0;font-weight:600">${esc(WARMUP[p.move ?? 0]?.cue ?? '')}</p></div>`;
    else if (p.kind === 'work' && this.sprinting) panel = '<div class="call-box"><h4>Sprint</h4><div class="c-name">Lovituri drepte, viteză maximă</div><p class="small" style="margin:0">Jab-cross non-stop, pe toată distanța. Garda revine la fiecare pumn.</p></div>';
    else if (p.kind === 'work' && this.call && this.caller) panel = this.callHtml(theme ? theme.name : 'Acum');
    else if (p.kind === 'work' && this.cfg.legSwap) panel = `<div class="call-box"><h4>Formă</h4><p style="margin:0">${esc(LEG_CUES[ctx.S.set.legMode])}</p></div>`;
    else if (p.kind === 'rest' && this.tip) panel = `<div class="call-box"><h4>Sfat de la Alex</h4><p style="margin:0;font-weight:600">${esc(this.tip)}</p></div>`;
    else if (p.kind === 'rest') panel = `<div class="call-box"><h4>Urmează</h4><p style="margin:0;font-weight:600">Runda ${(p.round ?? 0) + 1} din ${p.rounds}. Respiră adânc.</p></div>`;
    else if (p.kind === 'prep') panel = this.cfg.tip ? `<div class="call-box"><h4>Focus</h4><p style="margin:0;font-weight:600">${esc(this.cfg.tip)}</p></div>` : '';
    const body = `
      <p class="phase-lbl" id="ph">${esc(p.kind === 'work' ? (this.sprinting ? 'Sprint' : theme?.name || (this.cfg.focus && FOCUS_LINE[this.cfg.focus]) || 'Lucru') : p.kind === 'move' ? 'Încălzire' : p.label)}</p>
      <div class="big-time" id="t">${mmss(Math.ceil(L.left))}</div>
      <p class="round-lbl" id="rd">${esc(roundTxt)}</p>
      ${p.round && (p.rounds ?? 0) > 1 ? `<div class="rd-dots" aria-hidden="true">${Array.from({ length: p.rounds ?? 0 }, (_, i) => `<i class="${i + 1 < p.round! ? 'ok' : i + 1 === p.round ? (p.kind === 'work' ? 'on' : 'ok') : ''}"></i>`).join('')}</div>` : ''}
      ${panel}`;
    const paused = !this.clock.running;
    const ctrl =
      ctrlBtn('p:reset', 'refresh', 'Resetează') +
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
      ${art('claws', 'done-claws')}<h1 class="pl-h done-h">Gata.</h1>
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
    const rounds = roundsSeq(c.rounds, c.work, c.rounds > 1 ? c.rest : 0, 5);
    // Warm-up first: its moves, then a short "get ready" before round 1.
    this.phases = this.warm
      ? [rounds[0], ...WARMUP.map((m, i): Phase => ({ kind: 'move', sec: m.sec, label: m.name, move: i, round: i + 1, rounds: WARMUP.length })), { kind: 'prep', sec: 10, label: 'Gata de runda 1' }, ...rounds.slice(1)]
      : rounds;
    this.clock.start();
    this.st = 'run';
    this.lastI = -1;
    this.render();
    this.timer = window.setInterval(() => this.tick(), 200);
    this.tick();
  }

  /** Calls for the round now running: its theme's combinations, or all of the block's. */
  pool(): Call[] {
    const L = locate(this.phases, this.clock.t);
    const t = this.themeOf(this.phases[L.i]?.round);
    return t ? t.combos.map((c) => ({ name: c.name, seq: c.seq, say: c.call, note: c.note })) : this.calls;
  }

  nextCall(speak = true): void {
    const pool = this.pool();
    if (!pool.length) return;
    let i = Math.floor(Math.random() * pool.length);
    if (pool.length > 1 && i === this.callIdx) i = (i + 1) % pool.length;
    this.callIdx = i;
    this.call = pool[i];
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
        if (!this.sprinting && this.sprintRound(p.round) && sec <= SPRINT && sec > 1) {
          this.sprinting = true;
          hush();
          sfx.warn();
          buzz([150, 80, 150]);
          say('Sprint! Straight punches, full speed', 'en');
          this.render();
        } else if (sec === 10 && this.cfg.work > 20 && !this.sprinting) {
          sfx.warn();
          buzz(120);
          this.render();
        }
      } else if (sec <= 3 && sec >= 1) sfx.tick();
    }
    if (p.kind === 'work' && this.caller && !this.sprinting && this.clock.running && this.clock.t - this.lastCall >= this.every && L.left > 5) {
      this.nextCall();
      this.render();
    }
  }

  onPhase(p: Phase): void {
    this.sprinting = false;
    if (p.kind === 'move') {
      if (p.round === 1) slam('Încălzire', `${WARMUP.length} mișcări`);
      sfx.beep();
      buzz(120);
      return;
    }
    if (p.kind === 'work') {
      if (p.round && p.rounds && p.rounds > 1) slam(p.round === p.rounds ? 'Ultima rundă' : `Runda ${p.round}`, `din ${p.rounds}`);
      else slam('Start');
      sfx.bell(1);
      buzz(350);
      const th = this.themeOf(p.round);
      if (this.caller) {
        this.nextCall(false);
        if (th) window.setTimeout(() => this.clock.running && say(th.name, 'ro'), 300);
        window.setTimeout(() => this.call && this.clock.running && say(this.call.say, 'en'), 900);
      }
    } else if (p.kind === 'rest') {
      sfx.bell(3);
      buzz([200, 100, 200]);
      hush();
      const boxing = this.cfg.focus && !isDrill(this.cfg.focus) && this.cfg.focus !== 'legs';
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
      case 'p:sprint':
        this.sprint = (el as HTMLInputElement).checked;
        return;
      case 'p:warm':
        this.warm = (el as HTMLInputElement).checked;
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
      case 'p:reset': {
        const was = this.clock.running;
        this.clock.pause();
        hush();
        this.render();
        ask('Resetezi?', 'Timerul pornește din nou de la început.', 'Resetează', () => {
          this.clock.set(0);
          this.lastI = -2;
          this.clock.resume();
          this.tick();
        }, 'Renunță', false, () => {
          if (was) this.clock.resume();
          this.render();
        });
        return;
      }
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
