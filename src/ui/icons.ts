// Line icons, 24 × 24, drawn with currentColor.

const P: Record<string, string> = {
  today: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  plan: '<rect x="3.5" y="5" width="17" height="15.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="M7.5 14h3M13.5 14h3M7.5 17h3"/>',
  fight: '<path d="M7 10.5V7.8C7 5.7 8.7 4 10.8 4h3.6C17.5 4 20 6.5 20 9.6v2.9c0 2.5-1.6 4.7-4 5.5V20.5H8V17.6c-1.8-.9-3-2.8-3-4.8 0-1.3 1-2.3 2.3-2.3H11"/><path d="M8 20.5h8"/>',
  mind: '<path d="M12 21c-3.9 0-7-2.8-7-6.6 0-2.9 1.8-4.6 3.2-6.1.7 1.4 1.7 2.2 2.7 2.4-.3-3.3 1.1-6 3.9-7.7-.2 2.6.9 4.4 2.3 6 1.4 1.5 2.9 3.2 2.9 5.6C20 18.2 16 21 12 21z"/><path d="M12 21c-1.7 0-3-1.3-3-3 0-1.6 1.1-2.5 1.9-3.4.3.8.9 1.2 1.5 1.3.1-1.5.7-2.6 1.8-3.5.1 1.6.8 2.4 1.4 3.2.4.6.4 1.3.4 1.9 0 1.9-1.6 3.5-4 3.5z"/>',
  progress: '<path d="M4 20.5h16"/><rect x="5" y="12" width="3.4" height="8.5"/><rect x="10.3" y="7" width="3.4" height="13.5"/><rect x="15.6" y="3.5" width="3.4" height="17"/>',
  gear: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.6M12 18.6v2.6M21.2 12h-2.6M5.4 12H2.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8M18.5 18.5l-1.8-1.8M7.3 7.3L5.5 5.5"/><circle cx="12" cy="12" r="6.6"/>',
  play: '<path d="M7 4.5v15l12.5-7.5z" fill="currentColor" stroke="none"/>',
  pause: '<rect x="6" y="4.5" width="4" height="15" fill="currentColor" stroke="none"/><rect x="14" y="4.5" width="4" height="15" fill="currentColor" stroke="none"/>',
  next: '<path d="M5 5l9 7-9 7z" fill="currentColor" stroke="none"/><rect x="16" y="5" width="3" height="14" fill="currentColor" stroke="none"/>',
  prev: '<path d="M19 5l-9 7 9 7z" fill="currentColor" stroke="none"/><rect x="5" y="5" width="3" height="14" fill="currentColor" stroke="none"/>',
  close: '<path d="M5.5 5.5l13 13M18.5 5.5l-13 13"/>',
  check: '<path d="M4.5 12.5l5 5 10-11"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  sound: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 010 6M18 6.5a7.5 7.5 0 010 11"/>',
  mute: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M16 9.5l5 5M21 9.5l-5 5"/>',
  ext: '<path d="M13.5 4.5h6v6M19.5 4.5l-9 9"/><path d="M17 14v5.5H4.5V7H10"/>',
  trash: '<path d="M4.5 6.5h15M9.5 6.5V4h5v2.5M6.5 6.5l1 13.5h9l1-13.5"/>',
  run: '<circle cx="14.5" cy="4.5" r="1.8"/><path d="M7 21l3.2-5.5 3 2.5 1.3-5.5 3 2.5h3M10.2 15.5l1.7-6.2-3.4 1.2-2 3.2M11.9 9.3l3.4-.6"/>',
  walk: '<circle cx="13" cy="4.5" r="1.8"/><path d="M9.5 21l2.2-6.5 2.8 2.8V21M11.7 14.5l.8-5.5-3 1.6-1.3 3.2M12.5 9l2.3 3.3 2.7 1"/>',
  drop: '<path d="M12 3.5s-6 6.6-6 10.8a6 6 0 0012 0C18 10.1 12 3.5 12 3.5z"/><path d="M9.3 14.6a2.8 2.8 0 002.7 2.6"/>',
  wind: '<path d="M3 9h11.5a2.5 2.5 0 10-2.5-2.5M3 13h15.5a2.5 2.5 0 11-2.5 2.5M3 17h7"/>',
  timer: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.5M9.5 2.5h5M18.5 6.5l1.5-1.5"/>',
  trophy: '<path d="M7.5 4h9v5a4.5 4.5 0 01-9 0z"/><path d="M7.5 6H4.5c0 3 1.3 4.6 3.4 4.9M16.5 6h3c0 3-1.3 4.6-3.4 4.9M12 13.5V17M8 20.5h8M9.5 17h5v3.5h-5z"/>',
  moon: '<path d="M19.5 14.5A8 8 0 019.5 4.5a8 8 0 1010 10z"/>',
  steps: '<path d="M8.5 13.5c-1.8 0-3-1.6-3-4.2S6.7 4.5 8.5 4.5s2.6 1.9 2.6 4.6-.8 4.4-2.6 4.4zM6 16.5l5-.6.4 2.2c.2 1.3-.7 2.4-2 2.4-1.5 0-2.6-1.3-2.9-2.6z"/><path d="M15.5 10.5c1.8 0 3-1.6 3-4.2"/><path d="M18.5 6.3c0-2-1.2-3.8-3-3.8s-2.6 1.9-2.6 4.6.8 3.4 2.6 3.4M18 13.5l-5-.6-.4 2.2c-.2 1.3.7 2.4 2 2.4 1.5 0 2.6-1.3 2.9-2.6z"/>',
  book: '<path d="M4 5.5c2.7-1.3 5.4-1.3 8 0v14c-2.6-1.3-5.3-1.3-8 0zM12 5.5c2.6-1.3 5.3-1.3 8 0v14c-2.7-1.3-5.4-1.3-8 0z"/>',
  bolt: '<path d="M13.5 2.5L5 13.5h6l-1 8 8.5-11h-6z"/>',
  stretch: '<circle cx="12" cy="4.3" r="1.8"/><path d="M4 8.5l8 1.3 8-1.3M12 9.8v5.2l-4 6M12 15l4 6"/>',
  rope: '<path d="M5 3.5v6M19 3.5v6"/><path d="M5 9.5c0 8 3 11 7 11s7-3 7-11"/>',
  bag: '<path d="M12 2.5v3"/><rect x="7" y="5.5" width="10" height="15" rx="2"/><path d="M7 9.5h10M7 16.5h10"/>',
  wall: '<path d="M18.5 3v18"/><circle cx="14.5" cy="5.5" r="1.8"/><path d="M14.5 8v6h-6.5v6.5M14.5 14H18"/>',
  shadow: '<circle cx="9" cy="5" r="1.8"/><path d="M9 7.5v6l-3 7M9 13.5l3 7M9 9.5l4.5-1.5 5.5 1M9 10l-3.5 2.5"/>',
  edit: '<path d="M4.5 19.5l1-4.5 10-10 3.5 3.5-10 10z"/><path d="M13.5 7l3.5 3.5"/>',
  chev: '<path d="M9 5.5l6.5 6.5L9 18.5"/>',
  back: '<path d="M15 5.5L8.5 12l6.5 6.5"/>',
  flag: '<path d="M5.5 21V4M5.5 4.5h11l-2 4 2 4h-11"/>',
  star: '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M4.5 19.5h15"/>',
  upload: '<path d="M12 15.5v-11M7 9.5l5-5 5 5M4.5 19.5h15"/>',
};

export function ic(name: string, label?: string): string {
  const body = P[name] ?? '';
  const a = label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"';
  return `<svg viewBox="0 0 24 24" ${a} fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="square" stroke-linejoin="miter">${body}</svg>`;
}
