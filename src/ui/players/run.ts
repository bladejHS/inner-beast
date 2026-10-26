// GPS tracker for Sunday's 20-minute jog and Wednesday's walk.

import { Track, routePath, simplify, MAX_ACC, type Fix } from '../../logic/geo.ts';
import { Clock } from '../../logic/seq.ts';
import { makeEntry } from '../../logic/store.ts';
import { dayKey, esc, km, mmss, num, paceStr } from '../../logic/util.ts';
import { buzz, say, sfx, unlock } from '../audio.ts';
import { addEntry, ask, closePlayer, closeSheet, ctx, mountPlayer, openSheet, ovEl, save, toast, type Player } from '../ctx.ts';
import { ring } from '../charts.ts';
import { howHtml } from '../how.ts';
import { art } from '../art.ts';
import { chrome, ctrlBtn, setText } from './common.ts';

export interface RunCfg {
  mode: 'run' | 'walk';
  block?: string;
  /** Target duration in seconds (jog). */
  target?: number;
}

const STRIDE_M = 0.75;
const RUN_CUES: Array<[number, string]> = [
  [0, 'Începe încet. Respiră calm.'],
  [300, 'Respirația e calmă? Crește puțin ritmul.'],
  [600, 'Jumătate. Crește încet și constant.'],
  [900, 'Ultimele cinci minute. Puțin mai repede, controlat.'],
  [1200, 'Douăzeci de minute. Gata, sau continui ușor.'],
];

type GpsState = 'off' | 'wait' | 'ok' | 'weak' | 'denied' | 'none';

class RunPlayer implements Player {
  st: 'ready' | 'run' | 'done' = 'ready';
  cfg: RunCfg;
  track = new Track();
  clock = new Clock();
  watchId: number | null = null;
  gps: GpsState = 'off';
  acc = 0;
  gap = false;
  cueIdx = -1;
  coach = '';
  timer = 0;
  saved = false;
  steps = 0;

  constructor(cfg: RunCfg) {
    this.cfg = cfg;
    this.watch();
    this.render();
  }

  get name(): string {
    return this.cfg.mode === 'run' ? 'Jogging' : 'Walk';
  }

  watch(): void {
    if (!('geolocation' in navigator)) {
      this.gps = 'none';
      return;
    }
    this.gps = 'wait';
    this.watchId = navigator.geolocation.watchPosition(
      (p) => this.onFix({ lat: p.coords.latitude, lon: p.coords.longitude, acc: p.coords.accuracy, t: p.timestamp || Date.now() }),
      (err) => {
        this.gps = err.code === err.PERMISSION_DENIED ? 'denied' : 'weak';
        this.renderGps();
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 30000 },
    );
  }

  onFix(f: Fix): void {
    this.acc = f.acc;
    this.gps = f.acc <= MAX_ACC ? 'ok' : 'weak';
    if (this.st === 'run' && this.clock.running) {
      if (this.gap) {
        // after a pause: re-anchor without counting the distance covered while paused
        if (f.acc <= MAX_ACC) {
          this.track.pts.push(f);
          this.gap = false;
        }
      } else this.track.add(f, this.clock.t);
    }
    this.renderGps();
  }

  gpsHtml(): string {
    const map: Record<GpsState, [string, string]> = {
      off: ['', 'GPS oprit'],
      wait: ['mid', 'Caut semnal GPS…'],
      ok: ['ok', `GPS bun (±${Math.round(this.acc)} m)`],
      weak: ['mid', `Semnal slab${this.acc ? ` (±${Math.round(this.acc)} m)` : ''}`],
      denied: ['', 'Fără acces la locație. Poți folosi doar cronometrul.'],
      none: ['', 'Telefonul nu are GPS în browser.'],
    };
    const [cls, txt] = map[this.gps];
    return `<span class="gps ${cls}" id="gps"><i></i>${esc(txt)}</span>`;
  }

