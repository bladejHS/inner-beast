// Machine Row, Thursday's alternative to the Heavy Bag: four challenges, timed here,
// with the distance read off the rowing machine's monitor and entered by hand.

import { ROW_CHALLENGES, rowChallenge, rowRests, rowTotal, type RowChallenge } from '../../data/row.ts';
import { Clock } from '../../logic/seq.ts';
import { makeEntry } from '../../logic/store.ts';
import { esc, mmss, num } from '../../logic/util.ts';
import { buzz, say, sfx, unlock, hush } from '../audio.ts';
import { addEntry, ask, closePlayer, ctx, mountPlayer, ovEl, save, toast, type Player } from '../ctx.ts';
import { slam } from '../fx.ts';
import { howHtml } from '../how.ts';
import { art } from '../art.ts';
import { chrome, ctrlBtn, setText } from './common.ts';

class RowPlayer implements Player {
  st: 'ready' | 'run' | 'done' = 'ready';
  ch: RowChallenge;
  block: string;
  clock = new Clock();
  timer = 0;
  /** Continuous challenges: metres entered from the monitor. */
  meters = 0;
  /** Interval challenge: finished interval times, and whether we're in the rest between two. */
  splits: number[] = [];
  resting = false;
  /** Clock time when the current interval or rest began. */
  segAt = 0;
  lastSec = -1;
  saved = false;

  constructor(block: string) {
    this.block = block;
    this.ch = rowChallenge(ctx.S.set.rowCh);
    this.render();
  }

  get interval(): boolean {
    return this.ch.reps > 1;
  }

  render(): void {
    const el = ovEl();
    if (this.st === 'ready') el.innerHTML = this.readyHtml();
    else if (this.st === 'run') el.innerHTML = this.interval ? this.intervalHtml() : this.continuousHtml();
    else el.innerHTML = this.doneHtml();
  }

  readyHtml(): string {
    const c = this.ch;
    const body = `
      <h1 class="pl-h">Machine Row</h1>
      <p class="pl-sub">${esc(c.name)}: ${esc(c.label)}</p>
      <div class="chips" role="group" aria-label="Provocarea" style="margin:14px 0">${ROW_CHALLENGES.map((x) => `<button class="chip" aria-pressed="${x.id === c.id}" data-a="p:ch" data-v="${x.id}">${x.id.toUpperCase()} · ${esc(x.label)}</button>`).join('')}</div>
      <p class="dim">${c.reps > 1 ? `${c.reps} intervale de ${c.meters} m, ${num(rowTotal(c))} m în total. ${c.rest} s pauză între intervale, fără pauză după ultimul.` : `${num(c.meters)} m continuu. Ține un ritm pe care îl poți duce până la capăt.`}</p>
      ${howHtml('Machine Row', undefined, { open: true })}
      <p class="small dim">Aplicația nu citește aparatul: ${c.reps > 1 ? 'apeși când monitorul arată 250 m la fiecare interval' : 'notezi distanța de pe monitor pe parcurs'}.</p>
      <button class="btn" data-a="p:start">Start</button>`;
    return chrome('Machine Row', body);
  }

  continuousHtml(): string {
    const c = this.ch;
    const pct = Math.min(100, (this.meters / c.meters) * 100);
    const body = `
      <p class="phase-lbl">${esc(c.name)}: ${esc(c.label)}</p>
      <div class="big-time" id="t">${mmss(Math.floor(this.clock.t))}</div>
      <p class="round-lbl"><b>${num(this.meters)}</b> din ${num(c.meters)} m, mai sunt ${num(Math.max(0, c.meters - this.meters))} m</p>
      <div class="bar" aria-hidden="true"><i style="width:${pct.toFixed(1)}%"></i></div>
      <div class="call-box"><h4>Distanța de pe monitor</h4>
        <div class="row"><div class="stepper" role="group" aria-label="Distanța"><button data-a="p:m" data-d="-1" aria-label="Scade 100 m">−</button><output>${num(this.meters)} m</output><button data-a="p:m" data-d="1" aria-label="Crește 100 m">+</button></div>
        <input type="number" inputmode="numeric" min="0" max="${c.meters}" step="10" data-a="p:mset" value="${this.meters || ''}" placeholder="metri" aria-label="Metri pe monitor" style="max-width:110px"></div>
      </div>
      <button class="btn" data-a="p:fin">${this.meters >= c.meters ? 'Gata' : `Am terminat ${esc(c.label)}`}</button>`;
    const paused = !this.clock.running;
    const ctrl = ctrlBtn('p:pause', paused ? 'play' : 'pause', paused ? 'Continuă' : 'Pauză', true);
    return chrome('Machine Row', body, { cls: paused ? 'ph-rest' : 'ph-work', ctrl, center: true });
  }

