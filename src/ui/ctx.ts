// Shared app context: state, navigation, toasts, bottom sheets and the active full-screen player.

import { loadState, saveState, type Entry, type State } from '../logic/store.ts';
import { esc } from '../logic/util.ts';
import { keepAwake, hush } from './audio.ts';

export type Tab = 'today' | 'plan' | 'fight' | 'alex' | 'mind' | 'progress';
export type View =
  | { t: 'day'; idx: number }
  | { t: 'chapter'; id: string }
  | { t: 'settings' }
  | { t: 'history' }
  | { t: 'book' }
  | null;

export interface Player {
  act(a: string, el: HTMLElement): void;
  input?(el: HTMLElement): void;
  /** Return false to block closing (e.g. ask first). */
  close?(): boolean;
  destroy(): void;
}

export const ctx = {
  S: loadState() as State,
  tab: 'today' as Tab,
  view: null as View,
  player: null as Player | null,
  render: (): void => {},
  /** Called after a player closes (any way), so navigation history can follow. */
  onPlayerClosed: (): void => {},
};

let saveFailed = false;
export function save(): void {
  const ok = saveState(ctx.S);
  if (!ok && !saveFailed) toast('Nu pot salva pe telefon. Verifică spațiul liber.');
  saveFailed = !ok;
}

/** Block completed a moment ago: its card plays the "done" stamp once. */
export const fresh = { block: '', until: 0 };

export function addEntry(e: Entry): void {
  if (e.block) {
    fresh.block = e.block;
    fresh.until = Date.now() + 4000;
  }
  ctx.S.log.push(e);
  ctx.S.log.sort((a, b) => a.ts - b.ts);
  save();
}

let toastTimer = 0;
export function toast(msg: string, ms = 2600): void {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('on'), ms);
}

// ---------- bottom sheet ----------
type SheetFn = (el: HTMLElement) => void;
let sheetActs: Record<string, SheetFn> = {};

export function openSheet(html: string, acts: Record<string, SheetFn> = {}): void {
  const host = document.getElementById('sheet');
  if (!host) return;
  sheetActs = acts;
  host.innerHTML = `<div class="sh-bg" data-a="sh:close"></div><div class="sh" role="dialog" aria-modal="true">${html}</div>`;
  const first = host.querySelector<HTMLElement>('input, textarea, button:not([data-a="sh:close"])');
  first?.focus({ preventScroll: true });
}

export function closeSheet(): void {
  const host = document.getElementById('sheet');
  if (host) host.innerHTML = '';
  sheetActs = {};
}

export function sheetAct(a: string, el: HTMLElement): boolean {
  const fn = sheetActs[a];
  if (fn) {
    fn(el);
    return true;
  }
  if (a === 'sh:close') {
    closeSheet();
    return true;
  }
  return false;
}

export function ask(title: string, text: string, yes: string, onYes: () => void, no = 'Renunță', danger = false, onNo?: () => void): void {
  const cancel = (): void => {
    closeSheet();
    onNo?.();
  };
  openSheet(
    `<h2>${esc(title)}</h2><p class="dim">${esc(text)}</p><div class="btn-row" style="margin-top:18px"><button class="btn ghost" data-a="sh:no">${esc(no)}</button><button class="btn ${danger ? 'danger' : ''}" data-a="sh:yes">${esc(yes)}</button></div>`,
    {
      'sh:yes': () => {
        closeSheet();
        onYes();
      },
      'sh:no': cancel,
      'sh:close': cancel,
    },
  );
}

// ---------- full-screen players ----------
export function mountPlayer(p: Player): void {
  const ov = document.getElementById('ov');
  if (ov && !ctx.player) {
    ov.classList.add('ov-in');
    window.setTimeout(() => ov.classList.remove('ov-in'), 500);
  }
  if (ctx.player) ctx.player.destroy();
  ctx.player = p;
  void keepAwake(true);
}

export function closePlayer(force = false): void {
  const p = ctx.player;
  if (!p) return;
  if (!force && p.close && !p.close()) return;
  p.destroy();
  ctx.player = null;
  hush();
  void keepAwake(false);
  const ov = document.getElementById('ov');
  if (ov) ov.innerHTML = '';
  ctx.render();
  ctx.onPlayerClosed();
}

export function ovEl(): HTMLElement {
  return document.getElementById('ov') as HTMLElement;
}
