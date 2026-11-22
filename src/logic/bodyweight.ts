/* Body weight, for the one decision in ZENITH that depends on it (2026-11-23).

   The user: "până scad din kg ca să ajung la o greutate care să îmi permită alergatul. Kg alea să fie 125." So the
   machines are not a month-long thing with a date on it — they last until the scale says the running may start, and
   the app has to know the weight to decide.

   ZENITH never asked for a weight and has no scale screen; NUTRIX does, and both apps are served from the same
   origin, so the weight is read from there when it is available and typed by hand otherwise. One number, two ways
   in, and a seven-day average rather than one morning: a single weigh-in can swing a kilogram of water, and nobody
   wants the plan to flip between running and the bike on that. */

/** NUTRIX's saved state, on the same origin. */
const NUTRIX_KEY = 'beast-nutrition:v2';

/** The mean of the weights of the last `days` days that have one; null when there is none. */
export function meanKg(weights: Record<string, number>, today: string, days = 7): number | null {
  const from = new Date(Date.parse(`${today}T12:00:00Z`) - (days - 1) * 864e5).toISOString().slice(0, 10);
  const vals = Object.entries(weights)
    .filter(([d, kg]) => d >= from && d <= today && kg > 0)
    .map(([, kg]) => kg);
  if (!vals.length) {
    // nothing this week: fall back to the most recent one there is, however old
    const all = Object.entries(weights).filter(([, kg]) => kg > 0).sort(([a], [b]) => a.localeCompare(b));
    return all.length ? all.at(-1)![1] : null;
  }
  return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
}

/** The weight NUTRIX knows about, when it is on this device and this origin. */
export function nutrixKg(today: string): number | null {
  try {
    const raw = localStorage.getItem(NUTRIX_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as { weights?: Record<string, number> };
    return s.weights ? meanKg(s.weights, today) : null;
  } catch {
    return null;
  }
}

/** What the body weighs now: this app's own notes first, then NUTRIX. */
export function currentKg(weights: Record<string, number>, today: string): { kg: number; from: 'zenith' | 'nutrix' } | null {
  const own = meanKg(weights, today);
  if (own != null) return { kg: own, from: 'zenith' };
  const other = nutrixKg(today);
  return other != null ? { kg: other, from: 'nutrix' } : null;
}

/** True while the body is still above the weight at which running may start. `kg` null = not known, so stay on the machine. */
export const stillHeavy = (kg: number | null, target: number): boolean => target > 0 && (kg == null || kg > target);
