import { useState } from 'preact/hooks';
import { activeMs, completedSets, dayNum, estimateActivityKcal, fmt, localDate, sessionVolume, sumNutrients, trendChange, windowAvg, type Session } from '../lib/calc';
import { latestWeight, setState, targetFor, useStore } from '../lib/store';
import { go, openSheet } from '../ui/bus';
import { Bar, Disclaimer, Icon, Num, Ring } from '../ui/components';
import { Sparkline } from '../ui/Chart';

const greet = () => {
  const h = new Date().getHours();
  return h < 11 ? 'Selamat pagi.' : h < 15 ? 'Selamat siang.' : h < 18 ? 'Selamat sore.' : 'Selamat malam.';
};

export function sessionKcal(s: Session, bodyKg: number) {
  return estimateActivityKcal(s.activity, bodyKg, activeMs(s) / 60000);
}

export function Today() {
  const s = useStore((x) => x);
  const today = localDate();
  const t = targetFor(s, today);
  const items = s.food.filter((f) => f.date === today);
  const tot = sumNutrients(items);
  const kcalTarget = t?.calories ?? 0;
  const diff = kcalTarget - tot.kcal;
  const lw = latestWeight(s);
  const avg7 = windowAvg(s.weights, today);
  const chg = trendChange(s.weights, today);
  const todaysSessions = s.sessions.filter((x) => x.date === today);
  const lastSession = s.sessions[s.sessions.length - 1];
  const body = lw?.kg ?? s.profile?.weightKg ?? 70;
  const act = todaysSessions.map((x) => sessionKcal(x, body)).filter((e) => e.available);
  const actLo = act.reduce((a, e) => a + e.lo, 0), actHi = act.reduce((a, e) => a + e.hi, 0);
  const week = s.targets.length ? Math.floor((dayNum(today) - dayNum(s.targets[0].effectiveFrom)) / 7) + 1 : 1;
  const hide = s.prefs.hideWeight;
  const weighedToday = lw?.date === today;
  const [scenario, setScenario] = useState(false);

  return (
    <div class="stack">
      <section class="hello rise" style={{ '--d': '0ms' } as any}>
        <h1>{greet()}</h1>
        <p class="muted">Goal: <b class="caps">{s.profile?.goal ?? '—'}</b> · Minggu {week}</p>
      </section>

      <section class="card cal-card rise" style={{ '--d': '40ms' } as any}>
        <Ring value={tot.kcal} max={kcalTarget}>
          <span class="ring-big"><Num value={tot.kcal} /></span>
          <span class="ring-sub num">/ {fmt.kcal(kcalTarget)} kcal</span>
        </Ring>
        <div class="cal-side">
          <p class="cal-rem">
            {diff >= 0
              ? <><b class="num"><Num value={diff} /></b> kcal tersisa</>
              : <><b class="num"><Num value={-diff} /></b> kcal di atas target</>}
          </p>
          <div class="macro">
            <div class="macro-row"><span>Protein</span><span class="num">{fmt.g(tot.p)} / {t?.proteinG ?? 0} g</span></div>
            <Bar value={tot.p} max={t?.proteinG ?? 1} />
          </div>
          <div class="macro-mini">
            <span>Karbo <b class="num">{fmt.g(tot.c)} g</b></span>
            <span>Lemak <b class="num">{fmt.g(tot.f)} g</b></span>
          </div>
          {tot.unknown > 0 && <p class="tiny muted">{tot.unknown} entri tanpa data makro</p>}
        </div>
        <button class="card-link" onClick={() => go('food')} aria-label="Buka Food"><Icon n="chev" size={18} /></button>
      </section>

      <section class="card rise" style={{ '--d': '80ms' } as any}>
        <div class="card-h">
          <h2>Tren beratmu</h2>
          {weighedToday && <span class="badge badge-accent">Sudah timbang hari ini</span>}
        </div>
        {hide ? (
          <p class="muted">Angka berat disembunyikan. <button class="link" onClick={() => setState((x) => ({ prefs: { ...x.prefs, hideWeight: false } }))}>Tampilkan</button></p>
        ) : avg7 != null ? (
          <div class="trend-row">
            <div>
              <p class="big num"><Num value={avg7} format={fmt.kg} /> <small>kg</small></p>
              <p class="muted tiny">rata-rata 7 hari{chg != null && <> · <b class="num">{fmt.signed(chg)} kg</b> vs minggu lalu</>}</p>
            </div>
            <Sparkline entries={s.weights} today={today} />
          </div>
        ) : (
          <p class="muted">Belum ada data berat.</p>
        )}
        <button class="btn btn-soft btn-block" onClick={() => openSheet({ kind: 'weight' })}><Icon n="plus" size={18} /> {s.weights.length ? 'Catat berat' : 'Catat berat pertama'}</button>
      </section>

      <section class="card rise" style={{ '--d': '120ms' } as any}>
        <div class="card-h"><h2>Workout</h2></div>
        {s.active ? (
          <p><span class="pulse" /> <b>{s.active.name}</b> sedang berjalan</p>
        ) : todaysSessions.length ? (
          todaysSessions.map((x) => <p key={x.id}><b>{x.name}</b> · <span class="num">{Math.round(activeMs(x) / 60000)} mnt · {completedSets(x)} set · {fmt.kcal(sessionVolume(x))} kg</span></p>)
        ) : lastSession ? (
          <p class="muted">Terakhir: <b>{lastSession.name}</b> · {new Date(lastSession.date + 'T00:00').toLocaleDateString('id-ID', { weekday: 'long' })}. Hari istirahat juga bagian dari latihan.</p>
        ) : (
          <p class="muted">Belum ada sesi. Mulai dari template dalam 2 tap.</p>
        )}
        <button class="btn btn-primary btn-block" onClick={() => go('train')}>{s.active ? 'Lanjutkan workout' : 'Mulai workout'}</button>
      </section>

      <section class="card balance rise" style={{ '--d': '160ms' } as any}>
        <div class="card-h"><h2>Gambaran energi hari ini</h2><span class="badge badge-neutral">3well Balance</span></div>
        <dl class="rows">
          <div><dt>Makanan tercatat</dt><dd class="num">{fmt.kcal(tot.kcal)} kcal</dd></div>
          <div><dt>Target makan harian</dt><dd class="num">{fmt.kcal(kcalTarget)} kcal</dd></div>
          <div><dt>Estimasi aktivitas tercatat</dt><dd class="num">{act.length ? `${fmt.kcal(actLo)}–${fmt.kcal(actHi)} kcal` : '—'}</dd></div>
          <div class="strong"><dt>Status target</dt><dd class="num">{diff >= 0 ? `${fmt.kcal(diff)} kcal tersisa` : `${fmt.kcal(-diff)} kcal di atas`}</dd></div>
        </dl>
        <p class="tiny muted">Workout dicatat terpisah karena aktivitas rata-ratamu sudah termasuk dalam target harian — jadi tidak dihitung dua kali.</p>
        <button class="link" onClick={() => setScenario(!scenario)} aria-expanded={scenario}>{scenario ? 'Tutup skenario' : 'Jelajahi skenario'}</button>
        <div class={`collapse ${scenario ? 'open' : ''}`}>
          <div>
            <p class="scenario"><Icon n="bolt" size={16} /> Jika menambah <b>30 menit jalan kaki</b>, kira-kira aktivitas tambahan <b class="num">{(() => { const e = estimateActivityKcal('walk', body, 30); return `${fmt.kcal(e.lo)}–${fmt.kcal(e.hi)}`; })()} kcal</b>. Ini skenario, bukan anjuran.</p>
            <p class="scenario"><Icon n="info" size={16} /> Makan <b>200 kcal di atas target</b> satu hari menggeser rata-rata mingguan sekitar <b class="num">+29 kcal/hari</b> — efeknya kecil bila hari lain konsisten.</p>
          </div>
        </div>
      </section>

      <Disclaimer />
    </div>
  );
}
