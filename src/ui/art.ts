// The ink drawings (public/art, made by scripts/art.mjs), painted with currentColor through a CSS mask.

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

/** The day's banner (public/days, made by scripts/photos.mjs): a picture with the day's motto lettered in. */
export function dayPhoto(idx: number, cls = '', lazy = false): string {
  return `<img class="day-ph ${cls}" src="${import.meta.env.BASE_URL}days/${idx}.webp" width="830" height="230" alt="" decoding="async"${lazy ? ' loading="lazy"' : ''}>`;
}

export function art(name: ArtName, cls = ''): string {
  return `<i class="art ${cls}" style="--m:url(${import.meta.env.BASE_URL}art/${name}.webp);--ar:${RATIO[name].toFixed(4)}" aria-hidden="true"></i>`;
}
