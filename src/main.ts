import './beast.css';
import { publishPlan } from './logic/bridge.ts';
import { blockById, WEEK, type Block } from './data/plan.ts';
import { rowChallenge } from './data/row.ts';
import { defaultHabit, freshState, normalize, type Habit } from './logic/store.ts';
import { growPushups, habitGoal } from './logic/progress.ts';
import { dayKey, esc, shortDay, uid, weekdayIdx, weekStart } from './logic/util.ts';
import { initAudio, unlock } from './ui/audio.ts';
import { closePlayer, closeSheet, ctx, openSheet, ask, save, sheetAct, toast, type Tab, type View } from './ui/ctx.ts';
import { ic } from './ui/icons.ts';
import { openBreath } from './ui/players/breath.ts';
import { openRoutine } from './ui/players/routine.ts';
import { jogTarget, openPolar } from './ui/players/run.ts';
import { openShower } from './ui/players/shower.ts';
import { openWimHof } from './ui/players/wimhof.ts';
import { dropWorkoutDraft, resumeWorkout, saveWorkoutDraft } from './ui/players/workout.ts';
import { fightHtml, setComboCat, startQuick } from './ui/screens/fight.ts';
import { toggleLearned } from './ui/screens/alex.ts';
import { chapterHtml, mindHtml } from './ui/screens/mind.ts';
import { planHtml } from './ui/screens/plan.ts';
import { historyHtml, progressHtml, testValue } from './ui/screens/progress.ts';
import { testById, UNIT_LABEL } from './data/tests.ts';
import { parseTime } from './logic/runlog.ts';
import { settingsHtml } from './ui/screens/settings.ts';
import { openCoach } from './ui/players/coach.ts';
import { challengeHtml, toggleRace } from './ui/screens/challenge.ts';
import { resumeRace, startRace } from './ui/players/race.ts';
import { discAct, disciplineHtml } from './ui/screens/discipline.ts';
import { labHtml } from './ui/screens/lab.ts';
import { openLab } from './ui/players/lab.ts';
import { icsExport } from './ui/ics.ts';
import { liveBlock, planPicks, saveSteps, startBlock, toggleMark } from './ui/screens/shared.ts';
import { dayViewHtml, todayHtml } from './ui/screens/today.ts';
import { clawSwipe, countUp, lite } from './ui/fx.ts';

initAudio(() => ctx.S.set);

const BASE = import.meta.env.BASE_URL;

// Six places with labels always on, nothing behind "More"; Settings only behind the gear (the user asked on
// 2026-11-07 for Provocări in the bar). Training on the left of the wolf (Azi), mind and progress on the right.
// The order left to right is also the direction the claw swipe takes between tabs.
const ORDER: Array<[Tab, string, string]> = [
  ['plan', 'Plan', 'plan'],
  ['fight', 'Lupte', 'fight'],
  ['challenge', 'Provocări', 'cup'],
  ['today', 'Azi', ''],
  ['mind', 'Minte', 'mind'],
  ['progress', 'Progres', 'progress'],
];

/** Screens that open from a tab: the bar keeps their tab marked, and their back button returns there. */
export const PARENT: Partial<Record<Tab, Tab>> = { alex: 'fight', lab: 'mind', disc: 'challenge' };

/** Links into a section of a tab (data-to): the section that holds the anchor. */
const ANCHOR_SEG: Record<string, [Tab, string]> = { tests: ['progress', 'tests'], why: ['mind', 'mental'], wins: ['mind', 'mental'] };

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
    case 'alex':
      return fightHtml();
    case 'mind':
      return mindHtml();
    case 'disc':
      return disciplineHtml();
    case 'lab':
      return labHtml();
    case 'challenge':
      return challengeHtml();
    case 'progress':
      return progressHtml();
    default:
      return todayHtml();
  }
}

