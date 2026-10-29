// Calendar reminders: a web app can't schedule notifications (least of all on iPhone), so the next 4 weeks of the plan
// and the photo days go into the phone's calendar as an .ics file, each with an alarm.

import { WEEK, blockLine } from '../data/plan.ts';
import { addDays, dayKey, pad2, parseDay, weekdayIdx } from '../logic/util.ts';
import { ctx, toast } from './ctx.ts';
import { PHOTO_EVERY, photoDue } from './screens/body.ts';
import { blockMinutes } from './screens/shared.ts';

const icsEsc = (s: string): string => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
/** Lines longer than 75 octets fold onto the next line with a leading space (RFC 5545). */
function fold(l: string): string {
  const out: string[] = [];
  let s = l;
  while (s.length > 72) {
    out.push(s.slice(0, 72));
    s = ' ' + s.slice(72);
  }
  out.push(s);
  return out.join('\r\n');
}
const stamp = (d: Date): string => `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}T${pad2(d.getHours())}${pad2(d.getMinutes())}00`;
const ymd = (k: string): string => k.replace(/-/g, '');

export function icsText(time: string, alarm: number, today = dayKey()): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(time) ?? ['', '18', '00'];
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Inner Beast//Plan//RO', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Inner Beast'];
  const alarmLines = (text: string, trigger: string): string[] => ['BEGIN:VALARM', 'ACTION:DISPLAY', `TRIGGER:${trigger}`, fold(`DESCRIPTION:${icsEsc(text)}`), 'END:VALARM'];
  for (let i = 0; i < 28; i++) {
    const k = addDays(today, i);
    const day = WEEK[weekdayIdx(k)];
    const st = parseDay(k);
    st.setHours(+m[1], +m[2], 0, 0);
    const mins = Math.max(15, day.blocks.reduce((s, b) => s + blockMinutes(b), 0));
    const en = new Date(st.getTime() + mins * 60000);
    // the UID stays the same for a day, so exporting again updates the events instead of doubling them
    L.push('BEGIN:VEVENT', `UID:beast-${k}@inner-beast`, `DTSTAMP:${now}`, `DTSTART:${stamp(st)}`, `DTEND:${stamp(en)}`, fold(`SUMMARY:${icsEsc(`Inner Beast · ${day.title}`)}`), fold(`DESCRIPTION:${icsEsc(day.blocks.map((b) => `• ${blockLine(b, ctx.S.set)}`).join('\n'))}`));
    if (alarm > 0) L.push(...alarmLines(`În ${alarm} de minute: ${day.title}`, `-PT${alarm}M`));
    L.push('END:VEVENT');
  }
  // photo days: the next one, then every 2 weeks, all-day with a reminder at 9 in the morning
  let pk = addDays(today, photoDue(today));
  while (pk <= addDays(today, 27)) {
    L.push('BEGIN:VEVENT', `UID:beast-photo-${pk}@inner-beast`, `DTSTAMP:${now}`, `DTSTART;VALUE=DATE:${ymd(pk)}`, `DTEND;VALUE=DATE:${ymd(addDays(pk, 1))}`, fold(`SUMMARY:${icsEsc('Inner Beast · ziua pozei de progres')}`), fold(`DESCRIPTION:${icsEsc('Aceeași lumină, același loc, aceeași poziție. Adaugă poza în Progres.')}`), ...alarmLines('Azi e ziua pozei de progres', 'PT9H'), 'END:VEVENT');
    pk = addDays(pk, PHOTO_EVERY);
  }
  L.push('END:VCALENDAR');
  return L.join('\r\n') + '\r\n';
}

export async function icsExport(time: string, alarm: number): Promise<void> {
  const blob = new Blob([icsText(time, alarm)], { type: 'text/calendar' });
  const file = new File([blob], 'inner-beast.ics', { type: 'text/calendar' });
  try {
    if (navigator.canShare?.({ files: [file] }) && matchMedia('(pointer: coarse)').matches) {
      await navigator.share({ files: [file], title: 'Inner Beast · antrenamente' });
      return;
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return;
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  window.setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 1000);
  toast('Calendar descărcat. Deschide fișierul ca să adaugi antrenamentele.');
}
