// Settings: sound, voice, rest times, data backup and the sources.

declare const __BUILD__: string;
import { esc } from '../../logic/util.ts';
const AERO_WORD: Record<string, string> = { row: 'Pe vâslitor', assault: 'Pe assault bike', bike: 'Pe bicicletă' };
import { zone2 } from '../../logic/runlog.ts';
import { ctx } from '../ctx.ts';
import { ic } from '../icons.ts';
import { pageHead, top } from './shared.ts';

const sw = (k: string, on: boolean, label: string): string =>
  `<label class="switch"><input type="checkbox" data-a="set-bool" data-k="${k}" ${on ? 'checked' : ''} aria-label="${esc(label)}"><span></span></label>`;

const row = (label: string, hint: string, ctl: string): string =>
  `<div class="field"><div class="field-l">${esc(label)}${hint ? `<small>${esc(hint)}</small>` : ''}</div>${ctl}</div>`;

function openingMode(): string {
  try {
    return localStorage.getItem('beast:opening') || 'auto';
  } catch {
    return 'auto';
  }
}

/** Animations on this device: all of them, or reduced (no claw swipes, slams, embers or count-ups). */
export function motionMode(): 'full' | 'lite' {
  try {
    return localStorage.getItem('beast:motion') === 'lite' ? 'lite' : 'full';
  } catch {
    return 'full';
  }
}

