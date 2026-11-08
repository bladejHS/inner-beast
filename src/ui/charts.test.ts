import { test } from 'node:test';
import assert from 'node:assert/strict';
import { bars } from './charts.ts';

test('bars: the goal line at its height, the value on each bar, hatched under the goal, a stub for a day with nothing', () => {
  const h = bars([{ v: 8, label: 'Lu' }, { v: 6, label: 'Ma' }, { v: 0, label: 'Mi', today: true }], 8, { goalLabel: '8 h', name: 'Somn' });
  assert.match(h, /class="bars-goal" style="bottom:100\.0%"><span>8 h<\/span>/);
  assert.match(h, /<i class="ok" style="height:100\.0%"><b>8<\/b><\/i>/);
  assert.match(h, /<i class="low" style="height:75\.0%"><b>6<\/b><\/i>/);
  assert.match(h, /<i class="" style="height:0\.0%"><\/i>/);
  assert.match(h, /role="img" aria-label="Somn: Lu 8, Ma 6, Mi nimic"/);
  assert.match(h, /<span class="today">Mi<\/span>/);
  // a value over the goal raises the scale, so the goal line comes down
  assert.match(bars([{ v: 12500, label: 'Lu' }], 10000, { fmt: (v) => `${v / 1000}k` }), /bottom:80\.0%"><span>10k<\/span>.*<b>12\.5k<\/b>/);
});
