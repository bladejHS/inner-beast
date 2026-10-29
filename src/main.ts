import './styles.css';
import { blockById, WEEK, type Block } from './data/plan.ts';
import { rowChallenge } from './data/row.ts';
import { defaultHabit, freshState, normalize, type Habit } from './logic/store.ts';
import { dayKey, esc, uid, weekdayIdx } from './logic/util.ts';
import { initAudio, unlock } from './ui/audio.ts';
import { countUp, initParallax, revealBelowFold } from './ui/fx.ts';
import { closePlayer, closeSheet, ctx, openSheet, ask, save, sheetAct, toast, type Tab, type View } from './ui/ctx.ts';
import { ic } from './ui/icons.ts';
import { openBreath } from './ui/players/breath.ts';
import { openRoutine } from './ui/players/routine.ts';
import { openShower } from './ui/players/shower.ts';
import { openWimHof } from './ui/players/wimhof.ts';
import { fightHtml, setComboCat, startQuick } from './ui/screens/fight.ts';
import { alexHtml, toggleLearned } from './ui/screens/alex.ts';
import { chapterHtml, mindHtml } from './ui/screens/mind.ts';
import { planHtml } from './ui/screens/plan.ts';
import { historyHtml, progressHtml } from './ui/screens/progress.ts';
import { settingsHtml } from './ui/screens/settings.ts';
import { bodyAct, bodyChange, bodyInput, hydratePhotos } from './ui/screens/body.ts';
import { nuAct, nuChange, nuInput, nutriStartup, nutritionHtml } from './ui/screens/nutrition.ts';
import { MORE_TABS, moreHtml } from './ui/screens/more.ts';
import { icsExport } from './ui/ics.ts';
import { isDark, saveSteps, setTheme, startBlock, toggleMark } from './ui/screens/shared.ts';
import { dayViewHtml, todayHtml } from './ui/screens/today.ts';

initAudio(() => ctx.S.set);
initParallax();

// five destinations; Nutriție, Minte and Alex live behind "Mai mult"
const TABS: Array<[Tab, string, string]> = [
  ['today', 'Azi', 'today'],
  ['plan', 'Plan', 'plan'],
  ['fight', 'Lupte', 'fight'],
  ['progress', 'Progres', 'progress'],
  ['more', 'Mai mult', 'more'],
];

const views: View[] = [];
const scrollMem: Partial<Record<Tab, number>> = {};

function screenHtml(): string {
  const v = views[views.length - 1];
  if (v) {
    if (v.t === 'day') return dayViewHtml(v.idx);
    if (v.t === 'chapter') return chapterHtml(v.id);
    if (v.t === 'settings') return settingsHtml();
    if (v.t === 'history') return historyHtml();
  }
  switch (ctx.tab) {
    case 'plan':
      return planHtml();
    case 'fight':
      return fightHtml();
    case 'alex':
      return alexHtml();
    case 'mind':
      return mindHtml();
    case 'nutri':
      return nutritionHtml();
    case 'more':
      return moreHtml();
    case 'progress':
      return progressHtml();
    default:
      return todayHtml();
  }
}

function navHtml(): string {
  const cur = MORE_TABS.includes(ctx.tab) ? 'more' : ctx.tab;
  return `<nav class="tabs" aria-label="Secțiuni">${TABS.map(([k, label, icon]) => `<button data-a="tab" data-k="${k}" ${cur === k && !views.length ? 'aria-current="page"' : ''}>${ic(icon)}<span>${label}</span></button>`).join('')}</nav>`;
}

