// Race simulation player: one segment at a time, a running race clock and splits.
// Closing it leaves the race running; it can be picked up from the Challenge tab.

import { LEVEL_NAMES, raceById, type RaceLevel } from '../../data/races.ts';
import { advance, back, bestTime, elapsed, newRun, pause, resume, segElapsed, type RaceRun } from '../../logic/race.ts';
import { makeEntry } from '../../logic/store.ts';
import { esc, raceTime } from '../../logic/util.ts';
import { buzz, say, sfx, unlock } from '../audio.ts';
import { addEntry, ask, closePlayer, ctx, mountPlayer, ovEl, save, type Player } from '../ctx.ts';
import { chrome, ctrlBtn, setText } from './common.ts';

class RacePlayer implements Player {
  run: RaceRun;
  level: RaceLevel;
  title: string;
  timer = 0;
  result: { dur: number; pb?: number; splits: number[] } | null = null;

  constructor(run: RaceRun) {
    this.run = run;
    const r = raceById(run.ev);
    this.level = (r ?? { levels: [] as RaceLevel[] }).levels[run.lvl];
    this.title = `${r?.name ?? ''}: ${this.level.name}`;
    this.catchUp();
    this.render();
    this.timer = window.setInterval(() => this.tick(), 250);
  }

  /** Timed segments that ran out while the app was closed. */
  catchUp(): void {
    const { run, level } = this;
    for (;;) {
      const s = level.segs[run.i]?.sec;
      if (!s || segElapsed(run, Date.now()) < s) break;
      advance(run, Date.now(), s);
      if (run.i >= level.segs.length) return this.finish();
    }
    save();
  }

  render(): void {
    const el = ovEl();
    if (this.result) {
      const { dur, pb, splits } = this.result;
      const rows = splits.map((s, i) => `<li><div><b>${esc(this.level.segs[i].name)}</b><span>${raceTime(s)}</span></div></li>`).join('');
      el.innerHTML = chrome(this.title, `<h1 class="pl-h done-h">Finish.</h1>
        <p class="lead">${raceTime(dur)}${pb === undefined ? ', primul tău timp la acest nivel.' : dur < pb ? `, record nou. Înainte: ${raceTime(pb)}.` : `. Recordul rămâne ${raceTime(pb)}.`}</p>
        <ul class="hist">${rows}</ul><div style="height:16px"></div><button class="btn" data-a="p:close">Închide</button>`);
      return;
    }
    const { run, level } = this;
    const seg = level.segs[run.i];
    const next = level.segs[run.i + 1];
    const paused = run.pausedAt !== null;
    const left = seg.sec ? Math.max(0, seg.sec - segElapsed(run, Date.now())) : segElapsed(run, Date.now());
    el.innerHTML = chrome(this.title, `
      <div class="bar" style="margin-top:0"><i style="width:${((run.i / level.segs.length) * 100).toFixed(1)}%"></i></div>
      <p class="small dim" style="margin:0">Pasul ${run.i + 1} din ${level.segs.length}</p>
      <p class="phase-lbl">Timp total <span id="ra-t">${raceTime(elapsed(run, Date.now()))}</span></p>
      <h1 class="pl-h">${esc(seg.name)}</h1>
      ${seg.detail ? `<p class="target">${esc(seg.detail)}</p>` : ''}
      <div class="big-time" id="ra-s">${raceTime(Math.ceil(left))}</div>
      ${seg.alt ? `<p class="cue">${esc(seg.alt)}</p>` : ''}
      ${next ? `<p class="prev">Urmează: ${esc(next.name)}${next.detail ? `, ${esc(next.detail)}` : ''}</p>` : '<p class="prev">Ultimul pas</p>'}
      ${seg.sec ? '' : '<button class="tap-big" data-a="p:next">Gata</button>'}
      <p class="small dim" style="margin-top:12px;text-align:center"><button class="link" data-a="p:quit">Abandonează cursa</button></p>`,
      { cls: seg.rest ? 'ph-rest' : paused ? 'ph-prep' : 'ph-work', ctrl: ctrlBtn('p:back', 'prev', 'Pasul anterior') + ctrlBtn('p:pause', paused ? 'play' : 'pause', paused ? 'Continuă' : 'Pauză', true) });
  }

  tick(): void {
    if (this.result) return;
    const { run, level } = this;
    const seg = level.segs[run.i];
    const now = Date.now();
    const s = segElapsed(run, now);
    setText('ra-t', raceTime(elapsed(run, now)));
    setText('ra-s', raceTime(Math.ceil(seg.sec ? Math.max(0, seg.sec - s) : s)));
    if (seg.sec && run.pausedAt === null && s >= seg.sec) this.step(seg.sec);
  }

  step(sec?: number): void {
    const { run, level } = this;
    advance(run, Date.now(), sec);
    if (run.i >= level.segs.length) return this.finish();
    save();
    const seg = level.segs[run.i];
    sfx.go();
    buzz(250);
    say(seg.name, 'en');
    this.render();
  }

  finish(): void {
    const { run, level } = this;
    window.clearInterval(this.timer);
    const dur = run.splits.reduce((s, x) => s + x, 0);
    const pb = bestTime(ctx.S.log, run.ev, run.lvl);
    addEntry(makeEntry({ kind: 'race', name: `${raceById(run.ev)?.name}: ${level.name}`, dur, data: { ev: run.ev, lvl: run.lvl, level: LEVEL_NAMES[run.lvl], splits: run.splits } }));
    ctx.S.race = null;
    save();
    this.result = { dur, pb, splits: run.splits };
    sfx.bell(3);
    buzz([300, 120, 300]);
    this.render();
  }

  act(a: string): void {
    const { run } = this;
    const now = Date.now();
    switch (a) {
      case 'p:next':
        return this.step();
      case 'p:pause':
        if (run.pausedAt === null) pause(run, now);
        else resume(run, now);
        save();
        return this.render();
      case 'p:back':
        back(run, now, !!this.level.segs[run.i - 1]?.sec);
        save();
        return this.render();
      case 'p:quit':
        return ask('Abandonezi cursa?', 'Timpul de până acum nu se salvează.', 'Abandonează', () => {
          ctx.S.race = null;
          save();
          closePlayer(true);
        }, 'Continuă', true);
    }
  }

  destroy(): void {
    window.clearInterval(this.timer);
  }
}

export function startRace(ev: string, lvl: number): void {
  unlock();
  const r = raceById(ev);
  const name = r?.levels[lvl]?.name;
  if (!name) return;
  const go = (): void => {
    ctx.S.race = newRun(ev, lvl, Date.now());
    save();
    mountPlayer(new RacePlayer(ctx.S.race));
  };
  // The two top levels are real race distances: the physical load is real even if the race is a simulation.
  const gate = (): void =>
    lvl >= 3
      ? ask(`${name}: distanță reală de concurs`, 'Nivelurile Pro și Elită cer luni de pregătire specifică. Pornește doar dacă ai făcut deja, în ultimele săptămâni, sesiuni de cel puțin trei sferturi din distanța asta, fără dureri. Planifică apă, mâncare și o zi liberă după.', 'Am pregătirea, pornesc', go, 'Renunță')
      : go();
  if (ctx.S.race) return ask('Ai o cursă începută', 'Dacă pornești alta, cea de acum se pierde.', 'Pornește', gate, 'Renunță', true);
  gate();
}

export function resumeRace(): void {
  unlock();
  if (ctx.S.race) mountPlayer(new RacePlayer(ctx.S.race));
}