  renderGps(): void {
    const el = document.getElementById('gps');
    if (el) el.outerHTML = this.gpsHtml();
  }

  render(): void {
    const el = ovEl();
    const c = this.cfg;
    if (this.st === 'ready') {
      el.innerHTML = chrome(
        this.name,
        `<h1 class="pl-h">${this.name}</h1>
        <p class="pl-sub">${c.mode === 'run' ? `${Math.round((c.target ?? 1200) / 60)} de minute` : '10.000 de pași, prin natură'}</p>
        <p class="dim">${c.mode === 'run' ? 'Începe încet, respiră calm, crește viteza încet și constant.' : 'Mergi prin natură. Pașii îi iei din telefon sau îi estimez din distanță.'}</p>
        ${howHtml(c.mode === 'run' ? 'Jogging' : 'Walk (10K Steps)', undefined, { open: true })}
        <p>${this.gpsHtml()}</p>
        <p class="small dim">Ecranul rămâne aprins cât timp alergi. Dacă îl blochezi, unele telefoane opresc GPS-ul din browser.</p>
        <button class="btn" data-a="p:start" style="margin-top:12px">Start</button>
        <button class="link" data-a="p:manual">Introdu manual (bandă, ceas)</button>`,
      );
      return;
    }
    if (this.st === 'run') {
      const t = this.clock.t;
      const target = c.target ?? 0;
      const avg = this.track.m > 50 ? (t / this.track.m) * 1000 : 0;
      const paused = !this.clock.running;
      const pts = simplify(this.track.pts, 8);
      const timeHtml = `<div><div class="mid-time" id="t">${mmss(t)}</div>${target ? `<p class="small dim" style="margin:0">din ${mmss(target)}</p>` : ''}</div>`;
      el.innerHTML = chrome(
        this.name,
        `${c.mode === 'run' && target ? ring(t / target, timeHtml, 6) : `<div style="text-align:center;margin:14px 0">${timeHtml}</div>`}
        <p class="coach" id="coach">${esc(this.coach)}</p>
        <div class="run-stats">
          <div><b id="dk">${km(this.track.m)}</b><span>km</span></div>
          <div><b id="pn">${paceStr(this.track.pace())}</b><span>ritm acum, min/km</span></div>
          <div><b id="pa">${paceStr(avg)}</b><span>ritm mediu, min/km</span></div>
          <div><b id="st">${c.mode === 'walk' ? num(this.track.m / STRIDE_M) : this.track.splits.length}</b><span>${c.mode === 'walk' ? 'pași estimați' : 'km întregi'}</span></div>
        </div>
        ${pts.length > 1 ? `<svg class="route" viewBox="0 0 300 160"><path d="${routePath(pts, 300, 160)}"/></svg>` : ''}
        <p>${this.gpsHtml()}</p>`,
        { ctrl: ctrlBtn('p:pause', paused ? 'play' : 'pause', paused ? 'Continuă' : 'Pauză', true) + ctrlBtn('p:finish', 'flag', 'Termină') },
      );
      return;
    }
    const t = this.clock.t;
    const avg = this.track.m > 50 ? (t / this.track.m) * 1000 : 0;
    const pts = simplify(this.track.pts, 8);
    const est = Math.round(this.track.m / STRIDE_M);
    el.innerHTML = chrome(
      this.name,
      `${art('claws', 'done-claws')}<h1 class="pl-h done-h">Gata.</h1>
      <div class="run-stats">
        <div><b>${mmss(t)}</b><span>timp</span></div>
        <div><b>${km(this.track.m)}</b><span>km</span></div>
        <div><b>${paceStr(avg)}</b><span>ritm mediu</span></div>
        <div><b>${this.track.splits.length}</b><span>km întregi</span></div>
      </div>
      ${this.track.splits.length ? `<p class="small dim">Pe kilometru: ${this.track.splits.map((s, i) => mmss(s - (i ? this.track.splits[i - 1] : 0))).join(', ')}</p>` : ''}
      ${pts.length > 1 ? `<svg class="route" viewBox="0 0 300 160"><path d="${routePath(pts, 300, 160)}"/></svg>` : ''}
      ${c.mode === 'walk' ? `<p style="margin-top:14px">Pași (din telefon sau estimare)</p><input type="number" inputmode="numeric" data-a="p:steps" value="${this.steps || est}" min="0" max="100000">` : ''}
      <div style="height:16px"></div>
      <button class="btn" data-a="p:save">${this.saved ? 'Salvat' : 'Salvează'}</button>
      <button class="link" data-a="p:discard">Nu salva</button>`,
    );
  }

