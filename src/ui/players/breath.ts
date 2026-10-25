// 4-7-8 breathing: in through the nose for 4, hold for 7, out through the mouth for 8.

import { breath478Seq, Clock, locate, totalSec, type Phase } from '../../logic/seq.ts';
import { makeEntry } from '../../logic/store.ts';
import { esc, mmss } from '../../logic/util.ts';
import { say, sfx, unlock, buzz } from '../audio.ts';
import { addEntry, ctx, mountPlayer, ovEl, save, type Player } from '../ctx.ts';
import { chrome, ctrlBtn, setText } from './common.ts';

class BreathPlayer implements Player {
  st: 'ready' | 'run' | 'done' = 'ready';
  block?: string;
  phases: Phase[] = [];
  clock = new Clock();
  raf = 0;
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
    const m = ctx.S.set.breathMin;
    if (this.st === 'ready') {
      el.innerHTML = chrome(
        'Breathing Exercises',
        `<h1 class="pl-h">4-7-8</h1>
        <p class="pl-sub">Metoda de respirație din carte</p>
        <ol class="ticks">
          <li>Inspiri pe nas, lent, 4 secunde.</li>
          <li>Ții aerul 7 secunde.</li>
          <li>Expiri pe gură, complet, cu un „whoosh”, 8 secunde.</li>
        </ol>
        <p class="dim">Vârful limbii stă lipit în spatele dinților de sus. Dacă amețești, revii la respirația normală și continui după.</p>
        <div class="chips" style="margin:14px 0 18px">${[2, 5, 10].map((v) => `<button class="chip" aria-pressed="${m === v}" data-a="p:min" data-v="${v}">${v} min</button>`).join('')}</div>
        <button class="btn" data-a="p:start">Start</button>`,
      );
      return;
    }
    if (this.st === 'done') {
      el.innerHTML = chrome(
        'Breathing Exercises',
        `<h1 class="pl-h">Gata.</h1><p class="lead">${this.cycles()} cicluri 4-7-8, ${mmss(this.clock.t)}.</p><p class="dim">${this.saved ? 'Salvat în progres.' : ''}</p><button class="btn" data-a="p:close">Închide</button>`,
        { center: true },
      );
      return;
    }
    const L = locate(this.phases, this.clock.t);
    const p = this.phases[L.i];
    const paused = !this.clock.running;
    el.innerHTML = chrome(
      'Breathing Exercises',
      `<p class="round-lbl" style="text-align:center" id="cy">${p.round ? `Ciclul ${p.round} din ${p.rounds}` : ''}</p>
      <div class="orb-wrap"><div class="orb" id="orb"></div><div class="orb-txt"><div><b id="big">${Math.ceil(L.left)}</b></div></div></div>
      <p class="phase-lbl" id="lbl" style="text-align:center">${esc(p.label)}</p>
      <p class="prev" style="text-align:center">Rămas: <span id="rem">${mmss(totalSec(this.phases) - this.clock.t)}</span></p>`,
      { center: true, ctrl: ctrlBtn('p:pause', paused ? 'play' : 'pause', paused ? 'Continuă' : 'Pauză', true) },
    );
    this.frame();
  }

  cycles(): number {
    const L = locate(this.phases, this.clock.t);
    const done = this.phases.slice(0, L.done ? this.phases.length : L.i).filter((p) => p.kind === 'out').length;
    return done;
  }

  start(): void {
    unlock();
    this.phases = breath478Seq(ctx.S.set.breathMin, 3);
    this.clock.start();
    this.st = 'run';
    this.render();
    this.timer = window.setInterval(() => this.logic(), 200);
    this.loop();
  }

  loop = (): void => {
    this.frame();
    this.logic();
    this.raf = requestAnimationFrame(this.loop);
  };

  frame(): void {
    const orb = document.getElementById('orb');
    if (!orb || this.st !== 'run') return;
    const L = locate(this.phases, this.clock.t);
    const p = this.phases[L.i];
    const f = L.into / p.sec;
    const s = p.kind === 'in' ? 0.4 + 0.6 * f : p.kind === 'hold' ? 1 : p.kind === 'out' ? 1 - 0.6 * f : 0.4;
    orb.style.setProperty('--s', s.toFixed(3));
  }

  logic(): void {
    if (this.st !== 'run') return;
    const L = locate(this.phases, this.clock.t);
    if (L.done) return this.finish();
    const p = this.phases[L.i];
    if (L.i !== this.lastI) {
      this.lastI = L.i;
      setText('lbl', p.label);
      setText('cy', p.round ? `Ciclul ${p.round} din ${p.rounds}` : '');
      if (p.kind === 'in') {
        sfx.breath(true);
        if (p.round === 1) say('Inspiră', 'ro');
      } else if (p.kind === 'hold') {
        sfx.beep();
        if (p.round === 1) say('Ține', 'ro');
      } else if (p.kind === 'out') {
        sfx.breath(false);
        if (p.round === 1) say('Expiră', 'ro');
      }
    }
    const s = Math.ceil(L.left);
    if (s !== this.lastSec) {
      this.lastSec = s;
      setText('big', String(s));
      setText('rem', mmss(totalSec(this.phases) - this.clock.t));
    }
  }

  finish(): void {
    cancelAnimationFrame(this.raf);
    window.clearInterval(this.timer);
    this.clock.pause();
    sfx.chime();
    buzz(200);
    this.saveEntry();
    this.st = 'done';
    this.render();
  }

  saveEntry(): void {
    if (this.saved) return;
    const c = this.cycles();
    if (c < 2) return;
    const planned = this.phases.filter((p) => p.kind === 'out').length;
    addEntry(makeEntry({ kind: 'breath', block: c >= planned * 0.8 ? this.block : undefined, name: 'Breathing Exercises', dur: this.clock.t, data: { cycles: c, method: '4-7-8' } }));
    this.saved = true;
  }

  act(a: string, el: HTMLElement): void {
    switch (a) {
      case 'p:min':
        ctx.S.set.breathMin = Number(el.dataset.v) || 10;
        save();
        return this.render();
      case 'p:start':
        return this.start();
      case 'p:pause':
        if (this.clock.running) this.clock.pause();
        else this.clock.resume();
        return this.render();
    }
  }

  close(): boolean {
    if (this.st === 'run') this.saveEntry();
    return true;
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    window.clearInterval(this.timer);
  }
}

export function openBreath(block?: string): void {
  mountPlayer(new BreathPlayer(block));
}

