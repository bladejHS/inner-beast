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
  ['Hard work beats talent when talent', "doesn't work hard"],
  ['Discipline builds', 'freedom'],
  ['Better than', 'yesterday'],
  ['No', 'excuses'],
  ['Small steps,', 'big results'],
  ['Pain today,', 'power tomorrow'],
  ['Same you,', 'but stronger'],
];

/** The day's poster (2026-11-11, in place of the stock photos): the motto set in Saira over a steel plate, the wolf's
 *  mark faint at the right, the day's number stencilled, the red slash. `sm` is the small cut on the plan's day cards. */
export function dayPoster(idx: number, cls = ''): string {
  const [a, b] = DAY_MOTTO[idx] ?? DAY_MOTTO[0]!;
  return `<div class="poster ${cls}" aria-hidden="true"><i class="po-mark" style="--m:url(${import.meta.env.BASE_URL}ui/mark.svg)"></i><i class="po-n">0${idx + 1}</i><i class="po-slash"></i><p class="po-t"><span>${a}</span> <b>${b}</b></p></div>`;
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