  start(): void {
    unlock();
    if (this.watchId === null && this.gps !== 'none') this.watch();
    this.st = 'run';
    this.clock.start();
    this.render();
    sfx.go();
    buzz(300);
    this.timer = window.setInterval(() => this.tick(), 500);
    this.tick();
  }

  tick(): void {
    const t = this.clock.t;
    setText('t', mmss(t));
    setText('dk', km(this.track.m));
    setText('pn', paceStr(this.track.pace()));
    setText('pa', paceStr(this.track.m > 50 ? (t / this.track.m) * 1000 : 0));
    setText('st', this.cfg.mode === 'walk' ? num(this.track.m / STRIDE_M) : String(this.track.splits.length));
    const target = this.cfg.target ?? 0;
    const ringVal = ovEl().querySelector<SVGCircleElement>('.ring .val');
    if (ringVal && target) {
      const c = Number(ringVal.getAttribute('stroke-dasharray'));
      ringVal.setAttribute('stroke-dashoffset', String((c * (1 - Math.min(1, t / target))).toFixed(2)));
    }
    if (this.cfg.mode === 'run') {
      let idx = -1;
      RUN_CUES.forEach(([at], i) => {
        if (t >= at) idx = i;
      });
      if (idx !== this.cueIdx) {
        this.cueIdx = idx;
        this.coach = RUN_CUES[idx][1];
        setText('coach', this.coach);
        if (idx > 0) {
          if (RUN_CUES[idx][0] >= (this.cfg.target ?? 1200)) sfx.bell(3);
          else sfx.beep();
          buzz(250);
        }
        say(this.coach, 'ro');
      }
    }
    // redraw the route every ~10 s
    if (Math.floor(t) % 10 === 0) {
      const svg = ovEl().querySelector('.route path');
      const pts = simplify(this.track.pts, 8);
      if (svg && pts.length > 1) svg.setAttribute('d', routePath(pts, 300, 160));
    }
  }

  finish(): void {
    window.clearInterval(this.timer);
    this.clock.pause();
    this.stopWatch();
    sfx.chime();
    this.st = 'done';
    this.render();
  }

  stopWatch(): void {
    if (this.watchId !== null) navigator.geolocation.clearWatch(this.watchId);
    this.watchId = null;
  }

  saveEntry(): void {
    if (this.saved) return;
    const t = this.clock.t;
    const c = this.cfg;
    if (c.mode === 'run') {
      const full = t >= (c.target ?? 1200) * 0.8;
      addEntry(
        makeEntry({
          kind: 'run',
          block: full ? c.block : undefined,
          name: 'Jogging',
          dur: t,
          data: { m: Math.round(this.track.m), pace: this.track.m > 50 ? Math.round((t / this.track.m) * 1000) : 0, splits: this.track.splits, pts: simplify(this.track.pts, 15) },
        }),
      );
    } else {
      const steps = this.steps || Math.round(this.track.m / STRIDE_M);
      const today = dayKey();
      ctx.S.steps[today] = Math.max(ctx.S.steps[today] ?? 0, steps);
      addEntry(
        makeEntry({
          kind: 'walk',
          block: steps >= 10000 ? c.block : undefined,
          name: 'Walk (10K Steps)',
          dur: t,
          data: { m: Math.round(this.track.m), steps, pts: simplify(this.track.pts, 25) },
        }),
      );
    }
    save();
    this.saved = true;
  }

