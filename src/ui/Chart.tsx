import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { addDays, dayNum, fmt, movingAverage, type WeightEntry } from '../lib/calc';

interface Band { lo: number; hi: number; center: number; days: number }

function useWidth<T extends HTMLElement>(init = 340) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(init);
  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(240, Math.round(e.contentRect.width))));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

const shortDate = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

export function WeightChart({ entries, days, today, goal, band }: { entries: WeightEntry[]; days: number; today: string; goal?: number | null; band?: Band | null }) {
  const [ref, W] = useWidth<HTMLDivElement>();
  const H = 210;
  const pad = { l: 34, r: 12, t: 14, b: 26 };
  const [hover, setHover] = useState<number | null>(null);

  const startN = dayNum(today) - days + 1;
  const smooth = useMemo(() => movingAverage(entries), [entries]);
  const vis = smooth.filter((p) => dayNum(p.date) >= startN);
  const endN = dayNum(today) + (band ? band.days : 0);

  const ys = vis.flatMap((p) => [p.kg, p.avg]);
  if (band) ys.push(band.lo, band.hi);
  let lo = ys.length ? Math.min(...ys) : 70, hi = ys.length ? Math.max(...ys) : 80;
  const showGoal = goal != null && goal > lo - 3 && goal < hi + 3;
  if (showGoal) { lo = Math.min(lo, goal!); hi = Math.max(hi, goal!); }
  const span = Math.max(1.5, hi - lo);
  lo -= span * 0.12; hi += span * 0.12;

  const x = (n: number) => pad.l + ((n - startN) / Math.max(1, endN - startN)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - (v - lo) / (hi - lo)) * (H - pad.t - pad.b);

  // break the smoothed line when gaps > 4 days (do not invent data)
  const segs: string[] = [];
  let cur = '';
  vis.forEach((p, i) => {
    const gap = i > 0 && dayNum(p.date) - dayNum(vis[i - 1].date) > 4;
    const c = `${x(dayNum(p.date)).toFixed(1)},${y(p.avg).toFixed(1)}`;
    if (!cur || gap) { if (cur) segs.push(cur); cur = `M${c}`; } else cur += ` L${c}`;
  });
  if (cur) segs.push(cur);

  const rawStep = (hi - lo) / 4;
  const step = [0.5, 1, 2, 5, 10].find((v) => v >= rawStep) ?? 10;
  const yt: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) yt.push(Math.round(v * 10) / 10);
  const xt = [startN, Math.round((startN + dayNum(today)) / 2), dayNum(today)];

  const last = vis[vis.length - 1];
  const bandPath = band && last
    ? `M${x(dayNum(today))},${y(last.avg)} L${x(endN)},${y(band.hi)} L${x(endN)},${y(band.lo)} Z`
    : '';

  const pick = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    const px = clientX - r.left;
    let best = -1, bd = Infinity;
    vis.forEach((p, i) => { const d = Math.abs(x(dayNum(p.date)) - px); if (d < bd) { bd = d; best = i; } });
    setHover(best >= 0 ? best : null);
  };

  const h = hover != null ? vis[hover] : null;
  const summary = vis.length
    ? `${vis.length} kali timbang dalam ${days} hari. Rata-rata 7 hari terakhir ${fmt.kg(last!.avg)} kg.${band ? ` Rentang perkiraan ${band.days} hari: ${fmt.kg(band.lo)}–${fmt.kg(band.hi)} kg.` : ''}`
    : 'Belum ada data berat pada rentang ini.';

  return (
    <div class="chart" ref={ref}>
      <svg
        key={`${days}-${entries.length}`}
        width={W} height={H} viewBox={`0 0 ${W} ${H}`}
        role="img" aria-label={summary}
        tabIndex={0}
        onPointerMove={(e) => pick(e.clientX)}
        onPointerDown={(e) => pick(e.clientX)}
        onPointerLeave={() => setHover(null)}
        onKeyDown={(e) => {
          if (!vis.length) return;
          if (e.key === 'ArrowLeft') setHover((v) => Math.max(0, (v ?? vis.length) - 1));
          if (e.key === 'ArrowRight') setHover((v) => Math.min(vis.length - 1, (v ?? -1) + 1));
          if (e.key === 'Escape') setHover(null);
        }}
      >
        <defs>
          <linearGradient id="bandg" x1="0" x2="1">
            <stop offset="0" stop-color="var(--accent)" stop-opacity=".28" />
            <stop offset="1" stop-color="var(--accent)" stop-opacity=".08" />
          </linearGradient>
        </defs>
        {yt.map((v) => (
          <g key={v}>
            <line x1={pad.l} x2={W - pad.r} y1={y(v)} y2={y(v)} class="grid" />
            <text x={pad.l - 6} y={y(v) + 4} class="axis" text-anchor="end">{step < 1 ? v.toFixed(1) : v.toFixed(0)}</text>
          </g>
        ))}
        {xt.map((n, i) => (
          <text key={n} x={x(n)} y={H - 7} class="axis" text-anchor={i === 0 ? 'start' : i === 2 && !band ? 'end' : 'middle'}>{shortDate(addDays('1970-01-01', n))}</text>
        ))}
        {band && <text x={x(endN)} y={H - 7} class="axis" text-anchor="end">+{band.days}h</text>}
        {showGoal && (
          <g class="goal">
            <line x1={pad.l} x2={W - pad.r} y1={y(goal!)} y2={y(goal!)} />
            <text x={W - pad.r} y={y(goal!) - 5} text-anchor="end">target {fmt.kg(goal!)}</text>
          </g>
        )}
        {bandPath && <path d={bandPath} fill="url(#bandg)" class="band" />}
        {band && last && <line x1={x(dayNum(today))} y1={y(last.avg)} x2={x(endN)} y2={y(band.center)} class="band-mid" />}
        {vis.map((p, i) => (
          <circle key={p.date} cx={x(dayNum(p.date))} cy={y(p.kg)} r={hover === i ? 4.5 : 2.6} class={`dot ${hover === i ? 'on' : ''}`} style={{ animationDelay: `${Math.min(i * 12, 400)}ms` }} />
        ))}
        {segs.map((d) => <path key={d} d={d} class="trend" pathLength={1} />)}
        {h && <line x1={x(dayNum(h.date))} x2={x(dayNum(h.date))} y1={pad.t} y2={H - pad.b} class="cursor" />}
      </svg>
      {h && (
        <div class="tip" style={{ left: Math.min(W - 130, Math.max(0, x(dayNum(h.date)) - 65)) }}>
          <b>{shortDate(h.date)}</b>
          <span>Timbang <b class="num">{fmt.kg(h.kg)}</b> kg</span>
          <span>Rata² 7h <b class="num">{fmt.kg(h.avg)}</b> kg</span>
        </div>
      )}
      <div class="legend">
        <span><i class="lg-dot" />Timbang harian</span>
        <span><i class="lg-line" />Rata-rata 7 hari</span>
        {band && <span><i class="lg-band" />Rentang perkiraan</span>}
      </div>
      <p class="sr-only">{summary}</p>
    </div>
  );
}

export function Sparkline({ entries, today, days = 21 }: { entries: WeightEntry[]; today: string; days?: number }) {
  const W = 120, H = 36;
  const s = movingAverage(entries).filter((p) => dayNum(p.date) > dayNum(today) - days);
  if (s.length < 2) return <svg width={W} height={H} aria-hidden="true" />;
  const lo = Math.min(...s.map((p) => p.avg)), hi = Math.max(...s.map((p) => p.avg));
  const r = Math.max(0.3, hi - lo);
  const x0 = dayNum(s[0].date), x1 = dayNum(s[s.length - 1].date);
  const pts = s.map((p) => `${((dayNum(p.date) - x0) / Math.max(1, x1 - x0)) * (W - 6) + 3},${H - 4 - ((p.avg - lo) / r) * (H - 8)}`);
  const lp = pts[pts.length - 1].split(',');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} class="spark" aria-hidden="true">
      <path d={`M${pts.join(' L')}`} pathLength={1} class="trend" />
      <circle cx={lp[0]} cy={lp[1]} r={3} class="spark-end" />
    </svg>
  );
}
