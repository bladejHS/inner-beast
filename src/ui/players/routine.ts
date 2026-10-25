// Guided stretching and mobility: each move has its own timer, with a "switch sides" call at half time.

import { routineById, routineSeconds, type Routine } from '../../data/routines.ts';
import { Clock, locate, phaseStart, routineSeq, type Phase } from '../../logic/seq.ts';
import { makeEntry } from '../../logic/store.ts';
import { esc, mmss } from '../../logic/util.ts';
import { buzz, say, sfx, unlock } from '../audio.ts';
import { addEntry, ask, closePlayer, mountPlayer, ovEl, type Player } from '../ctx.ts';
import { ring } from '../charts.ts';
import { chrome, ctrlBtn, setText } from './common.ts';

class RoutinePlayer implements Player {
  st: 'ready' | 'run' | 'done' = 'ready';
  r: Routine;
  block?: string;
  phases: Phase[] = [];
  clock = new Clock();
  timer = 0;
  lastI = -1;
  lastSec = -1;
  sideSwitched = false;
  saved = false;

  constructor(rid: string, block?: string) {
    this.r = routineById(rid);
    this.block = block;
    this.render();
  }

  render(): void {
    const el = ovEl();
    const r = this.r;
    if (this.st === 'ready') {
      el.innerHTML = chrome(
        r.name,
        `<h1 class="pl-h">${esc(r.name)}</h1>
        <p class="pl-sub">${Math.round(routineSeconds(r) / 60)} minute, ${r.moves.length} exerciții</p>
        <p class="dim">${esc(r.intro)}</p>
        <ul class="hist" style="margin:8px 0 18px">${r.moves.map((m) => `<li><div><b>${esc(m.name)}</b><span>${mmss(m.sec)}${m.sides ? ', pe ambele părți' : ''}${m.alex ? ', de la Alex' : ''}</span></div></li>`).join('')}</ul>
        <button class="btn" data-a="p:start">Start</button>`,
      );
      return;
    }
    if (this.st === 'done') {
      el.innerHTML = chrome(
        r.name,
        `<h1 class="pl-h">Gata.</h1><p class="lead">${esc(r.name)}: ${mmss(Math.min(this.clock.t, routineSeconds(r) + 5))}.</p><p class="dim">${this.saved ? 'Salvat în progres.' : ''}</p><button class="btn" data-a="p:close">Închide</button>`,
        { center: true },
      );
      return;
    }
    const L = locate(this.phases, this.clock.t);
    const p = this.phases[L.i];
    const m = p.move !== undefined ? r.moves[p.move] : null;
    const next = p.move !== undefined ? r.moves[p.move + 1] : r.moves[0];
    const side = m?.sides ? (L.into < p.sec / 2 ? 'Partea stângă' : 'Partea dreaptă') : '';
    const total = this.phases.reduce((s, x) => s + x.sec, 0);
    const pct = Math.min(100, (this.clock.t / total) * 100);
    const paused = !this.clock.running;
    el.innerHTML = chrome(
      r.name,
      `<div class="bar" style="margin-top:0"><i id="pb" style="width:${pct.toFixed(1)}%"></i></div>
      <p class="small dim" style="margin:0">${p.move !== undefined ? `${p.move + 1} din ${r.moves.length}` : 'Pregătește-te'}</p>
      <h1 class="pl-h">${esc(m ? m.name : r.moves[0].name)}</h1>
      ${side ? `<p class="round-lbl" id="sd" style="color:var(--lime)">${side}</p>` : ''}
      ${ring(1 - L.left / p.sec, `<div><div class="mid-time" id="t">${mmss(Math.ceil(L.left))}</div></div>`, 6)}
      <p class="cue">${esc(m ? m.cue : r.moves[0].cue)}</p>
      ${m?.alex ? '<p class="alex"><b>Alex</b> face asta în rutina lui de mobilitate.</p>' : ''}
      ${next && p.move !== undefined ? `<p class="prev">Urmează: ${esc(next.name)}</p>` : ''}`,
      { cls: p.kind === 'prep' ? 'ph-prep' : '', ctrl: ctrlBtn('p:prev', 'prev', 'Înapoi') + ctrlBtn('p:pause', paused ? 'play' : 'pause', paused ? 'Continuă' : 'Pauză', true) + ctrlBtn('p:skip', 'next', 'Următorul') },
    );
  }

  start(): void {
    unlock();
    this.phases = routineSeq(this.r.moves, 5);
    this.clock.start();
    this.st = 'run';
    this.render();
    this.timer = window.setInterval(() => this.tick(), 250);
  }

  tick(): void {
    const L = locate(this.phases, this.clock.t);
    if (L.done) return this.finish();
    const p = this.phases[L.i];
    if (L.i !== this.lastI) {
      const first = this.lastI === -1;
      this.lastI = L.i;
      this.sideSwitched = false;
      if (!first) {
        sfx.go();
        buzz(250);
        if (p.move !== undefined) say(this.r.moves[p.move].name, 'en');
      }
      return this.render();
    }
    const m = p.move !== undefined ? this.r.moves[p.move] : null;
    if (m?.sides && !this.sideSwitched && L.into >= p.sec / 2) {
      this.sideSwitched = true;
      sfx.beep();
      buzz([120, 80, 120]);
      say('Schimbă partea', 'ro');
      return this.render();
    }
    const s = Math.ceil(L.left);
    if (s !== this.lastSec) {
      this.lastSec = s;
      setText('t', mmss(s));
      const ringVal = ovEl().querySelector<SVGCircleElement>('.ring .val');
      if (ringVal) {
        const c = Number(ringVal.getAttribute('stroke-dasharray'));
        ringVal.setAttribute('stroke-dashoffset', String((c * (L.left / p.sec)).toFixed(2)));
      }
      const pb = document.getElementById('pb');
      if (pb) pb.style.width = `${Math.min(100, (this.clock.t / this.phases.reduce((a, x) => a + x.sec, 0)) * 100).toFixed(1)}%`;
      if (s <= 3 && s >= 1) sfx.tick();
    }
  }

  finish(): void {
    window.clearInterval(this.timer);
    this.clock.pause();
    sfx.chime();
    this.saveEntry();
    this.st = 'done';
    this.render();
  }

  saveEntry(): void {
    if (this.saved) return;
    const total = routineSeconds(this.r);
    const done = Math.min(total, Math.max(0, this.clock.t - 5));
    if (done < 60) return;
    addEntry(makeEntry({ kind: 'routine', block: done >= total * 0.8 ? this.block : undefined, name: this.r.name, dur: done, data: { rid: this.r.id } }));
    this.saved = true;
  }

  act(a: string): void {
    switch (a) {
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
      case 'p:prev': {
        const L = locate(this.phases, this.clock.t);
        this.clock.set(phaseStart(this.phases, L.into > 3 ? L.i : Math.max(0, L.i - 1)));
        this.lastI = -2;
        return this.tick();
      }
    }
  }

  close(): boolean {
    if (this.st !== 'run' || this.clock.t < 65) return true;
    const was = this.clock.running;
    this.clock.pause();
    this.render();
    ask('Te oprești?', 'Salvez cât ai făcut până acum?', 'Salvează și ieși', () => {
      this.saveEntry();
      closePlayer(true);
    }, 'Continuă', false, () => {
      if (was) this.clock.resume();
      this.render();
    });
    return false;
  }

  destroy(): void {
    window.clearInterval(this.timer);
  }
}

export function openRoutine(rid: string, block?: string): void {
  mountPlayer(new RoutinePlayer(rid, block));
}
