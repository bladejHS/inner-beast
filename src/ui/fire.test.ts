import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fireCalendar, heat, minutesByDay } from './fire.ts';
import type { Entry } from '../logic/store.ts';

const e = (date: string, kind: Entry['kind'], min: number): Entry => ({ id: date + kind, ts: 0, date, kind, name: '', dur: min * 60, data: {} });

test('only training lights the calendar, and the minutes set the heat', () => {
  const by = minutesByDay([e('2026-11-16', 'rounds', 30), e('2026-11-16', 'workout', 50), e('2026-11-16', 'walk', 90), e('2026-11-15', 'shower', 5)]);
  assert.equal(Math.round(by.get('2026-11-16')!), 80);
  assert.equal(by.get('2026-11-15'), undefined);
  assert.deepEqual([0, 10, 30, 60, 80].map(heat), [0, 1, 2, 3, 4]);
});

test('twelve columns of seven days, the active days and the longest run', () => {
  const html = fireCalendar([e('2026-11-13', 'rounds', 40), e('2026-11-14', 'run', 20), e('2026-11-15', 'workout', 60), e('2026-11-11', 'rounds', 40)], '2026-11-16');
  assert.equal((html.match(/class="fc-w"/g) ?? []).length, 12);
  assert.match(html, /<b class="num">4<\/b><span>zile de antrenament/);
  assert.match(html, /<b class="num">3<\/b><span>zile la rând/);
});
