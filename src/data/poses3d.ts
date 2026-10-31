// The figures for the 3D athlete: mobility and stretching only. They reuse the key poses of poses.ts.

import { POSES, type Fig } from './poses.ts';

export type Fig3 = Fig & { box?: [number, number, number] };

/** Routines that play the 3D athlete. */
export const ROUTINES_3D: readonly string[] = ['stretch-push', 'stretch-pull', 'mobility', 'daily', 'dagestan', 'splits'];

const EXTRA: Record<string, Fig3> = {
  'Cross-body Shoulder Stretch': {
    slow: true,
    k: [
      { p: [50, 46], t: 180, a: [[80, 80], [2, 150]], l: [[0, 0], [0, 0]] },
      { p: [50, 46], t: 180, a: [[92, 92], [8, 140]], l: [[0, 0], [0, 0]] },
    ],
  },
};

export function fig3d(name: string): Fig3 | undefined {
  return EXTRA[name] ?? POSES[name];
}
