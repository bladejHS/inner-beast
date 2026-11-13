import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Pedometer, parseSteps, strideM } from './pedometer.ts';

/** Feeds `sec` seconds at 60 Hz of gravity plus `f(t)` along one axis, with a bit of sensor noise. */
function feed(p: Pedometer, sec: number, f: (t: number) => number, t0 = 0, seed = 1): number {
  let r = seed;
  const noise = () => ((r = (r * 16807) % 2147483647) / 2147483647 - 0.5) * 0.3;
  for (let i = 0; i < sec * 60; i++) {
    const t = t0 + i / 60;
    p.push(noise(), 9.81 + f(t) + noise(), noise(), t * 1000);
  }
  return t0 + sec;
}

const gait = (hz: number, amp: number) => (t: number) => amp * Math.sin(2 * Math.PI * hz * t);

test('counts a steady walk to within 1 %', () => {
  for (const [hz, amp] of [[1.8, 3], [1.5, 1.6], [2.2, 5], [1.0, 2]] as const) {
    const p = new Pedometer();
    feed(p, 120, gait(hz, amp));
    const want = hz * 120;
    assert.ok(Math.abs(p.steps - want) <= want * 0.01 + 1, `${hz} Hz: ${p.steps} vs ${want}`);
  }
});

test('a real-looking step, heel strike and push-off as two bumps, still counts once', () => {
  for (const [hz, amp] of [[1.8, 3], [1.6, 1.5]] as const) {
    const p = new Pedometer();
    feed(p, 120, (t) => amp * Math.sin(2 * Math.PI * hz * t) + amp * 0.45 * Math.sin(4 * Math.PI * hz * t + 1.2) + amp * 0.15 * Math.sin(6 * Math.PI * hz * t));
    const want = hz * 120;
    assert.ok(Math.abs(p.steps - want) <= want * 0.01 + 1, `${hz} Hz: ${p.steps} vs ${want}`);
  }
});

test('a phone at rest, shaken once or put down does not count', () => {
  const rest = new Pedometer();
  feed(rest, 60, () => 0);
  assert.equal(rest.steps, 0);
  const bumps = new Pedometer();
  feed(bumps, 30, (t) => (t % 3 < 0.15 ? 4 : 0));
  assert.equal(bumps.steps, 0);
  // three steps and a stop: under the 4 needed to start counting
  const three = new Pedometer();
  feed(three, 1.67, gait(1.8, 3));
  feed(three, 10, () => 0, 1.67);
  assert.equal(three.steps, 0);
});

test('walk, stop, walk again: both stretches counted', () => {
  const p = new Pedometer();
  let t = feed(p, 60, gait(1.8, 3));
  t = feed(p, 20, () => 0, t);
  feed(p, 60, gait(1.8, 3), t);
  assert.ok(Math.abs(p.steps - 216) <= 4, String(p.steps));
});

test('steps from Apple Health in the clipboard', () => {
  assert.equal(parseSteps('8423'), 8423);
  assert.equal(parseSteps('8.423'), 8423);
  assert.equal(parseSteps('8,423'), 8423);
  assert.equal(parseSteps('12 345'), 12345);
  assert.equal(parseSteps('8423.6'), 8424);
  assert.equal(parseSteps('8423,4 pași'), 8423);
  assert.equal(parseSteps('0'), 0);
  assert.equal(parseSteps('salut'), null);
  assert.equal(parseSteps('9999999'), null);
  assert.equal(strideM(200), 0.83);
});
