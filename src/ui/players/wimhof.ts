// Guided Wim Hof breathing: power breaths, a hold after the exhale, a 15-second recovery breath, then quiet.

import { breathPos, holdStats, PACE, RECOVERY_SEC } from '../../logic/wimhof.ts';
import { Clock } from '../../logic/seq.ts';
import { makeEntry } from '../../logic/store.ts';
import { esc, mmss } from '../../logic/util.ts';
import { buzz, say, sfx, unlock } from '../audio.ts';
import { addEntry, ask, closePlayer, ctx, mountPlayer, ovEl, save, type Player } from '../ctx.ts';
import { art } from '../art.ts';
import { chrome, field, setText, stepper } from './common.ts';

type St = 'ready' | 'breathe' | 'hold' | 'recover' | 'exhale' | 'med' | 'done';

class WimHofPlayer implements Player {
  st: St = 'ready';
  block?: string;
  round = 1;
  holds: number[] = [];
  clock = new Clock();
  total = new Clock();
  raf = 0;
  timer = 0;
  lastN = -1;
  lastInhale = false;
  lastSec = -1;
  saved = false;

  constructor(block?: string) {
    this.block = block;
    this.render();
  }

  get set() {
    return ctx.S.set;
  }
  get per(): number {
    return PACE[this.set.whPace];
  }

  render(): void {
    const el = ovEl();
    const s = this.set;
    if (this.st === 'ready') {
      const hs = holdStats(ctx.S.log);
      el.innerHTML = chrome(
        'Wim Hof',
        `${art('angel', 'pl-art')}<h1 class="pl-h">Meditation</h1>
        <p class="pl-sub">Respirația Wim Hof, apoi liniște</p>
        <ol class="ticks" style="counter-reset:none">
          <li>${s.whBreaths} de respirații adânci: inspiri complet, pe nas sau pe gură, și lași aerul să iasă fără efort.</li>
          <li>După ultima expirație ții aerul cât poți, fără să forțezi.</li>
          <li>Când simți nevoia, inspiri complet și ții ${RECOVERY_SEC} secunde.</li>
          <li>Repeți de ${s.whRounds} ori, apoi stai în liniște.</li>
        </ol>
        <div class="card" style="border-color:var(--red)">
          <p style="margin:0 0 10px"><b>Siguranță.</b> Stai așezat sau întins. Niciodată în apă, la volan sau în picioare: poți leșina. Furnicăturile și o amețeală ușoară sunt normale; dacă te simți rău, te oprești. Dacă ai epilepsie, probleme cu inima, tensiune mare sau ești însărcinat, întreabă întâi medicul.</p>
          <label class="row" style="justify-content:flex-start;gap:12px;font-weight:700"><span class="switch"><input type="checkbox" data-a="p:safe" ${s.whSafety ? 'checked' : ''}><span></span></span>Am înțeles</label>
        </div>
        <div class="setup">
          ${field('Runde', stepper('p:rounds', String(s.whRounds), 'Runde'))}
          ${field('Respirații pe rundă', stepper('p:breaths', String(s.whBreaths), 'Respirații'))}
          ${field('Ritm', `<div class="chips">${(['slow', 'normal', 'fast'] as const).map((k) => `<button class="chip" aria-pressed="${s.whPace === k}" data-a="p:pace" data-v="${k}">${{ slow: 'Lent', normal: 'Normal', fast: 'Rapid' }[k]}</button>`).join('')}</div>`)}
          ${field('Liniște la final', stepper('p:med', `${s.whMed} min`, 'Liniște'))}
        </div>
        ${hs.best ? `<p class="prev">Cea mai lungă retenție: ${mmss(hs.best)}. Ultima sesiune: ${hs.last.map(mmss).join(', ')}.</p>` : ''}
        <button class="btn" data-a="p:start" ${s.whSafety ? '' : 'disabled style="opacity:.4"'}>Start</button>`,
      );
      return;
    }
    if (this.st === 'done') {
      const hs = holdStats(ctx.S.log);
      el.innerHTML = chrome(
        'Wim Hof',
        `${art('claws', 'done-claws')}<h1 class="pl-h done-h">Gata.</h1>
        <p class="lead">Retenții: ${this.holds.map(mmss).join(', ') || '–'}</p>
        ${hs.best ? `<p class="dim">Recordul tău: ${mmss(hs.best)}.</p>` : ''}
        <p class="dim">${this.saved ? 'Salvat în progres.' : ''}</p>
        <button class="btn" data-a="p:close">Închide</button>`,
        { center: true },
      );
      return;
    }
    let label = '';
    let big = '';
    let sub = `Runda ${this.round} din ${s.whRounds}`;
    let btn = '';
    if (this.st === 'breathe') {
      const b = breathPos(this.clock.t, this.per);
      label = b.inhale ? 'Inspiră' : 'Lasă aerul să iasă';
      big = String(Math.min(b.n + 1, s.whBreaths));
    } else if (this.st === 'hold') {
      label = 'Ține aerul, cu plămânii goi';
      big = mmss(this.clock.t);
      btn = '<button class="tap-big" data-a="p:breathe">Respir</button>';
    } else if (this.st === 'recover') {
      label = 'Inspiră complet și ține';
      big = String(Math.ceil(RECOVERY_SEC - this.clock.t));
    } else if (this.st === 'exhale') {
      label = 'Expiră';
      big = '';
    } else if (this.st === 'med') {
      label = 'Liniște. Respiră normal.';
      big = mmss(Math.ceil(this.set.whMed * 60 - this.clock.t));
      sub = 'Meditație';
    }
    el.innerHTML = chrome(
      'Wim Hof',
      `<p class="round-lbl" style="text-align:center">${esc(sub)}</p>
      <div class="orb-wrap"><div class="orb" id="orb"></div><div class="orb-txt"><div><b id="big">${esc(big)}</b></div></div></div>
      <p class="phase-lbl" id="lbl" style="text-align:center">${esc(label)}</p>
      <div style="margin-top:18px">${btn}</div>
      ${this.holds.length ? `<p class="prev" style="text-align:center">Retenții: ${this.holds.map(mmss).join(', ')}</p>` : ''}`,
      { center: true },
    );
    this.frame();
  }

