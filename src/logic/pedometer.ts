// Step counting from the phone's accelerometer, for the walk tracker while the app is open.
// Each step is one bounce of the body: the size of the acceleration (gravity included, so the phone's position in the
// hand or pocket doesn't matter) rises and falls once. The signal is smoothed (3 Hz), its slow part removed (posture,
// gravity), and a step is a positive swing above an adaptive threshold. Two guards keep shaking out:
//  - steps are 0.25–2 s apart (4 to 0.5 steps a second);
//  - counting starts only after 4 regular steps in a row, which are then credited together, the way the phones'
//    own pedometers ignore a phone picked up or put down.
// The most precise number of the day is still the phone's own count (Apple Health): see parseSteps.

const MIN_GAP = 0.25;
const MAX_GAP = 2;
const START_RUN = 4;
const MIN_THR = 0.6;

export class Pedometer {
  steps = 0;
  private fast = NaN;
  private slow = NaN;
  private lastT = NaN;
  private high = false;
  private peak = 0;
  private peakT = 0;
  private thr = MIN_THR;
  private amp = 0;
  private prevStep = NaN;
  private prevGap = NaN;
  private run = 0;
  private walking = false;

  /** One accelerometer reading (m/s², gravity included) at `t` ms. True when it completes a counted step. */
  push(ax: number, ay: number, az: number, t: number): boolean {
    const a = Math.hypot(ax, ay, az);
    if (!Number.isFinite(a)) return false;
    if (Number.isNaN(this.lastT)) {
      this.fast = this.slow = a;
      this.lastT = t;
      return false;
    }
    const dt = Math.min(0.2, Math.max(0.001, (t - this.lastT) / 1000));
    this.lastT = t;
    this.fast += lp(dt, 3) * (a - this.fast);
    this.slow += lp(dt, 0.4) * (a - this.slow);
    const s = this.fast - this.slow;
    if (!this.high) {
      if (s > this.thr) {
        this.high = true;
        this.peak = s;
        this.peakT = t;
      }
      return false;
    }
    if (s > this.peak) {
      this.peak = s;
      this.peakT = t;
    }
    if (s > 0) return false;
    // the swing is over: one step candidate, at its peak
    this.high = false;
    // a swing well under the usual step is the second bump of the same step (push-off after heel strike): skipped
    if (this.amp && this.peak < this.amp * 0.55) return false;
    this.amp = this.amp ? this.amp * 0.8 + this.peak * 0.2 : this.peak;
    this.thr = Math.max(MIN_THR, this.amp * 0.4);
    return this.candidate(this.peakT / 1000);
  }

  private candidate(t: number): boolean {
    const gap = t - this.prevStep;
    if (gap < MIN_GAP) return false; // a second bump inside the same step
    this.prevStep = t;
    const regular = gap <= MAX_GAP && (Number.isNaN(this.prevGap) || (gap / this.prevGap > 0.6 && gap / this.prevGap < 1.67));
    this.prevGap = gap <= MAX_GAP ? gap : NaN;
    if (!regular || Number.isNaN(gap)) {
      this.walking = false;
      this.run = 1;
      return false;
    }
    if (this.walking) {
      this.steps++;
      return true;
    }
    this.run++;
    if (this.run >= START_RUN) {
      this.walking = true;
      this.steps += this.run;
      return true;
    }
    return false;
  }
}

/** Smoothing factor of a first-order low-pass at `hz` for a step of `dt` seconds. */
function lp(dt: number, hz: number): number {
  const rc = 1 / (2 * Math.PI * hz);
  return dt / (rc + dt);
}

/** Walking stride from height: about 0.415 × height (0.83 m at 2 m). For the GPS estimate when the sensor is off. */
export const strideM = (heightCm: number): number => (heightCm > 100 && heightCm < 250 ? heightCm * 0.00415 : 0.75);

/**
 * The step count a Shortcut copied from Apple Health: "8423", "8.423", "8,423", "8 423" or "8423.6".
 * Null when the text holds no plausible day of steps.
 */
export function parseSteps(text: string): number | null {
  const t = text.trim().replace(/[\s  ]/g, '');
  const m = t.match(/\d[\d.,]*/);
  if (!m) return null;
  const raw = m[0].replace(/[.,]$/, '');
  const n = /^\d{1,3}([.,]\d{3})+$/.test(raw) ? Number(raw.replace(/[.,]/g, '')) : Math.round(Number(raw.replace(',', '.')));
  return Number.isFinite(n) && n >= 0 && n <= 150000 ? n : null;
}
