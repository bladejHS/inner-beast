import test from 'node:test';
import assert from 'node:assert/strict';
import { fig3d, ROUTINES_3D } from '../data/poses3d.ts';
import { ROUTINES } from '../data/routines.ts';

test('every mobility and stretching move has a 3D figure', () => {
  const missing = ROUTINES.filter((r) => ROUTINES_3D.includes(r.id)).flatMap((r) => r.moves.map((m) => m.name)).filter((n) => !fig3d(n));
  assert.deepEqual(missing, []);
});
