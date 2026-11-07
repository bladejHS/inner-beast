import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planSnapshot } from './bridge.ts';

const base = { legMode: 'wall', thuFeet: 'rope', thuMain: 'bag', rowCh: 'a', rest3: 60, rest1: 60 } as const;
const thursday = (o: Partial<typeof base> | { thuFeet?: 'ladder'; thuMain?: 'row'; rowCh?: string; thuPartner?: 'spar' }) => planSnapshot({ ...base, ...o } as never)[3]!;

test('Thursday publishes only the picked options and names the one left out', () => {
  const rope = thursday({});
  assert.equal(rope.length, 4);
  assert.equal(rope[0]!.name, 'Jumping Rope');
  assert.deepEqual(rope[0]!.alt, { other: 'Agility Ladder' });
  assert.deepEqual(rope[1]!.alt, { other: 'Technical Sparring / Pads' });
  assert.deepEqual(rope[3]!.alt, { other: 'Machine Row' });
  const ladder = thursday({ thuFeet: 'ladder' });
  assert.equal(ladder.length, 4);
  assert.deepEqual([ladder[0]!.id, ladder[0]!.name, ladder[0]!.focus], ['thu-rope', 'Agility Ladder', 'ladder']);
  assert.deepEqual(ladder[0]!.alt, { other: 'Jumping Rope' });
  const spar = thursday({ thuPartner: 'spar' });
  assert.deepEqual([spar[1]!.name, spar[1]!.alt], ['Technical Sparring / Pads', { other: 'Shadow Kickboxing' }]);
});

test('a rowing pick carries its challenge and its own workload; the punch-out goes to shadow boxing', () => {
  const minutes = (rowCh: string) => thursday({ thuMain: 'row', rowCh })[3]!;
  assert.deepEqual([minutes('a').kind, minutes('a').min], ['row', 5]);
  assert.equal(minutes('c').min, 45);
  assert.deepEqual(minutes('b').alt, { other: 'Heavy Bag Training', detail: 'Challenge B: 5.000 m' });
  assert.equal(thursday({ thuMain: 'row' })[2]!.name, 'Punch-out Shadow');
});

test('the other boxing days keep their sessions and only Thursday has alternatives', () => {
  const week = planSnapshot(base);
  assert.deepEqual([0, 1, 4].map((d) => week[d]!.filter((s) => s.kind === 'rounds').length), [2, 1, 1]);
  assert.ok(week.flat().filter((s) => s.alt).every((s) => s.id.startsWith('thu-') || s.id === 'sun-jog'));
  assert.deepEqual(week[6]!.find((s) => s.id === 'sun-jog')!.alt, { other: 'Jogging' });
});
