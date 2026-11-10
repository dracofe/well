import { useEffect, useState } from 'preact/hooks';

export type Route = '' | 'start' | 'today' | 'food' | 'train' | 'progress' | 'settings';
export type SheetReq = { kind: 'weight'; date?: string } | null;

const readRoute = (): Route => (location.hash.replace(/^#\/?/, '').split('?')[0] as Route) || '';

let route: Route = readRoute();
let sheet: SheetReq = null;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

window.addEventListener('hashchange', () => { route = readRoute(); emit(); scrollTo({ top: 0 }); });

export function go(r: Route) {
  if (r === route) return;
  location.hash = r ? `/${r}` : '';
}

export function openSheet(s: SheetReq) { sheet = s; emit(); }

export function useBus() {
  const [, f] = useState(0);
  useEffect(() => { const cb = () => f((n) => n + 1); subs.add(cb); return () => { subs.delete(cb); }; }, []);
  return { route, sheet };
}
