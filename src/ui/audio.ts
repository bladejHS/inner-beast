// Bells, beeps, voice and vibration, synthesized on the fly (no audio files). Plus the screen wake lock.

import type { Settings } from '../logic/store.ts';

let ac: AudioContext | null = null;
let getSet: () => Settings = () => ({ sound: true, voice: true, vibrate: true, wake: true }) as Settings;

export function initAudio(get: () => Settings): void {
  getSet = get;
}

/** Must run inside a tap handler: browsers only allow audio after a user gesture. */
export function unlock(): void {
  try {
    if (!ac) ac = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ac.state === 'suspended') void ac.resume();
  } catch {
    ac = null;
  }
  try {
    speechSynthesis.getVoices();
    // iOS only lets a page speak after it has spoken once inside a tap
    if (getSet().voice && !speechUnlocked) {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      speechSynthesis.speak(u);
      speechUnlocked = true;
    }
  } catch {
    /* no speech */
  }
}
let speechUnlocked = false;

function tone(freq: number, at: number, dur: number, type: OscillatorType = 'sine', gain = 0.25): void {
  if (!ac) return;
  const t = ac.currentTime + at;
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ac.destination);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function bellHit(at: number): void {
  const f0 = 880;
  [[1, 0.32], [2.76, 0.16], [5.4, 0.09], [8.93, 0.05]].forEach(([r, g]) => tone(f0 * r, at, 1.6 / Math.sqrt(r), 'sine', g));
}

const on = (): boolean => getSet().sound && !!ac;

export const sfx = {
  /** Boxing bell: 1 hit to start a round, 3 to end it. */
  bell(times = 1): void {
    if (!on()) return;
    for (let i = 0; i < times; i++) bellHit(i * 0.28);
  },
  /** Last-10-seconds clapper. */
  warn(): void {
    if (!on()) return;
    tone(1350, 0, 0.05, 'square', 0.12);
    tone(1350, 0.14, 0.05, 'square', 0.12);
  },
  /** 3-2-1 countdown tick. */
  tick(): void {
    if (!on()) return;
    tone(740, 0, 0.12, 'triangle', 0.22);
  },
  go(): void {
    if (!on()) return;
    tone(1180, 0, 0.45, 'triangle', 0.26);
  },
  beep(): void {
    if (!on()) return;
    tone(980, 0, 0.16, 'sine', 0.22);
  },
  /** Soft rising (inhale) or falling (exhale) cue for breathing. */
  breath(up: boolean): void {
    if (!on() || !ac) return;
    const t = ac.currentTime;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(up ? 330 : 440, t);
    o.frequency.exponentialRampToValueAtTime(up ? 440 : 330, t + 0.6);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.08);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    o.connect(g).connect(ac.destination);
    o.start(t);
    o.stop(t + 0.75);
  },
  chime(): void {
    if (!on()) return;
    [523.25, 659.25, 783.99].forEach((f, i) => tone(f, i * 0.16, 1.4, 'sine', 0.14));
  },
};

function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  try {
    const vs = speechSynthesis.getVoices();
    return vs.find((v) => v.lang.toLowerCase().startsWith(lang)) ?? undefined;
  } catch {
    return undefined;
  }
}

/** Speaks a line. Romanian lines are skipped when the phone has no Romanian voice. */
export function say(text: string, lang: 'en' | 'ro' = 'en'): void {
  if (!getSet().voice || !('speechSynthesis' in window)) return;
  const v = pickVoice(lang);
  if (lang === 'ro' && !v) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'en' ? 'en-US' : 'ro-RO';
    if (v) u.voice = v;
    u.rate = lang === 'en' ? 1.05 : 1;
    speechSynthesis.speak(u);
  } catch {
    /* ignore */
  }
}

export function hush(): void {
  try {
    speechSynthesis.cancel();
  } catch {
    /* ignore */
  }
}

export function buzz(pattern: number | number[]): void {
  if (!getSet().vibrate) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* ignore */
  }
}

let lock: { release: () => Promise<void> } | null = null;
let wantLock = false;

export async function keepAwake(onOff: boolean): Promise<void> {
  wantLock = onOff && getSet().wake;
  try {
    if (wantLock && !lock && 'wakeLock' in navigator) {
      lock = await (navigator as unknown as { wakeLock: { request: (t: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock.request('screen');
      (lock as unknown as EventTarget).addEventListener?.('release', () => (lock = null));
    } else if (!wantLock && lock) {
      await lock.release();
      lock = null;
    }
  } catch {
    lock = null;
  }
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && wantLock && !lock) void keepAwake(true);
});
