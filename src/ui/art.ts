// The ink drawings (public/art, made by scripts/art.mjs), painted with currentColor through a CSS mask.

import { CLAWS } from './claws.ts';

const RATIO = {
  wolf: 392 / 482,
  claws: 316 / 312,
  fighter: 653 / 241,
  strength: 686 / 514,
  norisk: 616 / 615,
  trust: 624 / 800,
  boxer: 546 / 800,
  atlas: 283 / 613,
  eyes: 614 / 314,
  why: 900 / 634,
  heart: 478 / 700,
  angel: 585 / 900,
  masks: 368 / 700,
  jester: 681 / 694,
  peek: 375 / 600,
  sharks: 268 / 800,
} as const;

export type ArtName = keyof typeof RATIO;

/** The day's motto, as the e-book's banners had them (the last word is the one in red). */
export const DAY_MOTTO: Array<[string, string]> = [
  ['Run fast.', 'Build muscle.'],
  ['Quality over', 'quantity.'],
  ['Build strength and', 'work capacity.'],
  ['Move well, lift strong,', 'recover smart.'],
  ['Fuel hard,', 'train hard.'],
  ['Build your engine.', 'Perform when it counts.'],
  ['This is where you', 'get better.'],
];

/** The day's banner in Plan (2026-11-20, the user asked for a new one): set like the Hybrid365 slides, the number in
 *  gold and the weekday in heavy white caps ("1. MONDAY"), the day's motto under them, the session icons on the right,
 *  a gold hairline at the foot and the forge crest faint behind. `ics` are the icons of the day's sessions. */
const DAY_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
export function dayPoster(idx: number, cls = '', ics = ''): string {
  const [a, b] = DAY_MOTTO[idx] ?? DAY_MOTTO[0]!;
  return `<div class="poster hy ${cls}" aria-hidden="true"><i class="po-mark" style="--m:url(${import.meta.env.BASE_URL}ui/mark.svg)"></i><i class="po-sheen"></i>
    <span class="po-day"><b>${idx + 1}.</b>${DAY_EN[idx] ?? ''}</span><span class="po-m">${a} <em>${b}</em></span>${ics ? `<span class="po-ics">${ics}</span>` : ''}<i class="po-line"></i></div>`;
}

/** The finish mark on every "Gata." screen: three claw gashes torn in, with a shock ring. */
function doneMark(): string {
  const paths = CLAWS.map((c, i) => `<path d="${c.fill}" style="--d:${(0.06 + i * 0.07).toFixed(2)}s"/>`).join('');
  return `<div class="done-mark" aria-hidden="true"><i class="dm-ring"></i><i class="dm-ring dm-r2"></i><svg viewBox="0 0 100 100">${paths}</svg></div>`;
}

export function art(name: ArtName, cls = ''): string {
  if (name === 'claws' && cls.includes('done-claws')) return doneMark();
  return `<i class="art ${cls}" style="--m:url(${import.meta.env.BASE_URL}art/${name}.webp);--ar:${RATIO[name].toFixed(4)}" aria-hidden="true"></i>`;
}