// ---------- the tab bar: built once, outside #app, so its blade can slide between tabs ----------
const nav = document.createElement('nav');
nav.id = 'nav';
nav.className = 'nav';
nav.setAttribute('aria-label', 'Secțiuni');
nav.innerHTML = `<div class="nav-plate" aria-hidden="true"></div><i class="nav-blade" aria-hidden="true"></i>${ORDER.map(([k, label, icon]) =>
  k === 'today'
    ? `<button class="nav-b nav-wolf" data-a="tab" data-k="today"><span class="nw" aria-hidden="true"><i class="nw-ring"></i><span class="nw-hex"><img src="${BASE}ui/wolf-badge.webp" alt="" width="168" height="198" decoding="async"></span></span><span class="nav-l">${label}</span></button>`
    : `<button class="nav-b" data-a="tab" data-k="${k}">${ic(icon)}<span class="nav-l">${label}</span></button>`,
).join('')}`;
document.body.appendChild(nav);

// the claw marks that rip across the screen between tabs (see fx.ts)
const swipe = document.createElement('div');
swipe.id = 'swipe';
swipe.setAttribute('aria-hidden', 'true');
swipe.innerHTML = '<b></b><i></i><i></i><i></i>';
document.body.appendChild(swipe);

/** The wolf in the tab bar roars: on picking Azi again, and when the opening's wolf lands in it. */
function roar(): void {
  if (lite()) return;
  const w = nav.querySelector<HTMLElement>('.nav-wolf');
  if (!w) return;
  w.classList.remove('roar');
  void w.offsetWidth;
  w.classList.add('roar');
}

// The opening rips open (index.html): the screen underneath makes its entry, and the wolf lands in the bar.
addEventListener('beast:reveal', () => {
  const app = document.getElementById('app');
  if (!app || lite()) return;
  app.classList.remove('enter-tab', 'enter-seg');
  void app.offsetWidth;
  app.classList.add('enter-tab');
  clearTimeout(enterTimer);
  enterTimer = window.setTimeout(() => app.classList.remove('enter-tab', 'enter-seg'), 1100);
});
addEventListener('beast:landed', roar);

let navOn = '';
function syncNav(): void {
  const cur = PARENT[ctx.tab] ?? ctx.tab;
  const i = ORDER.findIndex(([k]) => k === cur);
  nav.style.setProperty('--i', String(Math.max(0, i)));
  for (const b of nav.querySelectorAll<HTMLElement>('.nav-b')) {
    if (b.dataset.k === cur) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  }
  if (cur !== navOn) {
    nav.dataset.on = cur;
    // the wolf roars when Azi is picked again
    if (cur === 'today' && navOn) roar();
    navOn = cur;
  }
}

// ---------- render ----------
type Enter = 'tab' | 'seg' | '';
let enterTimer = 0;
const rings = new Map<string, number>();
let segInk: { tab: string; x: number; w: number } | null = null;

function render(enter: Enter = ''): void {
  const app = document.getElementById('app');
  if (!app) return;
  const active = document.activeElement as HTMLElement | null;
  const keepId = active && (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT') ? active.id : '';
  publishPlan(planPicks());
  // the entry plays only on navigation; any other redraw shows the screen at once
  app.classList.remove('enter-tab', 'enter-seg');
  if (enter) {
    void app.offsetWidth;
    app.classList.add(`enter-${enter}`);
    clearTimeout(enterTimer);
    enterTimer = window.setTimeout(() => app.classList.remove('enter-tab', 'enter-seg'), 1100);
  }
  app.innerHTML = screenHtml();
  syncNav();
  placeSegInk(enter === 'seg');
  moveRings(app, !!enter);
  if (enter) for (const el of app.querySelectorAll<HTMLElement>('[data-count]')) countUp(el, 0, Number(el.dataset.count) || 0, 800);
  if (keepId) {
    const el = document.getElementById(keepId) as HTMLInputElement | null;
    el?.focus({ preventScroll: true });
  }
}
ctx.render = () => render();

/** The red blade under the current section: slides from the section that was open before. */
function placeSegInk(slide: boolean): void {
  const bar = document.querySelector<HTMLElement>('#app .seg-in');
  if (!bar) {
    segInk = null;
    return;
  }
  const cur = bar.querySelector<HTMLElement>('.seg-b[aria-current]');
  const ink = bar.querySelector<HTMLElement>('.seg-ink');
  if (!cur || !ink) return;
  const x = cur.offsetLeft;
  const w = cur.offsetWidth;
  const to = `translateX(${x}px) scaleX(${w / 100})`;
  if (slide && segInk && segInk.tab === ctx.tab && !lite()) {
    ink.style.transition = 'none';
    ink.style.transform = `translateX(${segInk.x}px) scaleX(${segInk.w / 100})`;
    void ink.offsetWidth;
    ink.style.transition = '';
  }
  ink.style.transform = to;
  segInk = { tab: ctx.tab, x, w };
  if (bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: Math.max(0, x - (bar.clientWidth - w) / 2), behavior: slide && !lite() ? 'smooth' : 'auto' });
}

