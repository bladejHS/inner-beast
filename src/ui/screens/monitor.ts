// "Monitor": live pulse from a Bluetooth strap, HRV, Effort for the session and the morning Charge.
// Uses the standard Heart Rate service through Web Bluetooth; WHOOP straps expose it too.
/// <reference types="web-bluetooth" />

import { charge, effort, hrMax, parseHrm, rmssd, zone } from '../../logic/monitor.ts';
import { dayKey, esc, mmss, shortDay } from '../../logic/util.ts';
import { spark } from '../charts.ts';
import { ctx, save, toast } from '../ctx.ts';
import { top } from './shared.ts';

const live = {
  dev: null as BluetoothDevice | null,
  name: '',
  hr: 0,
  bat: undefined as number | undefined,
  rr: [] as number[],
  start: 0,
  trimp: 0,
  peak: 0,
  last: 0,
  /** Morning check running: resting beats collected until this time. */
  morningEnd: 0,
  hrs: [] as number[],
};
let paint: () => void = () => {};

const restHr = (): number => {
  const v = Object.values(ctx.S.mon.days).map((d) => d.rhr);
  return v.length ? Math.round(v.reduce((s, x) => s + x, 0) / v.length) : 60;
};
const age = (): number => ctx.S.mon.age;

function onBeat(e: Event): void {
  const c = e.target as BluetoothRemoteGATTCharacteristic;
  if (!c.value) return;
  const { hr, rr } = parseHrm(c.value);
  const now = Date.now();
  live.hr = hr;
  live.rr.push(...rr);
  if (live.rr.length > 600) live.rr.splice(0, live.rr.length - 600);
  if (hr) live.hrs.push(hr);
  if (live.hrs.length > 600) live.hrs.shift();
  if (live.start) {
    live.trimp += (zone(hr, restHr(), hrMax(age())) * Math.min(now - live.last, 5000)) / 60000;
    live.peak = Math.max(live.peak, hr);
  }
  live.last = now;
  if (live.morningEnd && now >= live.morningEnd) finishMorning();
  paint();
}

function finishMorning(): void {
  live.morningEnd = 0;
  const v = rmssd(live.rr);
  if (v === null) return toast('Prea puține bătăi curate. Stai nemișcat și reia.');
  const sorted = [...live.hrs].sort((a, b) => a - b);
  ctx.S.mon.days[dayKey()] = { rmssd: Math.round(v * 10) / 10, rhr: sorted[Math.floor(sorted.length / 4)] };
  save();
  ctx.render();
}

async function connect(): Promise<void> {
  if (!navigator.bluetooth) return toast('Browserul nu are Bluetooth. Folosește Chrome pe Android sau pe calculator.');
  try {
    const dev = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['heart_rate'] }, { namePrefix: 'WHOOP' }],
      optionalServices: ['heart_rate', 'battery_service'],
    });
    const gatt = await dev.gatt?.connect();
    if (!gatt) return;
    const hrc = await (await gatt.getPrimaryService('heart_rate')).getCharacteristic('heart_rate_measurement');
    hrc.addEventListener('characteristicvaluechanged', onBeat);
    await hrc.startNotifications();
    try {
      const b = await (await gatt.getPrimaryService('battery_service')).getCharacteristic('battery_level');
      live.bat = (await b.readValue()).getUint8(0);
    } catch {
      live.bat = undefined;
    }
    dev.addEventListener('gattserverdisconnected', () => {
      live.dev = null;
      live.hr = 0;
      toast('Senzor deconectat.');
      ctx.render();
    });
    live.dev = dev;
    live.name = dev.name ?? 'Senzor';
    live.last = Date.now();
    ctx.render();
  } catch (e) {
    if ((e as Error).name !== 'NotFoundError') toast('Nu m-am putut conecta. Pe WHOOP pornește Heart Rate Broadcast.');
  }
}

function liveValues(): { el: string; v: string }[] {
  const z = live.hr ? zone(live.hr, restHr(), hrMax(age())) : 0;
  const v = rmssd(live.rr.slice(-120));
  return [
    { el: 'mo-hr', v: live.hr ? String(live.hr) : '–' },
    { el: 'mo-z', v: String(z) },
    { el: 'mo-hrv', v: v === null ? '–' : v.toFixed(0) },
    { el: 'mo-ef', v: String(effort(live.trimp)) },
    { el: 'mo-t', v: live.start ? mmss(Math.floor((Date.now() - live.start) / 1000)) : '0:00' },
  ];
}

