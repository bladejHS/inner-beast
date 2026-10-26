// Settings: sound, voice, rest times, data backup and the sources.

import { esc } from '../../logic/util.ts';
import { ctx } from '../ctx.ts';
import { art } from '../art.ts';
import { ic } from '../icons.ts';
import { isDark, top } from './shared.ts';

const sw = (k: string, on: boolean, label: string): string =>
  `<label class="switch"><input type="checkbox" data-a="set-bool" data-k="${k}" ${on ? 'checked' : ''} aria-label="${esc(label)}"><span></span></label>`;

const step = (k: string, value: string, label: string): string =>
  `<div class="stepper" role="group" aria-label="${esc(label)}"><button data-a="set-step" data-k="${k}" data-d="-1" aria-label="Scade">−</button><output>${esc(value)}</output><button data-a="set-step" data-k="${k}" data-d="1" aria-label="Crește">+</button></div>`;

const row = (label: string, hint: string, ctl: string): string =>
  `<div class="field"><div class="field-l">${esc(label)}${hint ? `<small>${esc(hint)}</small>` : ''}</div>${ctl}</div>`;

export function settingsHtml(): string {
  const s = ctx.S.set;
  const mm = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  return `${top(true)}
    <h1 class="stack mid">Setări</h1>
    <h2 class="sec">Aspect</h2>
    ${row('Mod întunecat', 'Tuș alb pe negru. Îl comuți și din luna/soarele de sus.', `<label class="switch"><input type="checkbox" data-a="set-theme" ${isDark() ? 'checked' : ''} aria-label="Mod întunecat"><span></span></label>`)}
    <h2 class="sec">Sunet și ecran</h2>
    ${row('Sunete', 'Gong, bipuri, semnale', sw('sound', s.sound, 'Sunete'))}
    ${row('Voce', 'Combinațiile strigate în engleză, indicațiile în română', sw('voice', s.voice, 'Voce'))}
    ${row('Vibrații', 'La schimbarea rundelor', sw('vibrate', s.vibrate, 'Vibrații'))}
    ${row('Ecranul rămâne aprins', 'Cât timp rulează un timer', sw('wake', s.wake, 'Ecran aprins'))}
    <h2 class="sec">Runde</h2>
    ${row('Combinații strigate', 'În rundele de shadow boxing, sac și coardă', `<div class="chips">${[0, 10, 15, 20, 30].map((v) => `<button class="chip" aria-pressed="${s.callEvery === v}" data-a="set-call" data-v="${v}">${v ? `${v} s` : 'Oprit'}</button>`).join('')}</div>`)}
    ${row('Pauză la rundele de 3 minute', 'Cartea nu o precizează; standardul în box e 1 minut', step('rest3', mm(s.rest3), 'Pauză 3 minute'))}
    ${row('Pauză la intervalele de 1 minut', 'Wall Sit / Jumping Squats', step('rest1', mm(s.rest1), 'Pauză 1 minut'))}
    ${row('Duminică', 'Treci la Jumping Squats când ești pregătit', `<div class="chips"><button class="chip" aria-pressed="${s.legMode === 'wall'}" data-a="set-leg" data-v="wall">Wall Sit</button><button class="chip" aria-pressed="${s.legMode === 'jump'}" data-a="set-leg" data-v="jump">Jumping Squats</button></div>`)}
    <h2 class="sec">Datele tale<small>Stau doar pe telefonul ăsta. Fă-ți din când în când o copie.</small></h2>
    <div style="display:grid;gap:10px">
      <button class="btn ghost sm" style="width:100%" data-a="export">${ic('download')}Descarcă o copie</button>
      <label class="btn ghost sm" style="width:100%;cursor:pointer">${ic('upload')}Încarcă o copie<input type="file" accept="application/json,.json" data-a="import" hidden></label>
      <button class="btn danger sm" style="width:100%" data-a="reset">Șterge tot</button>
    </div>
    <h2 class="sec">Surse</h2>
    <ul class="ticks small">
      <li>Programul, planul săptămânal și capitolele: e-book-ul „Unleash Your Inner Beast” de Alex. Nutriția nu e inclusă.</li>
      <li>Combinațiile, rutina de spate, mobilitatea și sfaturile: canalul lui Alex Hanma, <a href="https://www.tiktok.com/@alexhanma___" target="_blank" rel="noopener">TikTok @alexhanma___</a> și <a href="https://www.instagram.com/alexhanma_/" target="_blank" rel="noopener">Instagram @alexhanma_</a>.</li>
      <li>Meditația: metoda de respirație Wim Hof. Respirația 4-7-8: metoda din carte.</li>
    </ul>
    <div class="sign">${art('norisk')}</div>
    <p class="small dim" style="text-align:center">Inner Beast 2.0</p>`;
}
