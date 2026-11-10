import { useMemo, useState } from 'preact/hooks';
import { buildPlan, customTargetWarning, fmt, validateProfile, type ActivityLevel, type FormulaParam, type Goal, type Pace, type ProfileInput } from '../lib/calc';
import { completeOnboarding } from '../lib/store';
import { go } from '../ui/bus';
import { Disclaimer, Field, Icon, Num, Wordmark, toast } from '../ui/components';

const GOALS: { v: Goal; t: string; d: string }[] = [
  { v: 'cut', t: 'Cut', d: 'Turunkan lemak sambil menjaga kekuatan' },
  { v: 'bulk', t: 'Bulk', d: 'Naikkan berat dengan surplus terkendali' },
  { v: 'maintain', t: 'Maintain', d: 'Jaga berat, rapikan rutinitas' },
];
const ACTS: { v: ActivityLevel; t: string; d: string }[] = [
  { v: 'sitting', t: 'Kebanyakan duduk', d: 'Kerja meja, sedikit jalan, jarang olahraga' },
  { v: 'light', t: 'Sedikit aktif', d: 'Olahraga 1–3×/minggu atau cukup banyak jalan' },
  { v: 'moderate', t: 'Cukup aktif', d: 'Gym 3–5×/minggu' },
  { v: 'very', t: 'Sangat aktif', d: 'Latihan berat 6–7×/minggu atau kerja fisik' },
];

