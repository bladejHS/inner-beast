// Monday's 10-minute bodyweight workout: squats, push-ups and pull-ups, as many rounds as possible.

import { BW_MOVES, BW_SCHEMES } from '../../data/workouts.ts';
import { Clock } from '../../logic/seq.ts';
import { makeEntry } from '../../logic/store.ts';
import { esc, mmss, shortDay } from '../../logic/util.ts';
import { buzz, sfx, unlock } from '../audio.ts';
import { addEntry, ask, closePlayer, ctx, mountPlayer, ovEl, save, type Player } from '../ctx.ts';
import { howHtml } from '../how.ts';
import { chrome, ctrlBtn, setText, stepper } from './common.ts';

const PREP = 5;

class AmrapPlayer implements Player {
  st: 'ready' | 'run' | 'done' = 'ready';
  min: number;
  scheme: number;
  rounds = 0;
  extra = 0;
  clock = new Clock();
  timer = 0;
  lastSec = -1;
  started = false;
  saved = false;
  block?: string;

  constructor(block?: string, min = 10) {
    this.block = block;
    this.min = min;
    this.scheme = ctx.S.set.bwScheme;
    this.render();
  }

  get reps(): number[] {
    return BW_SCHEMES[this.scheme].reps;
  }

  last(): { rounds: number; extra: number; date: string; scheme: number } | null {
    for (let i = ctx.S.log.length - 1; i >= 0; i--) {
      const e = ctx.S.log[i];
      if (e.kind === 'amrap') return { rounds: Number(e.data.rounds) || 0, extra: Number(e.data.extra) || 0, date: e.date, scheme: Number(e.data.scheme) || 0 };
    }
    return null;
  }

  render(): void {
    const el = ovEl();
    const moves = (big: boolean) =>
      `<ul class="amrap-moves">${BW_MOVES.map((m, i) => `<li><span>${esc(m)}</span><b${big ? '' : ' style="font-size:22px"'}>${this.reps[i]}</b></li>`).join('')}</ul>`;
    if (this.st === 'ready') {
      const l = this.last();
      el.innerHTML = chrome(
        'Bodyweight Workout',
        `<h1 class="pl-h">Bodyweight Workout</h1>
        <p class="pl-sub">${this.min} minute, cât mai multe runde</p>
        <p class="dim">O rundă înseamnă toate trei exercițiile, în ordine. Numeri rundele, apoi repetările din runda neterminată.</p>
        <div class="chips" style="margin:14px 0 4px">${BW_SCHEMES.map((s, i) => `<button class="chip" aria-pressed="${i === this.scheme}" data-a="p:scheme" data-i="${i}">${esc(s.name)} ${s.reps.join('-')}</button>`).join('')}</div>
        ${moves(true)}
        ${BW_MOVES.map((m) => howHtml(m, undefined, { title: `Cum se face: ${m}` })).join('')}
        ${l ? `<p class="prev">Data trecută (${shortDay(l.date)}): ${l.rounds} runde + ${l.extra} repetări${l.scheme !== this.scheme ? ', altă variantă' : ''}. Progresia e obligatorie: bate-l.</p>` : ''}
        <button class="btn" data-a="p:start" style="margin-top:14px">Start</button>`,
      );
      return;
    }
    if (this.st === 'run') {
      const t = this.clock.t;
      const prep = t < PREP;
      const left = prep ? PREP - t : this.min * 60 - (t - PREP);
      const paused = !this.clock.running;
      el.innerHTML = chrome(
        'Bodyweight Workout',
        `<p class="phase-lbl">${prep ? 'Pregătește-te' : 'Timp rămas'}</p>
        <div class="mid-time" id="t">${mmss(Math.ceil(left))}</div>
        ${moves(false)}
        <p class="round-lbl" style="margin:8px 0 12px">Runde: <span id="rn">${this.rounds}</span></p>
        <button class="tap-big" data-a="p:add" ${prep ? 'disabled' : ''}>+1 rundă</button>
        <button class="link" data-a="p:undo">Anulează ultima rundă</button>`,
        { cls: prep ? 'ph-prep' : '', ctrl: ctrlBtn('p:pause', paused ? 'play' : 'pause', paused ? 'Continuă' : 'Pauză', true) },
      );
      return;
    }
    el.innerHTML = chrome(
      'Bodyweight Workout',
      `<h1 class="pl-h">Timpul a expirat.</h1>
      <p class="lead">${this.rounds} runde complete.</p>
      <p>Câte repetări ai mai făcut în runda neterminată?</p>
      ${stepper('p:extra', String(this.extra), 'Repetări în plus')}
      <div style="height:18px"></div>
      <button class="btn" data-a="p:save">${this.saved ? 'Salvat' : 'Salvează'}</button>
      <button class="link" data-a="p:close">Închide</button>`,
      { center: true },
    );
  }

