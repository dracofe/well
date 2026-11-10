import { useEffect, useMemo, useState } from 'preact/hooks';
import { addDays, fmt, itemNutrients, localDate, scaleNutrients, sumNutrients, uid, type FoodItemSnapshot, type MealType } from '../lib/calc';
import { FOODS, SOURCE_LABEL, searchFoods, type Food } from '../data/foods';
import { addCustomFood, addFood, copyDay, removeFood, setState, targetFor, toggleFavorite, updateFood, useStore } from '../lib/store';
import { Badge, Bar, Field, Icon, Num, Seg, Sheet, toast } from '../ui/components';
import { haptic } from '../ui/motion';

export const MEALS: { v: MealType; l: string }[] = [
  { v: 'breakfast', l: 'Sarapan' },
  { v: 'lunch', l: 'Makan siang' },
  { v: 'dinner', l: 'Makan malam' },
  { v: 'snack', l: 'Snack' },
];
const MEAL_SHORT: { v: MealType; l: string }[] = [{ v: 'breakfast', l: 'Pagi' }, { v: 'lunch', l: 'Siang' }, { v: 'dinner', l: 'Malam' }, { v: 'snack', l: 'Snack' }];
const mealNow = (): MealType => { const h = new Date().getHours(); return h < 10 ? 'breakfast' : h < 15 ? 'lunch' : h < 21 ? 'dinner' : 'snack'; };
const dayLabel = (d: string) => {
  const t = localDate();
  if (d === t) return 'Hari ini';
  if (d === addDays(t, -1)) return 'Kemarin';
  return new Date(d + 'T00:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
};

type Edit = { food: Food; item?: FoodItemSnapshot } | null;

export function FoodScreen() {
  const s = useStore((x) => x);
  const [date, setDate] = useState(localDate());
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState<Edit>(null);
  const [quick, setQuick] = useState(false);
  const [custom, setCustom] = useState(false);

  const items = s.food.filter((f) => f.date === date);
  const tot = sumNutrients(items);
  const t = targetFor(s, date);
  const results = useMemo(() => (q.trim() ? searchFoods(q, s.customFoods).slice(0, 30) : []), [q, s.customFoods]);
  const allFoods = [...s.customFoods, ...FOODS];
  const byId = (id: string) => allFoods.find((f) => f.id === id);
  const favs = s.favorites.map(byId).filter(Boolean) as Food[];
  const recent = useMemo(() => {
    const seen = new Set<string>();
    const out: Food[] = [];
    for (let i = s.food.length - 1; i >= 0 && out.length < 6; i--) {
      const id = s.food[i].foodId;
      if (id && !seen.has(id)) { seen.add(id); const f = byId(id); if (f) out.push(f); }
    }
    return out;
  }, [s.food.length, s.customFoods]);

  const openItem = (it: FoodItemSnapshot) => {
    // historical snapshot is the source of truth for an existing item
    const snapFood: Food = { id: it.foodId ?? it.id, name: it.name, cat: '', kcal: it.per.kcal, p: it.per.p ?? 0, c: it.per.c ?? 0, f: it.per.f ?? 0, portions: byId(it.foodId ?? '')?.portions ?? [], source: it.source };
    if (!it.baseG) { setEdit(null); return; }
    setEdit({ food: snapFood, item: it });
  };

  const incomplete = !!s.incomplete[date];
  const yesterday = addDays(date, -1);
  const hasYesterday = s.food.some((f) => f.date === yesterday);

  return (
    <div class="stack">
      <section class="food-sticky">
        <div class="date-switch">
          <button class="icon-btn" onClick={() => setDate(addDays(date, -1))} aria-label="Hari sebelumnya"><Icon n="back" /></button>
          <b>{dayLabel(date)}</b>
          <button class="icon-btn" onClick={() => setDate(addDays(date, 1))} disabled={date >= localDate()} aria-label="Hari berikutnya"><Icon n="chev" /></button>
        </div>
        <div class="intake">
          <div class="intake-top">
            <span><b class="num"><Num value={tot.kcal} /></b> / <span class="num">{fmt.kcal(t?.calories ?? 0)}</span> kcal</span>
            <span class="muted num">P {fmt.g(tot.p)} · K {fmt.g(tot.c)} · L {fmt.g(tot.f)} g</span>
          </div>
          <Bar value={tot.kcal} max={t?.calories ?? 1} />
        </div>
        <label class="search">
          <Icon n="search" size={20} />
          <input id="food-search" type="search" placeholder="Cari nasi, ayam, telur..." value={q} onInput={(e) => setQ(e.currentTarget.value)} aria-label="Cari makanan" autocomplete="off" />
          {q && <button class="icon-btn" onClick={() => setQ('')} aria-label="Hapus pencarian"><Icon n="x" size={18} /></button>}
        </label>
      </section>

      {q.trim() ? (
        <section class="card list-card">
          {results.length ? results.map((f, i) => <FoodRow key={f.id} f={f} i={i} fav={s.favorites.includes(f.id)} onPick={() => setEdit({ food: f })} />) : (
            <div class="empty">
              <p>“{q}” belum ada di database.</p>
              <div class="row-gap">
                <button class="btn btn-soft" onClick={() => setCustom(true)}>Buat makanan sendiri</button>
                <button class="btn btn-ghost" onClick={() => setQuick(true)}>Quick add kalori</button>
              </div>
            </div>
          )}
        </section>
      ) : (
        <>
          {(favs.length > 0 || recent.length > 0) && (
            <section class="rise">
              <h2 class="sec-h">{favs.length ? 'Favorit' : 'Terakhir dicatat'}</h2>
              <div class="hscroll">
                {(favs.length ? favs : recent).map((f, i) => (
                  <button key={f.id} class="food-chip" style={{ '--d': `${i * 30}ms` } as any} onClick={() => setEdit({ food: f })}>
                    <b>{f.name}</b><span class="num">{fmt.kcal(f.kcal * (f.portions[0]?.g ?? 100) / 100)} kcal · {f.portions[0]?.label ?? '100 g'}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <div class="row-gap wrap rise" style={{ '--d': '40ms' } as any}>
            <button class="btn btn-soft btn-sm" onClick={() => setQuick(true)}><Icon n="bolt" size={16} /> Quick add</button>
            <button class="btn btn-soft btn-sm" onClick={() => setCustom(true)}><Icon n="plus" size={16} /> Makanan sendiri</button>
            {hasYesterday && <button class="btn btn-soft btn-sm" onClick={() => { copyDay(yesterday, date); toast('Makanan kemarin disalin'); }}><Icon n="copy" size={16} /> Salin kemarin</button>}
          </div>

          {MEALS.map((m, mi) => {
            const list = items.filter((i) => i.meal === m.v);
            const mt = sumNutrients(list);
            return (
              <section class="card meal rise" key={m.v} style={{ '--d': `${80 + mi * 40}ms` } as any}>
                <div class="card-h">
                  <h2>{m.l}</h2>
                  <span class="num muted">{list.length ? `${fmt.kcal(mt.kcal)} kcal` : ''}</span>
                </div>
                {list.length ? (
                  <ul class="items">
                    {list.map((it) => {
                      const n = itemNutrients(it);
                      return (
                        <li key={it.id} class="item">
                          <button class="item-main" onClick={() => openItem(it)} disabled={!it.baseG}>
                            <b>{it.name}</b>
                            <span class="muted tiny num">{it.baseG ? `${Math.round(it.qty)} g` : 'quick add'}{it.portionLabel ? ` · ${it.portionLabel}` : ''} · P {n.p == null ? '?' : fmt.g(n.p)} g</span>
                          </button>
                          <span class="num">{fmt.kcal(n.kcal)}</span>
                          <button class="icon-btn sm" aria-label={`Hapus ${it.name}`} onClick={() => { removeFood(it.id); toast('Dihapus', 'info'); }}><Icon n="trash" size={17} /></button>
                        </li>
                      );
                    })}
                  </ul>
                ) : <p class="muted tiny">Belum ada catatan.</p>}
              </section>
            );
          })}

          <label class="check-row">
            <input type="checkbox" checked={incomplete} onChange={(e) => { const v = e.currentTarget.checked; setState((x) => ({ incomplete: { ...x.incomplete, [date]: v } })); }} />
            <span>Catatan hari ini mungkin belum lengkap</span>
          </label>
          {incomplete && <p class="note"><Icon n="info" size={18} />Food log may be incomplete — review mingguan akan memperhitungkannya.</p>}
        </>
      )}

      <PortionSheet edit={edit} date={date} onClose={() => setEdit(null)} favs={s.favorites} onDone={() => setQ('')} />
      <QuickAddSheet open={quick} date={date} onClose={() => setQuick(false)} />
      <CustomFoodSheet open={custom} initialName={q} onClose={() => setCustom(false)} onCreated={(f) => { setCustom(false); setEdit({ food: f }); }} />
    </div>
  );
}

function FoodRow({ f, i, fav, onPick }: { f: Food; i: number; fav: boolean; onPick: () => void }) {
  return (
    <button class="food-row" onClick={onPick} style={{ '--d': `${Math.min(i, 10) * 18}ms` } as any}>
      <span class="fr-main">
        <b>{f.name}{fav && <Icon n="star" size={14} class="fav-on" />}</b>
        <span class="muted tiny">{f.state ? `${f.state} · ` : ''}{SOURCE_LABEL[f.source]}</span>
      </span>
      <span class="num fr-k">{fmt.kcal(f.kcal)}<small> /100g</small></span>
    </button>
  );
}

function PortionSheet({ edit, date, onClose, favs, onDone }: { edit: Edit; date: string; onClose: () => void; favs: string[]; onDone: () => void }) {
  const f = edit?.food;
  const [grams, setGrams] = useState('100');
  const [portion, setPortion] = useState<string | undefined>();
  const [meal, setMeal] = useState<MealType>(mealNow());

  useEffect(() => {
    if (!edit) return;
    if (edit.item) { setGrams(String(Math.round(edit.item.qty))); setPortion(edit.item.portionLabel); setMeal(edit.item.meal); }
    else { const p = edit.food.portions[0]; setGrams(String(p?.g ?? 100)); setPortion(p?.label); setMeal(mealNow()); }
  }, [edit]);

  const g = Number(grams.replace(',', '.'));
  const valid = Number.isFinite(g) && g > 0 && g <= 3000;
  const n = f ? scaleNutrients({ kcal: f.kcal, p: f.p, c: f.c, f: f.f }, 100, valid ? g : 0) : { kcal: 0, p: 0, c: 0, f: 0 };

  const save = () => {
    if (!f || !valid) return;
    haptic(10);
    if (edit?.item) {
      updateFood(edit.item.id, { qty: g, meal, portionLabel: portion });
      toast('Diperbarui');
    } else {
      addFood({ foodId: f.id, name: f.name, source: f.source, per: { kcal: f.kcal, p: f.p, c: f.c, f: f.f }, baseG: 100, qty: g, portionLabel: portion, meal, date });
      toast(`${f.name} ditambahkan`);
      onDone();
    }
    onClose();
  };

  return (
    <Sheet open={!!edit} onClose={onClose} title={f?.name ?? ''}>
      {f && (
        <div class="portion">
          <div class="row-between">
            <Badge tone={f.source === 'estimate' ? 'warn' : 'neutral'}>{SOURCE_LABEL[f.source]}</Badge>
            {!edit?.item && (
              <button class={`icon-btn ${favs.includes(f.id) ? 'fav-on' : ''}`} aria-pressed={favs.includes(f.id)} aria-label="Favorit" onClick={() => { toggleFavorite(f.id); haptic(); }}>
                <Icon n="star" />
              </button>
            )}
          </div>
          <div class="nutri">
            <div class="nutri-k"><span class="num"><Num value={n.kcal} /></span><small>kcal</small></div>
            <div class="nutri-m">
              <span><b class="num">{fmt.g(n.p ?? 0)}</b> g protein</span>
              <span><b class="num">{fmt.g(n.c ?? 0)}</b> g karbo</span>
              <span><b class="num">{fmt.g(n.f ?? 0)}</b> g lemak</span>
            </div>
          </div>
          {f.portions.length > 0 && (
            <div class="chips">
              {f.portions.flatMap((p) => (p.label.startsWith('1 ') ? [p, { label: p.label.replace(/^1 /, '2 '), g: p.g * 2 }] : [p])).map((p) => (
                <button key={p.label} class={`chip ${portion === p.label ? 'on' : ''}`} onClick={() => { setPortion(p.label); setGrams(String(p.g)); haptic(4); }}>
                  {p.label} <small class="num">{p.g} g</small>
                </button>
              ))}
            </div>
          )}
          <Field label="Berat (gram)" error={valid ? undefined : 'Masukkan 1–3000 gram'} hint={f.state ? `Nilai untuk kondisi ${f.state}` : undefined}>
            <input inputMode="decimal" value={grams} onInput={(e) => { setGrams(e.currentTarget.value); setPortion(undefined); }} />
          </Field>
          <Seg label="Waktu makan" value={meal} onChange={setMeal} options={MEAL_SHORT} />
          {f.source === 'estimate' && <p class="tiny muted">Masakan campuran — nilai bisa berbeda jauh tergantung resep & porsi.</p>}
          <button class="btn btn-primary btn-lg btn-block" disabled={!valid} onClick={save}>{edit?.item ? 'Simpan perubahan' : 'Tambahkan'}</button>
        </div>
      )}
    </Sheet>
  );
}

function QuickAddSheet({ open, date, onClose }: { open: boolean; date: string; onClose: () => void }) {
  const [kcal, setKcal] = useState('');
  const [name, setName] = useState('');
  const [meal, setMeal] = useState<MealType>(mealNow());
  useEffect(() => { if (open) { setKcal(''); setName(''); setMeal(mealNow()); } }, [open]);
  const k = Number(kcal);
  const ok = Number.isFinite(k) && k > 0 && k <= 5000;
  return (
    <Sheet open={open} onClose={onClose} title="Quick add kalori">
      <div class="stack-sm">
        <Field label="Kalori (kcal)" error={kcal && !ok ? 'Masukkan 1–5000 kcal' : undefined}><input inputMode="numeric" value={kcal} onInput={(e) => setKcal(e.currentTarget.value)} placeholder="250" /></Field>
        <Field label="Nama (opsional)"><input value={name} onInput={(e) => setName(e.currentTarget.value)} placeholder="Jajan kantor" /></Field>
        <Seg label="Waktu makan" value={meal} onChange={setMeal} options={MEAL_SHORT} />
        <p class="tiny muted">Protein, karbo, dan lemak akan ditandai <b>tidak diketahui</b> — bukan nol.</p>
        <button class="btn btn-primary btn-lg btn-block" disabled={!ok} onClick={() => {
          addFood({ foodId: null, name: name.trim() || 'Quick add', source: 'estimate', per: { kcal: k, p: null, c: null, f: null }, baseG: null, qty: 1, meal, date });
          toast(`${fmt.kcal(k)} kcal ditambahkan`);
          onClose();
        }}>Tambahkan</button>
      </div>
    </Sheet>
  );
}

function CustomFoodSheet({ open, initialName, onClose, onCreated }: { open: boolean; initialName: string; onClose: () => void; onCreated: (f: Food) => void }) {
  const [v, setV] = useState({ name: '', serving: '100', kcal: '', p: '', c: '', f: '' });
  useEffect(() => { if (open) setV({ name: initialName, serving: '100', kcal: '', p: '', c: '', f: '' }); }, [open]);
  const n = (x: string) => Number(x.replace(',', '.'));
  const serving = n(v.serving);
  const ok = v.name.trim() && serving > 0 && n(v.kcal) >= 0 && v.kcal !== '' && [v.p, v.c, v.f].every((x) => x === '' || n(x) >= 0);
  const set = (k: keyof typeof v) => (e: any) => setV({ ...v, [k]: e.currentTarget.value });
  return (
    <Sheet open={open} onClose={onClose} title="Makanan sendiri">
      <div class="stack-sm">
        <p class="tiny muted">Salin dari label kemasan. Nilai disimpan per takaran saji dan dikonversi ke per 100 g.</p>
        <Field label="Nama"><input value={v.name} onInput={set('name')} placeholder="Granola merek X" /></Field>
        <div class="grid-2">
          <Field label="Takaran saji (g)"><input inputMode="decimal" value={v.serving} onInput={set('serving')} /></Field>
          <Field label="Kalori / saji"><input inputMode="decimal" value={v.kcal} onInput={set('kcal')} /></Field>
        </div>
        <div class="grid-3">
          <Field label="Protein g"><input inputMode="decimal" value={v.p} onInput={set('p')} /></Field>
          <Field label="Karbo g"><input inputMode="decimal" value={v.c} onInput={set('c')} /></Field>
          <Field label="Lemak g"><input inputMode="decimal" value={v.f} onInput={set('f')} /></Field>
        </div>
        <button class="btn btn-primary btn-lg btn-block" disabled={!ok} onClick={() => {
          const k = 100 / serving;
          const food: Food = { id: 'c-' + uid(), name: v.name.trim(), cat: 'Buatan sendiri', kcal: n(v.kcal) * k, p: n(v.p || '0') * k, c: n(v.c || '0') * k, f: n(v.f || '0') * k, portions: [{ label: '1 saji', g: serving }], source: 'label' };
          addCustomFood(food);
          toast('Makanan dibuat');
          onCreated(food);
        }}>Simpan & pilih porsi</button>
      </div>
    </Sheet>
  );
}
