// "Breathwork Lab": four breathing modes for control, focus and recovery.

import { LAB } from '../../logic/breathlab.ts';
import { esc } from '../../logic/util.ts';
import { ctx } from '../ctx.ts';
import { ic } from '../icons.ts';
import { top } from './shared.ts';

export function labHtml(): string {
  const done = ctx.S.log.filter((e) => e.kind === 'breath' && e.data.lab);
  const min = Math.round(done.reduce((s, e) => s + e.dur, 0) / 60);
  return `${top()}
    <header class="lab-head">
      <img class="lab-hero" src="${import.meta.env.BASE_URL}lab/hero.webp" width="1280" height="720" alt="" decoding="async">
      <h1 class="sr">Breathwork Lab</h1>
      <p class="sr">Control your breath. Control your response.</p>
      <div class="lab-sum"><span><b class="num">${done.length}</b> sesiuni</span><span><b class="num">${min}</b> min</span></div>
    </header>
    <div class="lab-modes">${LAB.map((m) => {
      const n = done.filter((e) => e.data.lab === m.id).length;
      return `<button class="lab-mode" data-mode="${m.id}" data-a="lab" data-k="${m.id}">
        <span class="lab-code">${m.code}</span>
        <span class="lab-mt"><b>${esc(m.name)}</b><span>${esc(m.when)}</span><em>${esc(m.pattern)} · ${m.rec} min${n ? ` · ${n}×` : ''}</em></span>${ic('chev')}</button>`;
    }).join('')}</div>`;
}
