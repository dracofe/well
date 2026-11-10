import { useEffect, useMemo, useState } from 'preact/hooks';
import { MET, activeMs, completedSets, e1rm, estimateActivityKcal, exerciseVolume, fmt, localDate, sessionVolume, uid, validSet, type MetKey, type Session, type WExercise } from '../lib/calc';
import { EXERCISES, TEMPLATES, exById, type Exercise } from '../data/exercises';
import { deleteSession, discardActive, finishActive, getState, lastPerformance, latestWeight, patchActive, startSession, useStore } from '../lib/store';
import { Badge, Icon, Sheet, toast } from '../ui/components';
import { haptic } from '../ui/motion';

const clock = (ms: number) => {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return (h ? `${h}:` : '') + `${String(m).padStart(h ? 2 : 1, '0')}:${String(x).padStart(2, '0')}`;
};

function makeExercise(ex: Exercise): WExercise {
  const last = lastPerformance(ex.id);
  const sets = ex.kind === 'cardio' ? [] : (last ?? [{ reps: 8, kg: 0 }, { reps: 8, kg: 0 }, { reps: 8, kg: 0 }]).map((x) => ({ id: uid(), reps: x.reps, kg: x.kg, done: false }));
  return { id: uid(), exId: ex.id, name: ex.name, muscle: ex.muscle, kind: ex.kind, sets, cardioMin: ex.kind === 'cardio' ? 20 : undefined };
}

function begin(name: string, activity: MetKey, ids: string[]) {
  const sess: Session = {
    id: uid(), name, date: localDate(), startedAt: Date.now(), endedAt: null, pausedMs: 0, pausedAt: null,
    intensity: 'moderate', activity, exercises: ids.map((id) => exById(id)).filter(Boolean).map((e) => makeExercise(e!)),
  };
  startSession(sess);
  haptic(14);
}

/** Best e1RM per exercise across finished sessions, used for PR detection. */
function bestE1rm(sessions: Session[]) {
  const m = new Map<string, number>();
  for (const s of sessions) for (const e of s.exercises) for (const x of e.sets) {
    const v = e1rm(x.kg, x.reps);
    if (v && v > (m.get(e.exId) ?? 0)) m.set(e.exId, v);
  }
  return m;
}

export function Train() {
  const active = useStore((s) => s.active);
  const sessions = useStore((s) => s.sessions);
  const [summary, setSummary] = useState<{ s: Session; prs: { name: string; v: number }[] } | null>(null);

  const finish = () => {
    const before = bestE1rm(getState().sessions);
    const done = finishActive();
    if (!done) return;
    const prs: { name: string; v: number }[] = [];
    for (const e of done.exercises) {
      const best = Math.max(0, ...e.sets.map((x) => e1rm(x.kg, x.reps) ?? 0));
      if (best > 0 && before.has(e.exId) && best > before.get(e.exId)! + 0.01) prs.push({ name: e.name, v: best });
    }
    haptic(20);
    setSummary({ s: done, prs });
  };

  return (
    <>
      {active ? <ActiveSession s={active} onFinish={finish} /> : <TrainHome sessions={sessions} />}
      <SummarySheet data={summary} onClose={() => setSummary(null)} />
    </>
  );
}

