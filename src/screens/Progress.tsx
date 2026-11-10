import { useMemo, useState } from 'preact/hooks';
import { FORECAST_MIN, e1rm, fmt, forecast, localDate, trendChange, weeklyReview, windowAvg } from '../lib/calc';
import { deleteWeight, setState, targetFor, updateTarget, useStore } from '../lib/store';
import { openSheet } from '../ui/bus';
import { Badge, Bar, Disclaimer, Icon, Num, Seg, Sheet, toast } from '../ui/components';
import { WeightChart } from '../ui/Chart';

const CONF: Record<string, string> = { low: 'Keyakinan rendah', medium: 'Keyakinan sedang', high: 'Keyakinan tinggi' };

export function Progress() {
  const s = useStore((x) => x);
  const today = localDate();
  const [range, setRange] = useState<'7' | '30' | '90'>('30');
  const [how, setHow] = useState(false);
  const [showBand, setShowBand] = useState(true);
  const t = targetFor(s, today);
  const goal = s.profile?.targetWeightKg ?? null;

  const fc = useMemo(() => forecast(s.weights, today, { plannedWeeklyKg: t?.plannedWeeklyKg }), [s.weights, t?.plannedWeeklyKg]);
  const avg = windowAvg(s.weights, today);
  const chg7 = trendChange(s.weights, today, 7);
  const chg30 = trendChange(s.weights, today, 30);
  const review = useMemo(() => weeklyReview({ today, weights: s.weights, food: s.food, sessions: s.sessions, goal: s.profile?.goal ?? 'maintain', plannedWeeklyKg: t?.plannedWeeklyKg ?? 0, proteinTarget: t?.proteinG ?? 0 }), [s.weights, s.food, s.sessions, t]);

  const start = s.weights[0]?.kg;
  const goalPct = goal != null && start != null && avg != null && start !== goal ? Math.max(0, Math.min(1, (start - avg) / (start - goal))) : null;

  const band = showBand && (fc.state === 'trend' || fc.state === 'early') ? { lo: fc.lo, hi: fc.hi, center: fc.center, days: 30 } : null;

  // strength retention / progress: first vs latest best e1RM on key lifts within 6 weeks
  const lifts = useMemo(() => {
    const keys = ['bench', 'squat', 'deadlift', 'ohp', 'row'];
    return keys.map((k) => {
      const pts = s.sessions.flatMap((x) => x.exercises.filter((e) => e.exId === k).map((e) => ({ date: x.date, v: Math.max(0, ...e.sets.map((y) => e1rm(y.kg, y.reps) ?? 0)) }))).filter((p) => p.v > 0);
      if (pts.length < 2) return null;
      return { k, name: s.sessions.flatMap((x) => x.exercises).find((e) => e.exId === k)!.name, first: pts[0].v, last: pts[pts.length - 1].v };
    }).filter(Boolean) as { k: string; name: string; first: number; last: number }[];
  }, [s.sessions]);

  if (s.prefs.hideWeight) {
    return (
      <div class="stack">
        <section class="card empty rise">
          <Icon n="eye" size={28} />
          <p>Grafik berat sedang disembunyikan. Istirahat dari angka itu juga oke.</p>
          <button class="btn btn-soft" onClick={() => setState((x) => ({ prefs: { ...x.prefs, hideWeight: false } }))}>Tampilkan lagi</button>
        </section>
      </div>
    );
  }

  return (
    <div class="stack">
      <section class="prog-hero rise">
        <p class="eyebrow">Tren 7 hari saat ini</p>
        {avg != null ? (
          <>
            <p class="hero-num num"><Num value={avg} format={fmt.kg} /><small> kg</small></p>
            <div class="row-gap wrap">
              {chg7 != null && <span class="pill num">{fmt.signed(chg7)} kg · 7 hari</span>}
              {chg30 != null && <span class="pill num">{fmt.signed(chg30)} kg · 30 hari</span>}
            </div>
            {goalPct != null && (
              <div class="goal-prog">
                <div class="row-between tiny"><span class="num">{fmt.kg(start!)} kg</span><span class="num">target {fmt.kg(goal!)} kg</span></div>
                <Bar value={goalPct * 100} max={100} />
              </div>
            )}
          </>
        ) : (
          <div class="empty">
            <p>Belum ada data berat.</p>
            <button class="btn btn-primary" onClick={() => openSheet({ kind: 'weight' })}>Catat berat pertama</button>
          </div>
        )}
      </section>

      <section class="card rise" style={{ '--d': '50ms' } as any}>
        <div class="card-h">
          <Seg label="Rentang grafik" value={range} onChange={setRange} options={[{ v: '7', l: '7D' }, { v: '30', l: '30D' }, { v: '90', l: '90D' }]} />
          <button class="icon-btn" aria-label="Catat berat" onClick={() => openSheet({ kind: 'weight' })}><Icon n="plus" /></button>
        </div>
        <WeightChart entries={s.weights} days={Number(range)} today={today} goal={goal} band={band} />
        <p class="tiny muted">Perubahan harian sering mencerminkan cairan, garam, atau isi pencernaan — perhatikan garis rata-ratanya.</p>
      </section>

      <section class="card forecast rise" style={{ '--d': '100ms' } as any}>
        <div class="card-h">
          <h2>Kemungkinan berat dalam 30 hari</h2>
          {(fc.state === 'trend' || fc.state === 'early') && <Badge tone={fc.confidence === 'high' ? 'accent' : 'neutral'}>{CONF[fc.confidence]}</Badge>}
          {fc.state === 'scenario' && <Badge tone="warn">Skenario</Badge>}
        </div>
        {fc.state === 'trend' || fc.state === 'early' ? (
          <>
            <p class="fc-range num"><Num value={fc.lo} format={fmt.kg} />–<Num value={fc.hi} format={fmt.kg} /> <small>kg</small></p>
            <p class="muted tiny">Arah tren {fmt.signed(fc.slopePerWeek, 2)} kg/minggu · {fc.n} kali timbang dalam {fc.spanDays} hari{fc.state === 'early' ? ' · arah awal, rentang dilebarkan' : ''}.</p>
            <label class="check-row tiny"><input type="checkbox" checked={showBand} onChange={(e) => setShowBand(e.currentTarget.checked)} /> Tampilkan di grafik</label>
            <p class="tiny muted">Dihitung {new Date(fc.computedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} · model trend-v1</p>
          </>
        ) : fc.state === 'scenario' ? (
          <>
            {fc.center != null && <p class="fc-range num muted">{fmt.kg(fc.lo!)}–{fmt.kg(fc.hi!)} <small>kg</small></p>}
            <p class="muted tiny">{fc.center != null ? 'Ilustrasi jika rencana diikuti — bukan prediksi personal. ' : ''}{fc.reason}</p>
          </>
        ) : (
          <p class="muted">{'reason' in fc ? fc.reason : ''}</p>
        )}
        <button class="link" onClick={() => setHow(true)}>Bagaimana diperkirakan?</button>
      </section>

      <section class="card review rise" style={{ '--d': '150ms' } as any}>
        <div class="card-h"><h2>Weekly review</h2><span class="muted tiny">7 hari terakhir</span></div>
        <dl class="stat-grid">
          <div><dt>Timbang</dt><dd class="num">{review.weighIns}×</dd></div>
          <div><dt>Hari makan tercatat</dt><dd class="num">{review.foodDays}/7</dd></div>
          <div><dt>Rata² asupan</dt><dd class="num">{review.avgKcal != null ? fmt.kcal(review.avgKcal) : '—'}</dd></div>
          <div><dt>Hari protein tercapai</dt><dd class="num">{review.proteinDays}</dd></div>
          <div><dt>Sesi latihan</dt><dd class="num">{review.sessions}</dd></div>
          <div><dt>Total set</dt><dd class="num">{review.sets}</dd></div>
        </dl>
        {review.eligible ? (
          <>
            <p class="row-between"><span>Laju rencana vs teramati</span><b class="num">{fmt.signed(review.plannedWeekly, 2)} / {fmt.signed(review.observedWeekly!, 2)} kg</b></p>
            <p class="review-msg">{review.message}</p>
            {review.recommendation === 'adjust' && t && (
              <div class="row-gap">
                <button class="btn btn-ghost" onClick={() => toast('Rencana dipertahankan')}>Pertahankan</button>
                <button class="btn btn-primary" onClick={() => {
                  if (!confirm(`Ubah target menjadi ${fmt.kcal(t.calories + review.adjustKcal)} kcal mulai hari ini? Data hari sebelumnya tetap memakai target lama.`)) return;
                  updateTarget({ calories: t.calories + review.adjustKcal, custom: true });
                  toast('Target diperbarui mulai hari ini');
                }}>Sesuaikan {review.adjustKcal > 0 ? '+' : ''}{review.adjustKcal} kcal</button>
              </div>
            )}
          </>
        ) : (
          <p class="muted tiny">{review.reason}</p>
        )}
      </section>

      {lifts.length > 0 && (
        <section class="card rise" style={{ '--d': '200ms' } as any}>
          <div class="card-h"><h2>{s.profile?.goal === 'cut' ? 'Strength retention' : 'Progres kekuatan'}</h2><Badge>est. 1RM</Badge></div>
          <ul class="rows-list">
            {lifts.map((l) => <li key={l.k}><span>{l.name}</span><b class="num">{fmt.kg(l.last)} kg <small class="muted">({fmt.signed(l.last - l.first)})</small></b></li>)}
          </ul>
          <p class="tiny muted">Konteks performa latihan — bukan pengukuran massa otot.</p>
        </section>
      )}

      <section class="rise" style={{ '--d': '240ms' } as any}>
        <h2 class="sec-h">Riwayat timbang</h2>
        <div class="card list-card">
          {[...s.weights].reverse().slice(0, 30).map((w) => (
            <div class="item" key={w.date}>
              <button class="item-main" onClick={() => openSheet({ kind: 'weight', date: w.date })}>
                <b class="num">{fmt.kg(w.kg)} kg</b>
                <span class="muted tiny">{new Date(w.date + 'T00:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}{w.note ? ` · ${w.note}` : ''}</span>
              </button>
              <button class="icon-btn sm" aria-label={`Hapus berat ${w.date}`} onClick={() => { deleteWeight(w.date); toast('Entri dihapus · tren dihitung ulang', 'info'); }}><Icon n="trash" size={17} /></button>
            </div>
          ))}
          {!s.weights.length && <p class="muted tiny pad">Belum ada entri.</p>}
        </div>
      </section>

      <Disclaimer />

      <Sheet open={how} onClose={() => setHow(false)} title="Bagaimana diperkirakan?">
        <div class="prose">
          <ol>
            <li>Ambil berat 6 minggu terakhir (satu entri per hari, hari kosong <b>tidak</b> diisi).</li>
            <li>Hitung rata-rata berjalan 7 hari dari data yang ada.</li>
            <li>Ukur arah tren dengan kemiringan robust (Theil–Sen), bukan sekadar membandingkan titik awal dan akhir.</li>
            <li>Proyeksi tengah = berat tren sekarang + kemiringan harian × 30.</li>
            <li>Rentang dibangun dari naik-turunnya data dan jumlah data — makin sedikit/berisik, makin lebar.</li>
          </ol>
          <p>Prakiraan berbasis tren butuh minimal <b>{FORECAST_MIN.trendN} kali timbang dalam {FORECAST_MIN.trendSpan}+ hari</b>. Di bawah itu, 3well menampilkan arah awal (rentang lebar) atau skenario berdasarkan rencana.</p>
          <p>Perubahan berat tidak linier, dan 1 kg perubahan berat ≠ 1 kg lemak atau otot.</p>
        </div>
      </Sheet>
    </div>
  );
}
