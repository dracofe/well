import type { ComponentChildren } from 'preact';
import { useEffect, useRef, useState } from 'preact/hooks';
import { reduced, useCountUp } from './motion';

// ───────── Icons (inline, 24px stroke) ─────────
const paths: Record<string, string> = {
  today: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  food: 'M7 3v8m-3-8v5a3 3 0 0 0 6 0V3M7 11v10M17 21V3c-2.5 1-4 4-4 8h4',
  train: 'M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11',
  progress: 'M3 20h18M5 16l4-5 4 3 6-8',
  plus: 'M12 5v14M5 12h14',
  x: 'M6 6l12 12M18 6L6 18',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  chev: 'M9 6l6 6-6 6',
  back: 'M15 6l-6 6 6 6',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16l-4-4',
  pause: 'M9 5v14M15 5v14',
  play: 'M7 5l12 7-12 7z',
  trash: 'M4 7h16M9 7V4h6v3m-8 0l1 13h8l1-13',
  info: 'M12 8h.01M11 12h1v5h1M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z',
  scale: 'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm4 5a4 4 0 0 1 6 0l-2 2',
  settings: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm7.4 3a7.4 7.4 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14.5 3h-5l-.4 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6a7.4 7.4 0 0 0 0 2.4l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2l.4 2.6h5l.4-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z',
  water: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z',
  copy: 'M9 9h10v10H9zM5 15V5h10',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10-3a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  bolt: 'M13 3L5 14h6l-1 7 8-11h-6z',
};
export function Icon({ n, size = 22, class: cls }: { n: keyof typeof paths | string; size?: number; class?: string }) {
  return (
    <svg class={cls} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d={paths[n]} />
    </svg>
  );
}

// ───────── Animated number ─────────
export function Num({ value, format = (n: number) => Math.round(n).toLocaleString('id-ID') }: { value: number; format?: (n: number) => string }) {
  const v = useCountUp(value);
  return <span class="num">{format(v)}</span>;
}

// ───────── Ring ─────────
export function Ring({ value, max, size = 168, stroke = 12, children }: { value: number; max: number; size?: number; stroke?: number; children?: ComponentChildren }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const over = max > 0 && value > max;
  const [shown, setShown] = useState(reduced() ? pct : 0);
  useEffect(() => { const id = requestAnimationFrame(() => setShown(pct)); return () => cancelAnimationFrame(id); }, [pct]);
  return (
    <div class="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${Math.round(pct * 100)}% dari target`}>
        <circle cx={size / 2} cy={size / 2} r={r} class="ring-track" stroke-width={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} class={`ring-fill ${over ? 'over' : ''}`} stroke-width={stroke} fill="none"
          stroke-linecap="round" stroke-dasharray={c} stroke-dashoffset={c * (1 - shown)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div class="ring-center">{children}</div>
    </div>
  );
}

// ───────── Bar ─────────
export function Bar({ value, max, tone = 'accent' }: { value: number; max: number; tone?: 'accent' | 'muted' | 'ink' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const [w, setW] = useState(reduced() ? pct : 0);
  useEffect(() => { const id = requestAnimationFrame(() => setW(pct)); return () => cancelAnimationFrame(id); }, [pct]);
  return <div class={`bar bar-${tone}`} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemax={Math.round(max)}><i style={{ width: `${w}%` }} /></div>;
}

// ───────── Bottom sheet ─────────
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ComponentChildren }) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
      return () => cancelAnimationFrame(id);
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), reduced() ? 0 : 240);
    return () => clearTimeout(t);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    setTimeout(() => panel.current?.querySelector<HTMLElement>('input,button:not(.sheet-x),select')?.focus({ preventScroll: true }), 60);
    return () => { window.removeEventListener('keydown', onKey); prev?.focus?.({ preventScroll: true }); };
  }, [open]);

  // drag-to-dismiss (lightweight pointer handling)
  const drag = useRef<{ y: number; dy: number } | null>(null);
  const onDown = (e: PointerEvent) => { drag.current = { y: e.clientY, dy: 0 }; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); };
  const onMove = (e: PointerEvent) => {
    if (!drag.current || !panel.current) return;
    drag.current.dy = Math.max(0, e.clientY - drag.current.y);
    panel.current.style.transform = `translateY(${drag.current.dy}px)`;
    panel.current.style.transition = 'none';
  };
  const onUp = () => {
    if (!drag.current || !panel.current) return;
    const dy = drag.current.dy;
    panel.current.style.transform = '';
    panel.current.style.transition = '';
    drag.current = null;
    if (dy > 90) onClose();
  };

  if (!mounted) return null;
  return (
    <div class={`sheet-wrap ${shown ? 'show' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
      <div class="sheet-backdrop" onClick={onClose} />
      <div class="sheet" ref={panel}>
        <div class="sheet-grab" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}><span /></div>
        <div class="sheet-head">
          <h2>{title}</h2>
          <button class="icon-btn sheet-x" onClick={onClose} aria-label="Tutup"><Icon n="x" /></button>
        </div>
        <div class="sheet-body">{children}</div>
      </div>
    </div>
  );
}

// ───────── Toast ─────────
type ToastMsg = { id: number; text: string; tone?: 'ok' | 'info' };
let pushToast: (t: string, tone?: 'ok' | 'info') => void = () => {};
export const toast = (t: string, tone: 'ok' | 'info' = 'ok') => pushToast(t, tone);
export function Toaster() {
  const [items, setItems] = useState<ToastMsg[]>([]);
  useEffect(() => {
    pushToast = (text, tone) => {
      const id = Date.now() + Math.random();
      setItems((x) => [...x.slice(-2), { id, text, tone }]);
      setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 2600);
    };
  }, []);
  return (
    <div class="toaster" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} class={`toast toast-${t.tone}`}>
          <Icon n={t.tone === 'info' ? 'info' : 'check'} size={18} />
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}

// ───────── Segmented control ─────────
export function Seg<T extends string>({ value, options, onChange, label }: { value: T; options: { v: T; l: string }[]; onChange: (v: T) => void; label: string }) {
  const idx = Math.max(0, options.findIndex((o) => o.v === value));
  return (
    <div class="seg" role="radiogroup" aria-label={label} style={{ '--n': options.length, '--i': idx } as any}>
      <i class="seg-pill" />
      {options.map((o) => (
        <button key={o.v} role="radio" aria-checked={o.v === value} class={o.v === value ? 'on' : ''} onClick={() => onChange(o.v)}>{o.l}</button>
      ))}
    </div>
  );
}

// ───────── Field ─────────
export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ComponentChildren }) {
  return (
    <label class={`field ${error ? 'has-err' : ''}`}>
      <span class="field-l">{label}</span>
      {children}
      {error ? <span class="field-err" role="alert">{error}</span> : hint ? <span class="field-h">{hint}</span> : null}
    </label>
  );
}

export function Badge({ children, tone = 'neutral' }: { children: ComponentChildren; tone?: 'neutral' | 'accent' | 'warn' }) {
  return <span class={`badge badge-${tone}`}>{children}</span>;
}

export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <span class="wordmark" style={{ fontSize: size }} aria-label="3well">
      <b>3</b>well
    </span>
  );
}

export function Disclaimer() {
  return <p class="disclaimer">Estimasi bukan saran medis. Hasil tiap orang bisa berbeda.</p>;
}