  manual(): void {
    const walk = this.cfg.mode === 'walk';
    openSheet(
      `<h2>${walk ? 'Plimbare' : 'Alergare'} manuală</h2>
      <div class="field"><div class="field-l">Minute</div><input type="number" inputmode="decimal" id="mm" value="${walk ? 60 : Math.round((this.cfg.target ?? 1200) / 60)}" style="width:110px"></div>
      <div class="field"><div class="field-l">Distanță (km)</div><input type="number" inputmode="decimal" step="0.01" id="mk" value="" placeholder="ex. 3,2" style="width:110px"></div>
      ${walk ? '<div class="field"><div class="field-l">Pași</div><input type="number" inputmode="numeric" id="ms" value="10000" style="width:110px"></div>' : ''}
      <div style="height:14px"></div>
      <button class="btn" data-a="m:save">Salvează</button>`,
      {
        'm:save': () => {
          const min = parseFloat((document.getElementById('mm') as HTMLInputElement).value.replace(',', '.')) || 0;
          const kmv = parseFloat((document.getElementById('mk') as HTMLInputElement).value.replace(',', '.')) || 0;
          const st = walk ? parseInt((document.getElementById('ms') as HTMLInputElement).value, 10) || 0 : 0;
          if (min <= 0) return toast('Scrie câte minute ai făcut.');
          const t = min * 60;
          const m = kmv * 1000;
          if (walk) {
            const today = dayKey();
            ctx.S.steps[today] = Math.max(ctx.S.steps[today] ?? 0, st);
            addEntry(makeEntry({ kind: 'walk', block: st >= 10000 ? this.cfg.block : undefined, name: 'Walk (10K Steps)', dur: t, data: { m, steps: st, manual: true } }));
          } else {
            addEntry(makeEntry({ kind: 'run', block: t >= (this.cfg.target ?? 1200) * 0.8 ? this.cfg.block : undefined, name: 'Jogging', dur: t, data: { m, pace: m > 0 ? Math.round((t / m) * 1000) : 0, splits: [], manual: true } }));
          }
          closeSheet();
          toast('Salvat.');
          closePlayer(true);
        },
      },
    );
  }

  act(a: string, el: HTMLElement): void {
    switch (a) {
      case 'p:start':
        return this.start();
      case 'p:pause':
        if (this.clock.running) {
          this.clock.pause();
          this.gap = true;
        } else this.clock.resume();
        return this.render();
      case 'p:finish':
        if (this.clock.t < 30) {
          ask('Termini deja?', 'Ai mai puțin de 30 de secunde.', 'Termină', () => this.finish(), 'Continuă');
          return;
        }
        return this.finish();
      case 'p:save':
        this.saveEntry();
        toast('Salvat.');
        return closePlayer(true);
      case 'p:discard':
        this.saved = true;
        return closePlayer(true);
      case 'p:manual':
        return this.manual();
      case 'p:steps':
        return;
    }
    void el;
  }

  input(el: HTMLElement): void {
    if (el.dataset.a === 'p:steps') this.steps = Math.max(0, parseInt((el as HTMLInputElement).value, 10) || 0);
  }

  close(): boolean {
    if (this.st === 'done' && !this.saved) {
      ask('Salvezi?', 'Ai terminat, dar nu ai salvat.', 'Salvează', () => {
        this.saveEntry();
        closePlayer(true);
      }, 'Nu salva', false, () => {
        this.saved = true;
        closePlayer(true);
      });
      return false;
    }
    if (this.st !== 'run') return true;
    this.clock.pause();
    this.gap = true;
    this.render();
    ask('Te oprești?', 'Termin înregistrarea și salvez?', 'Termină și salvează', () => {
      this.finish();
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
    this.stopWatch();
  }
}

export function openRun(cfg: RunCfg): void {
  mountPlayer(new RunPlayer(cfg));
}
