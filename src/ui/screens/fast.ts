// The fasting card on "Azi": 16/8 or a 24 h "no food" day, with a live countdown.

import { FAST_MODES, fastStatus, hms, type FastMode } from '../../logic/nutri/fast.ts';
import { dayKey, esc, RO_DAYS, weekdayIdx } from '../../logic/util.ts';
import { buzz } from '../audio.ts';
import { ask, ctx, save, toast } from '../ctx.ts';
import { ic } from '../icons.ts';

const S = (): typeof ctx.S => ctx.S;

// ---------- fasting ----------
function endFast(done: boolean): void {
  const f = S().fast;
  if (!f) return;
  const st = fastStatus(f, Date.now());
  S().fasts = [...S().fasts, { ...f, end: done ? st.endsAt : Date.now(), done }].slice(-100);
  S().fast = null;
}

const hhmm = (ts: number): string => {
  const d = new Date(ts);
  const same = dayKey(d) === dayKey();
  return `${same ? 'azi' : RO_DAYS[weekdayIdx(dayKey(d))].toLowerCase()} la ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

/** Fasting card: start 16/8 or a 24 h "no food" day; while running, a live countdown. */
export function fastCard(): string {
  const f = S().fast;
  if (!f) {
    const last = S().fasts.filter((x) => x.done).length;
    return `<section class="card fast" aria-label="Post"><div class="row"><div class="row-l"><h3>Post</h3><p class="small dim" style="margin:0">Pornești timerul acum; merge și cu aplicația închisă.${last ? ` ${last} ${last === 1 ? 'post dus' : 'posturi duse'} până la capăt.` : ''}</p></div>${ic('timer')}</div>
      <div class="btn-row" style="margin-top:12px"><button class="btn ghost sm" data-a="fa:start" data-k="168">16/8</button><button class="btn sm" data-a="fa:start" data-k="24">NO FOOD TODAY</button></div>
      <p class="small dim" style="margin:10px 0 0">16/8: 16 ore fără mâncare, apoi 8 ore în care mănânci. NO FOOD TODAY: 24 de ore fără mâncare.</p></section>`;
  }
  const m = FAST_MODES[f.mode];
  const st = fastStatus(f, Date.now());
  const big = st.done ? hms(st.windowLeft) : hms(st.left);
  const sub = st.done ? 'Fereastra de mâncat e deschisă. Se închide în' : `Fără mâncare până ${hhmm(st.endsAt)}. Mai ai`;
  return `<section class="card fast on ${st.done ? 'eat' : ''}" aria-label="Post" data-fast>
    <div class="row"><div class="row-l"><h3>${esc(m.name)}</h3><p class="small dim" style="margin:0">Început ${hhmm(f.start)} · ${m.hours} h fără mâncare</p></div>${ic('timer')}</div>
    <p class="small" style="margin:12px 0 0" data-fast-s>${esc(sub)}</p>
    <div class="fast-t num" data-fast-t>${big}</div>
    <div class="bar" aria-hidden="true"><i data-fast-bar style="width:${(st.frac * 100).toFixed(1)}%"></i></div>
    <p class="small dim" style="margin:0 0 12px" data-fast-e>${st.done ? 'Postul e făcut.' : `Ai postit ${hms(st.elapsed)}.`}</p>
    ${f.mode === '24' && !st.done ? '<p class="small dim" style="margin:0 0 12px">Bei apă; cafeaua și ceaiul neîndulcite sunt ok, un vârf de sare ajută. Fără sac greu azi. Dacă amețești sau ți se face rău, mănânci.</p>' : ''}
    <button class="btn ghost sm" data-a="fa:end">${st.done ? 'Închide fereastra' : 'Oprește postul'}</button></section>`;
}

/** Live countdown; finishes the fast by itself when the time is up. */
function fastTick(): void {
  const f = ctx.S?.fast;
  if (!f) return;
  const st = fastStatus(f, Date.now());
  if (st.over || (f.mode === '24' && st.done)) {
    endFast(true);
    save();
    buzz([300, 120, 300]);
    toast(f.mode === '24' ? '24 de ore fără mâncare. Gata, ai reușit.' : 'Fereastra 16/8 s-a încheiat.');
    ctx.render();
    return;
  }
  const el = document.querySelector('[data-fast]');
  if (!el) return;
  if (st.done && !el.classList.contains('eat')) {
    buzz([200, 100, 200]);
    ctx.render();
    return;
  }
  const t = el.querySelector('[data-fast-t]');
  if (t) t.textContent = st.done ? hms(st.windowLeft) : hms(st.left);
  const b = el.querySelector<HTMLElement>('[data-fast-bar]');
  if (b) b.style.width = `${(st.frac * 100).toFixed(1)}%`;
  const e = el.querySelector('[data-fast-e]');
  if (e && !st.done) e.textContent = `Ai postit ${hms(st.elapsed)}.`;
}
window.setInterval(fastTick, 1000);

export function fastAct(a: string, el: HTMLElement, render: () => void): void {
  const st = S();
  const key = el.dataset.k ?? '';
  switch (a) {
    case 'fa:start': {
      const mode: FastMode = key === '24' ? '24' : '168';
      if (st.fast) return;
      const go = () => {
        st.fast = { mode, start: Date.now() };
        save();
        toast(mode === '24' ? 'NO FOOD TODAY: timerul de 24 de ore a pornit.' : 'Post 16/8: timerul a pornit.');
        render();
      };
      if (mode === '24') return ask('NO FOOD TODAY?', 'Pornești un post de 24 de ore, de acum. Bei apă. Dacă ai o afecțiune, iei medicamente sau ai avut tulburări alimentare, întreabă întâi medicul.', 'Pornește', go);
      return go();
    }
    case 'fa:end': {
      const f = st.fast;
      if (!f) return;
      if (fastStatus(f, Date.now()).done) {
        endFast(true);
        save();
        return render();
      }
      return ask('Oprești postul?', 'Timerul se oprește și postul se notează ca întrerupt.', 'Oprește', () => {
        endFast(false);
        save();
        render();
      });
    }
  }
}