  begin(st: St): void {
    this.st = st;
    this.clock.start();
    this.lastN = -1;
    this.lastSec = -1;
    if (st === 'breathe') say(`Runda ${this.round}. Respiră adânc.`, 'ro');
    if (st === 'hold') {
      sfx.chime();
      say('Expiră și ține', 'ro');
    }
    if (st === 'recover') {
      sfx.breath(true);
      say('Inspiră complet și ține', 'ro');
    }
    if (st === 'med') say('Liniște', 'ro');
    this.render();
  }

  start(): void {
    unlock();
    this.total.start();
    this.round = 1;
    this.holds = [];
    this.begin('breathe');
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
    if (!orb) return;
    let s = 0.38;
    const t = this.clock.t;
    if (this.st === 'breathe') s = 0.38 + 0.62 * breathPos(t, this.per).fill;
    else if (this.st === 'hold') s = 0.34 + 0.03 * Math.sin(t * 1.2);
    else if (this.st === 'recover') s = Math.min(1, 0.4 + t / 1.6);
    else if (this.st === 'exhale') s = Math.max(0.38, 1 - t / 2);
    else if (this.st === 'med') s = 0.45 + 0.1 * Math.sin(t * 0.6);
    orb.style.setProperty('--s', s.toFixed(3));
  }

  logic(): void {
    const t = this.clock.t;
    const s = this.set;
    if (this.st === 'breathe') {
      const b = breathPos(t, this.per);
      if (b.n >= s.whBreaths) return this.begin('hold');
      if (b.n !== this.lastN || b.inhale !== this.lastInhale) {
        this.lastN = b.n;
        this.lastInhale = b.inhale;
        setText('big', String(b.n + 1));
        setText('lbl', b.inhale ? 'Inspiră' : 'Lasă aerul să iasă');
        sfx.breath(b.inhale);
        if (b.inhale && b.n === s.whBreaths - 3) say('Încă trei', 'ro');
      }
    } else if (this.st === 'hold') {
      const sec = Math.floor(t);
      if (sec !== this.lastSec) {
        this.lastSec = sec;
        setText('big', mmss(sec));
        if (sec > 0 && sec % 30 === 0) buzz(40);
      }
    } else if (this.st === 'recover') {
      const left = Math.ceil(RECOVERY_SEC - t);
      if (left !== this.lastSec) {
        this.lastSec = left;
        setText('big', String(Math.max(0, left)));
      }
      if (t >= RECOVERY_SEC) {
        sfx.breath(false);
        this.begin('exhale');
      }
    } else if (this.st === 'exhale') {
      if (t >= 2.5) {
        if (this.round < s.whRounds) {
          this.round++;
          this.begin('breathe');
        } else if (s.whMed > 0) this.begin('med');
        else this.finish();
      }
    } else if (this.st === 'med') {
      const left = Math.ceil(s.whMed * 60 - t);
      if (left !== this.lastSec) {
        this.lastSec = left;
        setText('big', mmss(Math.max(0, left)));
      }
      if (left <= 0) this.finish();
    }
  }

  finish(): void {
    cancelAnimationFrame(this.raf);
    window.clearInterval(this.timer);
    sfx.chime();
    this.saveEntry();
    this.st = 'done';
    this.render();
  }

  saveEntry(): void {
    if (this.saved || !this.holds.length) return;
    const s = this.set;
    addEntry(
      makeEntry({
        kind: 'wimhof',
        block: this.holds.length >= s.whRounds ? this.block : undefined,
        name: 'Meditation',
        dur: this.total.t,
        data: { holds: this.holds, rounds: this.holds.length, breaths: s.whBreaths, pace: s.whPace },
      }),
    );
    this.saved = true;
  }

  act(a: string, el: HTMLElement): void {
    const s = this.set;
    const d = Number(el.dataset.d || 0);
    switch (a) {
      case 'p:safe':
        s.whSafety = (el as HTMLInputElement).checked;
        save();
        return this.render();
      case 'p:rounds':
        s.whRounds = Math.max(1, Math.min(6, s.whRounds + d));
        break;
      case 'p:breaths':
        s.whBreaths = Math.max(15, Math.min(50, s.whBreaths + d * 5));
        break;
      case 'p:pace':
        s.whPace = (el.dataset.v as 'slow' | 'normal' | 'fast') || 'normal';
        break;
      case 'p:med':
        s.whMed = Math.max(0, Math.min(15, s.whMed + d));
        break;
      case 'p:start':
        if (!s.whSafety) return;
        return this.start();
      case 'p:breathe':
        if (this.st !== 'hold') return;
        this.holds.push(Math.round(this.clock.t));
        return this.begin('recover');
      default:
        return;
    }
    save();
    this.render();
  }

  close(): boolean {
    if (this.st === 'ready' || this.st === 'done') return true;
    if (!this.holds.length) return true;
    ask('Te oprești?', `Ai ${this.holds.length} ${this.holds.length === 1 ? 'rundă' : 'runde'} făcute. Salvez?`, 'Salvează și ieși', () => {
      this.saveEntry();
      closePlayer(true);
    }, 'Continuă');
    return false;
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    window.clearInterval(this.timer);
  }
}

export function openWimHof(block?: string): void {
  mountPlayer(new WimHofPlayer(block));
}
