// Breathwork Lab session: the mode's briefing, then a guided orb with the cycle timeline.

import { labDef, labSeq, type LabDef } from '../../logic/breathlab.ts';
import { Clock, locate, totalSec, type Phase } from '../../logic/seq.ts';
import { makeEntry } from '../../logic/store.ts';
import { esc, mmss } from '../../logic/util.ts';
import { say, sfx, unlock, buzz } from '../audio.ts';
import { addEntry, mountPlayer, ovEl, type Player } from '../ctx.ts';
import { art } from '../art.ts';
import { chrome, ctrlBtn, setText } from './common.ts';

class LabPlayer implements Player {
  st: 'ready' | 'run' | 'done' = 'ready';
  m: LabDef;
  min: number;
  phases: Phase[] = [];
  clock = new Clock();
  raf = 0;
  timer = 0;
  lastI = -1;
  lastSec = -1;
  saved = false;

  constructor(mode: string) {
    this.m = labDef(mode);
    this.min = this.m.rec;
    this.render();
  }

  title(): string {
    return `Breathwork Lab · ${this.m.name}`;
  }

  render(): void {
    const el = ovEl();
    const m = this.m;
    if (this.st === 'ready') {
      el.innerHTML = chrome(
        this.title(),
        `<div class="lab-brief" data-mode="${m.id}">
          <p class="lab-code">${m.code} · ${esc(m.pattern)}</p>
          <h1 class="pl-h">${esc(m.name)}</h1>
          <p class="lead" style="margin-top:6px">${esc(m.purpose)}</p>
          <p class="lab-k">Când</p><p class="small" style="margin:0">${esc(m.when)}</p>
          <p class="lab-k">Cum</p><ol class="ticks">${m.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
          <p class="lab-k">Durată · recomandat ${m.rec} min</p>
          <div class="chips" style="margin:6px 0 16px">${m.mins.map((v) => `<button class="chip" aria-pressed="${this.min === v}" data-a="p:min" data-v="${v}">${v} min</button>`).join('')}</div>
          <p class="small dim">Doar așezat sau întins. Niciodată în apă sau la volan. Dacă amețești, respiri normal.</p>
          <button class="btn" data-a="p:start">Start</button>
        </div>`,
      );
      return;
    }
    if (this.st === 'done') {
      el.innerHTML = chrome(
        this.title(),
        `${art('claws', 'done-claws')}<h1 class="pl-h done-h">Control.</h1><p class="lead">${esc(m.name)}: ${this.cycles()} cicluri, ${mmss(this.clock.t)}.</p><p class="dim">${this.saved ? 'Salvat în progres.' : ''}</p><button class="btn" data-a="p:close">Închide</button>`,
        { center: true },
      );
      return;
    }
    const L = locate(this.phases, this.clock.t);
    const p = this.phases[L.i];
    const n = this.phases[this.phases.length - 1].rounds ?? 1;
    const paused = !this.clock.running;
    el.innerHTML = chrome(
      this.title(),
      `<div class="lab-run" data-mode="${m.id}">
        <p class="lab-code" style="text-align:center" id="cy">${p.round ? `Ciclul ${p.round} / ${n}` : esc(m.pattern)}</p>
        <div class="orb-wrap"><div class="orb" id="orb"></div><div class="orb-txt"><div><b id="big">${Math.ceil(L.left)}</b></div></div></div>
        <p class="phase-lbl" id="lbl" style="text-align:center">${esc(p.label)}</p>
        <div class="lab-tl" aria-hidden="true">${Array.from({ length: Math.min(n, 60) }, (_, i) => `<i id="tl${i}" class="${(p.round ?? 0) > i + 1 ? 'ok' : ''}"></i>`).join('')}</div>
        <p class="prev" style="text-align:center">Rămas <span id="rem">${mmss(totalSec(this.phases) - this.clock.t)}</span></p>
      </div>`,
      { center: true, cls: 'ph-dark', ctrl: ctrlBtn('p:pause', paused ? 'play' : 'pause', paused ? 'Continuă' : 'Pauză', true) },
    );
    this.frame();
  }

  cycles(): number {
    const L = locate(this.phases, this.clock.t);
    const upTo = L.done ? this.phases.length : L.i;
    const last = this.phases.slice(0, upTo).filter((p) => p.kind !== 'prep').pop();
    if (!last?.round) return 0;
    // a cycle counts once its last phase is over
    const nextRound = this.phases[upTo]?.round;
    return L.done || nextRound !== last.round ? last.round : last.round - 1;
  }

  start(): void {
    unlock();
    this.phases = labSeq(this.m.id, this.min, 5);
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

  /** Orb size follows the breath: grows on the inhale, holds, shrinks on the exhale. */
  frame(): void {
    const orb = document.getElementById('orb');
    if (!orb || this.st !== 'run') return;
    const L = locate(this.phases, this.clock.t);
    const p = this.phases[L.i];
    const f = L.into / p.sec;
    const prev = this.phases[L.i - 1];
    let s = 0.4;
    if (p.kind === 'in') {
      // a second inhale (RESET) continues from where the first stopped
      const from = prev?.kind === 'in' ? 0.85 : 0.4;
      const to = this.phases[L.i + 1]?.kind === 'in' ? 0.85 : 1;
      s = from + (to - from) * f;
    } else if (p.kind === 'hold') s = prev?.kind === 'out' ? 0.4 : 1;
    else if (p.kind === 'out') s = 1 - 0.6 * f;
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
      const n = this.phases[this.phases.length - 1].rounds ?? 1;
      setText('cy', p.round ? `Ciclul ${p.round} / ${n}` : this.m.pattern);
      if (p.round && p.round > 1) document.getElementById(`tl${p.round - 2}`)?.classList.add('ok');
      document.querySelectorAll('.lab-tl i.on').forEach((x) => x.classList.remove('on'));
      if (p.round) document.getElementById(`tl${p.round - 1}`)?.classList.add('on');
      if (p.kind === 'in') sfx.breath(true);
      else if (p.kind === 'out') sfx.breath(false);
      else if (p.kind === 'hold') sfx.beep();
      if (p.round === 1) say(p.label, 'ro');
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
    addEntry(makeEntry({ kind: 'breath', name: `Breathwork Lab · ${this.m.name}`, dur: this.clock.t, data: { cycles: c, method: this.m.pattern, lab: this.m.id } }));
    this.saved = true;
  }

  act(a: string, el: HTMLElement): void {
    switch (a) {
      case 'p:min':
        if (this.st !== 'ready') return;
        this.min = Number(el.dataset.v) || this.m.rec;
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

export function openLab(mode: string): void {
  mountPlayer(new LabPlayer(mode));
}