/** Progress rings move from the value they showed last time (or from zero when a screen opens). */
function moveRings(app: HTMLElement, fromZero: boolean): void {
  for (const g of app.querySelectorAll<HTMLElement>('.gauge[data-ring]')) {
    const k = g.dataset.ring ?? '';
    const f = parseFloat(g.style.getPropertyValue('--f')) || 0;
    const from = rings.has(k) && !fromZero ? rings.get(k)! : 0;
    rings.set(k, f);
    if (from === f || lite()) continue;
    g.style.setProperty('--f', String(from));
    const v = g.querySelector('.g-v');
    if (v) void getComputedStyle(v).strokeDashoffset;
    requestAnimationFrame(() => g.style.setProperty('--f', String(f)));
  }
}

function go(fn: () => void, top = true): void {
  fn();
  render('tab');
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
  render('tab');
  window.scrollTo(0, views.length ? 0 : scrollMem[ctx.tab] ?? 0);
}

/** Position of a tab in the bar, for the direction of the swipe. */
const tabPos = (t: Tab): number => ORDER.findIndex(([k]) => k === (PARENT[t] ?? t));

function saveSegs(): void {
  try {
    sessionStorage.setItem('beast:seg', JSON.stringify(ctx.seg));
  } catch {
    /* storage blocked: sections reset on reload */
  }
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
    case 'coach':
      return openCoach();
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
  const goal = fresh ? 1 : h?.prog ? h.prog.start : h?.goal ?? 10;
  const step = fresh ? 0 : h?.prog?.step ?? 0;
  openSheet(
    `<h2>${fresh ? 'Obicei nou' : 'Rutina zilei'}</h2>
    <p class="dim">Un singur lucru bun pentru tine, atât de simplu încât îl faci zilnic. Flotările pornesc de la 10 și cresc cu 3 în fiecare săptămână.</p>
    <label class="small" for="hb-name" style="font-weight:700">Ce faci zilnic</label>
    <input type="text" id="hb-name" value="${esc(name)}" placeholder="ex. 50 Push-ups, 10 minute de citit" maxlength="60">
    <div class="field"><div class="field-l">Număr de atins<small>Gol = doar bifezi. Cu creștere: numărul din prima săptămână.</small></div><input type="number" id="hb-goal" inputmode="numeric" value="${type === 'count' ? goal : ''}" style="width:100px" min="1" max="1000"></div>
    <div class="field"><div class="field-l">Crește în fiecare săptămână cu<small>0 = numărul rămâne fix</small></div><input type="number" id="hb-step" inputmode="numeric" value="${step || ''}" placeholder="0" style="width:100px" min="0" max="100"></div>
    <div style="height:12px"></div>
    <button class="btn" data-a="hb-save">Salvează</button>`,
    {
      'hb-save': () => {
        const n = (document.getElementById('hb-name') as HTMLInputElement).value.trim();
        const g = parseInt((document.getElementById('hb-goal') as HTMLInputElement).value, 10);
        const st = Math.max(0, parseInt((document.getElementById('hb-step') as HTMLInputElement).value, 10) || 0);
        if (!n) return toast('Scrie ce faci zilnic.');
        const today = dayKey();
        // a growing count keeps its first week when only the name changes
        const prog = g > 0 && st > 0 ? { start: g, step: st, from: h && !fresh && h.prog && h.prog.start === g && h.prog.step === st ? h.prog.from : today } : undefined;
        if (fresh || !h) {
          if (h) h.archived = true;
          const nh: Habit = { id: uid(), name: n, type: g > 0 ? 'count' : 'check', goal: g > 0 ? g : 1, start: today, days: {}, ...(prog ? { prog } : {}) };
          ctx.S.habits.push(nh);
        } else {
          h.name = n;
          h.type = g > 0 ? 'count' : 'check';
          h.goal = g > 0 ? g : 1;
          if (prog) h.prog = prog;
          else delete h.prog;
        }
        save();
        closeSheet();
        render();
      },
    },
  );
}

