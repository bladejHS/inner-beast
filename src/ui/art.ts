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

/** Picture file per weekday (Monday first). The files were cut for the old week, when Leg Day was on Sunday:
 *  Saturday (Leg Day now) takes the runner, Sunday (mobility) the wolf on the rock. */
const DAY_FILE = [0, 1, 2, 3, 4, 6, 5];

/** The day's banner (public/days, made by scripts/photos.mjs): a picture with the day's motto lettered in. */
export function dayPhoto(idx: number, cls = '', lazy = false): string {
  return `<img class="day-ph ${cls}" src="${import.meta.env.BASE_URL}days/${DAY_FILE[idx] ?? idx}.webp" width="830" height="216" alt="" decoding="async"${lazy ? ' loading="lazy"' : ''}>`;
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
