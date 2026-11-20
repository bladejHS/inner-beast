// The mark of your rank: the pictures in public/ui/rank, drawn by scripts/ranks-art.mjs from the HYBRID FORGE mark
// (scripts/forge.mjs; the wolf until 2026-11-20). The names wolfArt/wolfBadge stay for the call sites.
import { rankOf, trainingSessions } from '../logic/ranks.ts';
import { ctx } from './ctx.ts';

const BASE = import.meta.env.BASE_URL;

export const rankIndex = (): number => { try { return rankOf(trainingSessions(ctx.S.log)).i; } catch { return 0; } };
/** The large wolf (680 × 801), for the stage, the celebration and the poster. */
export const wolfArt = (i = rankIndex()): string => `${BASE}ui/rank/wolf-${i}.webp`;
/** The head alone (192 px), for the tab bar and the small medallions. */
export const wolfBadge = (i = rankIndex()): string => `${BASE}ui/rank/badge-${i}.webp`;