paint = () => {
  for (const x of liveValues()) {
    const n = document.getElementById(x.el);
    if (n) n.textContent = x.v;
  }
};

export function monitorHtml(): string {
  const M = ctx.S.mon;
  const today = dayKey();
  const days = Object.keys(M.days).sort();
  const t = M.days[today];
  const past = days.filter((d) => d < today).slice(-30).map((d) => M.days[d]);
  const ch = t ? charge(t, past, ctx.S.sleep[today]) : null;
  const vals = liveValues();
  const val = (id: string): string => vals.find((v) => v.el === id)?.v ?? '';
  return `${top()}<h1 class="stack mid">Monitor</h1>
    <section class="card"><div class="row"><h3 style="margin:0">Încărcare</h3></div>
      <div class="stats"><div class="stat"><b>${ch ?? '–'}</b><span>${t ? (ch === null ? `calibrare, ${past.length} din 4 dimineți` : 'Charge, din 100') : 'fă testul de dimineață'}</span></div>
      <div class="stat"><b>${t ? t.rmssd : '–'}</b><span>HRV (RMSSD, ms)</span></div>
      <div class="stat"><b>${t ? t.rhr : '–'}</b><span>puls în repaus</span></div></div>
      ${days.length > 1 ? `<div class="row"><span class="small">HRV</span>${spark(days.slice(-30).map((d) => M.days[d].rmssd))}</div>` : ''}
    </section>
    <section class="card">
      <div class="row"><h3 style="margin:0">Live</h3><span class="ntag">${live.dev ? `${esc(live.name)}${live.bat !== undefined ? `, ${live.bat}%` : ''}` : 'neconectat'}</span></div>
      <div class="stats" style="margin:12px 0">
        <div class="stat"><b id="mo-hr">${val('mo-hr')}</b><span>bpm</span></div><div class="stat"><b id="mo-z">${val('mo-z')}</b><span>zonă 0–5</span></div>
        <div class="stat"><b id="mo-hrv">${val('mo-hrv')}</b><span>HRV acum</span></div><div class="stat"><b id="mo-ef">${val('mo-ef')}</b><span>Effort</span></div>
      </div>
      ${live.dev
        ? `<div class="btn-row"><button class="btn ghost" data-a="mo:morning" ${live.morningEnd ? 'disabled' : ''}>Test de dimineață (3 min)</button><button class="btn" data-a="mo:session">${live.start ? 'Oprește' : 'Pornește'} sesiunea <span id="mo-t">${val('mo-t')}</span></button></div>`
        : '<button class="btn" data-a="mo:connect">Conectează senzorul</button><p class="small dim" style="margin-top:8px">Merge cu orice centură sau brățară Bluetooth cu serviciul standard de puls. Pe WHOOP activează Heart Rate Broadcast. Pe iPhone, Safari nu are Web Bluetooth.</p>'}
    </section>
    <section class="card"><div class="field"><div class="field-l">Vârsta ta<small>Pentru pulsul maxim și zone</small></div><input type="number" data-a="mo:age" value="${M.age}" style="width:100px"></div></section>
    ${M.log.length ? `<section class="card"><h3>Sesiuni</h3><ul class="hist">${[...M.log].reverse().slice(0, 12).map((s) => `<li><div><b>Effort ${s.eff}</b><span>${shortDay(s.date)}, ${mmss(s.dur)}, puls maxim ${s.peak}</span></div></li>`).join('')}</ul></section>` : ''}
    <p class="small dim">Valori aproximative, nu măsurători medicale. Nu le folosi pentru diagnostic sau tratament.</p>`;
}

export function moInput(a: string, el: HTMLElement): void {
  const n = Number((el as HTMLInputElement).value);
  if (a === 'mo:age' && n >= 10 && n <= 100) {
    ctx.S.mon.age = n;
    save();
  }
}

export function moAct(a: string, render: () => void): void {
  if (a === 'mo:connect') {
    void connect();
  } else if (a === 'mo:morning') {
    live.rr = [];
    live.hrs = [];
    live.morningEnd = Date.now() + 180000;
    toast('Stai întins și nemișcat 3 minute.');
    render();
  } else if (a === 'mo:session') {
    if (live.start) {
      ctx.S.mon.log.push({ date: dayKey(), dur: Math.floor((Date.now() - live.start) / 1000), eff: effort(live.trimp), peak: live.peak });
      live.start = 0;
      save();
    } else {
      live.start = live.last = Date.now();
      live.trimp = 0;
      live.peak = 0;
    }
    render();
  }
}