export function settingsHtml(): string {
  const s = ctx.S.set;
  const op = openingMode();
  const mo = motionMode();
  const ae = s.aero;
  return `${top(true)}
    ${pageHead('Setări', 'Sunet, puls, memento-uri și datele tale.')}
    <h2 class="sec first">Sunet și ecran</h2>
    ${row('Sunete', 'Gong, bipuri, semnale', sw('sound', s.sound, 'Sunete'))}
    ${row('Voce', 'Indicațiile din timpul timerelor', sw('voice', s.voice, 'Voce'))}
    ${row('Vibrații', 'La schimbarea rundelor; pe iPhone browserul nu le permite', sw('vibrate', s.vibrate, 'Vibrații'))}
    ${row('Gongul trece de modul silențios', 'iPhone: sună și cu butonul de silențios pornit, dar poate opri muzica din alte aplicații', sw('bellThroughMute', s.bellThroughMute, 'Gongul trece de modul silențios'))}
    ${row('Ecranul rămâne aprins', 'Cât timp rulează un timer', sw('wake', s.wake, 'Ecran aprins'))}
    ${row('Animații', mo === 'lite' ? 'Reduse: fără dungi între ecrane și fără scântei' : 'Complete: dungi de viteză între ecrane, scântei la final', `<div class="chips">${[['full', 'Complete'], ['lite', 'Reduse']].map(([v, l]) => `<button class="chip" aria-pressed="${mo === v}" data-a="set-motion" data-v="${v}">${l}</button>`).join('')}</div>`)}
    ${row('Intro la pornire', 'Automat: complet la prima pornire și după o versiune nouă, altfel doar blazonul, o clipă', `<div class="chips">${[['auto', 'Automat'], ['full', 'Mereu'], ['short', 'Scurt'], ['off', 'Oprit']].map(([v, l]) => `<button class="chip" aria-pressed="${op === v}" data-a="set-opening" data-v="${v}">${l}</button>`).join('')}</div>`)}
    <h2 class="sec">Alergare<small>Tot ce ține de alergare poate trece pe aparat: aceleași minute, aceeași zonă, fără impact. Include și sesiunea de prag de marți.</small></h2>
    ${row('Pe ce alergi', ae === 'run' ? 'Pe picioare.' : `${AERO_WORD[ae]}${s.aeroUntil ? `, până pe ${s.aeroUntil}` : ', până îl schimbi'}.`, `<div class="chips">${([['run', 'Pe picioare'], ['row', 'Vâslitor'], ['assault', 'Assault'], ['bike', 'Bicicletă']] as const).map(([v, l]) => `<button class="chip" aria-pressed="${ae === v}" data-a="set-aero" data-v="${v}">${l}</button>`).join('')}</div>`)}
    ${ae === 'run' ? '' : row('Cât timp', s.aeroUntil ? `Se întoarce pe picioare după ${s.aeroUntil}.` : 'Fără termen: rămâne pe aparat până schimbi tu.', `<div class="chips">${[['28', 'O lună'], ['56', 'Două luni'], ['', 'Fără termen']].map(([v, l]) => `<button class="chip" aria-pressed="${(v === '') === (s.aeroUntil === '')}" data-a="set-aero-until" data-v="${v}">${l}</button>`).join('')}</div>`)}
    <h2 class="sec">Puls<small>Pentru alergările în zona 2, pragul de marți și intervalele de miercuri, cu centura de puls.</small></h2>
    ${row('Pulsul maxim', `Zona 2, ușor: ${zone2(s.hrMax)[0]}–${zone2(s.hrMax)[1]} bpm. Estimat pentru 23 de ani (208 − 0,7 × vârsta); dacă centura ți-a arătat un maxim mai mare, pune-l pe acela.`, `<div class="stepper" role="group" aria-label="Pulsul maxim"><button data-a="set-hr" data-d="-1" aria-label="Scade">−</button><output>${s.hrMax}</output><button data-a="set-hr" data-d="1" aria-label="Crește">+</button></div>`)}
    <h2 class="sec">Memento-uri în calendar<small>O aplicație web nu poate trimite notificări programate, mai ales pe iPhone. Pune următoarele 4 săptămâni din plan și zilele pozelor de progres în calendarul telefonului, cu alarmă.</small></h2>
    <div class="ics">
      <label class="nfld"><span>Ora antrenamentului</span><input id="icsT" type="time" value="18:00"></label>
      <label class="nfld"><span>Alarmă înainte</span><select id="icsA">${[[0, 'Fără'], [15, '15 min'], [30, '30 min'], [60, '1 oră'], [120, '2 ore']].map(([v, l]) => `<option value="${v}" ${v === 30 ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
    </div>
    <button class="btn" data-a="ics">${ic('download')}Adaugă în calendar (.ics)</button>
    <p class="small dim" style="margin-top:8px">Pe iPhone deschide fișierul și apasă „Adaugă tot”. Dacă îl exporți din nou, evenimentele se actualizează, nu se dublează.</p>
    <h2 class="sec">Datele tale<small>Stau doar pe telefonul ăsta. Fă-ți din când în când o copie.</small></h2>
    <div style="display:grid;gap:10px">
      <button class="btn ghost sm" style="width:100%" data-a="export">${ic('download')}Descarcă o copie</button>
      <label class="btn ghost sm" style="width:100%;cursor:pointer">${ic('upload')}Încarcă o copie<input type="file" accept="application/json,.json" data-a="import" hidden></label>
      <button class="btn danger sm" style="width:100%" data-a="reset">Șterge tot</button>
    </div>
    <h2 class="sec">Surse</h2>
    <ul class="ticks small">
      <li>Programul: Hybrid365 (@hybrid.365), split-ul run-focused: 3 alergări, 3 zile de upper, 1 de lower, 1 condiționare. Capitolele din Minte: e-book-ul „Unleash Your Inner Beast” de Alex.</li>
      <li>Planul săptămânal e cel din postările Hybrid365 (sesiuni, serii, repetări, pauze, progresii), potrivit pe tine doar unde ai cerut: Hack Squat în loc de Back Squat, alergările ușoare pot merge pe vâslitor. Greutatea pentru seria următoare se calculează din repetările făcute la seria de dinainte.</li>
      <li>Combinațiile, rutina de spate, mobilitatea și sfaturile: canalul lui Alex Hanma, <a href="https://www.tiktok.com/@alexhanma___" target="_blank" rel="noopener">TikTok @alexhanma___</a> și <a href="https://www.instagram.com/alexhanma_/" target="_blank" rel="noopener">Instagram @alexhanma_</a>.</li>
      <li>Meditația: metoda de respirație Wim Hof. Respirația 4-7-8: metoda din carte.</li>
    </ul>
    <h2 class="sec">Versiunea<small>Aplicația se actualizează singură când o deschizi cu internet. Dacă vezi totuși ceva vechi, apasă butonul: datele tale rămân.</small></h2>
    <button class="btn ghost sm" style="width:100%" data-a="force-update">${ic('refresh')}Actualizează acum</button>
    <p class="small dim" style="text-align:center;margin-top:28px">ZENITH 5.0 · versiunea ${__BUILD__}</p>`;
}