function render(): void {
  const app = document.getElementById('app');
  if (!app) return;
  const active = document.activeElement as HTMLElement | null;
  const keepId = active && (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT') ? active.id : '';
  app.innerHTML = screenHtml() + navHtml();
  hydratePhotos(app);
  if (keepId) {
    const el = document.getElementById(keepId) as HTMLInputElement | null;
    el?.focus({ preventScroll: true });
  }
}
ctx.render = render;

/** Cards slide in when a new screen opens (not on every re-render). */
function enter(): void {
  const app = document.getElementById('app');
  if (!app) return;
  app.classList.remove('enter');
  void app.offsetWidth;
  app.classList.add('enter');
  revealBelowFold(app);
  countUp(app);
  window.clearTimeout(enterTimer);
  enterTimer = window.setTimeout(() => app.classList.remove('enter'), 900);
}
let enterTimer = 0;

function go(fn: () => void, top = true): void {
  fn();
  render();
  enter();
  if (top) window.scrollTo(0, 0);
}

function pushView(v: View): void {
  if (!views.length) scrollMem[ctx.tab] = window.scrollY;
  views.push(v);
  history.pushState({ v: views.length }, '');
  go(() => {});
}

function popView(): void {
  views.pop();
  render();
  enter();
  window.scrollTo(0, views.length ? 0 : scrollMem[ctx.tab] ?? 0);
}

/** Today's plan block of a given kind, so tools opened from other tabs still check it off. */
function todayBlock(match: (b: Block) => boolean): Block | undefined {
  return WEEK[weekdayIdx(dayKey())].blocks.find(match);
}

function openTool(k: string): void {
  switch (k) {
    case 'wimhof':
      return openWimHof(todayBlock((b) => b.kind === 'wimhof')?.id);
    case 'breath':
      return openBreath(todayBlock((b) => b.kind === 'breath')?.id);
    case 'shower':
      return openShower(todayBlock((b) => b.kind === 'shower')?.id);
    case 'mobility':
    case 'stretch-push':
    case 'stretch-pull':
      return openRoutine(k, todayBlock((b) => b.routine === k)?.id);
    case 'daily':
    case 'dagestan':
    case 'peekaboo':
    case 'abs':
    case 'splits':
    case 'homebox':
      return openRoutine(k);
  }
}

function habitSheet(fresh: boolean): void {
  const h = ctx.S.habits.find((x) => !x.archived);
  const name = fresh ? '' : h?.name ?? '';
  const type = fresh ? 'check' : h?.type ?? 'count';
  const goal = fresh ? 1 : h?.goal ?? 50;
  openSheet(
    `<h2>${fresh ? 'Obicei nou' : 'Rutina zilei'}</h2>
    <p class="dim">Un singur lucru bun pentru tine, atât de simplu încât îl faci zilnic. Sugestia din carte: 50 de flotări.</p>
    <label class="small" for="hb-name" style="font-weight:700">Ce faci zilnic</label>
    <input type="text" id="hb-name" value="${esc(name)}" placeholder="ex. 50 Push-ups, 10 minute de citit" maxlength="60">
    <div class="field"><div class="field-l">Număr de atins<small>Gol = doar bifezi</small></div><input type="number" id="hb-goal" inputmode="numeric" value="${type === 'count' ? goal : ''}" style="width:100px" min="1" max="1000"></div>
    <div style="height:12px"></div>
    <button class="btn" data-a="hb-save">Salvează</button>`,
    {
      'hb-save': () => {
        const n = (document.getElementById('hb-name') as HTMLInputElement).value.trim();
        const g = parseInt((document.getElementById('hb-goal') as HTMLInputElement).value, 10);
        if (!n) return toast('Scrie ce faci zilnic.');
        const today = dayKey();
        if (fresh || !h) {
          if (h) h.archived = true;
          const nh: Habit = { id: uid(), name: n, type: g > 0 ? 'count' : 'check', goal: g > 0 ? g : 1, start: today, days: {} };
          ctx.S.habits.push(nh);
        } else {
          h.name = n;
          h.type = g > 0 ? 'count' : 'check';
          h.goal = g > 0 ? g : 1;
        }
        save();
        closeSheet();
        render();
      },
    },
  );
}

function exportData(): void {
  // the AI key stays on this phone: never in a file that gets shared
  const blob = new Blob([JSON.stringify({ ...ctx.S, nut: { ...ctx.S.nut, aiKey: undefined } }, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `inner-beast-${dayKey()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function importData(input: HTMLInputElement): void {
  const f = input.files?.[0];
  if (!f) return;
  f.text()
    .then((txt) => {
      const st = normalize(JSON.parse(txt));
      ask('Înlocuiești datele?', `Copia are ${st.log.length} înregistrări. Ce e acum pe telefon se înlocuiește.`, 'Înlocuiește', () => {
        if (!st.nut.aiKey && ctx.S.nut.aiKey) st.nut.aiKey = ctx.S.nut.aiKey;
        ctx.S = st;
        save();
        render();
        toast('Copie încărcată.');
      });
    })
    .catch(() => toast('Fișierul nu e o copie validă.'))
    .finally(() => (input.value = ''));
}

let whyTimer = 0;

function act(a: string, el: HTMLElement): void {
  const S = ctx.S;
  const today = dayKey();
  switch (a) {
    case 'tab': {
      const k = (el.dataset.k as Tab) || 'today';
      if (!views.length) scrollMem[ctx.tab] = window.scrollY;
      const same = ctx.tab === k && !views.length;
      views.length = 0;
      ctx.tab = k;
      render();
      if (!same) enter();
      const to = el.dataset.to;
      if (to) document.getElementById(to)?.scrollIntoView({ block: 'start' });
      else window.scrollTo(0, same ? 0 : scrollMem[k] ?? 0);
      return;
    }
    case 'start': {
      const b = blockById(el.dataset.b || '');
      if (b) {
        unlock();
        startBlock(b);
      }
      return;
    }
    case 'mark': {
      const b = blockById(el.dataset.b || '');
      if (b) toggleMark(b);
      return;
    }
    case 'day':
      return pushView({ t: 'day', idx: Number(el.dataset.i) || 0 });
    case 'chapter': {
      const top = views[views.length - 1];
      if (top && top.t === 'chapter') {
        top.id = el.dataset.id || '';
        return go(() => {});
      }
      return pushView({ t: 'chapter', id: el.dataset.id || '' });
    }
    case 'back':
      if (views.length) history.back();
      return;
    case 'settings':
      return pushView({ t: 'settings' });
    case 'theme':
      setTheme(!isDark());
      return render();
    case 'history':
      return pushView({ t: 'history' });
    case 'ics': {
      const t = (document.getElementById('icsT') as HTMLInputElement | null)?.value || '18:00';
      const al = Number((document.getElementById('icsA') as HTMLSelectElement | null)?.value ?? 30);
      void icsExport(t, al);
      return;
    }
    case 'qt':
      unlock();
      return startQuick(el.dataset.k || '');
    case 'learned':
      toggleLearned(el.dataset.id || '');
      return render();
    case 'ccat':
      setComboCat(el.dataset.k || 'all');
      return render();
    case 'tool':
      unlock();
      return openTool(el.dataset.k || '');
    case 'intro-ok':
      try {
        localStorage.setItem('beast:intro', '1');
      } catch {
        /* ignore */
      }
      return render();
    case 'hab': {
      const h = S.habits.find((x) => !x.archived);
      if (!h) return;
      h.days[today] = Math.max(0, (h.days[today] ?? 0) + (Number(el.dataset.n) || 0));
      if ((h.days[today] ?? 0) >= h.goal && (h.days[today] ?? 0) - (Number(el.dataset.n) || 0) < h.goal) toast(`${h.name}: făcut azi.`);
      save();
      return render();
    }
    case 'hab-check': {
      const h = S.habits.find((x) => !x.archived);
      if (!h) return;
      h.days[today] = (h.days[today] ?? 0) >= 1 ? 0 : 1;
      save();
      return render();
    }
    case 'hab-edit':
      return habitSheet(false);
    case 'hab-new':
      return habitSheet(true);
    case 'sleep': {
      const v = S.sleep[today];
      S.sleep[today] = v === undefined ? 7.5 : Math.max(0, Math.min(14, v + (Number(el.dataset.d) || 0) * 0.5));
      save();
      return render();
    }
    case 'win-add': {
      const inp = document.getElementById('win-in') as HTMLInputElement | null;
      const big = (document.getElementById('win-big') as HTMLInputElement | null)?.checked ?? false;
      const text = inp?.value.trim() ?? '';
      if (!text) return toast('Scrie victoria întâi.');
      S.wins.push({ id: uid(), date: today, text, big });
      save();
      render();
      toast('Notat. Fiecare pas înainte e un triumf.');
      return;
    }
    case 'win-del':
      S.wins = S.wins.filter((w) => w.id !== el.dataset.id);
      save();
      return render();
    case 'warrior': {
      const v = el.dataset.v;
      if (v === 'w' || v === 'v') S.warrior[today] = v;
      else delete S.warrior[today];
      save();
      return render();
    }
    case 'hist-del':
      ask('Ștergi înregistrarea?', 'Dispare din istoric și din progres.', 'Șterge', () => {
        S.log = S.log.filter((e) => e.id !== el.dataset.id);
        save();
        render();
      }, 'Renunță', true);
      return;
    case 'set-step': {
      const k = el.dataset.k as 'rest3' | 'rest1';
      S.set[k] = Math.max(0, Math.min(300, S.set[k] + (Number(el.dataset.d) || 0) * 15));
      save();
      return render();
    }
    case 'set-call':
      S.set.callEvery = Number(el.dataset.v) || 0;
      save();
      return render();
    case 'set-leg':
      S.set.legMode = el.dataset.v === 'jump' ? 'jump' : 'wall';
      save();
      return render();
    case 'alt':
      if (el.dataset.b === 'thu-rope') S.set.thuFeet = el.dataset.v === 'ladder' ? 'ladder' : 'rope';
      else S.set.thuMain = el.dataset.v === 'row' ? 'row' : 'bag';
      save();
      return render();
    case 'row-ch':
      S.set.rowCh = rowChallenge(el.dataset.v).id;
      save();
      return render();
    case 'export':
      return exportData();
    case 'reset':
      ask('Ștergi tot?', 'Istoricul, rutina, victoriile și setările dispar de pe telefon. Nu se poate anula.', 'Șterge tot', () => {
        ctx.S = freshState();
        ctx.S.habits = [defaultHabit(dayKey())];
        save();
        views.length = 0;
        ctx.tab = 'today';
        render();
      }, 'Renunță', true);
      return;
  }
}

function onChange(el: HTMLElement): void {
  const a = el.dataset.a || '';
  if (a.startsWith('body:')) return bodyChange(a, el, render);
  if (a.startsWith('nu:')) return nuChange(a, el, render);
  if (a.startsWith('p:')) return ctx.player?.act(a, el);
  const S = ctx.S;
  if (a === 'set-bool') {
    const k = el.dataset.k as 'sound' | 'voice' | 'vibrate' | 'wake';
    S.set[k] = (el as HTMLInputElement).checked;
    save();
    return;
  }
  if (a === 'import') return importData(el as HTMLInputElement);
  if (a === 'set-theme') {
    setTheme((el as HTMLInputElement).checked);
    return render();
  }
  if (a === 'steps') {
    saveSteps(parseInt((el as HTMLInputElement).value, 10) || 0);
    return render();
  }
}

function onInput(el: HTMLElement): void {
  const a = el.dataset.a || '';
  if (a.startsWith('body:')) return bodyInput(a, el);
  if (a.startsWith('nu:')) return nuInput(a, el);
  if (a.startsWith('p:')) return ctx.player?.input?.(el);
  if (a === 'why') {
    const k = el.dataset.k as 'victim' | 'winner' | 'drive';
    ctx.S.why[k] = (el as HTMLTextAreaElement).value;
    clearTimeout(whyTimer);
    whyTimer = window.setTimeout(save, 400);
  }
}

document.addEventListener('click', (ev) => {
  const t = ev.target as HTMLElement;
  if (t instanceof HTMLInputElement && (t.type === 'checkbox' || t.type === 'file' || t.type === 'number' || t.type === 'text')) return;
  const el = t.closest<HTMLElement>('[data-a]');
  if (!el || el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return;
  const a = el.dataset.a || '';
  if (document.getElementById('sheet')?.innerHTML && sheetAct(a, el)) return;
  if (a === 'p:close') return closePlayer();
  if (a === 'p:sound') {
    ctx.S.set.sound = !ctx.S.set.sound;
    save();
    const btn = el;
    btn.innerHTML = ic(ctx.S.set.sound ? 'sound' : 'mute');
    btn.setAttribute('aria-label', ctx.S.set.sound ? 'Oprește sunetul' : 'Pornește sunetul');
    return;
  }
  if (a.startsWith('p:')) {
    ctx.player?.act(a, el);
    return;
  }
  if (a.startsWith('body:')) return bodyAct(a, el, render);
  if (a.startsWith('nu:')) return nuAct(a, el, render);
  const hadPlayer = !!ctx.player;
  act(a, el);
  if (!hadPlayer && ctx.player) {
    history.pushState({ p: 1 }, '');
    playerState = true;
  }
});

document.addEventListener('change', (ev) => {
  const el = ev.target as HTMLElement;
  if (el?.dataset?.a) onChange(el);
});

document.addEventListener('input', (ev) => {
  const el = ev.target as HTMLElement;
  if (el?.dataset?.a) onInput(el);
});

// Typing reps: select the old number so the new one replaces it.
document.addEventListener('focusin', (ev) => {
  const t = ev.target;
  if (t instanceof HTMLInputElement && t.type === 'number') t.select();
});

// No zoom: iOS ignores user-scalable=no, so pinch is blocked here too (double-tap: touch-action in CSS).
for (const g of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(g, (ev) => ev.preventDefault());
document.addEventListener('touchmove', (ev) => {
  if (ev.touches.length > 1) ev.preventDefault();
}, { passive: false });

document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Enter' && ev.target instanceof HTMLInputElement && ev.target.type === 'number') ev.target.blur();
  if (ev.key === 'Enter' && (ev.target as HTMLElement)?.id === 'win-in') {
    act('win-add', ev.target as HTMLElement);
  }
});

// Android back button / swipe back: close the sheet, the player or the open view first.
let playerState = false;
let skipPop = false;
ctx.onPlayerClosed = () => {
  if (playerState) {
    playerState = false;
    skipPop = true;
    history.back();
  }
};
window.addEventListener('popstate', () => {
  if (skipPop) {
    skipPop = false;
    return;
  }
  if (ctx.player) {
    playerState = false;
    if (document.getElementById('sheet')?.innerHTML) closeSheet();
    const p = ctx.player;
    closePlayer();
    if (ctx.player === p) {
      history.pushState({ p: 1 }, '');
      playerState = true;
    }
    return;
  }
  if (document.getElementById('sheet')?.innerHTML) {
    closeSheet();
    if (views.length) history.pushState({ v: views.length }, '');
    return;
  }
  if (views.length) popView();
});

nutriStartup();
render();
enter();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
