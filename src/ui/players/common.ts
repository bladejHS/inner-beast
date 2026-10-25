// Shared markup for the full-screen players.

import { esc } from '../../logic/util.ts';
import { ic } from '../icons.ts';
import { ctx } from '../ctx.ts';

export function chrome(title: string, body: string, o: { cls?: string; ctrl?: string; center?: boolean } = {}): string {
  const snd = ctx.S.set.sound;
  return `<div class="pl ${o.cls ?? ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
  <div class="pl-bar">
    <button class="icon-btn" data-a="p:close" aria-label="Închide">${ic('close')}</button>
    <div class="pl-title">${esc(title)}</div>
    <button class="icon-btn" data-a="p:sound" aria-label="${snd ? 'Oprește sunetul' : 'Pornește sunetul'}">${ic(snd ? 'sound' : 'mute')}</button>
  </div>
  <div class="pl-body${o.center ? ' center' : ''}"><div class="pl-wrap">${body}</div></div>
  ${o.ctrl ? `<div class="pl-ctrl">${o.ctrl}</div>` : ''}
</div>`;
}

export function stepper(act: string, value: string, label: string): string {
  return `<div class="stepper" role="group" aria-label="${esc(label)}"><button data-a="${act}" data-d="-1" aria-label="Scade">−</button><output>${esc(value)}</output><button data-a="${act}" data-d="1" aria-label="Crește">+</button></div>`;
}

export function field(label: string, control: string, hint = ''): string {
  return `<div class="field"><div class="field-l">${esc(label)}${hint ? `<small>${esc(hint)}</small>` : ''}</div>${control}</div>`;
}

export function ctrlBtn(act: string, icon: string, label: string, main = false): string {
  return `<button class="${main ? 'main' : ''}" data-a="${act}" aria-label="${esc(label)}">${ic(icon)}</button>`;
}

export function switchCtl(act: string, on: boolean, label: string): string {
  return `<label class="switch"><input type="checkbox" data-a="${act}" ${on ? 'checked' : ''} aria-label="${esc(label)}"><span></span></label>`;
}

/** Throttled DOM text update by id. */
export function setText(id: string, txt: string): void {
  const el = document.getElementById(id);
  if (el && el.textContent !== txt) el.textContent = txt;
}
