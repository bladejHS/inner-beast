// Contrast shower from the off day: 1 minute cold, 1 minute warm.

import { Clock, doneSec, locate, phaseStart, showerSeq, totalSec, type Phase } from '../../logic/seq.ts';
import { makeEntry } from '../../logic/store.ts';
import { esc, mmss } from '../../logic/util.ts';
import { buzz, say, sfx, unlock } from '../audio.ts';
import { addEntry, ctx, mountPlayer, ovEl, save, type Player } from '../ctx.ts';
import { art } from '../art.ts';
import { howHtml } from '../how.ts';
import { chrome, ctrlBtn, field, setText, stepper, switchCtl } from './common.ts';

class ShowerPlayer implements Player {
  st: 'ready' | 'run' | 'done' = 'ready';
  block?: string;
  phases: Phase[] = [];
  clock = new Clock();
  timer = 0;
  lastI = -1;
  lastSec = -1;
  saved = false;

  constructor(block?: string) {
    this.block = block;
    this.render();
  }

  render(): void {
    const el = ovEl();
    const s = ctx.S.set;
    if (this.st === 'ready') {
      const total = s.showerRounds * 2 + (s.showerEndCold ? 1 : 0);
      el.innerHTML = chrome(
        'Cold & Warm Showers',
        `${art('sharks', 'pl-art')}<h1 class="pl-h">Cold & Warm Showers</h1>
        <p class="pl-sub">1 minut rece, 1 minut cald</p>
        <p class="dim">Pune telefonul unde îl vezi și îl auzi. La fiecare schimbare primești un semnal. Când vine apa rece, respiră lent, pe nas.</p>
        ${howHtml('Cold & Warm Showers', undefined, { open: true })}
        <div class="setup">
          ${field('Runde (rece + cald)', stepper('p:rounds', String(s.showerRounds), 'Runde'))}
          ${field('Termină pe rece', switchCtl('p:endcold', s.showerEndCold, 'Termină pe rece'), 'Încă un minut rece la final')}
        </div>
        <p class="prev">În total: ${total} minute.</p>
        <button class="btn" data-a="p:start">Start</button>`,
      );
      return;
    }
    if (this.st === 'done') {
      el.innerHTML = chrome(
        'Cold & Warm Showers',
        `${art('claws', 'done-claws')}<h1 class="pl-h done-h">Gata.</h1><p class="lead">${mmss(doneSec(this.phases, this.clock.t, 'cold'))} la rece.</p><p class="dim">${this.saved ? 'Salvat în progres.' : ''}</p><button class="btn" data-a="p:close">Închide</button>`,
        { center: true },
      );
      return;
    }
    const L = locate(this.phases, this.clock.t);
    const p = this.phases[L.i];
    const nx = this.phases[L.i + 1];
    const cls = p.kind === 'cold' ? 'ph-cold' : p.kind === 'warm' ? 'ph-warm' : 'ph-prep';
    const paused = !this.clock.running;
    el.innerHTML = chrome(
      'Cold & Warm Showers',
      `<p class="round-lbl">${p.round ? `Runda ${Math.min(p.round, p.rounds ?? 1)} din ${p.rounds}` : ''}</p>
      <p class="pl-h" style="font-size:clamp(64px,22vw,120px);margin:4px 0 0">${esc(p.kind === 'prep' ? 'Gata?' : p.label)}</p>
      <div class="big-time" id="t">${mmss(Math.ceil(L.left))}</div>
      <p class="pl-sub">${nx ? `Urmează: ${esc(nx.label.toLowerCase())}` : 'Ultimul minut'}</p>`,
      { cls, center: true, ctrl: ctrlBtn('p:pause', paused ? 'play' : 'pause', paused ? 'Continuă' : 'Pauză', true) + ctrlBtn('p:skip', 'next', 'Sari') },
    );
  }

  start(): void {
    unlock();
    const s = ctx.S.set;
    this.phases = showerSeq(s.showerRounds, 60, 60, s.showerEndCold, 5);
    this.clock.start();
    this.st = 'run';
    this.render();
    this.timer = window.setInterval(() => this.tick(), 200);
  }

  tick(): void {
    const L = locate(this.phases, this.clock.t);
    if (L.done) return this.finish();
    const p = this.phases[L.i];
    if (L.i !== this.lastI) {
      const first = this.lastI === -1;
      this.lastI = L.i;
      this.lastSec = -1;
      if (!first || p.kind !== 'prep') {
        if (p.kind === 'cold') {
          sfx.bell(1);
          buzz([400, 100, 400]);
          say('Rece', 'ro');
        } else if (p.kind === 'warm') {
          sfx.go();
          buzz(400);
          say('Cald', 'ro');
        }
      }
      this.render();
    }
    const s = Math.ceil(L.left);
    if (s !== this.lastSec) {
      this.lastSec = s;
      setText('t', mmss(s));
      if (s <= 3 && s >= 1) sfx.tick();
    }
  }

  finish(): void {
    window.clearInterval(this.timer);
    this.clock.pause();
    sfx.chime();
    buzz([300, 100, 300]);
    this.saveEntry();
    this.st = 'done';
    this.render();
  }

  saveEntry(): void {
    if (this.saved) return;
    const cold = doneSec(this.phases, this.clock.t, 'cold');
    if (cold < 30) return;
    const full = this.clock.t >= totalSec(this.phases) - 1;
    addEntry(makeEntry({ kind: 'shower', block: full ? this.block : undefined, name: 'Cold & Warm Showers', dur: this.clock.t, data: { coldSec: Math.round(cold), rounds: ctx.S.set.showerRounds } }));
    this.saved = true;
  }

  act(a: string, el: HTMLElement): void {
    const s = ctx.S.set;
    switch (a) {
      case 'p:rounds':
        s.showerRounds = Math.max(1, Math.min(10, s.showerRounds + Number(el.dataset.d || 0)));
        save();
        return this.render();
      case 'p:endcold':
        s.showerEndCold = (el as HTMLInputElement).checked;
        save();
        return this.render();
      case 'p:start':
        return this.start();
      case 'p:pause':
        if (this.clock.running) this.clock.pause();
        else this.clock.resume();
        return this.render();
      case 'p:skip': {
        const L = locate(this.phases, this.clock.t);
        this.clock.set(phaseStart(this.phases, L.i + 1));
        return this.tick();
      }
    }
  }

  close(): boolean {
    if (this.st === 'run') this.saveEntry();
    return true;
  }

  destroy(): void {
    window.clearInterval(this.timer);
  }
}

export function openShower(block?: string): void {
  mountPlayer(new ShowerPlayer(block));
}

