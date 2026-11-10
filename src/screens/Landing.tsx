import { go } from '../ui/bus';
import { Icon, Wordmark } from '../ui/components';
import { useReveal } from '../ui/motion';
import { seedDemo } from '../lib/store';

function Rings() {
  const rings = [
    { r: 92, c: 'var(--accent)', len: 0.78, l: 'Fueled' },
    { r: 70, c: 'var(--ink-2)', len: 0.62, l: 'Trained' },
    { r: 48, c: 'var(--accent-2)', len: 0.7, l: 'Progressed' },
  ];
  return (
    <div class="hero-rings" aria-hidden="true">
      <svg viewBox="0 0 220 220" width="100%" height="100%">
        {rings.map((g, i) => {
          const C = 2 * Math.PI * g.r;
          return (
            <g key={i} class={`hr hr-${i}`}>
              <circle cx="110" cy="110" r={g.r} class="hr-track" />
              <circle cx="110" cy="110" r={g.r} class="hr-fill" stroke={g.c} stroke-dasharray={`${C * g.len} ${C}`} style={{ '--c': C, animationDelay: `${300 + i * 160}ms` } as any} />
            </g>
          );
        })}
      </svg>
      <span class="hr-3">3</span>
    </div>
  );
}

function NoiseDemo() {
  // deterministic noisy series with downward trend
  const pts = Array.from({ length: 28 }, (_, i) => {
    const noise = Math.sin(i * 2.3) * 0.55 + Math.cos(i * 1.1) * 0.35;
    return { x: 10 + i * 11, y: 40 + i * 1.4 + noise * 14 };
  });
  const avg = pts.map((p, i) => {
    const w = pts.slice(Math.max(0, i - 6), i + 1);
    return { x: p.x, y: w.reduce((s, q) => s + q.y, 0) / w.length };
  });
  return (
    <svg viewBox="0 0 320 120" class="noise-demo" role="img" aria-label="Ilustrasi: titik timbang harian naik-turun, garis rata-rata 7 hari menunjukkan tren turun yang halus">
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r="2.6" class="nd-dot" style={{ transitionDelay: `${i * 22}ms` }} />)}
      <path d={`M${avg.map((p) => `${p.x},${p.y.toFixed(1)}`).join(' L')}`} class="nd-line" pathLength={1} />
    </svg>
  );
}

export function Landing() {
  const ref = useReveal<HTMLDivElement>();
  const demo = () => { seedDemo(); go('today'); };
  return (
    <div class="landing" ref={ref}>
      <header class="l-nav">
        <Wordmark size={24} />
        <button class="btn btn-ghost btn-sm" onClick={() => go('start')}>Mulai</button>
      </header>

      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow tag-words"><span>well,</span> <span>well,</span> <span>well.</span></p>
          <h1 class="hero-h">
            <span class="ln"><span>Eat with intention.</span></span>
            <span class="ln"><span>Train with purpose.</span></span>
            <span class="ln"><span class="hl">Track what matters.</span></span>
          </h1>
          <p class="hero-sub">Makanan, latihan, dan tren berat badan dalam satu tempat — dibuat untuk pola makan Indonesia, dengan angka yang jujur soal ketidakpastiannya.</p>
          <div class="hero-cta">
            <button class="btn btn-primary btn-lg" onClick={() => go('start')}>Mulai dalam 3 menit <Icon n="chev" size={18} /></button>
            <button class="btn btn-ghost btn-lg" onClick={demo}>Coba dengan data demo</button>
          </div>
          <p class="hero-note">Gratis · tanpa akun · data tersimpan di perangkatmu</p>
        </div>
        <Rings />
      </section>

      <section class="pillars">
        {[
          { n: '01', t: 'Well-Fueled', d: 'Catat nasi, lauk warteg, sampai sambal. Porsi lokal seperti centong & potong, plus recent dan favorit.', q: 'Sudah berapa kalori & protein hari ini?' },
          { n: '02', t: 'Well-Trained', d: 'Template Push/Pull/Legs, set × reps × beban, timer sesi, dan estimasi energi berupa rentang — bukan angka palsu.', q: 'Apa yang dilatih, dan apakah makin kuat?' },
          { n: '03', t: 'Well-Progressed', d: 'Rata-rata 7 hari, bukan panik karena satu angka. Proyeksi 30 hari dengan tingkat keyakinan.', q: 'Apakah tren bergerak sesuai tujuan?' },
        ].map((p, i) => (
          <article class="pillar" data-reveal style={{ transitionDelay: `${i * 90}ms` }} key={p.n}>
            <span class="pillar-n">{p.n}</span>
            <h3>{p.t}</h3>
            <p>{p.d}</p>
            <p class="pillar-q">“{p.q}”</p>
          </article>
        ))}
      </section>

      <section class="split" data-reveal>
        <div>
          <p class="eyebrow">Trend over noise</p>
          <h2>Timbangan naik 0,6 kg semalam? Lihat garisnya.</h2>
          <p>Berat harian dipengaruhi air, garam, dan glikogen. 3well menampilkan rata-rata 7 hari supaya kamu melihat arah sebenarnya — dan tidak pernah mengisi hari kosong dengan angka karangan.</p>
        </div>
        <div class="card demo-card"><NoiseDemo /></div>
      </section>

      <section class="loop" data-reveal>
        <p class="eyebrow">The 3well Loop</p>
        <h2>Satu siklus, bukan tiga aplikasi.</h2>
        <ol class="loop-steps">
          {['Log Food', 'Log Workout', 'Weigh In', 'Understand Trend', 'Weekly Adjustment'].map((s, i) => (
            <li key={s} style={{ '--d': `${i * 110}ms` } as any}><b>{i + 1}</b><span>{s}</span></li>
          ))}
        </ol>
      </section>

      <section class="honest" data-reveal>
        <div class="card honest-card">
          <p class="eyebrow">Estimate, don’t pretend</p>
          <div class="hc-row"><span>Push Day · 54 menit</span><b class="num">~160–250 kcal</b></div>
          <div class="hc-row"><span>Keyakinan</span><span class="badge badge-neutral">Rendah–Sedang</span></div>
          <div class="hc-row"><span>Kemungkinan berat 30 hari</span><b class="num">85,9–87,1 kg</b></div>
          <p class="hc-note">Contoh tampilan, bukan prediksi. Kalori latihan tidak otomatis menambah jatah makan — aktivitas rata-rata sudah dihitung di target harianmu.</p>
        </div>
        <div class="card honest-card">
          <p class="eyebrow">No shame UX</p>
          <ul class="checks">
            <li><Icon n="check" size={18} /> Tidak ada “makanan buruk” atau hukuman olahraga</li>
            <li><Icon n="check" size={18} /> Tidak ada streak wajib atau warna merah untuk hari biasa</li>
            <li><Icon n="check" size={18} /> Bisa sembunyikan grafik berat kapan saja</li>
            <li><Icon n="check" size={18} /> Data pribadi, ekspor & hapus kapan pun</li>
          </ul>
        </div>
      </section>

      <section class="final" data-reveal>
        <Wordmark size={44} />
        <p class="final-tag">Log your food. Log your lifts. See your trend.</p>
        <button class="btn btn-primary btn-lg" onClick={() => go('start')}>Mulai sekarang</button>
      </section>

      <footer class="l-foot">
        <p>3well ditujukan untuk orang dewasa (18+). Estimasi bukan saran medis — hasil tiap orang bisa berbeda. Untuk kondisi medis, kehamilan, atau riwayat gangguan makan, konsultasikan dengan tenaga kesehatan.</p>
      </footer>
    </div>
  );
}
