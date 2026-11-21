import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rankOf, RANKS, trainingSessions } from './ranks.ts';
import type { Entry } from './store.ts';

test('the rank climbs at each threshold', () => {
  assert.equal(rankOf(0).rank.name, 'Rookie');
  assert.equal(rankOf(9).rank.name, 'Rookie');
  assert.equal(rankOf(10).rank.name, 'Athlete');
  assert.equal(rankOf(39).next?.name, 'Hybrid');
  assert.equal(rankOf(39).into, 29);
  assert.equal(rankOf(500).rank.name, 'Zenith');
  assert.equal(rankOf(500).next, null);
  assert.equal(RANKS.length, 5);
});

test('walks, showers and breathing do not count', () => {
  const e = (kind: Entry['kind']): Entry => ({ id: kind, ts: 0, date: '2026-11-15', kind, name: '', dur: 0, data: {} });
  assert.equal(trainingSessions([e('rounds'), e('walk'), e('shower'), e('workout'), e('breath'), e('wimhof'), e('run')]), 3);
});