  intervalHtml(): string {
    const c = this.ch;
    const done = this.splits.length;
    const cur = done + 1;
    const left = this.resting ? Math.max(0, c.rest - (this.clock.t - this.segAt)) : 0;
    const t = this.resting ? Math.ceil(left) : Math.floor(this.clock.t - this.segAt);
    const body = `
      <p class="phase-lbl">${this.resting ? `Pauză · urmează intervalul ${cur} din ${c.reps}` : `Intervalul ${cur} din ${c.reps} · ${c.meters} m`}</p>
      <div class="big-time" id="t">${mmss(t)}</div>
      <p class="round-lbl">Făcute ${done} · Rămase ${c.reps - done}</p>
      <div class="rd-dots" aria-hidden="true">${Array.from({ length: c.reps }, (_, i) => `<i class="${i < done ? 'ok' : i === done && !this.resting ? 'on' : ''}"></i>`).join('')}</div>
      ${done ? `<div class="call-box"><h4>Timpi</h4><p style="margin:0;font-weight:600">${this.splits.map((s, i) => `${i + 1}. ${mmss(Math.round(s))}`).join(' · ')}</p></div>` : ''}
      ${this.resting ? '<button class="btn ghost" data-a="p:next">Sari pauza</button>' : `<button class="btn" data-a="p:split">Interval gata · ${c.meters} m</button>`}`;
    const paused = !this.clock.running;
    const ctrl = ctrlBtn('p:pause', paused ? 'play' : 'pause', paused ? 'Continuă' : 'Pauză', true);
    return chrome('Machine Row', body, { cls: this.resting ? 'ph-rest' : 'ph-work', ctrl, center: true });
  }

  doneHtml(): string {
    const c = this.ch;
    const meters = this.metersDone();
    const body = `
      ${art('claws', 'done-claws')}<h1 class="pl-h done-h">Gata.</h1>
      <p class="lead">${esc(c.name)}: ${num(meters)} din ${num(rowTotal(c))} m${this.interval ? `, ${this.splits.length} din ${c.reps} intervale` : ''}, în ${mmss(Math.round(this.clock.t))}.</p>
      <p class="dim">${this.saved ? 'Salvat în progres.' : ''}</p>
      <button class="btn" data-a="p:close">Închide</button>`;
    return chrome('Machine Row', body, { center: true });
  }

  metersDone(): number {
    return this.interval ? this.splits.length * this.ch.meters : Math.min(this.meters, this.ch.meters);
  }

  start(): void {
    unlock();
    this.meters = 0;
    this.splits = [];
    this.resting = false;
    this.clock.start();
    this.segAt = 0;
    this.st = 'run';
    slam('Start', `${this.ch.name}: ${this.ch.label}`);
    sfx.bell(1);
    buzz(350);
    this.render();
    this.timer = window.setInterval(() => this.tick(), 200);
  }

  tick(): void {
    if (this.interval && this.resting && this.clock.t - this.segAt >= this.ch.rest) return this.nextInterval();
    const t = this.interval && this.resting ? Math.ceil(this.ch.rest - (this.clock.t - this.segAt)) : Math.floor(this.clock.t - (this.interval ? this.segAt : 0));
    if (t === this.lastSec) return;
    this.lastSec = t;
    setText('t', mmss(t));
    if (this.interval && this.resting && t <= 3 && t >= 1) sfx.tick();
  }

