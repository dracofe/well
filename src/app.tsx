import { useEffect, useRef, useState } from 'preact/hooks';
import { go, openSheet, useBus, type Route } from './ui/bus';
import { Icon, Toaster, Wordmark } from './ui/components';
import { useStore } from './lib/store';
import { haptic } from './ui/motion';
import { Landing } from './screens/Landing';
import { Onboarding } from './screens/Onboarding';
import { Today } from './screens/Today';
import { FoodScreen } from './screens/Food';
import { Train } from './screens/Train';
import { Progress } from './screens/Progress';
import { Settings } from './screens/Settings';
import { WeightSheet } from './screens/WeightSheet';

const TABS: { r: Route; l: string; i: string }[] = [
  { r: 'today', l: 'Today', i: 'today' },
  { r: 'food', l: 'Food', i: 'food' },
  { r: 'train', l: 'Train', i: 'train' },
  { r: 'progress', l: 'Progress', i: 'progress' },
];

export function App() {
  const { route, sheet } = useBus();
  const onboarded = useStore((s) => s.onboarded);
  const active = useStore((s) => s.active);

  useEffect(() => {
    if (!onboarded && route !== '' && route !== 'start') go('');
    if (onboarded && (route === '' || route === 'start')) go('today');
  }, [onboarded, route]);

  if (!onboarded || route === '' || route === 'start') {
    return (
      <>
        {route === 'start' ? <Onboarding /> : <Landing />}
        <Toaster />
      </>
    );
  }

  const idx = TABS.findIndex((t) => t.r === route);
  return (
    <div class="app">
      <TopBar />
      <Screen route={route} idx={idx} />
      {active && route !== 'train' && (
        <button class="live-pill" onClick={() => go('train')}><span class="pulse" /> Workout berjalan · lanjutkan</button>
      )}
      <Fab />
      <nav class="tabbar" aria-label="Navigasi utama" style={{ '--i': Math.max(0, idx) } as any}>
        <i class="tab-ind" style={{ opacity: idx < 0 ? 0 : 1 }} />
        {TABS.map((t) => (
          <a key={t.r} href={`#/${t.r}`} class={route === t.r ? 'on' : ''} aria-current={route === t.r ? 'page' : undefined}>
            <Icon n={t.i} />
            <span>{t.l}</span>
          </a>
        ))}
      </nav>
      <WeightSheet open={sheet?.kind === 'weight'} date={sheet?.kind === 'weight' ? sheet.date : undefined} onClose={() => openSheet(null)} />
      <Toaster />
    </div>
  );
}

function TopBar() {
  const date = new Date().toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  return (
    <header class="topbar">
      <a href="#/today" class="tb-brand"><Wordmark size={21} /></a>
      <span class="tb-date">{date}</span>
      <a href="#/settings" class="icon-btn" aria-label="Pengaturan"><Icon n="settings" /></a>
    </header>
  );
}

function Screen({ route, idx }: { route: Route; idx: number }) {
  const prev = useRef(idx);
  const dir = idx === prev.current ? 0 : idx > prev.current ? 1 : -1;
  useEffect(() => { prev.current = idx; }, [idx]);
  return (
    <main key={route} class="screen" data-dir={dir} id="main">
      {route === 'today' && <Today />}
      {route === 'food' && <FoodScreen />}
      {route === 'train' && <Train />}
      {route === 'progress' && <Progress />}
      {route === 'settings' && <Settings />}
    </main>
  );
}

function Fab() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  }, [open]);
  const act = (fn: () => void) => { setOpen(false); haptic(); fn(); };
  const items = [
    { l: 'Berat', i: 'scale', f: () => openSheet({ kind: 'weight' }) },
    { l: 'Makanan', i: 'food', f: () => { go('food'); setTimeout(() => document.getElementById('food-search')?.focus(), 250); } },
    { l: 'Workout', i: 'train', f: () => go('train') },
  ];
  return (
    <div class={`fab-wrap ${open ? 'open' : ''}`}>
      <div class="fab-scrim" onClick={() => setOpen(false)} />
      <div class="fab-menu" aria-hidden={!open}>
        {items.map((it, i) => (
          <button key={it.l} class="fab-item" style={{ '--d': `${(items.length - i) * 30}ms` } as any} tabIndex={open ? 0 : -1} onClick={() => act(it.f)}>
            <span>{it.l}</span>
            <i><Icon n={it.i} size={20} /></i>
          </button>
        ))}
      </div>
      <button class="fab" aria-label={open ? 'Tutup quick add' : 'Quick add'} aria-expanded={open} onClick={() => { haptic(); setOpen(!open); }}>
        <Icon n="plus" size={26} />
      </button>
    </div>
  );
}