function TrainHome({ sessions }: { sessions: Session[] }) {
  const body = useStore((s) => latestWeight(s)?.kg ?? s.profile?.weightKg ?? 70);
  const prs = useMemo(() => {
    const m = bestE1rm(sessions);
    return [...m.entries()].map(([id, v]) => ({ name: exById(id)?.name ?? id, v })).sort((a, b) => b.v - a.v).slice(0, 5);
  }, [sessions]);
  return (
    <div class="stack">
      <section class="rise">
        <h1>Train</h1>
        <p class="muted">Pilih template — langsung mulai.</p>
      </section>
      <div class="hscroll tpl-row rise" style={{ '--d': '40ms' } as any}>
        {TEMPLATES.map((t, i) => (
          <button key={t.id} class="tpl" style={{ '--d': `${i * 40}ms` } as any} onClick={() => begin(t.name, t.activity, t.ex)}>
            <span class="tpl-n">{String(i + 1).padStart(2, '0')}</span>
            <b>{t.name}</b>
            <span class="muted tiny">{t.hint}</span>
            <span class="tpl-go"><Icon n="play" size={16} /> Mulai</span>
          </button>
        ))}
      </div>
      <button class="btn btn-soft btn-block rise" style={{ '--d': '80ms' } as any} onClick={() => begin('Workout', 'lift_moderate', [])}>
        <Icon n="plus" size={18} /> Start Empty Workout
      </button>

      {prs.length > 0 && (
        <section class="card rise" style={{ '--d': '120ms' } as any}>
          <div class="card-h"><h2>Estimasi 1RM terbaik</h2><Badge>estimasi</Badge></div>
          <ul class="rows-list">
            {prs.map((p) => <li key={p.name}><span>{p.name}</span><b class="num">{fmt.kg(p.v)} kg</b></li>)}
          </ul>
          <p class="tiny muted">Rumus Epley, hanya dari set 1–12 reps. Bukan angka pasti.</p>
        </section>
      )}

      <section class="rise" style={{ '--d': '160ms' } as any}>
        <h2 class="sec-h">Riwayat</h2>
        {sessions.length === 0 && <div class="card empty"><p>Belum ada sesi tercatat.</p></div>}
        <div class="stack-sm">
          {[...sessions].reverse().slice(0, 12).map((s) => {
            const est = estimateActivityKcal(s.activity, body, activeMs(s) / 60000);
            return (
              <article class="card hist" key={s.id}>
                <div class="card-h">
                  <h3>{s.name}</h3>
                  <span class="muted tiny">{new Date(s.date + 'T00:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                </div>
                <p class="num tiny">{Math.round(activeMs(s) / 60000)} mnt · {completedSets(s)} set · {fmt.kcal(sessionVolume(s))} kg volume{est.available ? ` · ~${fmt.kcal(est.lo)}–${fmt.kcal(est.hi)} kcal` : ''}</p>
                <p class="muted tiny">{s.exercises.map((e) => e.name).join(' · ')}</p>
                <button class="link tiny" onClick={() => { if (confirm('Hapus sesi ini?')) { deleteSession(s.id); toast('Sesi dihapus', 'info'); } }}>Hapus</button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ActiveSession({ s, onFinish }: { s: Session; onFinish: () => void }) {
  const [, tick] = useState(0);
  const [rest, setRest] = useState<number | null>(null); // rest end timestamp
  const [picker, setPicker] = useState(false);
  const [err, setErr] = useState<Record<string, string>>({});
  useEffect(() => { const id = setInterval(() => tick((n) => n + 1), 1000); return () => clearInterval(id); }, []);
  useEffect(() => { if (rest && Date.now() > rest) { setRest(null); haptic(30); } });

  const paused = s.pausedAt != null;
  const elapsed = activeMs(s);
  const togglePause = () => patchActive((a) => (a.pausedAt != null ? { ...a, pausedMs: a.pausedMs + (Date.now() - a.pausedAt), pausedAt: null } : { ...a, pausedAt: Date.now() }));

  const setField = (eid: string, sid: string, k: 'reps' | 'kg', v: string) =>
    patchActive((a) => ({ ...a, exercises: a.exercises.map((e) => (e.id !== eid ? e : { ...e, sets: e.sets.map((x) => (x.id !== sid ? x : { ...x, [k]: Number(v.replace(',', '.')), done: false })) })) }));

  const toggleDone = (e: WExercise, sid: string) => {
    const set = e.sets.find((x) => x.id === sid)!;
    if (!set.done) {
      const v = validSet(set.reps, set.kg);
      if (v) { setErr({ ...err, [sid]: v }); return; }
      setRest(Date.now() + 90_000);
      haptic(10);
    }
    setErr({ ...err, [sid]: '' });
    patchActive((a) => ({ ...a, exercises: a.exercises.map((x) => (x.id !== e.id ? x : { ...x, sets: x.sets.map((y) => (y.id !== sid ? y : { ...y, done: !y.done })) })) }));
  };

  const addSet = (eid: string) => patchActive((a) => ({
    ...a, exercises: a.exercises.map((e) => {
      if (e.id !== eid) return e;
      const last = e.sets[e.sets.length - 1];
      return { ...e, sets: [...e.sets, { id: uid(), reps: last?.reps ?? 8, kg: last?.kg ?? 0, done: false }] };
    }),
  }));
  const removeEx = (eid: string) => patchActive((a) => ({ ...a, exercises: a.exercises.filter((e) => e.id !== eid) }));

  const restLeft = rest ? Math.max(0, rest - Date.now()) : 0;
  const totalDone = completedSets(s);

  return (
    <div class="stack session">
      <section class="sess-head">
        <div>
          <p class="eyebrow">{paused ? 'Dijeda' : 'Sedang berjalan'}</p>
          <h1>{s.name}</h1>
        </div>
        <div class={`timer ${paused ? 'paused' : ''}`} aria-live="off">
          <span class="num">{clock(elapsed)}</span>
          <button class="icon-btn" onClick={togglePause} aria-label={paused ? 'Lanjutkan' : 'Jeda'}><Icon n={paused ? 'play' : 'pause'} /></button>
        </div>
      </section>

      <div class="field">
        <span class="field-l">Jenis aktivitas (untuk estimasi energi)</span>
        <select value={s.activity} onChange={(e) => patchActive((a) => ({ ...a, activity: e.currentTarget.value as MetKey }))}>
          {Object.entries(MET).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {s.exercises.map((e, ei) => (
        <section class="card ex rise" key={e.id} style={{ '--d': `${ei * 40}ms` } as any}>
          <div class="card-h">
            <div><h2>{e.name}</h2><span class="muted tiny">{e.muscle}{e.kind === 'resistance' && exerciseVolume(e) > 0 ? ` · ${fmt.kcal(exerciseVolume(e))} kg` : ''}</span></div>
            <button class="icon-btn sm" aria-label={`Hapus ${e.name}`} onClick={() => removeEx(e.id)}><Icon n="x" size={18} /></button>
          </div>
          {e.kind === 'cardio' ? (
            <label class="field">
              <span class="field-l">Durasi (menit) — timer sesi tetap dipakai untuk estimasi</span>
              <input inputMode="numeric" value={e.cardioMin} onInput={(ev) => patchActive((a) => ({ ...a, exercises: a.exercises.map((x) => (x.id === e.id ? { ...x, cardioMin: Number(ev.currentTarget.value) } : x)) }))} />
            </label>
          ) : (
            <>
              <div class="set-head"><span>Set</span><span>kg</span><span>Reps</span><span /></div>
              {e.sets.map((x, i) => (
                <div key={x.id}>
                  <div class={`set-row ${x.done ? 'done' : ''}`}>
                    <span class="set-i num">{i + 1}</span>
                    <input inputMode="decimal" aria-label={`Set ${i + 1} beban kg`} value={x.kg || ''} placeholder="0" onInput={(ev) => setField(e.id, x.id, 'kg', ev.currentTarget.value)} />
                    <input inputMode="numeric" aria-label={`Set ${i + 1} reps`} value={x.reps || ''} placeholder="8" onInput={(ev) => setField(e.id, x.id, 'reps', ev.currentTarget.value)} />
                    <button class="set-check" aria-pressed={x.done} aria-label={x.done ? 'Batalkan set' : 'Simpan set'} onClick={() => toggleDone(e, x.id)}><Icon n="check" size={20} /></button>
                  </div>
                  {err[x.id] && <p class="field-err">{err[x.id]}</p>}
                </div>
              ))}
              <button class="link" onClick={() => addSet(e.id)}>+ Tambah set</button>
            </>
          )}
        </section>
      ))}

      <button class="btn btn-soft btn-block" onClick={() => setPicker(true)}><Icon n="plus" size={18} /> Tambah latihan</button>

      <div class="sess-foot">
        {rest ? (
          <button class="rest" onClick={() => setRest(null)} aria-label="Lewati istirahat">
            <i style={{ transform: `scaleX(${restLeft / 90000})` }} />
            <span>Istirahat <b class="num">{clock(restLeft)}</b> · lewati</span>
          </button>
        ) : <span class="muted tiny num">{totalDone} set selesai</span>}
        <div class="row-gap">
          <button class="btn btn-ghost" onClick={() => { if (confirm('Buang sesi ini tanpa menyimpan?')) discardActive(); }}>Buang</button>
          <button class="btn btn-primary" onClick={onFinish}>Selesai</button>
        </div>
      </div>

      <ExercisePicker open={picker} onClose={() => setPicker(false)} onPick={(ex) => { patchActive((a) => ({ ...a, exercises: [...a.exercises, makeExercise(ex)] })); setPicker(false); }} />
    </div>
  );
}

function ExercisePicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (e: Exercise) => void }) {
  const [q, setQ] = useState('');
  const list = EXERCISES.filter((e) => `${e.name} ${e.muscle} ${e.equip}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <Sheet open={open} onClose={onClose} title="Tambah latihan">
      <label class="search"><Icon n="search" size={20} /><input value={q} onInput={(e) => setQ(e.currentTarget.value)} placeholder="Cari latihan atau otot" aria-label="Cari latihan" /></label>
      <div class="list-card">
        {list.map((e) => (
          <button key={e.id} class="food-row" onClick={() => onPick(e)}>
            <span class="fr-main"><b>{e.name}</b><span class="muted tiny">{e.muscle} · {e.equip}</span></span>
            <Icon n="plus" size={18} />
          </button>
        ))}
        {q.trim() && (
          <button class="food-row" onClick={() => onPick({ id: 'x-' + q.trim().toLowerCase().replace(/\s+/g, '-'), name: q.trim(), muscle: 'Custom', equip: '—', kind: 'resistance' })}>
            <span class="fr-main"><b>+ Buat “{q.trim()}”</b><span class="muted tiny">Latihan custom</span></span>
          </button>
        )}
      </div>
    </Sheet>
  );
}

function SummarySheet({ data, onClose }: { data: { s: Session; prs: { name: string; v: number }[] } | null; onClose: () => void }) {
  const body = useStore((s) => latestWeight(s)?.kg ?? s.profile?.weightKg ?? 70);
  const s = data?.s;
  const min = s ? activeMs(s) / 60000 : 0;
  const est = s ? estimateActivityKcal(s.activity, body, min) : null;
  return (
    <Sheet open={!!data} onClose={onClose} title="Ringkasan workout">
      {s && est && (
        <div class="summary">
          <div class="sum-hero">
            <span class="sum-check"><Icon n="check" size={28} /></span>
            <h3>{s.name}</h3>
            <p class="muted num">{Math.round(min)} menit aktif</p>
          </div>
          <dl class="rows">
            <div><dt>Latihan</dt><dd class="num">{s.exercises.length}</dd></div>
            <div><dt>Working sets</dt><dd class="num">{completedSets(s)}</dd></div>
            <div><dt>Training volume</dt><dd class="num">{fmt.kcal(sessionVolume(s))} kg</dd></div>
            <div><dt>Otot dilatih</dt><dd>{[...new Set(s.exercises.map((e) => e.muscle))].join(', ') || '—'}</dd></div>
            <div><dt>Estimasi energi latihan</dt><dd class="num">{est.available ? `~${fmt.kcal(est.lo)}–${fmt.kcal(est.hi)} kcal` : 'Tidak tersedia'}</dd></div>
            <div><dt>Keyakinan</dt><dd>{est.available ? (est.confidence === 'medium' ? 'Sedang' : 'Rendah–Sedang') : 'Rendah'}</dd></div>
          </dl>
          {data!.prs.length > 0 && (
            <div class="prs">
              {data!.prs.map((p) => <p key={p.name} class="pr"><Icon n="star" size={16} /> Estimasi 1RM baru: <b>{p.name}</b> <span class="num">{fmt.kg(p.v)} kg</span></p>)}
            </div>
          )}
          <p class="tiny muted">{est.note} Rentang ini informasional dan <b>tidak menambah</b> target makan harianmu.</p>
          <button class="btn btn-primary btn-lg btn-block" onClick={onClose}>Selesai</button>
        </div>
      )}
    </Sheet>
  );
}