const num = (s: string) => (s.trim() === '' ? NaN : Number(s.replace(',', '.')));

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [goal, setGoal] = useState<Goal>('cut');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [formula, setFormula] = useState<FormulaParam>('skip');
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [pace, setPace] = useState<Pace>('gentle');
  const [target, setTarget] = useState('');
  const [adult, setAdult] = useState(false);
  const [customKcal, setCustomKcal] = useState<string | null>(null);
  const [customProt, setCustomProt] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const profile: ProfileInput = { age: num(age), heightCm: num(height), weightKg: num(weight), formula, activity, goal, pace, targetWeightKg: target ? num(target) : null };
  const errors = validateProfile(profile);
  const plan = useMemo(() => (Object.keys(errors).length ? null : buildPlan(profile)), [age, height, weight, formula, activity, goal, pace, target]);

  const steps = ['Tujuan', 'Profil', 'Aktivitas', 'Laju', 'Rencana'];
  const canNext = [true, !errors.age && !errors.heightCm && !errors.weightKg && adult, true, !errors.targetWeightKg, true][step];

  const next = () => {
    if (step === 1 && !canNext) { setTouched(true); return; }
    setDir(1);
    setStep((s) => Math.min(steps.length - 1, s + 1));
  };
  const back = () => { setDir(-1); if (step === 0) go(''); else setStep((s) => s - 1); };

  const kcalVal = customKcal != null ? num(customKcal) : plan?.calories ?? 0;
  const protVal = customProt != null ? num(customProt) : plan?.proteinG ?? 0;
  const kcalWarn = plan && customKcal != null ? customTargetWarning(kcalVal, plan.bmr) : null;

  const finish = () => {
    if (!plan) return;
    if (!Number.isFinite(kcalVal) || kcalVal <= 0 || !Number.isFinite(protVal) || protVal <= 0) { toast('Cek lagi target kalori & protein', 'info'); return; }
    completeOnboarding(profile, { calories: Math.round(kcalVal), proteinG: Math.round(protVal) });
    toast('Rencana tersimpan. Selamat datang!');
  };

  return (
    <div class="onb">
      <header class="onb-top">
        <button class="icon-btn" onClick={back} aria-label="Kembali"><Icon n="back" /></button>
        <Wordmark size={20} />
        <span class="onb-count num">{step + 1}/{steps.length}</span>
      </header>
      <div class="onb-progress" aria-hidden="true"><i style={{ width: `${((step + 1) / steps.length) * 100}%` }} /></div>

      <div class="onb-body" key={step} data-dir={dir}>
        {step === 0 && (
          <>
            <h1>Apa tujuanmu saat ini?</h1>
            <p class="muted">Bisa diubah kapan saja.</p>
            <div class="choice-list">
              {GOALS.map((g, i) => (
                <button key={g.v} class={`choice ${goal === g.v ? 'on' : ''}`} onClick={() => setGoal(g.v)} style={{ '--d': `${i * 50}ms` } as any} aria-pressed={goal === g.v}>
                  <b>{g.t}</b><span>{g.d}</span>
                  <i class="choice-check"><Icon n="check" size={16} /></i>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h1>Sedikit tentang tubuhmu</h1>
            <p class="muted">Dipakai hanya untuk estimasi kebutuhan energi. Tersimpan di perangkat ini.</p>
            <div class="grid-3">
              <Field label="Usia" error={touched ? errors.age : undefined}><input inputMode="numeric" value={age} onInput={(e) => setAge(e.currentTarget.value)} placeholder="25" /></Field>
              <Field label="Tinggi (cm)" error={touched ? errors.heightCm : undefined}><input inputMode="decimal" value={height} onInput={(e) => setHeight(e.currentTarget.value)} placeholder="170" /></Field>
              <Field label="Berat (kg)" error={touched ? errors.weightKg : undefined}><input inputMode="decimal" value={weight} onInput={(e) => setWeight(e.currentTarget.value)} placeholder="75,0" /></Field>
            </div>
            <Field label="Parameter rumus metabolisme (opsional)" hint="Rumus Mifflin–St Jeor memakai koefisien berbeda. Pilih “Lewati” untuk nilai tengah — kamu tetap bisa atur target sendiri.">
              <div class="chips">
                {([['male', 'Koefisien pria'], ['female', 'Koefisien wanita'], ['skip', 'Lewati']] as const).map(([v, l]) => (
                  <button key={v} type="button" class={`chip ${formula === v ? 'on' : ''}`} onClick={() => setFormula(v)}>{l}</button>
                ))}
              </div>
            </Field>
            <label class="check-row">
              <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.currentTarget.checked)} />
              <span>Saya berusia 18+ dan memahami bahwa angka di 3well adalah estimasi, bukan saran medis.</span>
            </label>
            {touched && !adult && <p class="field-err">Centang untuk melanjutkan.</p>}
          </>
        )}

        {step === 2 && (
          <>
            <h1>Seberapa aktif harimu?</h1>
            <p class="muted">Sudah termasuk olahraga rutinmu — jadi workout yang dicatat nanti <b>tidak</b> menambah jatah makan lagi.</p>
            <div class="choice-list">
              {ACTS.map((a, i) => (
                <button key={a.v} class={`choice ${activity === a.v ? 'on' : ''}`} onClick={() => setActivity(a.v)} style={{ '--d': `${i * 50}ms` } as any} aria-pressed={activity === a.v}>
                  <b>{a.t}</b><span>{a.d}</span>
                  <i class="choice-check"><Icon n="check" size={16} /></i>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h1>{goal === 'maintain' ? 'Target berat (opsional)' : 'Pilih laju yang nyaman'}</h1>
            <p class="muted">Lebih pelan sering kali lebih mudah dipertahankan.</p>
            {goal !== 'maintain' && (
              <div class="choice-list">
                {([['gentle', 'Santai', goal === 'cut' ? '≈ −300 kcal/hari dari maintenance' : '≈ +200 kcal/hari'], ['standard', 'Standar', goal === 'cut' ? '≈ −500 kcal/hari dari maintenance' : '≈ +300 kcal/hari']] as const).map(([v, t, d], i) => (
                  <button key={v} class={`choice ${pace === v ? 'on' : ''}`} onClick={() => setPace(v)} style={{ '--d': `${i * 50}ms` } as any} aria-pressed={pace === v}>
                    <b>{t}</b><span>{d}</span>
                    <i class="choice-check"><Icon n="check" size={16} /></i>
                  </button>
                ))}
              </div>
            )}
            <Field label="Target berat (kg, opsional)" error={errors.targetWeightKg}>
              <input inputMode="decimal" value={target} onInput={(e) => setTarget(e.currentTarget.value)} placeholder={goal === 'cut' ? 'mis. 70' : goal === 'bulk' ? 'mis. 80' : '—'} />
            </Field>
          </>
        )}

        {step === 4 && plan && (
          <>
            <h1>Rencana awalmu</h1>
            <p class="muted">Titik awal yang akan disesuaikan dengan data nyata setiap 1–2 minggu.</p>
            <div class="card plan-card">
              <div class="plan-hero">
                <span class="label">Target makan harian <span class="badge badge-neutral">estimasi</span></span>
                <div class="plan-kcal"><Num value={Number.isFinite(kcalVal) ? kcalVal : 0} /> <small>kcal</small></div>
              </div>
              <dl class="plan-grid">
                <div><dt>BMR (est.)</dt><dd class="num">{fmt.kcal(plan.bmr)}</dd></div>
                <div><dt>Maintenance (est.)</dt><dd class="num">{fmt.kcal(plan.tdee)}</dd></div>
                <div><dt>Laju rencana</dt><dd class="num">{fmt.signed(plan.weeklyRateKg, 2)} kg/mgg</dd></div>
              </dl>
            </div>
            {plan.warnings.map((w) => <p class="note" key={w}><Icon n="info" size={18} />{w}</p>)}
            <div class="grid-2">
              <Field label="Target kalori (bisa diubah)" error={kcalWarn ?? undefined}>
                <input inputMode="numeric" value={customKcal ?? String(plan.calories)} onInput={(e) => setCustomKcal(e.currentTarget.value)} />
              </Field>
              <Field label="Target protein (g)" hint={`Saran: ${plan.proteinRange[0]}–${plan.proteinRange[1]} g`}>
                <input inputMode="numeric" value={customProt ?? String(plan.proteinG)} onInput={(e) => setCustomProt(e.currentTarget.value)} />
              </Field>
            </div>
            <Disclaimer />
          </>
        )}
      </div>

      <footer class="onb-foot">
        {step < steps.length - 1 ? (
          <button class="btn btn-primary btn-lg btn-block" onClick={next} disabled={step !== 1 && !canNext}>Lanjut</button>
        ) : (
          <button class="btn btn-primary btn-lg btn-block" onClick={finish}>Mulai pakai 3well</button>
        )}
      </footer>
    </div>
  );
}
