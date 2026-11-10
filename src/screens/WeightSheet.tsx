import { useEffect, useState } from 'preact/hooks';
import { fmt, localDate, validWeight } from '../lib/calc';
import { getState, logWeight } from '../lib/store';
import { Icon, Sheet, toast } from '../ui/components';
import { haptic } from '../ui/motion';

const NOTES = ['late meal', 'travel', 'higher sodium', 'siklus menstruasi', 'kurang tidur'];

export function WeightSheet({ open, date: initDate, onClose }: { open: boolean; date?: string; onClose: () => void }) {
  const [date, setDate] = useState(localDate());
  const [val, setVal] = useState('');
  const [note, setNote] = useState<string | undefined>();
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const s = getState();
    const d = initDate ?? localDate();
    const existing = s.weights.find((w) => w.date === d);
    const last = s.weights[s.weights.length - 1];
    setDate(d);
    setVal(existing ? String(existing.kg) : last ? String(last.kg) : '');
    setNote(existing?.note);
    setErr(null);
  }, [open, initDate]);

  const n = Number(val.replace(',', '.'));
  const step = (d: number) => { haptic(4); setVal((Math.round(((Number.isFinite(n) ? n : 70) + d) * 10) / 10).toFixed(1)); };
  const exists = getState().weights.some((w) => w.date === date);

  const save = (e?: Event) => {
    e?.preventDefault();
    const v = validWeight(n);
    if (v) { setErr(v); return; }
    if (date > localDate()) { setErr('Tanggal tidak boleh di masa depan'); return; }
    logWeight(date, Math.round(n * 100) / 100, note);
    haptic(12);
    toast(exists ? 'Berat diperbarui · tren dihitung ulang' : 'Tersimpan · tren diperbarui');
    onClose();
  };

  return (
    <Sheet open={open} onClose={onClose} title={exists ? 'Perbarui berat' : 'Catat berat'}>
      <form onSubmit={save} class="weigh">
        <div class="weigh-input">
          <button type="button" class="step-btn" onClick={() => step(-0.1)} aria-label="Kurangi 0,1 kg">−</button>
          <label class="weigh-num">
            <input inputMode="decimal" aria-label="Berat dalam kg" value={val} onInput={(e) => { setVal(e.currentTarget.value); setErr(null); }} />
            <span>kg</span>
          </label>
          <button type="button" class="step-btn" onClick={() => step(0.1)} aria-label="Tambah 0,1 kg">+</button>
        </div>
        {err && <p class="field-err center" role="alert">{err}</p>}
        <label class="field">
          <span class="field-l">Tanggal</span>
          <input type="date" value={date} max={localDate()} onInput={(e) => setDate(e.currentTarget.value)} />
        </label>
        <div class="field">
          <span class="field-l">Catatan (opsional)</span>
          <div class="chips">
            {NOTES.map((x) => <button type="button" key={x} class={`chip ${note === x ? 'on' : ''}`} onClick={() => setNote(note === x ? undefined : x)}>{x}</button>)}
          </div>
        </div>
        <p class="tiny muted"><Icon n="info" size={14} /> Untuk konsistensi, timbang pagi setelah ke kamar mandi & sebelum sarapan. Satu entri per hari — menyimpan lagi akan memperbarui.</p>
        <button class="btn btn-primary btn-lg btn-block" type="submit">Simpan{Number.isFinite(n) && n > 0 ? ` ${fmt.kg(n)} kg` : ''}</button>
      </form>
    </Sheet>
  );
}