/** Notes a test result; the how-to and the published reference sit above the field. */
function testSheet(id: string): void {
  const t = testById(id);
  if (!t) return;
  const rows = ctx.S.tests[id] ?? [];
  const time = t.unit === 'time';
  openSheet(
    `<h2>${esc(t.name)}</h2>
    <p class="dim">${esc(t.how)}</p>
    ${t.ref ? `<p class="small"><b>Reper.</b> ${esc(t.ref)}</p>` : '<p class="small dim">Fără normă publicată: te compari cu tine.</p>'}
    <div class="field"><div class="field-l">Rezultat azi<small>${esc(UNIT_LABEL[t.unit])}</small></div><input id="test-v" type="${time ? 'text' : 'number'}" inputmode="decimal" ${time ? 'placeholder="10:59"' : 'min="0" step="any"'} style="width:120px"></div>
    ${rows.length ? `<p class="small dim">Până acum: ${rows.slice(-4).map((r) => `${testValue(t, r.v)} (${shortDay(r.d)})`).join(', ')}.</p>` : ''}
    <button class="btn" data-a="test-save">Salvează</button>`,
    {
      'test-save': () => {
        const raw = (document.getElementById('test-v') as HTMLInputElement).value.trim();
        const v = time ? parseTime(raw) : Number(raw.replace(',', '.'));
        if (!(v > 0)) return toast(time ? 'Scrie timpul, de exemplu 10:59.' : 'Scrie un rezultat.');
        (ctx.S.tests[id] ??= []).push({ d: dayKey(), v });
        save();
        closeSheet();
        render();
        toast('Notat.');
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
      let k = (el.dataset.k as Tab) || 'today';
      // Alex lives in Lupte now, as its third section; Discipline in Provocări
      if (k === 'alex') {
        k = 'fight';
        ctx.seg.fight = 'alex';
        saveSegs();
      }
      if (k === 'disc') {
        k = 'challenge';
        ctx.seg.challenge = 'disc';
        saveSegs();
      }
      const to = el.dataset.to;
      const anchor = to ? ANCHOR_SEG[to] : undefined;
      if (anchor) {
        ctx.seg[anchor[0]] = anchor[1];
        saveSegs();
      }
      if (!views.length) scrollMem[ctx.tab] = window.scrollY;
      const same = ctx.tab === k && !views.length;
      const from = ctx.tab;
      views.length = 0;
      ctx.tab = k;
      if (!same) clawSwipe(tabPos(k) - tabPos(from));
      render(same && !to ? '' : 'tab');
      if (to) document.getElementById(to)?.scrollIntoView({ block: 'start' });
      else window.scrollTo(0, same ? 0 : scrollMem[k] ?? 0);
      return;
    }
    case 'seg': {
      const k = el.dataset.k || '';
      if (!k || ctx.seg[ctx.tab] === k) return;
      // keep the switcher where it is: if the page is scrolled past it, the new section starts right under it
      const ph = document.querySelector<HTMLElement>('#app .ph');
      const head = document.querySelector<HTMLElement>('#app .top');
      const stick = ph ? ph.getBoundingClientRect().bottom + window.scrollY - (head?.offsetHeight ?? 0) : 0;
      ctx.seg[ctx.tab] = k;
      saveSegs();
      render('seg');
      if (window.scrollY > stick) window.scrollTo(0, stick);
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
    case 'polar': {
      const b = blockById(el.dataset.b || '');
      if (b) openPolar({ mode: 'run', block: b.id, target: jogTarget((liveBlock(b).min ?? 20) * 60) });
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
    case 'lab':
      unlock();
      return openLab(el.dataset.k || 'reset');
    case 'tool':
      unlock();
      return openTool(el.dataset.k || '');
    case 'draft-go':
      unlock();
      return resumeWorkout();
    case 'draft-save':
      if (saveWorkoutDraft()) toast('Salvat în progres.');
      return render();
    case 'draft-drop':
      ask('Renunți la antrenament?', 'Seriile bifate în el nu se mai salvează.', 'Renunță la el', () => {
        dropWorkoutDraft();
        render();
      }, 'Păstrează', true);
      return;
    case 'knee': {
      const day = el.dataset.d || today;
      const f = el.dataset.f === 'm' ? 'm' : 'd';
      S.knee[day] = { ...(S.knee[day] ?? {}), [f]: Number(el.dataset.v) || 0 };
      save();
      toast(Number(el.dataset.v) >= 5 ? 'Notat. Săriturile mai așteaptă; dacă durerea rămâne, mergi la un medic.' : 'Notat.');
      return render();
    }
    case 'set-hr':
      S.set.hrMax = Math.max(150, Math.min(220, S.set.hrMax + (Number(el.dataset.d) || 0)));
      save();
      return render();
    case 'intro-ok':
      try {
        localStorage.setItem('beast:intro', '1');
      } catch {
        /* ignore */
      }
      return render();
    case 'deload': {
      // Either answer closes this week's proposal; the next one comes in the 4th week of the next emphasis.
      const mon = weekStart(today);
      S.deload = el.dataset.k === '1' ? { last: mon, week: mon } : { last: mon, week: '' };
      save();
      return render();
    }
    case 'hab': {
      const h = S.habits.find((x) => !x.archived);
      if (!h) return;
      const goal = habitGoal(h, today);
      h.days[today] = Math.max(0, (h.days[today] ?? 0) + (Number(el.dataset.n) || 0));
      if ((h.days[today] ?? 0) >= goal && (h.days[today] ?? 0) - (Number(el.dataset.n) || 0) < goal) toast(`${h.name}: făcut azi.`);
      save();
      return render();
    }
    case 'hab-fill': {
      const h = S.habits.find((x) => !x.archived);
      if (!h) return;
      const goal = habitGoal(h, today);
      if ((h.days[today] ?? 0) < goal) toast(`${h.name}: făcut azi.`);
      h.days[today] = Math.max(h.days[today] ?? 0, goal);
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
    case 'test':
      return testSheet(el.dataset.k || '');
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
    case 'set-opening':
      try {
        localStorage.setItem('beast:opening', el.dataset.v || 'auto');
      } catch {
        /* storage blocked: the intro stays on */
      }
      return render();
    case 'set-motion': {
      const v = el.dataset.v === 'lite' ? 'lite' : 'full';
      try {
        localStorage.setItem('beast:motion', v);
      } catch {
        /* storage blocked: the choice lasts until the app closes */
      }
      if (v === 'lite') document.documentElement.dataset.motion = 'lite';
      else delete document.documentElement.dataset.motion;
      return render();
    }
    case 'set-leg':
      S.set.legMode = el.dataset.v === 'jump' ? 'jump' : 'wall';
      save();
      return render();
    case 'alt':
      if (el.dataset.b === 'thu-rope') S.set.thuFeet = el.dataset.v === 'ladder' ? 'ladder' : 'rope';
      else if (el.dataset.b === 'thu-shadow') S.set.thuPartner = el.dataset.v === 'spar' ? 'spar' : 'shadow';
      else if (el.dataset.b === 'sun-jog') S.set.sunAero = el.dataset.v === 'run' ? 'run' : 'row';
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
  if (a.startsWith('p:')) return ctx.player?.act(a, el);
  const S = ctx.S;
  if (a === 'set-bool') {
    const k = el.dataset.k as 'sound' | 'voice' | 'vibrate' | 'wake' | 'bellThroughMute';
    S.set[k] = (el as HTMLInputElement).checked;
    save();
    return;
  }
  if (a === 'import') return importData(el as HTMLInputElement);
  if (a === 'steps') {
    saveSteps(parseInt((el as HTMLInputElement).value, 10) || 0);
    return render();
  }
}

function onInput(el: HTMLElement): void {
  const a = el.dataset.a || '';
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
  if (a === 'ch:open') {
    toggleRace(el.dataset.k ?? '');
    return render();
  }
  if (a === 'ch:go') return startRace(el.dataset.k ?? '', Number(el.dataset.i));
  if (a === 'ch:resume') return resumeRace();
  if (a.startsWith('dc:')) return discAct(a, el, render);
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

// the push-up routine grows from 10, 3 more each week (asked on 2026-11-07): kept from the first day it is seen
if (growPushups(ctx.S.habits, dayKey())) save();

render();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  });
}
