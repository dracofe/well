import { useEffect, useState } from 'preact/hooks';
import { buildPlan, customTargetWarning, fmt, localDate, type ActivityLevel, type Goal, type Pace } from '../lib/calc';
import { exportCSV, exportJSON, getState, latestWeight, setState, targetFor, updateTarget, useStore, wipeAll } from '../lib/store';
import { go } from '../ui/bus';
import { Disclaimer, Field, Seg, toast } from '../ui/components';

function download(name: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

let deferredPrompt: any = null;
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });

export function Settings() {
  const s = useStore((x) => x);
  const t = targetFor(s, localDate());
  const p = s.profile!;
  const [goal, setGoal] = useState<Goal>(p.goal);
  const [pace, setPace] = useState<Pace>(p.pace);
  const [activity, setActivity] = useState<ActivityLevel>(p.activity);
  const [kcal, setKcal] = useState(String(t?.calories ?? ''));
  const [prot, setProt] = useState(String(t?.proteinG ?? ''));
  const [canInstall, setCanInstall] = useState(!!deferredPrompt);
  useEffect(() => { const f = () => setCanInstall(true); addEventListener('beforeinstallprompt', f); return () => removeEventListener('beforeinstallprompt', f); }, []);

  const current = latestWeight(s)?.kg ?? p.weightKg;
  const preview = buildPlan({ ...p, goal, pace, activity, weightKg: current });
  const changed = goal !== p.goal || pace !== p.pace || activity !== p.activity;
  const kcalWarn = customTargetWarning(Number(kcal), t?.bmr ?? preview.bmr);

  return (
    <div class="stack">
      <section class="rise"><h1>Pengaturan</h1></section>

      <section class="card stack-sm rise" style={{ '--d': '40ms' } as any}>
        <h2>Goal & rencana</h2>
        <Seg label="Goal" value={goal} onChange={setGoal} options={[{ v: 'cut', l: 'Cut' }, { v: 'bulk', l: 'Bulk' }, { v: 'maintain', l: 'Maintain' }]} />
        {goal !== 'maintain' && <Seg label="Laju" value={pace} onChange={setPace} options={[{ v: 'gentle', l: 'Santai' }, { v: 'standard', l: 'Standar' }]} />}
        <Field label="Tingkat aktivitas">
          <select value={activity} onChange={(e) => setActivity(e.currentTarget.value as ActivityLevel)}>
            <option value="sitting">Kebanyakan duduk</option>
            <option value="light">Sedikit aktif</option>
            <option value="moderate">Cukup aktif</option>
            <option value="very">Sangat aktif</option>
          </select>
        </Field>
        {changed && (
          <div class="note">
            <span>Rekomendasi baru (berat {fmt.kg(current)} kg): <b class="num">{fmt.kcal(preview.calories)} kcal</b>, protein {preview.proteinG} g.</span>
            <button class="btn btn-primary btn-sm" onClick={() => {
              setState((x) => ({ profile: { ...x.profile!, goal, pace, activity, weightKg: current } }));
              updateTarget({ calories: preview.calories, proteinG: preview.proteinG, carbsG: preview.carbsG, fatG: preview.fatG, plannedWeeklyKg: preview.weeklyRateKg, bmr: preview.bmr, tdee: preview.tdee, custom: false });
              setKcal(String(preview.calories)); setProt(String(preview.proteinG));
              toast('Rencana baru berlaku mulai hari ini');
            }}>Terapkan mulai hari ini</button>
          </div>
        )}
        {preview.warnings.map((w) => <p class="tiny muted" key={w}>{w}</p>)}
      </section>

      <section class="card stack-sm rise" style={{ '--d': '80ms' } as any}>
        <h2>Target harian</h2>
        <div class="grid-2">
          <Field label="Kalori (kcal)" error={kcal !== String(t?.calories) ? kcalWarn ?? undefined : undefined}><input inputMode="numeric" value={kcal} onInput={(e) => setKcal(e.currentTarget.value)} /></Field>
          <Field label="Protein (g)" hint={`Saran ${preview.proteinRange[0]}–${preview.proteinRange[1]} g`}><input inputMode="numeric" value={prot} onInput={(e) => setProt(e.currentTarget.value)} /></Field>
        </div>
        <p class="tiny muted">Mode: Fixed Daily Budget — workout tidak menambah jatah makan. Estimasi maintenance ≈ <span class="num">{fmt.kcal(t?.tdee ?? preview.tdee)}</span> kcal.</p>
        <button class="btn btn-soft" disabled={!(Number(kcal) > 0 && Number(prot) > 0) || (kcal === String(t?.calories) && prot === String(t?.proteinG))} onClick={() => { updateTarget({ calories: Math.round(Number(kcal)), proteinG: Math.round(Number(prot)), custom: true }); toast('Target disimpan mulai hari ini'); }}>Simpan target</button>
      </section>

      <section class="card stack-sm rise" style={{ '--d': '120ms' } as any}>
        <h2>Fokus & privasi</h2>
        <label class="switch-row">
          <span><b>Sembunyikan angka berat</b><br /><span class="tiny muted">Istirahat dari angka timbangan tanpa menghapus data.</span></span>
          <input type="checkbox" role="switch" checked={s.prefs.hideWeight} onChange={(e) => { const v = e.currentTarget.checked; setState((x) => ({ prefs: { ...x.prefs, hideWeight: v } })); }} />
        </label>
        <p class="tiny muted">Semua data (berat, makanan, latihan) tersimpan <b>hanya di perangkat ini</b>. Tidak ada akun, iklan, atau pelacakan isi data. Versi cloud sync akan memerlukan persetujuan eksplisit.</p>
      </section>

      <section class="card stack-sm rise" style={{ '--d': '160ms' } as any}>
        <h2>Data</h2>
        <div class="row-gap wrap">
          <button class="btn btn-soft" onClick={() => download(`3well-${localDate()}.json`, exportJSON(), 'application/json')}>Ekspor JSON</button>
          <button class="btn btn-soft" onClick={() => download(`3well-${localDate()}.csv`, exportCSV(), 'text/csv')}>Ekspor CSV</button>
          {canInstall && <button class="btn btn-soft" onClick={async () => { deferredPrompt?.prompt(); deferredPrompt = null; setCanInstall(false); }}>Pasang aplikasi</button>}
        </div>
        <button class="btn btn-danger" onClick={() => {
          if (!confirm('Hapus SEMUA data 3well di perangkat ini? Tindakan ini tidak bisa dibatalkan. Ekspor dulu jika perlu.')) return;
          wipeAll();
          go('');
          toast('Semua data dihapus', 'info');
        }}>Hapus semua data</button>
        <p class="tiny muted num">{getState().weights.length} entri berat · {getState().food.length} entri makanan · {getState().sessions.length} sesi</p>
      </section>

      <Disclaimer />
      <p class="tiny muted center">3well v0.1 · well, well, well.</p>
    </div>
  );
}