  /** Interval done: rest before the next one, or finish after the last. */
  split(): void {
    this.splits.push(this.clock.t - this.segAt);
    this.segAt = this.clock.t;
    this.lastSec = -1;
    if (this.splits.length >= this.ch.reps) return this.finish();
    this.resting = true;
    sfx.bell(3);
    buzz([200, 100, 200]);
    say(`Rest ${this.ch.rest} seconds`, 'en');
    this.render();
  }

  nextInterval(): void {
    this.resting = false;
    this.segAt = this.clock.t;
    this.lastSec = -1;
    const n = this.splits.length + 1;
    slam(n === this.ch.reps ? 'Ultimul interval' : `Intervalul ${n}`, `din ${this.ch.reps}`);
    sfx.bell(1);
    buzz(350);
    this.render();
  }

  finish(): void {
    window.clearInterval(this.timer);
    this.clock.pause();
    hush();
    sfx.bell(3);
    buzz([300, 120, 300]);
    this.saveEntry();
    this.st = 'done';
    this.render();
  }

  saveEntry(): void {
    if (this.saved) return;
    const c = this.ch;
    const meters = this.metersDone();
    if (!meters) return;
    const full = meters >= rowTotal(c);
    addEntry(
      makeEntry({
        kind: 'row',
        block: full ? this.block : undefined,
        name: 'Machine Row',
        dur: this.clock.t,
        data: { challenge: `${c.name} (${c.label})`, ch: c.id, meters, target: rowTotal(c), reps: c.reps, intervals: this.splits.length, rests: rowRests(c), splits: this.splits.map((s) => Math.round(s)) },
      }),
    );
    this.saved = true;
    if (!full) toast('Salvat ca sesiune parțială.');
  }

  act(a: string, el: HTMLElement): void {
    switch (a) {
      case 'p:ch':
        // Only before the start, so a running piece never changes target under the clock.
        if (this.st !== 'ready') return;
        this.ch = rowChallenge(el.dataset.v);
        ctx.S.set.rowCh = this.ch.id;
        save();
        return this.render();
      case 'p:start':
        return this.start();
      case 'p:pause':
        if (this.clock.running) this.clock.pause();
        else this.clock.resume();
        return this.render();
      case 'p:m':
        this.meters = Math.max(0, Math.min(this.ch.meters, this.meters + Number(el.dataset.d || 0) * 100));
        return this.render();
      case 'p:fin':
        this.meters = this.ch.meters;
        return this.finish();
      case 'p:split':
        return this.split();
      case 'p:next':
        return this.nextInterval();
    }
  }

  input(el: HTMLElement): void {
    if (el.dataset.a !== 'p:mset') return;
    const v = Number((el as HTMLInputElement).value);
    this.meters = Number.isFinite(v) ? Math.max(0, Math.min(this.ch.meters, Math.round(v))) : 0;
    // Update the readouts without re-rendering, so typing keeps focus.
    const pct = Math.min(100, (this.meters / this.ch.meters) * 100);
    const bar = ovEl().querySelector<HTMLElement>('.bar i');
    if (bar) bar.style.width = `${pct.toFixed(1)}%`;
    const out = ovEl().querySelector('.stepper output');
    if (out) out.textContent = `${num(this.meters)} m`;
    const lbl = ovEl().querySelector('.round-lbl');
    if (lbl) lbl.innerHTML = `<b>${num(this.meters)}</b> din ${num(this.ch.meters)} m, mai sunt ${num(Math.max(0, this.ch.meters - this.meters))} m`;
  }

  close(): boolean {
    if (this.st !== 'run' || !this.metersDone()) return true;
    const wasRunning = this.clock.running;
    this.clock.pause();
    this.render();
    ask(
      'Te oprești?',
      `Ai făcut ${num(this.metersDone())} din ${num(rowTotal(this.ch))} m. Salvez ce ai făcut până acum?`,
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
    hush();
  }
}

export function openRow(block: string): void {
  mountPlayer(new RowPlayer(block));
}