  start(): void {
    unlock();
    ctx.S.set.bwScheme = this.scheme;
    save();
    this.st = 'run';
    this.clock.start();
    this.render();
    this.timer = window.setInterval(() => this.tick(), 200);
  }

  tick(): void {
    const t = this.clock.t;
    if (!this.started && t >= PREP) {
      this.started = true;
      sfx.go();
      buzz(300);
      this.render();
    }
    const left = t < PREP ? PREP - t : this.min * 60 - (t - PREP);
    if (left <= 0) return this.finish();
    const s = Math.ceil(left);
    if (s !== this.lastSec) {
      this.lastSec = s;
      setText('t', mmss(s));
      if (t < PREP && s <= 3) sfx.tick();
      if (t >= PREP && (s === 60 || s === 10)) {
        sfx.warn();
        buzz(120);
      }
    }
  }

  finish(): void {
    window.clearInterval(this.timer);
    this.clock.pause();
    sfx.bell(3);
    buzz([300, 120, 300]);
    this.st = 'done';
    this.render();
  }

  saveEntry(): void {
    if (this.saved) return;
    const worked = Math.max(0, Math.min(this.clock.t - PREP, this.min * 60));
    addEntry(
      makeEntry({
        kind: 'amrap',
        block: worked >= this.min * 60 - 1 ? this.block : undefined,
        name: 'Bodyweight Workout',
        dur: worked,
        data: { rounds: this.rounds, extra: this.extra, scheme: this.scheme, reps: this.reps, min: this.min },
      }),
    );
    this.saved = true;
  }

  act(a: string, el: HTMLElement): void {
    switch (a) {
      case 'p:scheme':
        this.scheme = Number(el.dataset.i) || 0;
        return this.render();
      case 'p:start':
        return this.start();
      case 'p:add':
        if (this.clock.t < PREP) return;
        this.rounds++;
        sfx.beep();
        buzz(60);
        setText('rn', String(this.rounds));
        return;
      case 'p:undo':
        this.rounds = Math.max(0, this.rounds - 1);
        setText('rn', String(this.rounds));
        return;
      case 'p:pause':
        if (this.clock.running) this.clock.pause();
        else this.clock.resume();
        return this.render();
      case 'p:extra':
        this.extra = Math.max(0, Math.min(60, this.extra + Number(el.dataset.d || 0)));
        return this.render();
      case 'p:save':
        this.saveEntry();
        return closePlayer(true);
    }
  }

  close(): boolean {
    if (this.st === 'done' && !this.saved) {
      this.saveEntry();
      return true;
    }
    if (this.st !== 'run' || this.clock.t < PREP + 30) return true;
    this.clock.pause();
    this.render();
    ask('Te oprești?', `Ai ${this.rounds} runde până acum.`, 'Salvează și ieși', () => {
      this.saveEntry();
      closePlayer(true);
    }, 'Continuă', false, () => {
      this.clock.resume();
      this.render();
    });
    return false;
  }

  destroy(): void {
    window.clearInterval(this.timer);
  }
}

export function openAmrap(block?: string, min = 10): void {
  mountPlayer(new AmrapPlayer(block, min));
}
