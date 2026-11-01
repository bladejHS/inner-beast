// The numbers of a run as typed in from a watch or a treadmill, and what they say about the next one.

import type { Entry } from './store.ts';
import { paceStr } from './util.ts';

export interface RunInput {
  dur: string;
  km: string;
  hrAvg: string;
  kcal: string;
  hrMax: string;
  paceAvg: string;
  paceMax: string;
}

export interface RunStats {
  dur: number;
  m: number;
  pace: number;
  paceMax: number;
  hrAvg: number;
  hrMax: number;
  kcal: number;
}

/** "25" is minutes, "25:30" or "25,30" min:sec, "1:05:30" h:mm:ss. Empty is 0, unreadable is NaN. */
export function parseTime(s: string): number {
  const t = s.trim();
  if (!t) return 0;
  const m = /^(\d+)(?:[:.,](\d{2}))?(?:[:.,](\d{2}))?$/.exec(t);
  if (!m || Number(m[2] ?? 0) > 59 || Number(m[3] ?? 0) > 59) return NaN;
  const [a, b, c] = [Number(m[1]), Number(m[2] ?? 0), Number(m[3] ?? 0)];
  return m[3] === undefined ? a * 60 + b : a * 3600 + b * 60 + c;
}

/** Empty is 0, anything that isn't a whole number in range is NaN. */
function whole(s: string, lo: number, hi: number): number {
  const t = s.trim();
  if (!t) return 0;
  const n = Number(t);
  return Number.isInteger(n) && n >= lo && n <= hi ? n : NaN;
}

/** Checks what was typed; a string result is the message for the user. Only the duration is required. */
export function readRun(v: RunInput): RunStats | string {
  const dur = parseTime(v.dur);
  if (!(dur > 0)) return 'Scrie durata, de exemplu 25:30.';
  const dist = v.km.trim() ? Number(v.km.trim().replace(',', '.')) : 0;
  if (!(dist >= 0 && dist <= 500)) return 'Scrie distanța în km, de exemplu 3,2.';
  const m = Math.round(dist * 1000);
  const typed = parseTime(v.paceAvg);
  const paceMax = parseTime(v.paceMax);
  if (isNaN(typed) || isNaN(paceMax)) return 'Scrie ritmul ca min:sec, de exemplu 5:30.';
  const pace = typed || (m > 50 ? Math.round((dur / m) * 1000) : 0);
  if (pace && paceMax > pace) return 'Pace Max e ritmul cel mai rapid, deci nu poate fi mai lent decât Pace Avg.';
  const hrAvg = whole(v.hrAvg, 30, 250);
  const hrMax = whole(v.hrMax, 30, 250);
  if (isNaN(hrAvg) || isNaN(hrMax)) return 'Pulsul e un număr între 30 și 250.';
  if (hrMax && hrAvg > hrMax) return 'HR Avg nu poate fi mai mare decât HR Max.';
  const kcal = whole(v.kcal, 0, 20000);
  if (isNaN(kcal)) return 'Caloriile sunt un număr întreg.';
  return { dur, m, pace, paceMax, hrAvg, hrMax, kcal };
}

/** Compares the last runs with a pulse, and sets a pace for the next one: 5 s faster than the best of the last four. */
export function runAdvice(log: Entry[]): string {
  const runs = log.filter((e) => e.kind === 'run' && Number(e.data.pace) > 0);
  if (!runs.length) return '';
  const pace = (e: Entry): number => Number(e.data.pace);
  const hr = (e: Entry): number => Number(e.data.hrAvg) || 0;
  const target = paceStr(Math.min(...runs.slice(-4).map(pace)) - 5);
  const beat = runs.filter((e) => hr(e) > 0).slice(-2);
  if (beat.length < 2) return `Ținta de azi: ${target} /km. Notează HR Avg ca să vezi dacă același ritm te costă mai puțin.`;
  const dp = pace(beat[1]) - pace(beat[0]);
  const dh = hr(beat[1]) - hr(beat[0]);
  if (Math.abs(dp) <= 10 && dh >= 5) return `Puls cu ${dh} bpm mai mare la același ritm. Poate fi oboseală: azi rămâi la ${paceStr(pace(beat[1]))} /km și urmărește pulsul.`;
  const note = Math.abs(dp) <= 10 && dh <= -3 ? `Același ritm cu ${-dh} bpm mai puțin: rezistența crește. ` : dp <= -10 && dh <= 3 ? `Mai rapid cu ${-dp} s/km la același puls: formă mai bună. ` : '';
  return `${note}Ținta de azi: ${target} /km sau același ritm cu puls mai mic.`;
}
